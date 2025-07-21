
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SHN_Gear.Data;
using System.Text;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace SHN_Gear.Services
{
    public class KnowledgeBaseService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<KnowledgeBaseService> _logger;
        private readonly IMemoryCache _cache;
        private const string ProductKnowledgeCacheKey = "ProductKnowledge";

        public KnowledgeBaseService(AppDbContext context, ILogger<KnowledgeBaseService> logger, IMemoryCache cache)
        {
            _context = context;
            _logger = logger;
            _cache = cache;
        }

        public async Task<string> GetProductKnowledgeAsync()
        {
            // Thử lấy kiến thức từ cache trước
            if (_cache.TryGetValue(ProductKnowledgeCacheKey, out string cachedKnowledge))
            {
                _logger.LogInformation("Product knowledge found in cache.");
                return cachedKnowledge;
            }

            _logger.LogInformation("Generating product knowledge from database.");
            var knowledgeBuilder = new StringBuilder();

            try
            {
                // Lấy tất cả sản phẩm cùng với thương hiệu và danh mục
                var products = await _context.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Include(p => p.Variants)
                    // .Where(p => p.IsActive) // Chỉ lấy sản phẩm đang hoạt động
                    .ToListAsync();

                if (!products.Any())
                {
                    _logger.LogWarning("No active products found in the database to build knowledge base.");
                    return "Không có thông tin sản phẩm nào trong hệ thống.";
                }

                knowledgeBuilder.AppendLine("Đây là danh sách các sản phẩm và thông tin chi tiết hiện có trong cửa hàng:");

                foreach (var product in products)
                {
                    knowledgeBuilder.AppendLine($"---");
                    knowledgeBuilder.AppendLine($"Tên sản phẩm: {product.Name}");
                    if (product.Category != null)
                    {
                        knowledgeBuilder.AppendLine($"Loại: {product.Category.Name}");
                    }
                    if (product.Brand != null)
                    {
                        knowledgeBuilder.AppendLine($"Thương hiệu: {product.Brand.Name}");
                    }
                    if (!string.IsNullOrEmpty(product.Description))
                    {
                        knowledgeBuilder.AppendLine($"Mô tả: {product.Description}");
                    }

                    var mainVariant = product.Variants.FirstOrDefault();
                    if (mainVariant != null)
                    {
                        knowledgeBuilder.AppendLine($"Giá: {mainVariant.Price:N0} VND");
                        if (mainVariant.DiscountPrice.HasValue && mainVariant.DiscountPrice < mainVariant.Price)
                        {
                            knowledgeBuilder.AppendLine($"Giá khuyến mãi: {mainVariant.DiscountPrice.Value:N0} VND");
                        }
                    }
                    knowledgeBuilder.AppendLine($"---");
                }

                var knowledge = knowledgeBuilder.ToString();

                // Cache kiến thức được tạo trong 15 phút
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(15));

                _cache.Set(ProductKnowledgeCacheKey, knowledge, cacheEntryOptions);

                return knowledge;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating product knowledge from database.");
                return "Đã xảy ra lỗi khi truy xuất thông tin sản phẩm.";
            }
        }
    }
}
