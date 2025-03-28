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

                // Kiểm tra số lượng tồn kho trước khi tạo đơn hàng
                foreach (var item in orderDto.OrderItems)
                {
                    var variant = await _context.ProductVariants
                        .Include(pv => pv.Product)
                        .FirstOrDefaultAsync(pv => pv.Id == item.ProductVariantId);

                    if (variant == null)
                    {
                        return BadRequest($"Không tìm thấy biến thể sản phẩm với ID {item.ProductVariantId}");
                    }

                    if (variant.StockQuantity < item.Quantity)
                    {
                        return BadRequest($"Số lượng tồn kho không đủ cho sản phẩm {variant.Product.Name} ({variant.Color}, {variant.Storage})");
                    }
                }

                // Create order
                var order = new Order
                {
                    UserId = orderDto.UserId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = orderDto.TotalAmount,
                    OrderStatus = orderDto.PaymentMethodId == 1 ? "Pending" : "WaitingForPayment", // 1 = Cash, 2 = MoMo
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

                // Process MoMo payment if payment method is MoMo
                if (orderDto.PaymentMethodId == 2)
                {
                    try
                    {
                        var momoOrderId = $"SHN{order.Id}";
                        var payUrl = await _momoService.CreatePaymentAsync(
                            momoOrderId,
                            $"Thanh toán đơn hàng SHN#{order.Id}",
                            (long)order.TotalAmount);

                        // Update MoMo info to order
                        order.MoMoOrderId = momoOrderId;
                        order.MoMoPayUrl = payUrl;
                        await _context.SaveChangesAsync();

                        await transaction.CommitAsync();

                        return Ok(new
                        {
                            Success = true,
                            OrderId = order.Id,
                            PaymentUrl = payUrl,
                            Message = "Vui lòng thanh toán qua MoMo để hoàn tất đơn hàng."
                        });
                    }
                    catch (Exception ex)
                    {
                        // If MoMo fails, update order status
                        order.OrderStatus = "PaymentFailed";
                        await _context.SaveChangesAsync();
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
                    var userVoucher = new UserVoucher
                    {
                        UserId = orderDto.UserId.Value,
                        VoucherId = voucher.Id,
                        UsedAt = DateTime.UtcNow
                    };
                    _context.UserVouchers.Add(userVoucher);
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
                }
                else // Failed
                {
                    order.OrderStatus = "PaymentFailed";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok();
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
                    ProductImage = oi.ProductVariant.Product.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl,
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
                .Include(o => o.OrderItems) // Chỉ cần Include OrderItems
                .Include(o => o.Address)    // Giữ Include Address để lấy thông tin địa chỉ
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound("Đơn hàng không tồn tại.");
            }

            Console.WriteLine($"Order {id} has {order.OrderItems.Count} items"); // Log số lượng items

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
                    VariantId = oi.ProductVariantId, // Chỉ lấy VariantId
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };

            return Ok(orderDetails);
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