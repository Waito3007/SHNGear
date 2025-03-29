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
                if (string.IsNullOrWhiteSpace(query))
                {
                    return Ok(new SearchResultDto()); // Trả về kết quả rỗng nếu query trống
                }

                var normalizedQuery = query.Trim().ToLower();
                var result = new SearchResultDto();

                // Tìm kiếm sản phẩm
                result.Products = await SearchProducts(normalizedQuery, limit);

                // Tìm kiếm danh mục
                result.Categories = await SearchCategories(normalizedQuery, limit);

                // Tìm kiếm thương hiệu
                result.Brands = await SearchBrands(normalizedQuery, limit);

                result.TotalResults = result.Products.Count + result.Categories.Count + result.Brands.Count;

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực hiện tìm kiếm");
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi tìm kiếm" });
            }
        }

        private async Task<List<SearchProductDto>> SearchProducts(string query, int limit)
        {
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Where(p => p.Name.ToLower().Contains(query) ||
                           p.Description.ToLower().Contains(query))
                .OrderBy(p => p.Name)
                .Take(limit)
                .Select(p => new SearchProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    ImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary).ImageUrl
                             ?? p.Images.FirstOrDefault().ImageUrl
                             ?? "/images/default-product.png",
                    Price = p.Variants.Min(v => v.Price)
                })
                .ToListAsync();
        }

        private async Task<List<SearchCategoryDto>> SearchCategories(string query, int limit)
        {
            return await _context.Categories
                .Where(c => c.Name.ToLower().Contains(query))
                .OrderBy(c => c.Name)
                .Take(limit)
                .Select(c => new SearchCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();
        }

        private async Task<List<SearchBrandDto>> SearchBrands(string query, int limit)
        {
            return await _context.Brands
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
                    .Where(p => p.Name.ToLower().Contains(normalizedQuery) ||
                               p.Description.ToLower().Contains(normalizedQuery));

                result.Products = await productQuery
                    .OrderBy(p => p.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new SearchProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ImageUrl = p.Images.FirstOrDefault().ImageUrl,
                        Price = p.Variants.Min(v => v.Price)
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
    }
}