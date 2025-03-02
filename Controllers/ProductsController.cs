using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // 📌 Lấy danh sách sản phẩm
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .ToListAsync();
    }

    // 📌 Lấy thông tin chi tiết sản phẩm theo ID
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id) 
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }

    // 📌 Thêm sản phẩm mới
    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct([FromBody] ProductDto productDto)
    {
        if (productDto == null)
            return BadRequest("Dữ liệu sản phẩm không hợp lệ.");

        if (string.IsNullOrWhiteSpace(productDto.Name) || productDto.CategoryId <= 0 || productDto.BrandId <= 0)
            return BadRequest("Tên, danh mục hoặc thương hiệu không hợp lệ.");

        var product = new Product
        {
            Name = productDto.Name,
            Description = productDto.Description,
            CategoryId = productDto.CategoryId,
            BrandId = productDto.BrandId,
            Images = productDto.Images?.Select(img => new ProductImage
            {
                ImageUrl = img.ImageUrl,
                IsPrimary = img.IsPrimary
            }).ToList() ?? new List<ProductImage>(),
            Variants = productDto.Variants?.Select(v => new ProductVariant
            {
                Color = v.Color,
                Storage = v.Storage,
                Price = v.Price,
                DiscountPrice = v.DiscountPrice,
                StockQuantity = v.StockQuantity,
                FlashSaleStart = v.FlashSaleStart,
                FlashSaleEnd = v.FlashSaleEnd
            }).ToList() ?? new List<ProductVariant>()
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // 📌 Xóa sản phẩm
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
