using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using SHN_Gear.Data;
using SHN_Gear.DTOs;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CartController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // Thêm sản phẩm vào giỏ hàng
        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] CartDto request)
        {
            if (request.ProductVariantId <= 0 || request.Quantity <= 0)
            {
                return BadRequest("Thông tin sản phẩm không hợp lệ.");
            }

            if (request.UserId > 0)
            {
                // Người dùng đã đăng nhập
                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.UserId == request.UserId);

                if (cart == null)
                {
                    cart = new Cart { UserId = request.UserId, Items = new List<CartItem>() };
                    _context.Carts.Add(cart);
                }

                var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);
                if (existingItem != null)
                {
                    existingItem.Quantity += request.Quantity;
                    existingItem.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    cart.Items.Add(new CartItem
                    {
                        ProductVariantId = request.ProductVariantId,
                        Quantity = request.Quantity,
                        AddedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
            }
            else
            {
                // Người dùng chưa đăng nhập - Lưu vào session
                var session = _httpContextAccessor.HttpContext!.Session;
                var sessionCart = session.GetString("Cart");
                var cartItems = string.IsNullOrEmpty(sessionCart)
                    ? new List<CartItemSession>()
                    : JsonSerializer.Deserialize<List<CartItemSession>>(sessionCart) ?? new List<CartItemSession>();

                var existingItem = cartItems.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);
                if (existingItem != null)
                {
                    existingItem.Quantity += request.Quantity;
                }
                else
                {
                    cartItems.Add(new CartItemSession
                    {
                        ProductVariantId = request.ProductVariantId,
                        Quantity = request.Quantity
                    });
                }

                session.SetString("Cart", JsonSerializer.Serialize(cartItems));
            }

            return Ok("Sản phẩm đã được thêm vào giỏ hàng.");
        }

        // Lấy giỏ hàng
        [HttpGet]
        public async Task<IActionResult> GetCart([FromQuery] int? userId)
        {
            if (userId > 0)
            {
                // Lấy giỏ hàng của người dùng đã đăng nhập
                var cart = await _context.Carts
                    .Include(c => c.Items)
                        .ThenInclude(i => i.ProductVariant)
                            .ThenInclude(v => v.Product)
                                .ThenInclude(p => p.Images) // Lấy hình ảnh sản phẩm
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || cart.Items.Count == 0)
                {
                    return Ok(new List<object>()); // Trả về danh sách rỗng nếu giỏ hàng trống
                }

                // Chuẩn bị dữ liệu trả về
                var cartItems = cart.Items.Select(i => new
                {
                    i.Id,
                    i.Quantity,
                    i.ProductVariantId,
                    ProductName = i.ProductVariant.Product.Name,
                    ProductDescription = i.ProductVariant.Product.Description,
                    ProductPrice = i.ProductVariant.Price,
                    ProductDiscountPrice = i.ProductVariant.DiscountPrice,
                    ProductImage = i.ProductVariant.Product.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl,
                    VariantColor = i.ProductVariant.Color,
                    VariantStorage = i.ProductVariant.Storage
                }).ToList();

                return Ok(cartItems);
            }
            else
            {
                // Lấy giỏ hàng từ session cho người dùng chưa đăng nhập
                var session = _httpContextAccessor.HttpContext!.Session;
                var sessionCart = session.GetString("Cart");
                var cartItems = string.IsNullOrEmpty(sessionCart)
                    ? new List<CartItemSession>()
                    : JsonSerializer.Deserialize<List<CartItemSession>>(sessionCart) ?? new List<CartItemSession>();

                // Lấy thông tin sản phẩm từ database
                var productVariantIds = cartItems.Select(i => i.ProductVariantId).ToList();
                var productVariants = await _context.ProductVariants
                    .Include(v => v.Product)
                        .ThenInclude(p => p.Images)
                    .Where(v => productVariantIds.Contains(v.Id))
                    .ToListAsync();

                var result = cartItems.Select(i =>
                {
                    var variant = productVariants.FirstOrDefault(v => v.Id == i.ProductVariantId);
                    return new
                    {
                        i.ProductVariantId,
                        i.Quantity,
                        ProductName = variant?.Product.Name,
                        ProductDescription = variant?.Product.Description,
                        ProductPrice = variant?.Price,
                        ProductDiscountPrice = variant?.DiscountPrice,
                        ProductImage = variant?.Product.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl,
                        VariantColor = variant?.Color,
                        VariantStorage = variant?.Storage
                    };
                }).ToList();

                return Ok(result);
            }
        }

        // Cập nhật số lượng sản phẩm trong giỏ hàng
        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] CartDto request)
        {
            if (request.UserId > 0)
            {
                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(i => i.Cart.UserId == request.UserId && i.ProductVariantId == request.ProductVariantId);

                if (cartItem == null)
                {
                    return NotFound("Sản phẩm không có trong giỏ hàng.");
                }

                cartItem.Quantity = request.Quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            else
            {
                var session = _httpContextAccessor.HttpContext!.Session;
                var sessionCart = session.GetString("Cart");
                var cartItems = string.IsNullOrEmpty(sessionCart)
                    ? new List<CartItemSession>()
                    : JsonSerializer.Deserialize<List<CartItemSession>>(sessionCart) ?? new List<CartItemSession>();

                var cartItem = cartItems.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);
                if (cartItem == null)
                {
                    return NotFound("Sản phẩm không có trong giỏ hàng.");
                }

                cartItem.Quantity = request.Quantity;
                session.Set("Cart", JsonSerializer.SerializeToUtf8Bytes(cartItems));

            }

            return Ok("Cập nhật số lượng thành công.");
        }

        // Xóa sản phẩm khỏi giỏ hàng
        [HttpDelete("remove/{productVariantId}")]
        public async Task<IActionResult> RemoveFromCart(int productVariantId, [FromQuery] int? userId)
        {
            if (userId > 0)
            {
                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(i => i.Cart.UserId == userId && i.ProductVariantId == productVariantId);

                if (cartItem == null)
                {
                    return NotFound("Sản phẩm không có trong giỏ hàng.");
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
            }
            else
            {
                var session = _httpContextAccessor.HttpContext!.Session;
                var sessionCart = session.GetString("Cart");
                var cartItems = string.IsNullOrEmpty(sessionCart)
                    ? new List<CartItemSession>()
                    : JsonSerializer.Deserialize<List<CartItemSession>>(sessionCart) ?? new List<CartItemSession>();

                var cartItem = cartItems.FirstOrDefault(i => i.ProductVariantId == productVariantId);
                if (cartItem == null)
                {
                    return NotFound("Sản phẩm không có trong giỏ hàng.");
                }

                cartItems.Remove(cartItem);
                session.SetString("Cart", JsonSerializer.Serialize(cartItems));
            }

            return Ok("Sản phẩm đã được xóa khỏi giỏ hàng.");
        }

        // Xóa toàn bộ giỏ hàng
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart([FromQuery] int? userId)
        {
            if (userId > 0)
            {
                var cart = await _context.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);
                if (cart != null)
                {
                    _context.CartItems.RemoveRange(cart.Items);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                var session = _httpContextAccessor.HttpContext!.Session;
                session.Remove("Cart");
            }

            return Ok("Giỏ hàng đã được làm trống.");
        }
    }
}
