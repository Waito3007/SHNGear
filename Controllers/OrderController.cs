using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Security.Claims;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderDto orderDto)
        {
            try
            {
                var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId) && string.IsNullOrEmpty(orderDto.GuestAddress))
                {
                    return BadRequest(new { message = "Bạn phải nhập địa chỉ nếu chưa đăng nhập." });
                }

                var order = new Order
                {
                    UserId = userId, // Nếu là khách thì UserId = null
                    OrderDate = DateTime.UtcNow,
                    OrderStatus = "Pending",
                    AddressId = userId != null ? orderDto.AddressId : null, // Chỉ lưu AddressId nếu có user
                    GuestAddress = userId == null ? orderDto.GuestAddress : null, // Chỉ lưu GuestAddress nếu là khách
                    PaymentMethodId = orderDto.PaymentMethodId,
                    TotalAmount = orderDto.Items.Sum(i => i.Price * i.Quantity)
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var item in orderDto.Items)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        Price = item.Price
                    };
                    _context.OrderItems.Add(orderItem);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Đơn hàng đã được đặt thành công!", orderId = order.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
