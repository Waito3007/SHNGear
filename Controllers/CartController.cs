using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Security.Claims;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
            if (userId == null)
            {
                return NotFound("Cart not found");
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found");
            }

            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductPrice = i.Product.Price,
                    Quantity = i.Quantity,
                    AddedAt = i.AddedAt,
                    UpdatedAt = i.UpdatedAt
                }).ToList()
            };

            return Ok(cartDto);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(int productId, int quantity)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
            if (userId == null)
            {
                userId = Guid.NewGuid().ToString();
                Response.Cookies.Append("GuestId", userId, new CookieOptions { Expires = DateTimeOffset.UtcNow.AddDays(30) });
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var cartItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (cartItem == null)
            {
                cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    AddedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }
            else
            {
                cartItem.Quantity += quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductPrice = i.Product.Price,
                    Quantity = i.Quantity,
                    AddedAt = i.AddedAt,
                    UpdatedAt = i.UpdatedAt
                }).ToList()
            };

            return Ok(cartDto);
        }

        [HttpPost("remove")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
            if (userId == null)
            {
                return NotFound("Cart not found");
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found");
            }

            var cartItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (cartItem == null)
            {
                return NotFound("Product not found in cart");
            }

            _context.CartItems.Remove(cartItem);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductPrice = i.Product.Price,
                    Quantity = i.Quantity,
                    AddedAt = i.AddedAt,
                    UpdatedAt = i.UpdatedAt
                }).ToList()
            };

            return Ok(cartDto);
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateCartItem(int productId, int quantity)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
            if (userId == null)
            {
                return NotFound("Cart not found");
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found");
            }

            var cartItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (cartItem == null)
            {
                return NotFound("Product not found in cart");
            }

            cartItem.Quantity = quantity;
            cartItem.UpdatedAt = DateTime.UtcNow;
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductPrice = i.Product.Price,
                    Quantity = i.Quantity,
                    AddedAt = i.AddedAt,
                    UpdatedAt = i.UpdatedAt
                }).ToList()
            };

            return Ok(cartDto);
        }
    }
}