using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // Helper method to map Product to ProductDto
        private ProductDto MapProductToDto(Product product)
        {
            var now = DateTime.UtcNow;
            bool isInFlashSale = product.IsFlashSale &&
                                 product.FlashSaleStartDate.HasValue && product.FlashSaleStartDate.Value <= now &&
                                 product.FlashSaleEndDate.HasValue && product.FlashSaleEndDate.Value >= now;

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                CategoryId = product.CategoryId,
                BrandId = product.BrandId,
                Images = product.Images.Select(img => new ProductImageDto
                {
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList(),
                Variants = product.Variants.Select(v => new ProductVariantDto
                {
                    Color = v.Color,
                    Storage = v.Storage,
                    // Apply flash sale price if applicable, otherwise use original price or discount price
                    Price = isInFlashSale && product.FlashSalePrice.HasValue
                            ? product.FlashSalePrice.Value
                            : v.Price,
                    DiscountPrice = isInFlashSale && product.FlashSalePrice.HasValue
                                    ? product.FlashSalePrice.Value // Flash sale price overrides discount price
                                    : v.DiscountPrice,
                    StockQuantity = v.StockQuantity
                }).ToList(),
                IsFlashSale = isInFlashSale, // Reflect actual flash sale status
                FlashSalePrice = product.FlashSalePrice,
                FlashSaleStartDate = product.FlashSaleStartDate,
                FlashSaleEndDate = product.FlashSaleEndDate
            };
        }

        // Lấy danh sách sản phẩm (có hỗ trợ lọc theo danh mục)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] int? categoryId = null)
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
            return Ok(products.Select(p => MapProductToDto(p)));
        }

        // Lấy thông tin chi tiết sản phẩm theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
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

            return Ok(MapProductToDto(product));
        }

        // Thêm sản phẩm mới
        [HttpPost]
        public async Task<ActionResult<ProductDto>> PostProduct([FromBody] ProductDto productDto)
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
                    StockQuantity = v.StockQuantity
                }).ToList() ?? new List<ProductVariant>(),
                IsFlashSale = productDto.IsFlashSale,
                FlashSalePrice = productDto.FlashSalePrice,
                FlashSaleStartDate = productDto.FlashSaleStartDate,
                FlashSaleEndDate = productDto.FlashSaleEndDate
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapProductToDto(product));
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

            // Update images (consider more robust handling for image updates)
            existingProduct.Images.Clear();
            foreach (var imgDto in productDto.Images)
            {
                existingProduct.Images.Add(new ProductImage { ImageUrl = imgDto.ImageUrl, IsPrimary = imgDto.IsPrimary });
            }

            // Update variants (consider more robust handling for variant updates)
            existingProduct.Variants.Clear();
            foreach (var variantDto in productDto.Variants)
            {
                existingProduct.Variants.Add(new ProductVariant
                {
                    Color = variantDto.Color,
                    Storage = variantDto.Storage,
                    Price = variantDto.Price,
                    DiscountPrice = variantDto.DiscountPrice,
                    StockQuantity = variantDto.StockQuantity
                });
            }

            existingProduct.IsFlashSale = productDto.IsFlashSale;
            existingProduct.FlashSalePrice = productDto.FlashSalePrice;
            existingProduct.FlashSaleStartDate = productDto.FlashSaleStartDate;
            existingProduct.FlashSaleEndDate = productDto.FlashSaleEndDate;

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
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetRelatedProductsByBrand(int brandId, int currentProductId)
        {
            var relatedProducts = await _context.Products
                .Where(p => p.BrandId == brandId && p.Id != currentProductId)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .ToListAsync();

            return Ok(relatedProducts.Select(p => MapProductToDto(p)));
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
                    v.StockQuantity,
                    v.Price,
                    v.DiscountPrice
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
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest("Vui lòng nhập từ khóa tìm kiếm.");
            }

            var products = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Variants)
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

            return Ok(products.Select(p => MapProductToDto(p)));
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
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsWithLowestPrice()
        {
            var now = DateTime.UtcNow;

            var products = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Where(p => p.Variants.Any()) // Chỉ lấy sản phẩm có ít nhất 1 variant
                .Select(p => new
                {
                    Product = p,
                    // Lấy giá thấp nhất (ưu tiên giá khuyến mãi nếu có)
                    MinPrice = p.IsFlashSale && p.FlashSaleStartDate <= now && now <= p.FlashSaleEndDate
                        ? p.FlashSalePrice ?? p.Variants.Min(v => v.Price)
                        : p.Variants.Min(v => v.Price)
                })
                .OrderBy(x => x.MinPrice) // Sắp xếp theo giá thấp nhất
                .Take(10) // Lấy 10 sản phẩm
                .Select(x => x.Product) // Chỉ lấy thông tin Product
                .ToListAsync();

            return Ok(products.Select(p => MapProductToDto(p)));
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
                    Brand = variant.Product.Brand?.Name,
                    variant.Product.IsFlashSale,
                    variant.Product.FlashSalePrice,
                    variant.Product.FlashSaleStartDate,
                    variant.Product.FlashSaleEndDate
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
                    Specifications = specifications,
                    product.IsFlashSale,
                    product.FlashSalePrice,
                    product.FlashSaleStartDate,
                    product.FlashSaleEndDate
                });
            }

            return Ok(result);
        }

        // New: Get products by a list of IDs
        [HttpGet("by-ids")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByIds([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids))
            {
                return BadRequest("Product IDs are required.");
            }

            var productIds = ids.Split(',').Select(int.Parse).ToList();

            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .ToListAsync();

            if (!products.Any())
            {
                return NotFound("No products found for the given IDs.");
            }

            return Ok(products.Select(p => MapProductToDto(p)));
        }

        // New: Get products currently on Flash Sale
        [HttpGet("flash-sale")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFlashSaleProducts()
        {
            var now = DateTime.UtcNow;
            var flashSaleProducts = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Where(p => p.IsFlashSale && p.FlashSaleStartDate <= now && now <= p.FlashSaleEndDate)
                .ToListAsync();

            return Ok(flashSaleProducts.Select(p => MapProductToDto(p)));
        }

        // New: Set a product to Flash Sale
        [HttpPut("{id}/set-flash-sale")]
        public async Task<IActionResult> SetFlashSale(int id, [FromBody] FlashSaleUpdateDto flashSaleDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.IsFlashSale = true;
            product.FlashSalePrice = flashSaleDto.FlashSalePrice;
            product.FlashSaleStartDate = flashSaleDto.FlashSaleStartDate;
            product.FlashSaleEndDate = flashSaleDto.FlashSaleEndDate;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // New: Clear Flash Sale from a product
        [HttpPut("{id}/clear-flash-sale")]
        public async Task<IActionResult> ClearFlashSale(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.IsFlashSale = false;
            product.FlashSalePrice = null;
            product.FlashSaleStartDate = null;
            product.FlashSaleEndDate = null;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}