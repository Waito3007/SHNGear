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
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduct(int id, [FromBody] ProductDto productDto)
    {
        if (productDto == null || id <= 0)
            return BadRequest("Dữ liệu sản phẩm không hợp lệ.");

        var existingProduct = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingProduct == null)
            return NotFound("Sản phẩm không tồn tại.");

        // Cập nhật thông tin sản phẩm
        existingProduct.Name = productDto.Name;
        existingProduct.Description = productDto.Description;
        existingProduct.CategoryId = productDto.CategoryId;
        existingProduct.BrandId = productDto.BrandId;

        // Thay thế toàn bộ danh sách ảnh hiện tại bằng danh sách mới
        existingProduct.Images = productDto.Images?.Select(img => new ProductImage
        {
            ImageUrl = img.ImageUrl,
            IsPrimary = img.IsPrimary
        }).ToList() ?? new List<ProductImage>();

        // Cập nhật danh sách biến thể
        existingProduct.Variants = productDto.Variants?.Select(v => new ProductVariant
        {
            Color = v.Color,
            Storage = v.Storage,
            Price = v.Price,
            DiscountPrice = v.DiscountPrice,
            StockQuantity = v.StockQuantity,
            FlashSaleStart = v.FlashSaleStart,
            FlashSaleEnd = v.FlashSaleEnd
        }).ToList() ?? new List<ProductVariant>();

        _context.Products.Update(existingProduct);
        await _context.SaveChangesAsync();

        return NoContent();
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
    // 📌 Lấy danh sách sản phẩm liên quan theo thương hiệu (brand)
    [HttpGet("related-by-brand/{brandId}/{currentProductId}")]
    public async Task<ActionResult<IEnumerable<Product>>> GetRelatedProductsByBrand(int brandId, int currentProductId)
    {
        var relatedProducts = await _context.Products
            .Where(p => p.BrandId == brandId && p.Id != currentProductId)
            .Include(p => p.Images)
            .ToListAsync();

        return Ok(relatedProducts);
    }
    
    // 📌 Lấy danh sách sản phẩm (có hỗ trợ lọc theo danh mục)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] int? categoryId)
    {
        var query = _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var products = await query.ToListAsync();
        return Ok(products);
    }


}
