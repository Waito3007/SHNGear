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

    // Lấy danh sách sản phẩm (có hỗ trợ lọc theo danh mục)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] int? categoryId = null)
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

        return await query.ToListAsync();
    }

    //Lấy thông tin chi tiết sản phẩm theo ID
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

    // Thêm sản phẩm mới
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

    // Cập nhật sản phẩm
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

        existingProduct.Name = productDto.Name;
        existingProduct.Description = productDto.Description;
        existingProduct.CategoryId = productDto.CategoryId;
        existingProduct.BrandId = productDto.BrandId;

        existingProduct.Images = productDto.Images?.Select(img => new ProductImage
        {
            ImageUrl = img.ImageUrl,
            IsPrimary = img.IsPrimary
        }).ToList() ?? new List<ProductImage>();

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

    // Xóa sản phẩm
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

    // Lấy danh sách sản phẩm liên quan theo thương hiệu (brand)
    [HttpGet("related-by-brand/{brandId}/{currentProductId}")]
    public async Task<ActionResult<IEnumerable<Product>>> GetRelatedProductsByBrand(int brandId, int currentProductId)
    {
        var relatedProducts = await _context.Products
            .Where(p => p.BrandId == brandId && p.Id != currentProductId)
            .Include(p => p.Images)
            .ToListAsync();

        return Ok(relatedProducts);
    }
    // API lấy danh sách biến thể (màu sắc + dung lượng + số lượng tồn) của sản phẩm
    [HttpGet("{id}/variants")]
    public async Task<ActionResult<IEnumerable<object>>> GetProductVariants(int id)
    {
        var product = await _context.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound("Sản phẩm không tồn tại.");
        }

        var variants = product.Variants
            .Select(v => new
            {
                v.Color,
                v.Storage,
                v.StockQuantity
            })
            .ToList();

        return Ok(variants);
    }
    // Lấy tổng số sản phẩm
    [HttpGet("count")]
    public async Task<ActionResult<int>> GetProductCount()
    {
        int totalProducts = await _context.Products.CountAsync();
        return Ok(totalProducts);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Product>>> SearchProducts([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return BadRequest("Vui lòng nhập từ khóa tìm kiếm.");
        }

        var products = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p =>
                p.Name.Contains(keyword) ||
                p.Description.Contains(keyword) ||
                (p.Category != null && p.Category.Name.Contains(keyword)) ||
                (p.Brand != null && p.Brand.Name.Contains(keyword))
            )
            .ToListAsync();

        if (products.Count == 0)
        {
            return NotFound("Không tìm thấy sản phẩm nào phù hợp.");
        }

        return Ok(products);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<int>> GetLowStockProducts()
    {
        int lowStockThreshold = 20;

        var lowStockProducts = await _context.Products
            .Where(p => p.Variants.Sum(v => v.StockQuantity) <= lowStockThreshold) // Sửa logic ở đây
            .CountAsync();

        return Ok(lowStockProducts);
    }

    [HttpGet("by-category")]
    public async Task<ActionResult> GetProductCountByCategory()
    {
        var categoryCounts = await _context.Products
            .GroupBy(p => p.Category.Name)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(categoryCounts);
    }
    // Lấy brand có số lượng sản phẩm nhiều nhất
    [HttpGet("by-brand")]
    public async Task<ActionResult> GetProductCountByBrand()
    {
        var topBrand = await _context.Products
        .GroupBy(p => p.Brand.Name)
        .Select(g => new { Brand = g.Key, Count = g.Count() })
        .OrderByDescending(g => g.Count) // Sắp xếp giảm dần theo số lượng
        .FirstOrDefaultAsync(); // Lấy thương hiệu có số lượng cao nhất

        return Ok(topBrand);
    }

    // GET: api/Products/lowest-price
    [HttpGet("lowest-price")]
    public async Task<ActionResult<IEnumerable<Product>>> GetProductsWithLowestPrice()
    {
        var now = DateTime.UtcNow;

        var products = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Brand)  // Bao gồm thông tin Brand
            .Include(p => p.Category)  // Bao gồm thông tin Category
            .Where(p => p.Variants.Any())  // Chỉ lấy sản phẩm có ít nhất 1 variant
            .Select(p => new
            {
                Product = p,
                // Lấy giá thấp nhất (ưu tiên giá khuyến mãi nếu có)
                MinPrice = p.Variants.Min(v =>
                    v.FlashSaleStart <= now && now <= v.FlashSaleEnd
                        ? v.DiscountPrice ?? v.Price
                        : v.Price)
            })
            .OrderBy(x => x.MinPrice)  // Sắp xếp theo giá thấp nhất
            .Take(10)  // Lấy 10 sản phẩm
            .Select(x => x.Product)  // Chỉ lấy thông tin Product
            .ToListAsync();

        return Ok(products);
    }

    // Lấy thông tin sản phẩm và hình ảnh dựa trên variantId
    [HttpGet("by-variant/{variantId}")]
    public async Task<ActionResult<object>> GetProductByVariantId(int variantId)
    {
        // Tìm variant theo variantId và bao gồm thông tin sản phẩm và hình ảnh
        var variant = await _context.ProductVariants
            .Include(v => v.Product)
                .ThenInclude(p => p.Images)
            .Include(v => v.Product)
                .ThenInclude(p => p.Category)
            .Include(v => v.Product)
                .ThenInclude(p => p.Brand)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        if (variant == null)
        {
            return NotFound("Không tìm thấy biến thể sản phẩm.");
        }

        // Tạo đối tượng trả về với thông tin sản phẩm và hình ảnh
        var result = new
        {
            Product = new
            {
                variant.Product.Id,
                variant.Product.Name,
                variant.Product.Description,
                Category = variant.Product.Category?.Name,
                Brand = variant.Product.Brand?.Name
            },
            Variant = new
            {
                variant.Id,
                variant.Color,
                variant.Storage,
                variant.Price,
                variant.DiscountPrice,
                variant.StockQuantity
            },
            Images = variant.Product.Images.Select(img => new
            {
                img.Id,
                img.ImageUrl,
                img.IsPrimary
            }).ToList()
        };

        return Ok(result);
    }
    [HttpPost("compare")]
    public async Task<IActionResult> CompareProducts([FromBody] List<int> productIds)
    {
        if (productIds == null || productIds.Count < 1)
        {
            return BadRequest("Vui lòng thêm sản phẩm để so sánh.");
        }

        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .Include(p => p.Images)
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .ToListAsync();

        if (products.Count < 1)
        {
            return NotFound("Không tìm thấy sản phẩm để so sánh.");
        }

        var result = new List<object>();

        foreach (var product in products)
        {
            object specifications = null;

            // Fetch specifications based on category
            var categoryName = product.Category?.Name?.ToLower();

            // Debug logging
            System.Console.WriteLine($"Product: {product.Name}, Category: {categoryName}");

            // Get unified product specifications
            var productSpecs = await _context.ProductSpecifications
                .Where(s => s.ProductId == product.Id)
                .OrderBy(s => s.DisplayOrder)
                .ThenBy(s => s.Name)
                .ToListAsync();

            if (productSpecs.Any())
            {
                // Convert to a dynamic object with Name-Value pairs
                var specDict = productSpecs.ToDictionary(s => s.Name, s => new { s.Value, s.Unit });
                
                specifications = new
                {
                    Type = "unified",
                    Specifications = specDict,
                    Count = productSpecs.Count
                };
            }

            result.Add(new
            {
                product.Id,
                product.Name,
                product.Description,
                Brand = product.Brand?.Name,
                Category = product.Category?.Name,
                Images = product.Images.Select(img => new
                {
                    img.Id,
                    img.ImageUrl,
                    img.IsPrimary
                }).ToList(),
                Variants = product.Variants.Select(v => new
                {
                    v.Color,
                    v.Storage,
                    v.Price,
                    v.DiscountPrice,
                    v.StockQuantity
                }).ToList(),
                Specifications = specifications
            });
        }

        return Ok(result);
    }
}
