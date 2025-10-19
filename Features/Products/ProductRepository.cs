using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Features.Products
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Product> Products, int TotalItems)> GetProductsAsync(
            int? categoryId,
            int page,
            int pageSize,
            string sortBy,
            string sortOrder,
            decimal? minPrice,
            decimal? maxPrice,
            int? brandId)
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

            if (brandId.HasValue)
            {
                query = query.Where(p => p.BrandId == brandId.Value);
            }

            if (minPrice.HasValue || maxPrice.HasValue)
            {
                query = query.Where(p => p.Variants.Any(v =>
                    (!minPrice.HasValue || v.Price >= minPrice.Value) &&
                    (!maxPrice.HasValue || v.Price <= maxPrice.Value)));
            }

            query = sortBy.ToLower() switch
            {
                "price" => sortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(p => p.Variants.Min(v => v.Price))
                    : query.OrderBy(p => p.Variants.Min(v => v.Price)),
                "createdat" => sortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(p => p.Id)
                    : query.OrderBy(p => p.Id),
                _ => sortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name)
            };

            var totalItems = await query.CountAsync();

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalItems);
        }

        public async Task<IEnumerable<Product>> GetRelatedProductsByBrandAsync(int brandId, int currentProductId)
        {
            return await _context.Products
                .Where(p => p.BrandId == brandId && p.Id != currentProductId)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .ToListAsync();
        }

        public async Task<Product> GetProductWithVariantsAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string keyword)
        {
            return await _context.Products
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
        }

        public async Task<int> GetLowStockProductsCountAsync(int lowStockThreshold)
        {
            return await _context.Products
                .Where(p => p.Variants.Sum(v => v.StockQuantity) <= lowStockThreshold)
                .CountAsync();
        }

        public async Task<object> GetProductCountByCategoryAsync()
        {
            return await _context.Products
                .GroupBy(p => p.Category.Name)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();
        }

        public async Task<object> GetProductCountByBrandAsync()
        {
            return await _context.Products
                .GroupBy(p => p.Brand.Name)
                .Select(g => new { Brand = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsWithLowestPriceAsync(int count)
        {
            var now = DateTime.UtcNow;
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Where(p => p.Variants.Any())
                .Select(p => new
                {
                    Product = p,
                    MinPrice = p.IsFlashSale && p.FlashSaleStartDate <= now && now <= p.FlashSaleEndDate
                        ? p.FlashSalePrice ?? p.Variants.Min(v => v.Price)
                        : p.Variants.Min(v => v.Price)
                })
                .OrderBy(x => x.MinPrice)
                .Take(count)
                .Select(x => x.Product)
                .ToListAsync();
        }

        public async Task<ProductVariant> GetProductByVariantIdAsync(int variantId)
        {
            return await _context.ProductVariants
                .Include(v => v.Product)
                    .ThenInclude(p => p.Images)
                .Include(v => v.Product)
                    .ThenInclude(p => p.Category)
                .Include(v => v.Product)
                    .ThenInclude(p => p.Brand)
                .FirstOrDefaultAsync(v => v.Id == variantId);
        }

        public async Task<IEnumerable<Product>> GetProductsByIdsAsync(List<int> productIds)
        {
            return await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetFlashSaleProductsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Where(p => p.IsFlashSale && p.FlashSaleStartDate <= now && now <= p.FlashSaleEndDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetPinnedProductsAsync()
        {
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Brand)
                .Where(p => p.IsPinned)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductSpecification>> GetProductSpecificationsAsync(int productId)
        {
            return await _context.ProductSpecifications
                .Where(s => s.ProductId == productId)
                .OrderBy(s => s.DisplayOrder)
                .ThenBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Product> GetByIdWithIncludesAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
