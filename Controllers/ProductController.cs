using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // 🟢 Thêm sản phẩm mới
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] ProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DiscountPrice = dto.DiscountPrice,
                FlashSaleStart = dto.FlashSaleStart,
                FlashSaleEnd = dto.FlashSaleEnd,
                Category = dto.Category,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sản phẩm đã được thêm.", ProductId = product.Id });
        }

        // 🔵 Lấy danh sách sản phẩm
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _context.Products
                .Include(p => p.Images)
                .ToListAsync();

            return Ok(products);
        }

        // 🔵 Lấy chi tiết một sản phẩm
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            return Ok(product);
        }

        // 🟡 Cập nhật sản phẩm
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.DiscountPrice = dto.DiscountPrice;
            product.FlashSaleStart = dto.FlashSaleStart;
            product.FlashSaleEnd = dto.FlashSaleEnd;
            product.Category = dto.Category;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sản phẩm đã được cập nhật." });
        }

        // 🔴 Xóa sản phẩm và tất cả thông tin liên quan (thông số kỹ thuật & ảnh sản phẩm)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            // Xóa tất cả thông số kỹ thuật liên quan
            var phoneSpec = await _context.PhoneSpecifications.FirstOrDefaultAsync(p => p.ProductId == id);
            if (phoneSpec != null) _context.PhoneSpecifications.Remove(phoneSpec);

            var laptopSpec = await _context.LaptopSpecifications.FirstOrDefaultAsync(l => l.ProductId == id);
            if (laptopSpec != null) _context.LaptopSpecifications.Remove(laptopSpec);

            var headphoneSpec = await _context.HeadphoneSpecifications.FirstOrDefaultAsync(h => h.ProductId == id);
            if (headphoneSpec != null) _context.HeadphoneSpecifications.Remove(headphoneSpec);

            // Xóa ảnh sản phẩm liên quan
            _context.ProductImages.RemoveRange(product.Images);

            // Xóa sản phẩm
            _context.Products.Remove(product);

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sản phẩm và tất cả dữ liệu liên quan đã được xóa." });
        }
    }
}
