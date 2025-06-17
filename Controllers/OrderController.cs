using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using SHN_Gear.Services;
using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;
using System;
using Newtonsoft.Json;
using System.IO;
using OfficeOpenXml;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.tool.xml;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Globalization; // Cho hàm ConvertToUnsigned
using System.Text;         // Cho NormalizationForm
using System.Text.RegularExpressions; // For Regex
using OfficeOpenXml.Style;
using Microsoft.AspNetCore.JsonPatch;
namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly MoMoPaymentService _momoService;
        private readonly IConfiguration _configuration;

        public OrderController(
            AppDbContext context,
            MoMoPaymentService momoService,
            IConfiguration configuration)
        {
            _context = context;
            _momoService = momoService;
            _configuration = configuration;
        }




        // Lấy thông tin đơn hàng
        [HttpGet("confirm/{orderId}")]
        public async Task<IActionResult> GetOrderConfirmationDetails(int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Product)
                                .ThenInclude(p => p.Images)
                    .Include(o => o.Address)
                    .Include(o => o.PaymentMethod)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return NotFound(new { Message = "Không tìm thấy đơn hàng" });
                }

                var result = new
                {
                    OrderId = order.Id,
                    OrderDate = order.OrderDate.ToString("dd/MM/yyyy HH:mm"),
                    TotalAmount = order.TotalAmount,
                    FormattedTotal = order.TotalAmount.ToString("N0") + " VNĐ",
                    PaymentMethod = order.PaymentMethod?.Name ?? "Tiền mặt",
                    OrderStatus = order.OrderStatus,
                    ShippingInfo = new
                    {
                        FullName = order.Address?.FullName ?? "N/A",
                        Phone = order.Address?.PhoneNumber ?? "N/A",
                        Address = $"{order.Address?.AddressLine1}, {order.Address?.City}, {order.Address?.State}",
                        Email = order.User?.Email ?? "N/A"
                    },
                    Products = order.OrderItems.Select(oi => new
                    {
                        Id = oi.ProductVariant.Product.Id,
                        Name = oi.ProductVariant.Product.Name,
                        Image = oi.ProductVariant.Product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                               ?? "/images/default-product.png",
                        Variant = $"{oi.ProductVariant.Color} - {oi.ProductVariant.Storage}",
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Total = oi.Price * oi.Quantity
                    }),
                    EstimatedDelivery = order.OrderDate.AddDays(3).ToString("dd/MM/yyyy")
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy thông tin đơn hàng", Error = ex.Message });
            }
        }
        // Lấy danh sách đơn hàng
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderDtos = orders.Select(order => new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                AddressId = order.AddressId,
                PaymentMethodId = order.PaymentMethodId,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductVariantId = oi.ProductVariantId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();

            return Ok(orderDtos);
        }
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderDto updateOrderDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Lấy đơn hàng hiện tại
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Đơn hàng không tồn tại.");
                }

                // Kiểm tra trạng thái đơn hàng - chỉ cho phép chỉnh sửa khi ở trạng thái Pending
                if (order.OrderStatus != "Pending")
                {
                    return BadRequest("Chỉ có thể chỉnh sửa đơn hàng khi ở trạng thái 'Chờ xử lý'");
                }

                // Cập nhật địa chỉ nếu có
                if (updateOrderDto.AddressId.HasValue)
                {
                    var address = await _context.Addresses.FindAsync(updateOrderDto.AddressId.Value);
                    if (address == null)
                    {
                        return BadRequest("Địa chỉ không tồn tại");
                    }
                    order.AddressId = updateOrderDto.AddressId.Value;
                }

                // Xử lý voucher
                Voucher? voucher = null;
                if (updateOrderDto.VoucherId.HasValue)
                {
                    voucher = await _context.Vouchers.FindAsync(updateOrderDto.VoucherId.Value);
                    if (voucher == null || !voucher.IsActive || voucher.ExpiryDate < DateTime.UtcNow)
                    {
                        return BadRequest("Voucher không hợp lệ.");
                    }
                    order.VoucherId = updateOrderDto.VoucherId;
                }
                else
                {
                    order.VoucherId = null;
                }

                // Xử lý các sản phẩm trong đơn hàng
                if (updateOrderDto.OrderItems != null && updateOrderDto.OrderItems.Count > 0)
                {
                    // Xóa các items cũ
                    _context.OrderItems.RemoveRange(order.OrderItems);

                    // Thêm các items mới
                    foreach (var itemDto in updateOrderDto.OrderItems)
                    {
                        var variant = await _context.ProductVariants
                            .Include(pv => pv.Product)
                            .FirstOrDefaultAsync(pv => pv.Id == itemDto.ProductVariantId);

                        if (variant == null)
                        {
                            return BadRequest($"Không tìm thấy biến thể sản phẩm với ID {itemDto.ProductVariantId}");
                        }

                        if (variant.StockQuantity < itemDto.Quantity)
                        {
                            return BadRequest($"Số lượng tồn kho không đủ cho sản phẩm {variant.Product.Name}");
                        }

                        order.OrderItems.Add(new OrderItem
                        {
                            ProductVariantId = itemDto.ProductVariantId,
                            Quantity = itemDto.Quantity,
                            Price = variant.DiscountPrice ?? variant.Price
                        });
                    }
                }

                // Tính toán lại tổng tiền
                order.TotalAmount = order.OrderItems.Sum(oi => oi.Quantity * oi.Price);

                // Áp dụng voucher nếu có
                if (voucher != null)
                {
                    order.TotalAmount -= voucher.DiscountAmount;
                    if (order.TotalAmount < 0) order.TotalAmount = 0;
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Đơn hàng đã được cập nhật thành công." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        //cập nhật một phần đơn
        [HttpPatch("{id}")]
        [Authorize]
        public async Task<IActionResult> PartialUpdateOrder(int id, [FromBody] JsonPatchDocument<Order> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest("Dữ liệu cập nhật không hợp lệ");
            }

            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound("Đơn hàng không tồn tại");
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.OrderStatus != "Pending")
            {
                return BadRequest("Chỉ có thể chỉnh sửa đơn hàng khi ở trạng thái 'Chờ xử lý'");
            }

            // Áp dụng các thay đổi
            patchDoc.ApplyTo(order);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra số lượng tồn kho nếu có thay đổi về sản phẩm
            if (patchDoc.Operations.Any(op => op.path.Contains("OrderItems")))
            {
                var orderWithItems = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == id);

                foreach (var item in orderWithItems.OrderItems)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                    if (variant.StockQuantity < item.Quantity)
                    {
                        return BadRequest($"Số lượng tồn kho không đủ cho sản phẩm ID {item.ProductVariantId}");
                    }
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đơn hàng đã được cập nhật thành công." });
        }
        // Tạo đơn hàng
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderDto orderDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Validate user
                User? user = null;
                if (orderDto.UserId.HasValue && orderDto.UserId.Value != 0)
                {
                    user = await _context.Users.FindAsync(orderDto.UserId.Value);
                    if (user == null) return NotFound("Người dùng không tồn tại.");
                }

                // Validate voucher
                Voucher? voucher = null;
                UserVoucher? userVoucher = null;
                if (orderDto.VoucherId.HasValue)
                {
                    voucher = await _context.Vouchers.FindAsync(orderDto.VoucherId.Value);
                    if (voucher == null || !voucher.IsActive || voucher.ExpiryDate < DateTime.UtcNow)
                    {
                        return BadRequest("Voucher không hợp lệ hoặc đã hết hạn.");
                    }

                    // Kiểm tra xem voucher đã được gán cho người dùng chưa
                    userVoucher = await _context.UserVouchers
                        .FirstOrDefaultAsync(uv => uv.VoucherId == voucher.Id && uv.UserId == orderDto.UserId.Value);
                    if (userVoucher == null)
                    {
                        return BadRequest("Bạn chưa sở hữu voucher này.");
                    }

                    // Kiểm tra trạng thái IsUsed
                    if (userVoucher.IsUsed)
                    {
                        return BadRequest("Voucher đã được sử dụng.");
                    }
                }

                // Kiểm tra số lượng tồn kho
                foreach (var item in orderDto.OrderItems)
                {
                    var variant = await _context.ProductVariants
                        .Include(pv => pv.Product)
                        .FirstOrDefaultAsync(pv => pv.Id == item.ProductVariantId);

                    if (variant == null) return BadRequest($"Không tìm thấy biến thể sản phẩm với ID {item.ProductVariantId}");
                    if (variant.StockQuantity < item.Quantity)
                        return BadRequest($"Số lượng tồn kho không đủ cho sản phẩm {variant.Product.Name}");
                }

                // Create order
                var order = new Order
                {
                    UserId = orderDto.UserId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = orderDto.TotalAmount,
                    OrderStatus = orderDto.PaymentMethodId == 1 ? "Pending" : "WaitingForPayment",
                    AddressId = orderDto.AddressId,
                    PaymentMethodId = orderDto.PaymentMethodId,
                    VoucherId = orderDto.VoucherId,
                    OrderItems = orderDto.OrderItems.Select(oi => new OrderItem
                    {
                        ProductVariantId = oi.ProductVariantId,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                };

                // Apply voucher discount
                if (voucher != null)
                {
                    order.TotalAmount -= voucher.DiscountAmount;
                    if (order.TotalAmount < 0) order.TotalAmount = 0;
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Trừ số lượng tồn kho
                foreach (var item in orderDto.OrderItems)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                    variant.StockQuantity -= item.Quantity;
                }

                // Thanh toán với MoMo (cả QR và thẻ)
                if (orderDto.PaymentMethodId == 2)
                {
                    try
                    {
                        var momoOrderId = $"SHN{order.Id}";
                        bool isCardPayment = Request.Headers["Payment-Type"].ToString() == "card";

                        var payUrl = await _momoService.CreatePaymentAsync(
                            momoOrderId,
                            $"Thanh toán đơn hàng SHN#{order.Id}",
                            (long)order.TotalAmount,
                            isCardPayment);

                        await transaction.CommitAsync();

                        return Ok(new
                        {
                            Success = true,
                            OrderId = order.Id,
                            PaymentUrl = payUrl,
                            Message = isCardPayment
                                ? "Vui lòng thanh toán bằng thẻ Visa/MasterCard"
                                : "Vui lòng thanh toán qua QR MoMo"
                        });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new
                        {
                            Success = false,
                            Message = "Lỗi khi khởi tạo thanh toán MoMo: " + ex.Message
                        });
                    }
                }

                // Process voucher and mark as used
                if (voucher != null && userVoucher != null)
                {
                    userVoucher.IsUsed = true;
                    _context.UserVouchers.Update(userVoucher);
                }

                // Remove purchased items from cart
                if (orderDto.UserId.HasValue)
                {
                    var productVariantIds = orderDto.OrderItems.Select(oi => oi.ProductVariantId).ToList();

                    var cartItemsToRemove = await _context.CartItems
                        .Where(ci => ci.Cart.UserId == orderDto.UserId.Value &&
                                     productVariantIds.Contains(ci.ProductVariantId))
                        .ToListAsync();

                    if (cartItemsToRemove.Any())
                    {
                        _context.CartItems.RemoveRange(cartItemsToRemove);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Đơn hàng đã được tạo.",
                    OrderId = order.Id,
                    CartItemsRemoved = orderDto.UserId.HasValue // Indicate if cart items were removed
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // MoMo payment callback
        [HttpPost("momo/callback")]
        public async Task<IActionResult> MoMoCallback([FromBody] MoMoCallbackModel callback)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Verify signature
                var rawData = $"accessKey={_configuration["MoMoConfig:AccessKey"]}" +
                             $"&amount={callback.Amount}" +
                             $"&extraData=" +
                             $"&ipnUrl={_configuration["MoMoConfig:NotifyUrl"]}" +
                             $"&orderId={callback.OrderId}" +
                             $"&orderInfo={callback.OrderInfo}" +
                             $"&partnerCode={callback.PartnerCode}" +
                             $"&redirectUrl={_configuration["MoMoConfig:ReturnUrl"]}" +
                             $"&requestId={callback.RequestId}" +
                             $"&requestType={_configuration["MoMoConfig:RequestType"]}";

                if (!_momoService.VerifySignature(callback.Signature, rawData))
                {
                    return BadRequest("Invalid signature");
                }

                // Find order
                var orderIdStr = callback.OrderId.Replace("SHN", "");
                if (!int.TryParse(orderIdStr, out int orderId))
                {
                    return BadRequest("Invalid order ID");
                }

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Update payment info
                order.MoMoTransId = callback.TransId;
                order.MoMoResponse = JsonConvert.SerializeObject(callback);

                // Process payment result
                if (callback.ResultCode == 0) // Success
                {
                    order.OrderStatus = "Paid";

                    // Trừ số lượng tồn kho (nếu chưa trừ)
                    foreach (var item in order.OrderItems)
                    {
                        var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                        if (variant != null)
                        {
                            variant.StockQuantity -= item.Quantity;
                        }
                    }

                    // Mark voucher as used if exists
                    if (order.VoucherId.HasValue && order.UserId.HasValue)
                    {
                        var userVoucher = new UserVoucher
                        {
                            UserId = order.UserId.Value,
                            VoucherId = order.VoucherId.Value,
                            UsedAt = DateTime.UtcNow
                        };
                        _context.UserVouchers.Add(userVoucher);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Trả về URL xác nhận
                    return Ok(new
                    {
                        Success = true,
                        RedirectUrl = $"/order-confirmation/{orderId}",
                        OrderId = orderId
                    });
                }
                else // Failed
                {
                    order.OrderStatus = "PaymentFailed";
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        Success = false,
                        RedirectUrl = $"/checkout?payment=failed&orderId={orderId}",
                        Message = callback.Message
                    });
                }


            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Lấy thông tin đơn hàng theo Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound("Đơn hàng không tồn tại.");
            }

            var orderDto = new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                AddressId = order.AddressId,
                PaymentMethodId = order.PaymentMethodId,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductVariantId = oi.ProductVariantId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };

            return Ok(orderDto);
        }

        // Xóa đơn hàng
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound("Đơn hàng không tồn tại.");
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đơn hàng đã được xóa." });
        }

        // Cập nhật trạng thái đơn hàng
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusDto updateStatusDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Đơn hàng không tồn tại.");
                }

                // Lưu trạng thái cũ để kiểm tra
                var oldStatus = order.OrderStatus;
                order.OrderStatus = updateStatusDto.NewStatus;

                // Nếu chuyển sang trạng thái "Delivered" và trước đó chưa phải là "Delivered"
                if (updateStatusDto.NewStatus == "Delivered" && oldStatus != "Delivered")
                {
                    // Cộng 500 điểm cho user
                    if (order.UserId.HasValue && order.User != null)
                    {
                        order.User.Points += 500;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Trạng thái đơn hàng đã được cập nhật." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // Lấy danh sách đơn hàng theo userId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images) // Lấy hình ảnh sản phẩm
                .ToListAsync();

            if (orders == null || orders.Count == 0)
            {
                return NotFound("Không tìm thấy đơn hàng nào cho người dùng này.");
            }

            var orderDtos = orders.Select(order => new
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                AddressId = order.AddressId,
                PaymentMethodId = order.PaymentMethodId,
                Items = order.OrderItems.Select(oi => new
                {
                    ProductName = oi.ProductVariant.Product.Name,
                    ProductDescription = oi.ProductVariant.Product.Description,
                    ProductImage = oi.ProductVariant.Product.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl,
                    VariantColor = oi.ProductVariant.Color,
                    VariantStorage = oi.ProductVariant.Storage,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();

            return Ok(orderDtos);
        }

        [HttpGet("user/{userId}/paged")]
        public async Task<IActionResult> GetPagedOrdersByUserId(int userId, int page = 1, int pageSize = 10)
        {
            var query = _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ThenInclude(pv => pv.Product)
                .ThenInclude(p => p.Images) // Lấy hình ảnh sản phẩm
                .OrderByDescending(o => o.OrderDate);

            var totalOrders = await query.CountAsync();
            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var orderDtos = orders.Select(order => new
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                AddressId = order.AddressId,
                PaymentMethodId = order.PaymentMethodId,
                Items = order.OrderItems.Select(oi => new
                {
                    ProductName = oi.ProductVariant.Product.Name,
                    ProductDescription = oi.ProductVariant.Product.Description,
                    ProductImage = oi.ProductVariant.Product.Images
                                .OrderByDescending(img => img.IsPrimary)
                                .ThenBy(img => img.Id)
                                .FirstOrDefault()?.ImageUrl ?? "/images/default-product.png",
                    VariantColor = oi.ProductVariant.Color,
                    VariantStorage = oi.ProductVariant.Storage,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();

            return Ok(new
            {
                TotalOrders = totalOrders,
                Page = page,
                PageSize = pageSize,
                Orders = orderDtos
            });
        }
        // Tổng doanh thu theo ngày
        [HttpGet("revenue/day")]
        public async Task<IActionResult> GetDailyRevenue()
        {
            var today = DateTime.UtcNow.Date;
            var revenue = await _context.Orders
                .Where(o => o.OrderDate.Date == today && o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { Revenue = revenue });
        }

        // Tổng doanh thu theo tuần
        [HttpGet("revenue/week")]
        public async Task<IActionResult> GetWeeklyRevenue()
        {
            var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
            var revenue = await _context.Orders
                .Where(o => o.OrderDate.Date >= startOfWeek && o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { Revenue = revenue });
        }

        // Tổng doanh thu theo tháng
        [HttpGet("revenue/month")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var revenue = await _context.Orders
                .Where(o => o.OrderDate.Date >= startOfMonth && o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { Revenue = revenue });
        }

        // Tổng doanh thu theo năm
        [HttpGet("revenue/year")]
        public async Task<IActionResult> GetYearlyRevenue()
        {
            var startOfYear = new DateTime(DateTime.UtcNow.Year, 1, 1);
            var revenue = await _context.Orders
                .Where(o => o.OrderDate.Date >= startOfYear && o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { Revenue = revenue });
        }

        // Số lượng đơn hàng đã hoàn thành
        [HttpGet("completed-orders")]
        public async Task<IActionResult> GetCompletedOrdersCount()
        {
            var count = await _context.Orders
                .Where(o => o.OrderStatus == "Delivered")
                .CountAsync();

            return Ok(new { CompletedOrders = count });
        }

        // Số lượng đơn hàng chờ xác nhận
        [HttpGet("pending-orders")]
        public async Task<IActionResult> GetPendingOrdersCount()
        {
            var count = await _context.Orders
                .Where(o => o.OrderStatus == "Pending")
                .CountAsync();

            return Ok(new { PendingOrders = count });
        }

        // Tổng tiền đơn hàng đã hoàn thành
        [HttpGet("completed-orders-total")]
        public async Task<IActionResult> GetCompletedOrdersTotal()
        {
            var total = await _context.Orders
                .Where(o => o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { CompletedOrdersTotal = total });
        }

        // Tổng doanh thu
        [HttpGet("total-revenue")]
        public async Task<IActionResult> GetTotalRevenue()
        {
            var totalRevenue = await _context.Orders
                .Where(o => o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { TotalRevenue = totalRevenue });
        }

        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product) // Thêm ThenInclude để lấy Product
                                        .ThenInclude(p => p.Images) // QUAN TRỌNG: Include cả Images

                .Include(o => o.Address)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound("Đơn hàng không tồn tại.");
            }

            Console.WriteLine($"Order {id} has {order.OrderItems.Count} items");

            var orderDetails = new
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                AddressId = order.AddressId,
                Address = order.Address != null ? new
                {
                    Id = order.Address.Id,
                    FullName = order.Address.FullName,
                    PhoneNumber = order.Address.PhoneNumber,
                    AddressLine1 = order.Address.AddressLine1,
                    AddressLine2 = order.Address.AddressLine2,
                    City = order.Address.City,
                    State = order.Address.State,
                    ZipCode = order.Address.ZipCode,
                    Country = order.Address.Country
                } : null,
                PaymentMethodId = order.PaymentMethodId,
                Items = order.OrderItems.Select(oi => new
                {
                    VariantId = oi.ProductVariantId,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    // ProductImage = oi.ProductVariant?.Product?.Images, // Lấy ảnh từ Product
                    ProductImage = oi.ProductVariant.Product.Images
                                .OrderByDescending(img => img.IsPrimary)
                                .ThenBy(img => img.Id)
                                .FirstOrDefault()?.ImageUrl ?? "/images/default-product.png",
                    ProductName = oi.ProductVariant?.Product?.Name // Có thể thêm tên sản phẩm nếu cần
                }).ToList()
            };

            return Ok(orderDetails);
        }
        [HttpGet("{orderId}/export/excel")]
        public async Task<IActionResult> ExportOrderToExcel(int orderId)
        {
            try
            {
                // Lấy thông tin đơn hàng từ database
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                    .Include(o => o.Address)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return NotFound(new { Message = $"Không tìm thấy đơn hàng với ID {orderId}" });
                }

                // Tạo file Excel với EPPlus
                using (var excelPackage = new ExcelPackage())
                {
                    // Tạo worksheet
                    var worksheet = excelPackage.Workbook.Worksheets.Add("Hóa đơn");

                    // Định dạng tiêu đề
                    worksheet.Cells["A1"].Value = "HÓA ĐƠN BÁN HÀNG";
                    worksheet.Cells["A1:E1"].Merge = true;
                    worksheet.Cells["A1"].Style.Font.Bold = true;
                    worksheet.Cells["A1"].Style.Font.Size = 16;
                    worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Thông tin đơn hàng
                    worksheet.Cells["A3"].Value = "Mã đơn hàng:";
                    worksheet.Cells["B3"].Value = order.Id;
                    worksheet.Cells["A4"].Value = "Ngày tạo:";
                    worksheet.Cells["B4"].Value = order.OrderDate.ToString("dd/MM/yyyy HH:mm");
                    worksheet.Cells["A5"].Value = "Khách hàng:";
                    worksheet.Cells["B5"].Value = order.Address?.FullName ?? "N/A";

                    // Tiêu đề bảng
                    var headerRow = 7;
                    worksheet.Cells[headerRow, 1].Value = "STT";
                    worksheet.Cells[headerRow, 2].Value = "Tên sản phẩm";
                    worksheet.Cells[headerRow, 3].Value = "Số lượng";
                    worksheet.Cells[headerRow, 4].Value = "Đơn giá";
                    worksheet.Cells[headerRow, 5].Value = "Thành tiền";

                    // Định dạng tiêu đề bảng
                    using (var range = worksheet.Cells[headerRow, 1, headerRow, 5])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    }

                    // Đổ dữ liệu sản phẩm
                    int row = 8;
                    foreach (var item in order.OrderItems)
                    {
                        worksheet.Cells[row, 1].Value = row - headerRow;
                        worksheet.Cells[row, 2].Value = item.ProductVariant.Product.Name;
                        worksheet.Cells[row, 3].Value = item.Quantity;
                        worksheet.Cells[row, 4].Value = item.Price;
                        worksheet.Cells[row, 4].Style.Numberformat.Format = "#,##0";
                        worksheet.Cells[row, 5].Value = item.Quantity * item.Price;
                        worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0";
                        row++;
                    }

                    // Tổng cộng
                    worksheet.Cells[row, 4].Value = "Tổng cộng:";
                    worksheet.Cells[row, 4].Style.Font.Bold = true;
                    worksheet.Cells[row, 5].Value = order.TotalAmount;
                    worksheet.Cells[row, 5].Style.Font.Bold = true;
                    worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0";

                    // Tự động điều chỉnh độ rộng cột
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    // Xuất file
                    var stream = new MemoryStream();
                    excelPackage.SaveAs(stream);
                    stream.Position = 0;

                    return File(
                        fileContents: stream.ToArray(),
                        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        fileDownloadName: $"HoaDon_{orderId}.xlsx");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi xuất file Excel" });
            }
        }

        // Hàm chuyển đổi số thành chữ tiếng Việt (CẦN TRIỂN KHAI HOẶC DÙNG THƯ VIỆN)
        private string ConvertNumberToWords_VI(decimal number)
        {
            if (number == 0) return "Không đồng";
            // Hàm NumberToTextVN.DocSo chịu trách nhiệm chính cho việc chuyển đổi.
            // Thêm "(... đồng chẵn./.)" là một quy ước thường thấy trên hóa đơn.
            return $"({NumberToTextVN.DocSo((long)Math.Round(number))} đồng chẵn./.)";
        }


        private async Task<OrderInvoiceViewModel> PrepareInvoiceViewModel(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                .Include(o => o.Address)
                .Include(o => o.PaymentMethod)
                // .Include(o => o.User) // Không còn cần User nếu chỉ lấy TaxCode từ đó
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return null;
            }

            var sellerInfo = new SellerInfo();

            decimal subtotal = order.OrderItems.Sum(oi => oi.Quantity * oi.Price);
            decimal vatRate = 0.1m;
            decimal vatAmount = subtotal * vatRate;
            decimal finalTotal = subtotal + vatAmount;

            // Không còn lấy BuyerTaxCode nữa
            // string buyerTaxCode = order.User?.TaxCode; 
            // if (string.IsNullOrEmpty(buyerTaxCode) && order.Address is ExtendedAddress extAddr)
            // {
            //     buyerTaxCode = extAddr.TaxCode;
            // }

            var viewModel = new OrderInvoiceViewModel
            {
                OrderId = order.Id,
                OrderDate = order.OrderDate,
                Seller = sellerInfo,
                BuyerFullName = order.Address?.FullName ?? "N/A",
                BuyerAddress = order.Address?.AddressLine1 ?? "N/A",
                // BuyerTaxCode = buyerTaxCode ?? "N/A", // <<<< LOẠI BỎ DÒNG NÀY
                PaymentMethodName = order.PaymentMethod?.Name ?? "Tiền mặt",
                Items = order.OrderItems.Select((item, index) => new InvoiceItemViewModel
                {
                    Index = index + 1,
                    ProductName = item.ProductVariant?.Product?.Name ?? "N/A",
                    Quantity = item.Quantity,
                    Price = item.Price
                }).ToList(),
                SubtotalAmount = subtotal,
                VatRate = vatRate,
                VatAmount = vatAmount,
                FinalTotalAmount = finalTotal,
                TotalAmountInWords = ConvertNumberToWords_VI(finalTotal)
            };

            return viewModel;
        }

        [HttpGet("{id}/export/image")]
        public async Task<IActionResult> ExportOrderToImage(int id)
        {
            try
            {
                var invoiceData = await PrepareInvoiceViewModel(id);
                if (invoiceData == null)
                {
                    return NotFound("Không tìm thấy đơn hàng hoặc không thể chuẩn bị dữ liệu hóa đơn.");
                }

                int width = 800;
                float currentY = 10f;
                float lineSpacing = 5f;
                float sectionSpacing = 15f;
                float leftMargin = 20f;
                float rightMarginContent = width - 20f;

                var titleFont = new System.Drawing.Font("Arial", 16, System.Drawing.FontStyle.Bold);
                var headerFont = new System.Drawing.Font("Arial", 10, System.Drawing.FontStyle.Bold);
                var normalFont = new System.Drawing.Font("Arial", 9, System.Drawing.FontStyle.Regular);
                var smallFont = new System.Drawing.Font("Arial", 8, System.Drawing.FontStyle.Regular);
                var blackBrush = Brushes.Black;
                var grayBrush = Brushes.Gray;

                var sfCenter = new StringFormat { Alignment = StringAlignment.Center };
                var sfRight = new StringFormat { Alignment = StringAlignment.Far };
                var sfLeft = new StringFormat { Alignment = StringAlignment.Near };

                int baseHeight = 430; // Giảm nhẹ baseHeight do bỏ BuyerTaxCode
                int itemRowHeight = 20;
                int calculatedHeight = baseHeight + (invoiceData.Items.Count * itemRowHeight) + (invoiceData.Items.Count > 0 ? 20 : 0);
                int height = Math.Max(580, calculatedHeight); // Giảm chiều cao tối thiểu nếu cần

                using (var bitmap = new Bitmap(width, height))
                using (var graphics = Graphics.FromImage(bitmap))
                {
                    graphics.Clear(Color.White);
                    graphics.SmoothingMode = SmoothingMode.AntiAlias;
                    graphics.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;

                    var sellerInfo = invoiceData.Seller;

                    // Vẽ Thông tin người bán
                    graphics.DrawString(sellerInfo.CompanyName, headerFont, blackBrush, leftMargin, currentY);
                    currentY += headerFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString(sellerInfo.Address, normalFont, blackBrush, leftMargin, currentY);
                    currentY += normalFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString(sellerInfo.TaxCode, normalFont, blackBrush, leftMargin, currentY);
                    currentY += normalFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString(sellerInfo.PhoneNumber, normalFont, blackBrush, leftMargin, currentY);
                    currentY += normalFont.GetHeight(graphics) + sectionSpacing;

                    // Vẽ Thông tin hóa đơn (Mẫu số, Ký hiệu, Số)
                    float initialYForInvoiceMeta = 10f;
                    graphics.DrawString($"Mẫu số: {invoiceData.InvoiceTemplateNo}", normalFont, blackBrush, width - 200, initialYForInvoiceMeta, sfLeft);
                    initialYForInvoiceMeta += normalFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString($"Ký hiệu: {invoiceData.InvoiceSeries}", normalFont, blackBrush, width - 200, initialYForInvoiceMeta, sfLeft);
                    initialYForInvoiceMeta += normalFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString($"Số: {invoiceData.InvoiceNumberFormatted}", normalFont, blackBrush, width - 200, initialYForInvoiceMeta, sfLeft);

                    // Vẽ Tiêu đề hóa đơn
                    string invoiceTitle = "HÓA ĐƠN BÁN HÀNG";
                    SizeF titleSize = graphics.MeasureString(invoiceTitle, titleFont);
                    graphics.DrawString(invoiceTitle, titleFont, blackBrush, (width - titleSize.Width) / 2, currentY);
                    currentY += titleSize.Height + lineSpacing;
                    SizeF dateSize = graphics.MeasureString(invoiceData.FormattedOrderDate, normalFont);
                    graphics.DrawString(invoiceData.FormattedOrderDate, normalFont, blackBrush, (width - dateSize.Width) / 2, currentY);
                    currentY += dateSize.Height + sectionSpacing;

                    // Vẽ Thông tin người mua (đã bỏ Mã số thuế)
                    graphics.DrawString($"Đơn vị mua hàng (Họ tên người mua): {invoiceData.BuyerFullName}", normalFont, blackBrush, leftMargin, currentY);
                    currentY += normalFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString($"Địa chỉ: {invoiceData.BuyerAddress}", normalFont, blackBrush, leftMargin, currentY);
                    currentY += normalFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawString($"Hình thức thanh toán: {invoiceData.PaymentMethodName}", normalFont, blackBrush, leftMargin, currentY);
                    currentY += normalFont.GetHeight(graphics) + sectionSpacing;

                    // Vẽ Bảng chi tiết sản phẩm (đã bỏ cột ĐVT)
                    float tableHeaderY = currentY;
                    float colSttX = leftMargin;
                    float colProductNameX = colSttX + 40;
                    float colQuantityX = colProductNameX + 380; // Tăng chiều rộng cột Tên sản phẩm thêm
                    float colUnitPriceX = colQuantityX + 100;  // Dịch chuyển cột Số lượng
                    float colAmountX = colUnitPriceX + 100;    // Dịch chuyển cột Đơn giá

                    graphics.DrawLine(Pens.Black, leftMargin, tableHeaderY, rightMarginContent, tableHeaderY);
                    tableHeaderY += lineSpacing;
                    graphics.DrawString("STT", headerFont, blackBrush, colSttX, tableHeaderY);
                    graphics.DrawString("Tên hàng hóa, dịch vụ", headerFont, blackBrush, colProductNameX, tableHeaderY);
                    graphics.DrawString("Số lượng", headerFont, blackBrush, colQuantityX, tableHeaderY, sfRight);
                    graphics.DrawString("Đơn giá", headerFont, blackBrush, colUnitPriceX, tableHeaderY, sfRight);
                    graphics.DrawString("Thành tiền", headerFont, blackBrush, colAmountX, tableHeaderY, sfRight);

                    tableHeaderY += headerFont.GetHeight(graphics) + lineSpacing;
                    graphics.DrawLine(Pens.Black, leftMargin, tableHeaderY, rightMarginContent, tableHeaderY);
                    currentY = tableHeaderY;

                    if (invoiceData.Items.Any())
                    {
                        foreach (var item in invoiceData.Items)
                        {
                            currentY += lineSpacing;
                            graphics.DrawString(item.Index.ToString(), normalFont, blackBrush, colSttX + 5, currentY);
                            graphics.DrawString(item.ProductName, normalFont, blackBrush, colProductNameX, currentY, new StringFormat { Trimming = StringTrimming.EllipsisCharacter });
                            graphics.DrawString(item.Quantity.ToString(), normalFont, blackBrush, colQuantityX, currentY, sfRight);
                            graphics.DrawString(item.Price.ToString("N0"), normalFont, blackBrush, colUnitPriceX, currentY, sfRight);
                            graphics.DrawString(item.Amount.ToString("N0"), normalFont, blackBrush, colAmountX, currentY, sfRight);
                            currentY += itemRowHeight;
                            graphics.DrawLine(Pens.LightGray, leftMargin, currentY, rightMarginContent, currentY);
                        }
                    }
                    else
                    {
                        currentY += itemRowHeight;
                        graphics.DrawString("Không có sản phẩm/dịch vụ.", normalFont, grayBrush, (width - graphics.MeasureString("Không có sản phẩm/dịch vụ.", normalFont).Width) / 2, currentY);
                        currentY += itemRowHeight;
                        graphics.DrawLine(Pens.LightGray, leftMargin, currentY, rightMarginContent, currentY);
                    }

                    // Vẽ Phần tổng cộng
                    currentY += lineSpacing;
                    float summaryLabelX = colUnitPriceX - 120; // Điều chỉnh cho phù hợp với cột mới
                    float summaryValueX = colAmountX;

                    graphics.DrawString("Cộng tiền hàng:", normalFont, blackBrush, summaryLabelX, currentY, sfRight);
                    graphics.DrawString(invoiceData.SubtotalAmount.ToString("N0"), normalFont, blackBrush, summaryValueX, currentY, sfRight);
                    currentY += normalFont.GetHeight(graphics) + lineSpacing;

                    if (invoiceData.VatAmount > 0)
                    {
                        graphics.DrawString($"Thuế GTGT ({invoiceData.VatRateFormatted}):", normalFont, blackBrush, summaryLabelX, currentY, sfRight);
                        graphics.DrawString(invoiceData.VatAmount.ToString("N0"), normalFont, blackBrush, summaryValueX, currentY, sfRight);
                        currentY += normalFont.GetHeight(graphics) + lineSpacing;
                    }

                    graphics.DrawLine(Pens.Black, summaryLabelX - 70, currentY, rightMarginContent, currentY);
                    currentY += lineSpacing;

                    graphics.DrawString("TỔNG CỘNG THANH TOÁN:", headerFont, blackBrush, summaryLabelX, currentY, sfRight);
                    graphics.DrawString(invoiceData.FinalTotalAmount.ToString("N0"), headerFont, blackBrush, summaryValueX, currentY, sfRight);
                    currentY += headerFont.GetHeight(graphics) + lineSpacing;

                    RectangleF wordsRect = new RectangleF(leftMargin, currentY, width - leftMargin - leftMargin, 40);
                    graphics.DrawString($"Số tiền viết bằng chữ: {invoiceData.TotalAmountInWords}", normalFont, blackBrush, wordsRect, sfLeft);
                    currentY += 40 + sectionSpacing;

                    // Vẽ Chữ ký
                    float signatureY = Math.Max(currentY, height - 100);
                    float buyerSignatureX = leftMargin + 100; // Điều chỉnh vị trí chữ ký
                    float sellerSignatureX = width - 100 - graphics.MeasureString("Người bán hàng", headerFont).Width / 2 - 50; // Điều chỉnh

                    graphics.DrawString("Người mua hàng", headerFont, blackBrush, buyerSignatureX, signatureY, sfCenter);
                    graphics.DrawString("(Ký, ghi rõ họ tên)", smallFont, blackBrush, buyerSignatureX, signatureY + headerFont.GetHeight(graphics) + 2, sfCenter);

                    graphics.DrawString("Người bán hàng", headerFont, blackBrush, sellerSignatureX, signatureY, sfCenter);
                    graphics.DrawString("(Ký, ghi rõ họ tên, đóng dấu)", smallFont, blackBrush, sellerSignatureX, signatureY + headerFont.GetHeight(graphics) + 2, sfCenter);

                    // Vẽ Footer
                    string footerMessage = "Xin cảm ơn Quý khách!";
                    SizeF footerSize = graphics.MeasureString(footerMessage, normalFont);
                    graphics.DrawString(footerMessage, normalFont, grayBrush, (width - footerSize.Width) / 2, height - footerSize.Height - 10);

                    using (var stream = new MemoryStream())
                    {
                        bitmap.Save(stream, ImageFormat.Png);
                        stream.Position = 0;
                        return File(stream.ToArray(), "image/png", $"HoaDon_{invoiceData.OrderId}_{DateTime.Now:yyyyMMddHHmmss}.png");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Lỗi khi xuất hóa đơn ảnh cho Order ID {id}: {ex.ToString()}");
                return StatusCode(500, $"Lỗi máy chủ nội bộ khi xuất hóa đơn ảnh: {ex.Message}");
            }
        }

        // --- HÀM XUẤT HÓA ĐƠN RA PDF ---
        [HttpGet("{id}/export/template")]
        public async Task<IActionResult> ExportOrderToPdf(int id)
        {
            try
            {
                var invoiceData = await PrepareInvoiceViewModel(id);
                if (invoiceData == null)
                {
                    return NotFound("Không tìm thấy đơn hàng hoặc không thể chuẩn bị dữ liệu hóa đơn.");
                }

                using (var stream = new MemoryStream())
                {
                    var document = new Document(PageSize.A4, 30, 30, 30, 30);
                    PdfWriter writer = PdfWriter.GetInstance(document, stream);
                    document.Open();

                    BaseFont bfBase;
                    try
                    {
                        string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
                        string fontFileName = "times.ttf"; // HOẶC "arial.ttf" - ĐẢM BẢO FILE NÀY TỒN TẠI
                        string fontPath = Path.Combine(baseDirectory, "Fonts", fontFileName);
                        if (!System.IO.File.Exists(fontPath))
                        {
                            // Thử tìm trong thư mục font hệ thống như một giải pháp dự phòng cuối cùng
                            string systemFontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), fontFileName);
                            if (System.IO.File.Exists(systemFontPath))
                            {
                                fontPath = systemFontPath;
                            }
                            else
                            {
                                throw new FileNotFoundException($"File font '{fontFileName}' không được tìm thấy tại '{Path.Combine(baseDirectory, "Fonts")}' hoặc trong thư mục font hệ thống.");
                            }
                        }
                        bfBase = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    }
                    catch (Exception fontEx)
                    {
                        Console.Error.WriteLine($"LỖI nghiêm trọng khi tải font: {fontEx.ToString()}. PDF có thể không hiển thị đúng tiếng Việt. Sử dụng font mặc định.");
                        bfBase = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED);
                    }

                    iTextSharp.text.Font fontTitle = new iTextSharp.text.Font(bfBase, 18, iTextSharp.text.Font.BOLD);
                    iTextSharp.text.Font fontHeader = new iTextSharp.text.Font(bfBase, 11, iTextSharp.text.Font.BOLD);
                    iTextSharp.text.Font fontNormal = new iTextSharp.text.Font(bfBase, 10, iTextSharp.text.Font.NORMAL);
                    iTextSharp.text.Font fontNormalBold = new iTextSharp.text.Font(bfBase, 10, iTextSharp.text.Font.BOLD);
                    iTextSharp.text.Font fontSmall = new iTextSharp.text.Font(bfBase, 9, iTextSharp.text.Font.NORMAL);

                    // Vẽ Header (Thông tin người bán & Thông tin hóa đơn)
                    PdfPTable headerTable = new PdfPTable(2) { WidthPercentage = 100 };
                    headerTable.SetWidths(new float[] { 60f, 40f });
                    PdfPCell sellerCell = new PdfPCell { Border = PdfPCell.NO_BORDER, Padding = 5f };
                    sellerCell.AddElement(new Paragraph(invoiceData.Seller.CompanyName, fontHeader));
                    sellerCell.AddElement(new Paragraph(invoiceData.Seller.Address, fontNormal));
                    sellerCell.AddElement(new Paragraph(invoiceData.Seller.TaxCode, fontNormal));
                    sellerCell.AddElement(new Paragraph(invoiceData.Seller.PhoneNumber, fontNormal));
                    headerTable.AddCell(sellerCell);
                    PdfPCell invoiceMetaCell = new PdfPCell { Border = PdfPCell.NO_BORDER, Padding = 5f };
                    invoiceMetaCell.AddElement(new Paragraph($"Mẫu số: {invoiceData.InvoiceTemplateNo}", fontNormal) { Alignment = Element.ALIGN_RIGHT });
                    invoiceMetaCell.AddElement(new Paragraph($"Ký hiệu: {invoiceData.InvoiceSeries}", fontNormal) { Alignment = Element.ALIGN_RIGHT });
                    invoiceMetaCell.AddElement(new Paragraph($"Số: {invoiceData.InvoiceNumberFormatted}", fontNormal) { Alignment = Element.ALIGN_RIGHT });
                    document.Add(headerTable);

                    // Vẽ Tiêu đề hóa đơn
                    Paragraph title = new Paragraph("HÓA ĐƠN BÁN HÀNG", fontTitle)
                    { Alignment = Element.ALIGN_CENTER, SpacingBefore = 10f, SpacingAfter = 5f };
                    document.Add(title);
                    Paragraph invoiceDate = new Paragraph(invoiceData.FormattedOrderDate, fontNormal)
                    { Alignment = Element.ALIGN_CENTER, SpacingAfter = 20f };
                    document.Add(invoiceDate);

                    // Vẽ Thông tin người mua (đã bỏ Mã số thuế)
                    document.Add(new Paragraph($"Đơn vị mua hàng (Họ tên người mua): {invoiceData.BuyerFullName}", fontNormal));
                    document.Add(new Paragraph($"Địa chỉ: {invoiceData.BuyerAddress}", fontNormal));
                    document.Add(new Paragraph($"Hình thức thanh toán: {invoiceData.PaymentMethodName}", fontNormal));
                    document.Add(new Paragraph(" ") { SpacingAfter = 5f });

                    // Vẽ Bảng chi tiết sản phẩm (đã bỏ cột ĐVT)
                    PdfPTable itemsTable = new PdfPTable(5); // 5 cột
                    itemsTable.WidthPercentage = 100;
                    itemsTable.SetWidths(new float[] { 5f, 50f, 10f, 15f, 20f }); // STT, Tên, SL, Đơn giá, Thành tiền
                    itemsTable.SpacingBefore = 10f;

                    string[] tableHeaders = { "STT", "Tên hàng hóa, dịch vụ", "Số lượng", "Đơn giá (VNĐ)", "Thành tiền (VNĐ)" };
                    foreach (string headerText in tableHeaders)
                    {
                        PdfPCell headerCell = new PdfPCell(new Phrase(headerText, fontNormalBold))
                        { HorizontalAlignment = Element.ALIGN_CENTER, VerticalAlignment = Element.ALIGN_MIDDLE, BackgroundColor = new BaseColor(217, 217, 217), Padding = 5f };
                        itemsTable.AddCell(headerCell);
                    }

                    foreach (var item in invoiceData.Items)
                    {
                        itemsTable.AddCell(new PdfPCell(new Phrase(item.Index.ToString(), fontNormal)) { Padding = 5f, HorizontalAlignment = Element.ALIGN_CENTER });
                        itemsTable.AddCell(new PdfPCell(new Phrase(item.ProductName, fontNormal)) { Padding = 5f });
                        itemsTable.AddCell(new PdfPCell(new Phrase(item.Quantity.ToString(), fontNormal)) { Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT });
                        itemsTable.AddCell(new PdfPCell(new Phrase(item.Price.ToString("N0"), fontNormal)) { Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT });
                        itemsTable.AddCell(new PdfPCell(new Phrase(item.Amount.ToString("N0"), fontNormal)) { Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT });
                    }
                    document.Add(itemsTable);

                    // Vẽ Phần tổng kết
                    PdfPTable summaryTable = new PdfPTable(2) { WidthPercentage = 100, SpacingBefore = 10f };
                    summaryTable.SetWidths(new float[] { 75f, 25f });
                    summaryTable.DefaultCell.Border = PdfPCell.NO_BORDER;
                    summaryTable.DefaultCell.Padding = 3f;
                    summaryTable.AddCell(new Phrase("Cộng tiền hàng:", fontNormal));
                    var subtotalCell = new PdfPCell(new Phrase(invoiceData.SubtotalAmount.ToString("N0") + " VNĐ", fontNormal));
                    subtotalCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    summaryTable.AddCell(subtotalCell);
                    summaryTable.AddCell(new Phrase($"Tiền thuế GTGT ({invoiceData.VatRateFormatted}):", fontNormal));
                    var vatAmountCell = new PdfPCell(new Phrase(invoiceData.VatAmount.ToString("N0") + " VNĐ", fontNormal));
                    vatAmountCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    summaryTable.AddCell(vatAmountCell);
                    summaryTable.AddCell(new Phrase("Tổng cộng tiền thanh toán:", fontNormalBold));
                    var finalTotalCell = new PdfPCell(new Phrase(invoiceData.FinalTotalAmount.ToString("N0") + " VNĐ", fontNormalBold));
                    finalTotalCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    summaryTable.AddCell(finalTotalCell);
                    document.Add(summaryTable);

                    Paragraph amountInWords = new Paragraph($"Số tiền viết bằng chữ: {invoiceData.TotalAmountInWords}", fontNormal)
                    { SpacingBefore = 5f, SpacingAfter = 20f };
                    document.Add(amountInWords);

                    // Vẽ Chữ ký
                    PdfPTable signatureTable = new PdfPTable(2) { WidthPercentage = 100, SpacingBefore = 30f };
                    signatureTable.SetWidths(new float[] { 50f, 50f });
                    signatureTable.DefaultCell.Border = PdfPCell.NO_BORDER;
                    PdfPCell buyerSignCellPdf = new PdfPCell { Border = PdfPCell.NO_BORDER, HorizontalAlignment = Element.ALIGN_CENTER };
                    buyerSignCellPdf.AddElement(new Paragraph("Người mua hàng", fontNormalBold) { Alignment = Element.ALIGN_CENTER });
                    buyerSignCellPdf.AddElement(new Paragraph("(Ký, ghi rõ họ tên)", fontSmall) { Alignment = Element.ALIGN_CENTER });
                    signatureTable.AddCell(buyerSignCellPdf);
                    PdfPCell sellerSignCellPdf = new PdfPCell { Border = PdfPCell.NO_BORDER, HorizontalAlignment = Element.ALIGN_CENTER };
                    sellerSignCellPdf.AddElement(new Paragraph("Người bán hàng", fontNormalBold) { Alignment = Element.ALIGN_CENTER });
                    sellerSignCellPdf.AddElement(new Paragraph("(Ký, ghi rõ họ tên, đóng dấu)", fontSmall) { Alignment = Element.ALIGN_CENTER });
                    signatureTable.AddCell(sellerSignCellPdf);
                    document.Add(signatureTable);

                    document.Close();
                    writer.Close();

                    return File(stream.ToArray(), "application/pdf", $"HoaDon_{invoiceData.OrderId}_{DateTime.Now:yyyyMMddHHmmss}.pdf");
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Lỗi khi xuất hóa đơn PDF cho Order ID {id}: {ex.ToString()}");
                return StatusCode(500, $"Lỗi máy chủ nội bộ khi xuất hóa đơn PDF: {ex.Message}");
            }
        }
        // Lấy địa chỉ theo đơn
        [HttpGet("by-phone/{phoneNumber}")]
        public async Task<IActionResult> GetOrdersByPhoneNumber(string phoneNumber)
        {
            try
            {
                // Tìm các địa chỉ có số điện thoại trùng khớp
                var addresses = await _context.Addresses
                    .Where(a => a.PhoneNumber == phoneNumber)
                    .Select(a => a.Id) // Chỉ lấy ID
                    .ToListAsync();

                if (!addresses.Any())
                {
                    return NotFound(new { Message = "Không tìm thấy đơn hàng nào với số điện thoại này" });
                }

                // Lấy các đơn hàng
                var orders = await _context.Orders
                    .Where(o => addresses.Contains(o.AddressId ?? 0))
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Product)
                            .ThenInclude(p => p.Images) // Lấy hình ảnh sản phẩm
                    .Include(o => o.Address)
                    .Include(o => o.PaymentMethod)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                var result = orders.Select(order => new
                {
                    OrderId = order.Id,
                    OrderDate = order.OrderDate.ToString("dd/MM/yyyy HH:mm"),
                    TotalAmount = order.TotalAmount,
                    FormattedTotal = order.TotalAmount.ToString("N0") + " VNĐ",
                    PaymentMethod = order.PaymentMethod != null ? order.PaymentMethod.Name : "Tiền mặt",
                    OrderStatus = order.OrderStatus,
                    ShippingInfo = new
                    {
                        FullName = order.Address != null ? order.Address.FullName : "N/A",
                        Phone = order.Address != null ? order.Address.PhoneNumber : "N/A",
                        Address = order.Address != null
                            ? $"{order.Address.AddressLine1}, {order.Address.City}, {order.Address.State}"
                            : "N/A",
                        Email = order.User != null ? order.User.Email : "N/A"
                    },
                    Products = order.OrderItems.Select(oi => new
                    {
                        Id = oi.ProductVariant.Product.Id,
                        Name = oi.ProductVariant.Product.Name,
                        Image = oi.ProductVariant.Product.Images
        .OrderByDescending(i => i.IsPrimary) // Ưu tiên ảnh IsPrimary
        .ThenBy(i => i.Id)                  // Sắp xếp thứ tự
        .FirstOrDefault()?                  // Lấy ảnh đầu tiên
        .ImageUrl ?? "/images/default-product.png", // Fallback nếu null
                        Variant = $"{oi.ProductVariant.Color} - {oi.ProductVariant.Storage}",
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Total = oi.Price * oi.Quantity
                    }),
                    EstimatedDelivery = order.OrderDate.AddDays(3).ToString("dd/MM/yyyy")
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy thông tin đơn hàng", Error = ex.Message });
            }
        }
        [HttpGet("dashboard/sales-overview")]
        public async Task<IActionResult> GetSalesOverview([FromQuery] string range = "month")
        {
            try
            {
                DateTime startDate;
                Func<DateTime, string> groupByFormat;
                Func<string, string> formatPeriodLabel;
                string xAxisKey;

                switch (range.ToLower())
                {
                    case "week":
                        startDate = DateTime.UtcNow.Date.AddDays(-7);
                        groupByFormat = date => ((int)date.DayOfWeek).ToString();
                        formatPeriodLabel = periodNum =>
                        {
                            var daysOfWeek = new[] { "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy" };
                            int dayIndex;
                            return int.TryParse(periodNum, out dayIndex) && dayIndex >= 0 && dayIndex < 7
                                ? daysOfWeek[dayIndex]
                                : periodNum;
                        };
                        xAxisKey = "day";
                        break;

                    case "year":
                        startDate = DateTime.UtcNow.Date.AddYears(0);
                        groupByFormat = date => date.Month.ToString();
                        formatPeriodLabel = period => $"Tháng {period}";
                        xAxisKey = "month";
                        break;

                    default: // month
                        startDate = DateTime.UtcNow.Date.AddMonths(-1);
                        groupByFormat = date => date.Day.ToString();
                        formatPeriodLabel = period => $"Ngày {period}";
                        xAxisKey = "day";
                        break;
                }

                // Get data from database
                var orders = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderStatus == "Delivered")
                    .Select(o => new { o.OrderDate, o.TotalAmount })
                    .ToListAsync();

                // Group and format data
                var salesData = orders
                    .GroupBy(o => groupByFormat(o.OrderDate))
                    .Select(g => new
                    {
                        Period = g.Key,
                        FormattedPeriod = formatPeriodLabel(g.Key),
                        ShortPeriod = range switch
                        {
                            "week" => formatPeriodLabel(g.Key).Replace("Chủ Nhật", "CN").Replace("Thứ ", ""),
                            "year" => $"T{g.Key}",
                            _ => g.Key
                        },
                        Sales = g.Sum(o => o.TotalAmount),
                        OrderCount = g.Count()
                    })
                    .OrderBy(x => int.Parse(x.Period))
                    .ToList();

                // Fill missing periods
                var allPeriods = range switch
                {
                    "week" => Enumerable.Range(0, 7).Select(i => i.ToString()),
                    "year" => Enumerable.Range(1, 12).Select(i => i.ToString()),
                    _ => Enumerable.Range(1, DateTime.DaysInMonth(DateTime.UtcNow.Year, DateTime.UtcNow.Month))
                        .Select(i => i.ToString())
                };

                salesData = allPeriods
                    .GroupJoin(salesData,
                        period => period,
                        data => data.Period,
                        (period, data) => new
                        {
                            Period = period,
                            FormattedPeriod = formatPeriodLabel(period),
                            ShortPeriod = range switch
                            {
                                "week" => formatPeriodLabel(period).Replace("Chủ Nhật", "CN").Replace("Thứ ", ""),
                                "year" => $"T{period}",
                                _ => period
                            },
                            Sales = data.FirstOrDefault()?.Sales ?? 0,
                            OrderCount = data.FirstOrDefault()?.OrderCount ?? 0
                        })
                    .OrderBy(x => int.Parse(x.Period))
                    .ToList();

                // Create summary object based on range
                object summary;
                switch (range.ToLower())
                {
                    case "week":
                        summary = new
                        {
                            TotalSales = salesData.Sum(x => x.Sales),
                            AverageDailySales = salesData.Average(x => x.Sales)
                        };
                        break;
                    case "month":
                        summary = new
                        {
                            TotalSales = salesData.Sum(x => x.Sales),
                            AverageDailySales = salesData.Average(x => x.Sales)
                        };
                        break;
                    case "year":
                        summary = new
                        {
                            TotalSales = salesData.Sum(x => x.Sales),
                            AverageMonthlySales = salesData.Average(x => x.Sales),
                            BestMonth = salesData.OrderByDescending(x => x.Sales).FirstOrDefault()?.FormattedPeriod,
                            WorstMonth = salesData.OrderBy(x => x.Sales).FirstOrDefault()?.FormattedPeriod
                        };
                        break;
                    default:
                        summary = new { };
                        break;
                }

                return Ok(new
                {
                    Data = salesData,
                    XAxisKey = xAxisKey,
                    TimeRange = range,
                    Currency = "VND",
                    Summary = summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy dữ liệu tổng quan bán hàng", Error = ex.Message });
            }
        }
        // Đếm tổng số đơn hàng
        [HttpGet("total-count")]
        public async Task<IActionResult> GetTotalOrderCount()
        {
            try
            {
                var totalOrders = await _context.Orders.CountAsync();
                return Ok(new { TotalOrders = totalOrders });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi đếm số lượng đơn hàng", Error = ex.Message });
            }
        }

        // Thêm vào OrderController
        [HttpGet("stats")]
        public async Task<IActionResult> GetOrderStats()
        {
            try
            {
                var totalOrders = await _context.Orders.CountAsync();
                var completedOrders = await _context.Orders
                    .Where(o => o.OrderStatus == "Delivered")
                    .CountAsync();
                var pendingOrders = await _context.Orders
                    .Where(o => o.OrderStatus == "Pending")
                    .CountAsync();
                var totalRevenue = await _context.Orders
                    .Where(o => o.OrderStatus == "Delivered")
                    .SumAsync(o => o.TotalAmount);

                return Ok(new
                {
                    TotalOrders = totalOrders,
                    CompletedOrders = completedOrders,
                    PendingOrders = pendingOrders,
                    TotalRevenue = totalRevenue
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy thống kê", Error = ex.Message });
            }
        }
        [HttpGet("revenue-year")]
        public async Task<IActionResult> GetRevenueDataYear([FromQuery] string range = "year")
        {
            try
            {
                DateTime startDate = DateTime.UtcNow.AddYears(-1); // Luôn lấy 1 năm gần nhất
                var currentDate = DateTime.UtcNow;

                var revenueData = await _context.Orders
                    .Where(o => o.OrderDate >= startDate &&
                               o.OrderDate <= currentDate &&
                               o.OrderStatus == "Delivered")
                    .GroupBy(o => new { o.OrderDate.Month, o.OrderDate.Year })
                    .Select(g => new
                    {
                        Month = g.Key.Month,
                        Year = g.Key.Year,
                        Revenue = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(x => x.Year)
                    .ThenBy(x => x.Month)
                    .ToListAsync();

                // Đảm bảo luôn có đủ 12 tháng
                var fullYearData = Enumerable.Range(0, 12)
                    .Select(i => new
                    {
                        Date = startDate.AddMonths(i),
                        Month = startDate.AddMonths(i).Month,
                        Year = startDate.AddMonths(i).Year,
                        Revenue = revenueData
                            .FirstOrDefault(d => d.Month == startDate.AddMonths(i).Month &&
                                               d.Year == startDate.AddMonths(i).Year)?.Revenue ?? 0
                    })
                    .ToList();

                return Ok(fullYearData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy dữ liệu doanh thu", Error = ex.Message });
            }
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueData([FromQuery] string range = "month")
        {
            try
            {
                DateTime startDate = range switch
                {
                    "week" => DateTime.UtcNow.AddDays(-7),
                    "year" => DateTime.UtcNow.AddYears(-1),
                    _ => DateTime.UtcNow.AddMonths(-1)
                };

                var revenueData = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderStatus == "Delivered")
                    .GroupBy(o => new { o.OrderDate.Date })
                    .Select(g => new
                    {
                        Date = g.Key.Date,
                        Revenue = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                return Ok(revenueData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy dữ liệu doanh thu", Error = ex.Message });
            }
        }

    }


    public static class NumberToTextVN
    {
        private static readonly string[] ChuSo = { "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín" };
        private static readonly string[] DonVi = { "", "nghìn", "triệu", "tỷ" }; // Mở rộng nếu cần (nghìn tỷ, triệu tỷ,...)

        private static string DocNhomBaChuSo(int baChuSo)
        {
            string tram, chuc, donViStr; // Đổi tên 'donVi' để tránh trùng với mảng 'DonVi'
            string ketQua = "";

            if (baChuSo < 0 || baChuSo > 999) return ""; // Chỉ xử lý số có 3 chữ số

            tram = ChuSo[baChuSo / 100];
            chuc = ChuSo[(baChuSo % 100) / 10];
            donViStr = ChuSo[baChuSo % 10];

            if (baChuSo == 0) return ""; // Nhóm ba số là 000 thì không đọc gì

            // Đọc hàng trăm
            if (baChuSo / 100 > 0)
            {
                ketQua += tram + " trăm ";
                if ((baChuSo % 100) == 0) return ketQua.Trim(); // Nếu là xxx00 (ví dụ: một trăm)
            }

            // Đọc hàng chục và đơn vị
            int phanDuTram = baChuSo % 100;
            if (phanDuTram / 10 > 0) // Có hàng chục (từ 10-99)
            {
                if (chuc == "một") ketQua += "mười "; // 1x -> mười
                else ketQua += chuc + " mươi ";    // 2x-9x -> hai mươi, ba mươi...

                if (phanDuTram % 10 == 0) return ketQua.Trim(); // Nếu là xx0 (ví dụ: hai mươi)

                if (phanDuTram % 10 == 5 && chuc != "không") ketQua += "lăm"; // x5 (trừ 05) -> lăm
                else if (phanDuTram % 10 == 1 && chuc != "không" && chuc != "một") ketQua += "mốt"; // x1 (trừ 01, 11) -> mốt
                else if (phanDuTram % 10 > 0) ketQua += donViStr;
            }
            else // Hàng chục là 0 (số dạng x0x)
            {
                // Nếu có hàng trăm và hàng đơn vị > 0 (ví dụ 101, 205) thì thêm "linh"
                if (baChuSo / 100 > 0 && (phanDuTram % 10) > 0) ketQua += "linh ";

                if ((phanDuTram % 10) > 0) ketQua += donViStr; // Đọc hàng đơn vị (ví dụ "một" trong "một trăm linh một", hoặc "một" nếu số là 1)
            }
            return ketQua.Trim();
        }

        public static string DocSo(long soTien)
        {
            if (soTien == 0) return ChuSo[0]; // "không"
            if (soTien < 0) return "Âm " + DocSo(Math.Abs(soTien)); // Viết hoa "Âm"

            string chuoiSo = "";
            int i = 0; // Index cho mảng DonVi (đơn vị nghìn, triệu, tỷ)

            if (soTien == 0) return ChuSo[0]; // Xử lý trường hợp 0

            while (soTien > 0)
            {
                long soDu = soTien % 1000; // Lấy 3 số cuối (nhóm ba chữ số)
                soTien /= 1000;      // Loại bỏ 3 số cuối đã xử lý

                if (soDu > 0) // Chỉ đọc nhóm này nếu nó khác 000
                {
                    string strNhomBa = DocNhomBaChuSo((int)soDu);
                    // Thêm đơn vị (nghìn, triệu, tỷ) nếu có và không phải là nhóm đơn vị cuối cùng (i > 0)
                    // Hoặc nếu là nhóm đơn vị cuối cùng nhưng strNhomBa không rỗng (tức là đọc số từ 1-999)
                    chuoiSo = strNhomBa + (i > 0 ? (" " + DonVi[i]) : "") + (string.IsNullOrEmpty(chuoiSo) ? "" : " ") + chuoiSo;
                }


                i++;
                if (i >= DonVi.Length && soTien > 0) // Nếu vượt quá đơn vị tỷ và vẫn còn số
                {
                    // Cần mở rộng mảng DonVi hoặc xử lý đặc biệt cho số quá lớn
                    // Hiện tại sẽ dừng ở "tỷ"
                    Console.Error.WriteLine("Số tiền quá lớn, vượt quá khả năng đọc của đơn vị 'tỷ'.");
                    break;
                }
            }

            chuoiSo = chuoiSo.Trim();

            // Dọn dẹp khoảng trắng thừa và các cụm từ không mong muốn
            chuoiSo = Regex.Replace(chuoiSo, @"\s+", " "); // Chuẩn hóa khoảng trắng
            // Các lệnh Regex sau có thể không cần thiết nếu DocNhomBaChuSo và logic vòng lặp đã chuẩn
            // Ví dụ: "không trăm linh" -> "linh" (nếu là đầu chuỗi)
            if (chuoiSo.StartsWith("không trăm linh ")) chuoiSo = chuoiSo.Substring("không trăm linh ".Length);
            else if (chuoiSo.StartsWith("không trăm ")) chuoiSo = chuoiSo.Substring("không trăm ".Length);
            // "mươi không" -> "mươi"
            chuoiSo = chuoiSo.Replace(" mươi không ", " mươi ");
            if (chuoiSo.EndsWith(" mươi không")) chuoiSo = chuoiSo.Substring(0, chuoiSo.Length - " không".Length);


            // Viết hoa chữ cái đầu tiên của chuỗi kết quả
            if (!string.IsNullOrEmpty(chuoiSo))
            {
                chuoiSo = char.ToUpper(chuoiSo[0]) + chuoiSo.Substring(1);
            }

            return chuoiSo;
        }
    }

    // Đặt các lớp ViewModel này trong namespace DTOs của bạn hoặc trong cùng file controller nếu tiện
    public class OrderInvoiceViewModel
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string FormattedOrderDate => $"Ngày {OrderDate:dd} tháng {OrderDate:MM} năm {OrderDate:yyyy}";

        public SellerInfo Seller { get; set; }

        public string BuyerFullName { get; set; }
        public string BuyerAddress { get; set; }
        // public string BuyerTaxCode { get; set; } // <<<< LOẠI BỎ DÒNG NÀY
        public string PaymentMethodName { get; set; }

        public List<InvoiceItemViewModel> Items { get; set; }

        public decimal SubtotalAmount { get; set; }
        public decimal VatRate { get; set; }
        public string VatRateFormatted => $"{VatRate * 100:N0}%";
        public decimal VatAmount { get; set; }
        public decimal FinalTotalAmount { get; set; }
        public string TotalAmountInWords { get; set; }

        public string InvoiceTemplateNo => Seller.InvoiceTemplateNo;
        public string InvoiceSeries => Seller.InvoiceSeries;
        public string InvoiceNumberFormatted => OrderId.ToString("D7");
    }

    // InvoiceItemViewModel giữ nguyên như lần cập nhật trước (đã bỏ Unit)
    public class InvoiceItemViewModel
    {
        public int Index { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Amount => Quantity * Price;
    }

    public class SellerInfo
    {
        public string CompanyName { get; set; } = "CÔNG TY TNHH SHN GEAR";
        public string Address { get; set; } = "117 Đường Nguyễn Thông, Quận 3, TP.HCM";
        public string TaxCode { get; set; } = "0123456789";
        public string PhoneNumber { get; set; } = "0778 706 084";
        public string InvoiceTemplateNo { get; set; } = "01GTKT0/001";
        public string InvoiceSeries { get; set; } = "AA/22E";
    }

    public class MoMoCallbackModel
    {
        public string PartnerCode { get; set; }
        public string OrderId { get; set; }
        public string RequestId { get; set; }
        public long Amount { get; set; }
        public string OrderInfo { get; set; }
        public string OrderType { get; set; }
        public string TransId { get; set; }
        public int ResultCode { get; set; }
        public string Message { get; set; }
        public string PayType { get; set; }
        public string Signature { get; set; }
    }
}