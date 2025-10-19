using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Features.Products
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

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
                Brand = product.Brand != null ? new BrandDto
                {
                    Id = product.Brand.Id,
                    Name = product.Brand.Name,
                    Description = product.Brand.Description,
                    Logo = product.Brand.Logo
                } : null,
                Images = product.Images.Select(img => new ProductImageDto
                {
                    ImageUrl = img.ImageUrl,
                    IsPrimary = img.IsPrimary
                }).ToList(),
                Variants = product.Variants.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    Color = v.Color,
                    Storage = v.Storage,
                    Price = v.Price,
                    DiscountPrice = isInFlashSale && product.FlashSalePrice.HasValue
                                    ? product.FlashSalePrice.Value
                                    : v.DiscountPrice,
                    StockQuantity = v.StockQuantity
                }).ToList(),
                IsFlashSale = isInFlashSale,
                FlashSalePrice = product.FlashSalePrice,
                FlashSaleStartDate = product.FlashSaleStartDate,
                FlashSaleEndDate = product.FlashSaleEndDate
            };
        }

        private Product MapDtoToProduct(ProductDto productDto)
        {
            return new Product
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
        }

        public async Task<PaginatedResponseDto<ProductDto>> GetProducts(int? categoryId, int page, int pageSize, string sortBy, string sortOrder, decimal? minPrice, decimal? maxPrice, int? brandId)
        {
            var (products, totalItems) = await _productRepository.GetProductsAsync(categoryId, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, brandId);
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            return new PaginatedResponseDto<ProductDto>
            {
                Data = products.Select(MapProductToDto),
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                HasPreviousPage = page > 1,
                HasNextPage = page < totalPages
            };
        }

        public async Task<ProductDto> GetProduct(int id)
        {
            var product = await _productRepository.GetByIdWithIncludesAsync(id);
            return product != null ? MapProductToDto(product) : null;
        }

        public async Task<ProductDto> CreateProduct(ProductDto productDto)
        {
            var product = MapDtoToProduct(productDto);
            await _productRepository.AddAsync(product);
            await _productRepository.SaveChangesAsync();
            return MapProductToDto(product);
        }

        public async Task<bool> UpdateProduct(int id, ProductDto productDto)
        {
            var existingProduct = await _productRepository.GetByIdWithIncludesAsync(id);
            if (existingProduct == null)
            {
                return false;
            }

            existingProduct.Name = productDto.Name;
            existingProduct.Description = productDto.Description;
            existingProduct.CategoryId = productDto.CategoryId;
            existingProduct.BrandId = productDto.BrandId;
            existingProduct.Images.Clear();
            foreach (var imgDto in productDto.Images)
            {
                existingProduct.Images.Add(new ProductImage { ImageUrl = imgDto.ImageUrl, IsPrimary = imgDto.IsPrimary });
            }
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

            _productRepository.Update(existingProduct);
            await _productRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProduct(int id)
        {
            var product = await _productRepository.GetByIdWithIncludesAsync(id);
            if (product == null)
            {
                return false;
            }

            _productRepository.Remove(product);
            await _productRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ProductDto>> GetRelatedProductsByBrand(int brandId, int currentProductId)
        {
            var products = await _productRepository.GetRelatedProductsByBrandAsync(brandId, currentProductId);
            return products.Select(MapProductToDto);
        }

        public async Task<IEnumerable<object>> GetProductVariants(int id)
        {
            var product = await _productRepository.GetProductWithVariantsAsync(id);
            if (product == null)
            {
                return null;
            }
            return product.Variants
                .Select(v => new
                {
                    v.Id,
                    v.Color,
                    v.Storage,
                    v.StockQuantity,
                    v.Price,
                    v.DiscountPrice
                })
                .ToList();
        }

        public async Task<int> GetProductCount()
        {
            return await _productRepository.CountAsync();
        }

        public async Task<IEnumerable<ProductDto>> SearchProducts(string keyword)
        {
            var products = await _productRepository.SearchProductsAsync(keyword);
            return products.Select(MapProductToDto);
        }

        public async Task<int> GetLowStockProducts()
        {
            return await _productRepository.GetLowStockProductsCountAsync(20);
        }

        public async Task<object> GetProductCountByCategory()
        {
            return await _productRepository.GetProductCountByCategoryAsync();
        }

        public async Task<object> GetProductCountByBrand()
        {
            return await _productRepository.GetProductCountByBrandAsync();
        }

        public async Task<IEnumerable<ProductDto>> GetProductsWithLowestPrice()
        {
            var products = await _productRepository.GetProductsWithLowestPriceAsync(10);
            return products.Select(MapProductToDto);
        }

        public async Task<object> GetProductByVariantId(int variantId)
        {
            var variant = await _productRepository.GetProductByVariantIdAsync(variantId);
            if (variant == null)
            {
                return null;
            }
            return new
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
        }

        public async Task<IEnumerable<CompareResultDto>> CompareProducts(List<int> productIds)
        {
            var products = await _productRepository.GetProductsByIdsAsync(productIds);
            var result = new List<CompareResultDto>();

            foreach (var product in products)
            {
                var productSpecs = await _productRepository.GetProductSpecificationsAsync(product.Id);
                var specDict = productSpecs.ToDictionary(s => s.Name, s => new ProductSpecificationDetailDto { Value = s.Value, Unit = s.Unit });

                result.Add(new CompareResultDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Brand = product.Brand?.Name,
                    Category = product.Category?.Name,
                    Images = product.Images.Select(img => new ProductImageDto { ImageUrl = img.ImageUrl, IsPrimary = img.IsPrimary }),
                    Variants = product.Variants.Select(v => new ProductVariantDto { Id = v.Id, Color = v.Color, Storage = v.Storage, Price = v.Price, DiscountPrice = v.DiscountPrice, StockQuantity = v.StockQuantity }),
                    Specifications = new { Type = "unified", Specifications = specDict, Count = productSpecs.Count() },
                    IsFlashSale = product.IsFlashSale,
                    FlashSalePrice = product.FlashSalePrice,
                    FlashSaleStartDate = product.FlashSaleStartDate,
                    FlashSaleEndDate = product.FlashSaleEndDate
                });
            }

            return result;
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByIds(string ids)
        {
            var productIds = ids.Split(',').Select(int.Parse).ToList();
            var products = await _productRepository.GetProductsByIdsAsync(productIds);
            return products.Select(MapProductToDto);
        }

        public async Task<IEnumerable<ProductDto>> GetFlashSaleProducts()
        {
            var products = await _productRepository.GetFlashSaleProductsAsync();
            return products.Select(MapProductToDto);
        }

        public async Task<bool> SetFlashSale(int id, FlashSaleUpdateDto flashSaleDto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return false;
            }
            product.IsFlashSale = true;
            product.FlashSalePrice = flashSaleDto.FlashSalePrice;
            product.FlashSaleStartDate = flashSaleDto.FlashSaleStartDate;
            product.FlashSaleEndDate = flashSaleDto.FlashSaleEndDate;
            await _productRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearFlashSale(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return false;
            }
            product.IsFlashSale = false;
            product.FlashSalePrice = null;
            product.FlashSaleStartDate = null;
            product.FlashSaleEndDate = null;
            await _productRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ProductDto>> GetPinnedProducts()
        {
            var products = await _productRepository.GetPinnedProductsAsync();
            return products.Select(MapProductToDto);
        }

        public async Task<bool> TogglePin(int id, PinnedProductDto pinnedProductDto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return false;
            }
            product.IsPinned = pinnedProductDto.IsPinned;
            await _productRepository.SaveChangesAsync();
            return true;
        }
    }
}
