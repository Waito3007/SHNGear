using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

[ApiController]
[Route("api/[controller]")]
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
        if (userId == null) return NotFound("Cart not found");

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.ProductVariant)
            .ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) return NotFound("Cart not found");

        var cartDto = new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            Items = cart.Items.Select(i => new CartItemDto
            {
                ProductId = i.ProductVariant.Product.Id,
                ProductName = i.ProductVariant.Product.Name,
                ProductPrice = i.ProductVariant.Price,
                Quantity = i.Quantity,
                AddedAt = i.AddedAt,
                UpdatedAt = i.UpdatedAt
            }).ToList()
        };

        return Ok(cartDto);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart(int productVariantId, int quantity)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
        if (userId == null)
        {
            userId = Guid.NewGuid().ToString();
            Response.Cookies.Append("GuestId", userId, new CookieOptions { Expires = DateTimeOffset.UtcNow.AddDays(30) });
        }

        var cart = await _context.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var cartItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == productVariantId);
        if (cartItem == null)
        {
            cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductVariantId = productVariantId,
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

        return Ok("Product added to cart successfully.");
    }

    [HttpPost("remove")]
    public async Task<IActionResult> RemoveFromCart(int productVariantId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
        if (userId == null) return NotFound("Cart not found");

        var cart = await _context.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart == null) return NotFound("Cart not found");

        var cartItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == productVariantId);
        if (cartItem == null) return NotFound("Product variant not found in cart");

        _context.CartItems.Remove(cartItem);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok("Product removed from cart.");
    }

    [HttpPost("update")]
    public async Task<IActionResult> UpdateCartItem(int productVariantId, int quantity)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Request.Cookies["GuestId"];
        if (userId == null) return NotFound("Cart not found");

        var cart = await _context.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart == null) return NotFound("Cart not found");

        var cartItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == productVariantId);
        if (cartItem == null) return NotFound("Product variant not found in cart");

        cartItem.Quantity = quantity;
        cartItem.UpdatedAt = DateTime.UtcNow;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok("Cart item updated successfully.");
    }
}
