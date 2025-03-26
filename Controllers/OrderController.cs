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

            // Create order
            var order = new Order
            {
                UserId = orderDto.UserId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = orderDto.TotalAmount,
                OrderStatus = orderDto.PaymentMethodId == 1 ? "Pending" : "WaitingForPayment", // 1 = Cash, 2 = MoMo
                AddressId = orderDto.AddressId,
                PaymentMethodId = orderDto.PaymentMethodId,
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
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Đơn hàng đã được tạo.", OrderId = order.Id });
        }

        // MoMo payment callback
        [HttpPost("momo/callback")]
        public async Task<IActionResult> MoMoCallback([FromBody] MoMoCallbackModel callback)
        {
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
                return Ok();
            }
            catch (Exception ex)
            {
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
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound("Đơn hàng không tồn tại.");
            }

            order.OrderStatus = updateStatusDto.NewStatus;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Trạng thái đơn hàng đã được cập nhật." });
        }

        // Lấy danh sách đơn hàng theo userId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .ToListAsync();

            if (orders == null || orders.Count == 0)
            {
                return NotFound("Không tìm thấy đơn hàng nào cho người dùng này.");
            }

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

        // Các phương thức thống kê giữ nguyên
        [HttpGet("revenue/day")]
        public async Task<IActionResult> GetDailyRevenue()
        {
            var today = DateTime.UtcNow.Date;
            var revenue = await _context.Orders
                .Where(o => o.OrderDate.Date == today && o.OrderStatus == "Delivered")
                .SumAsync(o => o.TotalAmount);

            return Ok(new { Revenue = revenue });
        }

        // ... (Các phương thức thống kê khác giữ nguyên) ...
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