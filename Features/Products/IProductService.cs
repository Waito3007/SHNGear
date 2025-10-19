using SHN_Gear.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SHN_Gear.Features.Products
{
    public interface IProductService
    {
        Task<PaginatedResponseDto<ProductDto>> GetProducts(int? categoryId, int page, int pageSize, string sortBy, string sortOrder, decimal? minPrice, decimal? maxPrice, int? brandId);
        Task<ProductDto> GetProduct(int id);
        Task<ProductDto> CreateProduct(ProductDto productDto);
        Task<bool> UpdateProduct(int id, ProductDto productDto);
        Task<bool> DeleteProduct(int id);
        Task<IEnumerable<ProductDto>> GetRelatedProductsByBrand(int brandId, int currentProductId);
        Task<IEnumerable<object>> GetProductVariants(int id);
        Task<int> GetProductCount();
        Task<IEnumerable<ProductDto>> SearchProducts(string keyword);
        Task<int> GetLowStockProducts();
        Task<object> GetProductCountByCategory();
        Task<object> GetProductCountByBrand();
        Task<IEnumerable<ProductDto>> GetProductsWithLowestPrice();
        Task<object> GetProductByVariantId(int variantId);
        Task<IEnumerable<CompareResultDto>> CompareProducts(List<int> productIds);
        Task<IEnumerable<ProductDto>> GetProductsByIds(string ids);
        Task<IEnumerable<ProductDto>> GetFlashSaleProducts();
        Task<bool> SetFlashSale(int id, FlashSaleUpdateDto flashSaleDto);
        Task<bool> ClearFlashSale(int id);
        Task<IEnumerable<ProductDto>> GetPinnedProducts();
        Task<bool> TogglePin(int id, PinnedProductDto pinnedProductDto);
    }
}
