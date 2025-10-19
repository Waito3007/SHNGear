using SHN_Gear.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SHN_Gear.Features.Products
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId);
        Task<(IEnumerable<Product> Products, int TotalItems)> GetProductsAsync(
            int? categoryId,
            int page,
            int pageSize,
            string sortBy,
            string sortOrder,
            decimal? minPrice,
            decimal? maxPrice,
            int? brandId);
        Task<IEnumerable<Product>> GetRelatedProductsByBrandAsync(int brandId, int currentProductId);
        Task<Product> GetProductWithVariantsAsync(int id);
        Task<IEnumerable<Product>> SearchProductsAsync(string keyword);
        Task<int> GetLowStockProductsCountAsync(int lowStockThreshold);
        Task<object> GetProductCountByCategoryAsync();
        Task<object> GetProductCountByBrandAsync();
        Task<IEnumerable<Product>> GetProductsWithLowestPriceAsync(int count);
        Task<ProductVariant> GetProductByVariantIdAsync(int variantId);
        Task<IEnumerable<Product>> GetProductsByIdsAsync(List<int> productIds);
        Task<IEnumerable<Product>> GetFlashSaleProductsAsync();
        Task<IEnumerable<Product>> GetPinnedProductsAsync();
        Task<IEnumerable<ProductSpecification>> GetProductSpecificationsAsync(int productId);
        Task<Product> GetByIdWithIncludesAsync(int id);
    }
}
