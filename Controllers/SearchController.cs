using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SearchController> _logger;

        public SearchController(AppDbContext context, ILogger<SearchController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Tìm kiếm tổng hợp sản phẩm, danh mục và thương hiệu
        /// </summary>
        /// <param name="query">Từ khóa tìm kiếm</param>
        /// <param name="limit">Số lượng kết quả tối đa cho mỗi loại (mặc định: 3)</param>
        /// <returns>Kết quả tìm kiếm gồm sản phẩm, danh mục và thương hiệu</returns>
        [HttpGet]
        public async Task<ActionResult<SearchResultDto>> Search(
            [FromQuery] string query,
            [FromQuery] int limit = 3)
        {
            try
            {
                _logger.LogInformation("Search endpoint called with query: {Query}, limit: {Limit}", query, limit);

                if (string.IsNullOrWhiteSpace(query))
                {
                    _logger.LogInformation("Empty query provided, returning empty result");
                    return Ok(new SearchResultDto()); // Trả về kết quả rỗng nếu query trống
                }

                var normalizedQuery = query.Trim().ToLower();
                var result = new SearchResultDto();

                _logger.LogInformation("Searching for products with normalized query: {NormalizedQuery}", normalizedQuery);

                // Tìm kiếm sản phẩm
                try
                {
                    result.Products = await SearchProducts(normalizedQuery, limit);
                    _logger.LogInformation("Found {Count} products", result.Products.Count);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error searching products");
                    result.Products = new List<SearchProductDto>();
                }

                // Tìm kiếm danh mục
                try
                {
                    result.Categories = await SearchCategories(normalizedQuery, limit);
                    _logger.LogInformation("Found {Count} categories", result.Categories.Count);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error searching categories");
                    result.Categories = new List<SearchCategoryDto>();
                }

                // Tìm kiếm thương hiệu
                try
                {
                    result.Brands = await SearchBrands(normalizedQuery, limit);
                    _logger.LogInformation("Found {Count} brands", result.Brands.Count);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error searching brands");
                    result.Brands = new List<SearchBrandDto>();
                }

                result.TotalResults = result.Products.Count + result.Categories.Count + result.Brands.Count;

                _logger.LogInformation("Search completed with {TotalResults} total results", result.TotalResults);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực hiện tìm kiếm");
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi tìm kiếm", Error = ex.Message });
            }
        }

        private async Task<List<SearchProductDto>> SearchProducts(string query, int limit)
        {
            try
            {
                _logger.LogInformation("Starting product search with query: {Query}, limit: {Limit}", query, limit);
                
                var products = await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Variants)
                    .Where(p => p.Name.ToLower().Contains(query) ||
                               (p.Description != null && p.Description.ToLower().Contains(query)))
                    .OrderBy(p => p.Name)
                    .Take(limit)
                    .Select(p => new SearchProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ImageUrl = p.Images.Any(i => i.IsPrimary) 
                                 ? p.Images.FirstOrDefault(i => i.IsPrimary).ImageUrl
                                 : p.Images.Any() 
                                   ? p.Images.FirstOrDefault().ImageUrl
                                   : "/images/default-product.png",
                        Price = p.Variants.Any() ? p.Variants.Min(v => v.Price) : 0
                    })
                    .ToListAsync();

                _logger.LogInformation("Product search completed, found {Count} products", products.Count);
                return products;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchProducts method");
                throw;
            }
        }

        private async Task<List<SearchCategoryDto>> SearchCategories(string query, int limit)
        {
            try
            {
                _logger.LogInformation("Starting category search with query: {Query}, limit: {Limit}", query, limit);
                
                var categories = await _context.Categories
                    .Where(c => c.Name.ToLower().Contains(query))
                    .OrderBy(c => c.Name)
                    .Take(limit)
                    .Select(c => new SearchCategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name
                    })
                    .ToListAsync();

                _logger.LogInformation("Category search completed, found {Count} categories", categories.Count);
                return categories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchCategories method");
                throw;
            }
        }

        private async Task<List<SearchBrandDto>> SearchBrands(string query, int limit)
        {
            try
            {
                _logger.LogInformation("Starting brand search with query: {Query}, limit: {Limit}", query, limit);
                
                var brands = await _context.Brands
                    .Where(b => b.Name.ToLower().Contains(query))
                    .OrderBy(b => b.Name)
                    .Take(limit)
                    .Select(b => new SearchBrandDto
                    {
                        Id = b.Id,
                        Name = b.Name,
                        LogoUrl = b.Logo ?? "/images/default-brand.png"
                    })
                    .ToListAsync();

                _logger.LogInformation("Brand search completed, found {Count} brands", brands.Count);
                return brands;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchBrands method");
                throw;
            }
        }

        /// <summary>
        /// API tìm kiếm nâng cao với phân trang
        /// </summary>
        [HttpGet("advanced")]
        public async Task<ActionResult<SearchResultDto>> AdvancedSearch(
            [FromQuery] string query,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return Ok(new SearchResultDto());
                }

                var normalizedQuery = query.Trim().ToLower();
                var result = new SearchResultDto
                {
                    Page = page,
                    PageSize = pageSize
                };

                // Tìm kiếm sản phẩm với phân trang
                var productQuery = _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Variants)
                    .Where(p => p.Name.ToLower().Contains(normalizedQuery) ||
                               (p.Description != null && p.Description.ToLower().Contains(normalizedQuery)));

                result.Products = await productQuery
                    .OrderBy(p => p.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new SearchProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ImageUrl = p.Images.Any() 
                                 ? p.Images.FirstOrDefault().ImageUrl 
                                 : "/images/default-product.png",
                        Price = p.Variants.Any() ? p.Variants.Min(v => v.Price) : 0
                    })
                    .ToListAsync();

                // Đếm tổng số sản phẩm
                var totalProducts = await productQuery.CountAsync();
                result.TotalResults = totalProducts;

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực hiện tìm kiếm nâng cao");
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi tìm kiếm" });
            }
        }

        /// <summary>
        /// Health check endpoint to test database connectivity
        /// </summary>
        [HttpGet("health")]
        public async Task<ActionResult> HealthCheck()
        {
            try
            {
                var productCount = await _context.Products.CountAsync();
                var categoryCount = await _context.Categories.CountAsync();
                var brandCount = await _context.Brands.CountAsync();

                return Ok(new
                {
                    Status = "Healthy",
                    ProductCount = productCount,
                    CategoryCount = categoryCount,
                    BrandCount = brandCount,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, new
                {
                    Status = "Unhealthy",
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}