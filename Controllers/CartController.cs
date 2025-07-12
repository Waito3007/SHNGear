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

            // Kiểm tra ProductVariant có tồn tại không
            var productVariant = await _context.ProductVariants
                .FirstOrDefaultAsync(pv => pv.Id == request.ProductVariantId);

            if (productVariant == null)
            {
                return BadRequest("Biến thể sản phẩm không tồn tại.");
            }

            // Kiểm tra stock
            if (productVariant.StockQuantity < request.Quantity)
            {
                return BadRequest("Số lượng yêu cầu vượt quá số lượng trong kho.");
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
                // Logic cũ cho người dùng đã đăng nhập
                var cart = await _context.Carts
                    .Include(c => c.Items)
                        .ThenInclude(i => i.ProductVariant)
                            .ThenInclude(v => v.Product)
                                .ThenInclude(p => p.Images)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || cart.Items.Count == 0)
                {
                    return Ok(new List<object>());
                }

                var cartItems = cart.Items.Select(i =>
                {
                    var now = DateTime.UtcNow;

                    // Check Product-level flash sale
                    bool isProductFlashSale = i.ProductVariant.Product.IsFlashSale &&
                                            i.ProductVariant.Product.FlashSaleStartDate.HasValue &&
                                            i.ProductVariant.Product.FlashSaleStartDate.Value <= now &&
                                            i.ProductVariant.Product.FlashSaleEndDate.HasValue &&
                                            i.ProductVariant.Product.FlashSaleEndDate.Value >= now;

                    // Check Variant-level flash sale
                    bool isVariantFlashSale = i.ProductVariant.FlashSaleStart.HasValue &&
                                             i.ProductVariant.FlashSaleEnd.HasValue &&
                                             i.ProductVariant.FlashSaleStart.Value <= now &&
                                             i.ProductVariant.FlashSaleEnd.Value >= now;

                    // Calculate final price (Priority: Variant Flash Sale > Product Flash Sale > Discount Price > Regular Price)
                    decimal finalPrice = i.ProductVariant.Price;
                    if (isVariantFlashSale)
                    {
                        // Variant flash sale has highest priority (but we need variant flash sale price - this might need to be added to model)
                        finalPrice = i.ProductVariant.DiscountPrice ?? i.ProductVariant.Price;
                    }
                    else if (isProductFlashSale && i.ProductVariant.Product.FlashSalePrice.HasValue)
                    {
                        finalPrice = i.ProductVariant.Product.FlashSalePrice.Value;
                    }
                    else if (i.ProductVariant.DiscountPrice.HasValue)
                    {
                        finalPrice = i.ProductVariant.DiscountPrice.Value;
                    }

                    return new
                    {
                        i.Id,
                        i.Quantity,
                        i.ProductVariantId,
                        ProductName = i.ProductVariant.Product.Name,
                        ProductImage = i.ProductVariant.Product.Images
            .OrderByDescending(img => img.IsPrimary) // Ưu tiên ảnh IsPrimary
            .ThenBy(img => img.Id)                  // Sau đó sắp xếp theo ID
            .FirstOrDefault()?.ImageUrl ?? "/images/default-product.png", // Fallback image
                        VariantColor = i.ProductVariant.Color,
                        VariantStorage = i.ProductVariant.Storage,
                        ProductPrice = i.ProductVariant.Price,
                        ProductDiscountPrice = finalPrice, // This will be the actual price to display
                        IsFlashSale = isProductFlashSale || isVariantFlashSale,
                        FlashSalePrice = isProductFlashSale ? i.ProductVariant.Product.FlashSalePrice : null
                    };
                }).ToList();

                return Ok(cartItems);
            }
            else
            {
                // Xử lý cho người dùng chưa đăng nhập
                var session = _httpContextAccessor.HttpContext!.Session;
                var sessionCart = session.GetString("Cart");
                var cartItems = string.IsNullOrEmpty(sessionCart)
                    ? new List<CartItemSession>()
                    : JsonSerializer.Deserialize<List<CartItemSession>>(sessionCart) ?? new List<CartItemSession>();

                // Lấy thông tin sản phẩm cho từng item trong giỏ hàng session
                var result = new List<object>();
                foreach (var item in cartItems)
                {
                    var variant = await _context.ProductVariants
                        .Include(v => v.Product)
                            .ThenInclude(p => p.Images)
                        .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId);

                    if (variant != null)
                    {
                        var now = DateTime.UtcNow;

                        // Check Product-level flash sale
                        bool isProductFlashSale = variant.Product.IsFlashSale &&
                                                variant.Product.FlashSaleStartDate.HasValue &&
                                                variant.Product.FlashSaleStartDate.Value <= now &&
                                                variant.Product.FlashSaleEndDate.HasValue &&
                                                variant.Product.FlashSaleEndDate.Value >= now;

                        // Check Variant-level flash sale
                        bool isVariantFlashSale = variant.FlashSaleStart.HasValue &&
                                                 variant.FlashSaleEnd.HasValue &&
                                                 variant.FlashSaleStart.Value <= now &&
                                                 variant.FlashSaleEnd.Value >= now;

                        // Calculate final price
                        decimal finalPrice = variant.Price;
                        if (isVariantFlashSale)
                        {
                            finalPrice = variant.DiscountPrice ?? variant.Price;
                        }
                        else if (isProductFlashSale && variant.Product.FlashSalePrice.HasValue)
                        {
                            finalPrice = variant.Product.FlashSalePrice.Value;
                        }
                        else if (variant.DiscountPrice.HasValue)
                        {
                            finalPrice = variant.DiscountPrice.Value;
                        }

                        result.Add(new
                        {
                            item.ProductVariantId,
                            item.Quantity,
                            ProductName = variant.Product.Name,
                            ProductImage = variant.Product.Images
                                .OrderByDescending(img => img.IsPrimary)
                                .ThenBy(img => img.Id)
                                .FirstOrDefault()?.ImageUrl ?? "/images/default-product.png",
                            VariantColor = variant.Color,
                            VariantStorage = variant.Storage,
                            ProductPrice = variant.Price,
                            ProductDiscountPrice = finalPrice,
                            IsFlashSale = isProductFlashSale || isVariantFlashSale,
                            FlashSalePrice = isProductFlashSale ? variant.Product.FlashSalePrice : null
                        });
                    }
                }

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

        [HttpDelete("remove-paid-items")]
        public async Task<IActionResult> RemovePaidCartItems([FromQuery] int? userId)
        {
            if (userId == null || userId <= 0)
            {
                return BadRequest("UserId không hợp lệ.");
            }

            // Lấy giỏ hàng của user
            var cart = await _context.Carts.Include(c => c.Items)
                                           .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || cart.Items == null || !cart.Items.Any())
            {
                return NotFound("Giỏ hàng trống hoặc không tồn tại.");
            }

            // Lấy danh sách các sản phẩm đã đặt hàng (có trong OrderItem)
            var paidProductVariantIds = await _context.OrderItems
                                                      .Select(oi => oi.ProductVariantId)
                                                      .ToListAsync();

            // Lọc các sản phẩm trong giỏ hàng đã được thanh toán
            var paidCartItems = cart.Items
                                    .Where(item => paidProductVariantIds.Contains(item.ProductVariantId))
                                    .ToList();

            if (!paidCartItems.Any())
            {
                return Ok("Không có sản phẩm nào đã thanh toán để xóa.");
            }

            // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
            _context.CartItems.RemoveRange(paidCartItems);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa các sản phẩm đã thanh toán khỏi giỏ hàng.", removedItems = paidCartItems.Count });
        }


        // lấy tên và ảnh product dựa trên productVariantId
        [HttpGet("variant-info/{productVariantId}")]
        public async Task<IActionResult> GetProductVariantInfo(int productVariantId)
        {
            try
            {
                var variant = await _context.ProductVariants
                    .Include(v => v.Product)
                        .ThenInclude(p => p.Images)
                    .FirstOrDefaultAsync(v => v.Id == productVariantId);

                if (variant == null)
                {
                    return NotFound("Biến thể sản phẩm không tồn tại");
                }

                var result = new
                {
                    ProductName = variant.Product.Name,
                    ProductImage = variant.Product.Images
                                .OrderByDescending(img => img.IsPrimary)
                                .ThenBy(img => img.Id)
                                .FirstOrDefault()?.ImageUrl ?? "/images/default-product.png",
                    VariantColor = variant.Color,
                    VariantStorage = variant.Storage,
                    Price = variant.Price,
                    DiscountPrice = variant.DiscountPrice
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lấy thông tin biến thể: {ex.Message}");
            }
        }
    }
}
