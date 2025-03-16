using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
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

        // Tạo đơn hàng mới
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderDto orderDto)
        {
            User? user = null;
            if (orderDto.UserId.HasValue && orderDto.UserId.Value != 0)
            {
                // Tìm người dùng
                user = await _context.Users.FindAsync(orderDto.UserId.Value);
                if (user == null)
                {
                    return NotFound("Người dùng không tồn tại.");
                }
            }

            // Tìm voucher (nếu có)
            Voucher? voucher = null;
            if (orderDto.VoucherId.HasValue)
            {
                voucher = await _context.Vouchers.FindAsync(orderDto.VoucherId.Value);
                if (voucher == null || !voucher.IsActive || voucher.ExpiryDate < DateTime.UtcNow)
                {
                    return BadRequest("Voucher không hợp lệ.");
                }
            }

            // Tạo đơn hàng mới
            var order = new Order
            {
                UserId = orderDto.UserId.HasValue && orderDto.UserId.Value != 0 ? orderDto.UserId.Value : (int?)null, // Đảm bảo UserId là null nếu không có
                OrderDate = orderDto.OrderDate,
                TotalAmount = orderDto.TotalAmount,
                OrderStatus = orderDto.OrderStatus,
                AddressId = orderDto.AddressId,
                PaymentMethodId = orderDto.PaymentMethodId,
                OrderItems = orderDto.OrderItems.Select(oi => new OrderItem
                {
                    ProductVariantId = oi.ProductVariantId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };

            // Áp dụng giảm giá từ voucher
            if (voucher != null)
            {
                order.TotalAmount -= voucher.DiscountAmount;
                if (order.TotalAmount < 0) order.TotalAmount = 0;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Đánh dấu voucher đã sử dụng
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
                UserId = order.UserId.HasValue ? order.UserId.Value : (int?)null, // Chuyển đổi rõ ràng từ int? sang int
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
    }
}
