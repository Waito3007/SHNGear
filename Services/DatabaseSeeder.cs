using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.Services;

namespace SHN_Gear.Services
{
    public class DatabaseSeeder
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(AppDbContext context, ILogger<DatabaseSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                // Seed AI Knowledge Base if empty
                if (!_context.AIKnowledgeBases.Any())
                {
                    _logger.LogInformation("Seeding AI Knowledge Base...");
                    await SeedAIKnowledgeBase();
                }

                // You can add other seeding methods here
                // await SeedDefaultAdminUsers();
                // await SeedProductCategories();

                await _context.SaveChangesAsync();
                _logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private async Task SeedAIKnowledgeBase()
        {
            var knowledgeEntries = KnowledgeBaseSeeder.GetDefaultKnowledgeBase();

            await _context.AIKnowledgeBases.AddRangeAsync(knowledgeEntries);

            _logger.LogInformation($"Added {knowledgeEntries.Count} AI knowledge base entries.");
        }

        public async Task SeedSpecificProductKnowledge()
        {
            // Seed knowledge về sản phẩm cụ thể từ database
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Variants)
                .Take(20) // Top 20 sản phẩm phổ biến
                .ToListAsync();

            var productKnowledge = new List<AIKnowledgeBase>();

            foreach (var product in products)
            {
                // Tạo knowledge entry cho từng sản phẩm
                productKnowledge.Add(new AIKnowledgeBase
                {
                    Topic = "product_specific",
                    Question = $"Thông tin về {product.Name}",
                    Answer = $"📱 {product.Name}\n" +
                            $"💰 Giá: {product.Variants.FirstOrDefault()?.Price:C}\n" +
                            $"🏷️ Danh mục: {product.Category?.Name}\n" +
                            $"🏢 Thương hiệu: {product.Brand?.Name}\n" +
                            $"📝 Mô tả: {(product.Description?.Length > 200 ? product.Description.Substring(0, 200) + "..." : product.Description)}\n\n" +
                            $"👉 Xem chi tiết tại: /products/{product.Id}",
                    Keywords = [product.Name.ToLower(), product.Brand?.Name?.ToLower() ?? "", product.Category?.Name?.ToLower() ?? ""],
                    Category = KnowledgeCategory.ProductInfo,
                    Priority = 5,
                    ProductCategoryIds = $"[{product.CategoryId}]",
                    BrandIds = $"[{product.BrandId}]",
                    IsActive = true,
                    MinConfidenceScore = 0.6m,
                    EscalationThreshold = 0.3m
                });
            }

            await _context.AIKnowledgeBases.AddRangeAsync(productKnowledge);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Added {productKnowledge.Count} product-specific knowledge entries.");
        }
    }
}
