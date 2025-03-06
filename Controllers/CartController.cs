using Microsoft.AspNetCore.Http;
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
    private readonly IHttpContextAccessor _httpContextAccessor;
    private const string SessionKeyGuestId = "GuestId";
    
    public CartController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    
    private string GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            var session = _httpContextAccessor.HttpContext.Session;
            userId = session.GetString(SessionKeyGuestId);
            if (userId == null)
            {
                userId = Guid.NewGuid().ToString();
                session.SetString(SessionKeyGuestId, userId);
            }
        }
        return userId;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
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
        var userId = GetUserId();
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
}
