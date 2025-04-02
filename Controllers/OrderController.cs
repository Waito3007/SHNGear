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
using System.Globalization; // Cho hàm ConvertToUnsigned
using System.Text;         // Cho NormalizationForm
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
        // Tạo đơn hàng mới (hỗ trợ cả tiền mặt và MoMo)
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
                if (orderDto.VoucherId.HasValue)
                {
                    voucher = await _context.Vouchers.FindAsync(orderDto.VoucherId.Value);
                    if (voucher == null || !voucher.IsActive || voucher.ExpiryDate < DateTime.UtcNow)
                    {
                        return BadRequest("Voucher không hợp lệ.");
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

                // Thanh toán với momo (cả QR và thẻ)
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

                // Process voucher for cash payment
                if (voucher != null && user != null)
                {
                    _context.UserVouchers.Add(new UserVoucher
                    {
                        UserId = orderDto.UserId.Value,
                        VoucherId = voucher.Id,
                        UsedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Đơn hàng đã được tạo.", OrderId = order.Id });
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

        [HttpGet("{id}/export/image")]
        public async Task<IActionResult> ExportOrderToImage(int id)
        {
            try
            {
                // Lấy thông tin đơn hàng từ database
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                    .Include(o => o.Address)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Không tìm thấy đơn hàng");
                }

                // Tính toán kích thước hình ảnh dựa trên số lượng sản phẩm
                int width = 800;
                int itemHeight = 30;
                int headerHeight = 200;
                int footerHeight = 50;
                int height = headerHeight + (order.OrderItems.Count * itemHeight) + footerHeight;

                // Tạo bitmap và graphics
                using (var bitmap = new System.Drawing.Bitmap(width, height))
                using (var graphics = System.Drawing.Graphics.FromImage(bitmap))
                {
                    // Vẽ nền trắng
                    graphics.Clear(System.Drawing.Color.White);

                    // Định dạng font và brush
                    var titleFont = new System.Drawing.Font("Arial", 20, System.Drawing.FontStyle.Bold);
                    var headerFont = new System.Drawing.Font("Arial", 12, System.Drawing.FontStyle.Bold);
                    var normalFont = new System.Drawing.Font("Arial", 10);
                    var blackBrush = System.Drawing.Brushes.Black;
                    var grayBrush = new System.Drawing.SolidBrush(System.Drawing.Color.Gray);

                    // Vẽ tiêu đề
                    graphics.DrawString("HÓA ĐƠN BÁN HÀNG", titleFont, blackBrush,
                        new System.Drawing.PointF(width / 2 - 150, 20));

                    // Vẽ thông tin đơn hàng
                    graphics.DrawString($"Mã đơn hàng: {order.Id}", normalFont, blackBrush, 20, 60);
                    graphics.DrawString($"Ngày tạo: {order.OrderDate:dd/MM/yyyy HH:mm}", normalFont, blackBrush, 20, 85);
                    graphics.DrawString($"Khách hàng: {order.Address?.FullName ?? "N/A"}", normalFont, blackBrush, 20, 110);
                    graphics.DrawString($"Địa chỉ: {order.Address?.AddressLine1 ?? "N/A"}", normalFont, blackBrush, 20, 135);

                    // Vẽ tiêu đề bảng
                    graphics.DrawString("STT", headerFont, blackBrush, 20, 170);
                    graphics.DrawString("Tên sản phẩm", headerFont, blackBrush, 60, 170);
                    graphics.DrawString("Số lượng", headerFont, blackBrush, 400, 170);
                    graphics.DrawString("Đơn giá", headerFont, blackBrush, 500, 170);
                    graphics.DrawString("Thành tiền", headerFont, blackBrush, 600, 170);

                    // Vẽ đường kẻ ngang dưới tiêu đề
                    graphics.DrawLine(System.Drawing.Pens.Gray, 20, 190, width - 20, 190);

                    // Vẽ từng sản phẩm
                    int yPos = 200;
                    int index = 1;
                    foreach (var item in order.OrderItems)
                    {
                        graphics.DrawString(index.ToString(), normalFont, blackBrush, 20, yPos);
                        graphics.DrawString(item.ProductVariant.Product.Name, normalFont, blackBrush, 60, yPos);
                        graphics.DrawString(item.Quantity.ToString(), normalFont, blackBrush, 400, yPos);
                        graphics.DrawString(item.Price.ToString("N0"), normalFont, blackBrush, 500, yPos);
                        graphics.DrawString((item.Quantity * item.Price).ToString("N0"), normalFont, blackBrush, 600, yPos);

                        yPos += itemHeight;
                        index++;
                    }

                    // Vẽ tổng cộng
                    graphics.DrawLine(System.Drawing.Pens.Gray, 20, yPos, width - 20, yPos);
                    yPos += 10;
                    graphics.DrawString("TỔNG CỘNG:  ", headerFont, blackBrush, 500, yPos);
                    graphics.DrawString(order.TotalAmount.ToString("N0"), headerFont, blackBrush, 600, yPos);

                    // Vẽ footer
                    yPos += 30;
                    graphics.DrawString("Cảm ơn quý khách đã mua hàng!", normalFont, grayBrush,
                        new System.Drawing.PointF(width / 2 - 100, yPos));

                    // Lưu hình ảnh vào memory stream
                    using (var stream = new MemoryStream())
                    {
                        bitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                        stream.Position = 0;

                        // Trả về file hình ảnh
                        return File(stream.ToArray(), "image/png", $"HoaDon_{order.Id}.png");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi xuất hóa đơn: {ex.Message}");
            }
        }
        private string ConvertToUnsigned(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            text = text.Normalize(NormalizationForm.FormD);
            var chars = text.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark).ToArray();
            return new string(chars).Normalize(NormalizationForm.FormC);
        }

        [HttpGet("{id}/export/template")]
        public async Task<IActionResult> ExportOrderToTemplate(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Product)
                    .Include(o => o.Address)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Order not found");
                }

                using (var stream = new MemoryStream())
                {
                    var document = new Document(PageSize.A4);
                    var writer = PdfWriter.GetInstance(document, stream);
                    document.Open();

                    // Add title
                    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
                    var title = new Paragraph(ConvertToUnsigned("HOA DON BAN HANG"), titleFont)
                    {
                        Alignment = Element.ALIGN_CENTER,
                        SpacingAfter = 20f
                    };
                    document.Add(title);

                    // Add order info
                    var infoFont = FontFactory.GetFont(FontFactory.HELVETICA, 12);
                    document.Add(new Paragraph(ConvertToUnsigned($"Mã đơn hàng: {order.Id}"), infoFont));
                    document.Add(new Paragraph(ConvertToUnsigned($"Ngày tạo: {order.OrderDate:dd/MM/yyyy}"), infoFont));
                    document.Add(new Paragraph(ConvertToUnsigned($"Khách hàng: {order.Address?.FullName ?? "N/A"}"), infoFont));
                    document.Add(new Paragraph(" "));

                    // Create table
                    var table = new PdfPTable(5)
                    {
                        WidthPercentage = 100,
                        SpacingBefore = 10f,
                        SpacingAfter = 10f
                    };

                    // Table headers
                    table.AddCell(new PdfPCell(new Phrase(ConvertToUnsigned("STT"), infoFont)));
                    table.AddCell(new PdfPCell(new Phrase(ConvertToUnsigned("Tên sản phẩm"), infoFont)));
                    table.AddCell(new PdfPCell(new Phrase(ConvertToUnsigned("Số lượng"), infoFont)));
                    table.AddCell(new PdfPCell(new Phrase(ConvertToUnsigned("Don Gia"), infoFont)));
                    table.AddCell(new PdfPCell(new Phrase(ConvertToUnsigned("Thành tiền"), infoFont)));

                    // Table data
                    int index = 1;
                    foreach (var item in order.OrderItems)
                    {
                        table.AddCell(new PdfPCell(new Phrase(index.ToString(), infoFont)));
                        table.AddCell(new PdfPCell(new Phrase(ConvertToUnsigned(item.ProductVariant.Product.Name), infoFont)));
                        table.AddCell(new PdfPCell(new Phrase(item.Quantity.ToString(), infoFont)));
                        table.AddCell(new PdfPCell(new Phrase(item.Price.ToString("N0"), infoFont)));
                        table.AddCell(new PdfPCell(new Phrase((item.Quantity * item.Price).ToString("N0"), infoFont)));
                        index++;
                    }

                    document.Add(table);

                    // Add total
                    var totalFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
                    document.Add(new Paragraph(ConvertToUnsigned($"Tổng cộng: {order.TotalAmount.ToString("N0")}"), totalFont)
                    {
                        Alignment = Element.ALIGN_RIGHT
                    });

                    document.Close();
                    writer.Close();

                    return File(stream.ToArray(), "application/pdf", $"HoaDon_{order.Id}.pdf");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error exporting to template: {ex.Message}");
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
                    .Where(o => addresses.Contains(o.Id))
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv.Product)
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