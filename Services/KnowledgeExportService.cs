using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;

namespace SHN_Gear.Services
{
    public class KnowledgeExportService
    {
        private readonly AppDbContext _context;
        public KnowledgeExportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task ExportWebsiteKnowledgeBaseAsync(string filePath)
        {
            var products = await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .Select(p => new
                {
                    name = p.Name,
                    category = p.Category.Name,
                    brand = p.Brand.Name,
                    price = p.Variants.OrderBy(v => v.Price).FirstOrDefault() != null ? p.Variants.OrderBy(v => v.Price).First().Price.ToString("N0") + "đ" : null,
                    warranty = "12 tháng"
                })
                .ToListAsync();

            var faqs = await _context.AIKnowledgeBases
                .Where(kb => kb.Category == KnowledgeCategory.General || kb.Category == KnowledgeCategory.Policy)
                .Select(kb => new { question = kb.Question, answer = kb.Answer })
                .ToListAsync();

            var policies = await _context.AIKnowledgeBases
                .Where(kb => kb.Category == KnowledgeCategory.Policy)
                .ToListAsync();

            var shipping = policies.FirstOrDefault(p => p.Topic.ToLower().Contains("shipping"))?.Answer ?? "";
            var returns = policies.FirstOrDefault(p => p.Topic.ToLower().Contains("return"))?.Answer ?? "";
            var warranty = policies.FirstOrDefault(p => p.Topic.ToLower().Contains("warranty"))?.Answer ?? "";

            var knowledge = new
            {
                websiteName = "SHN Gear",
                description = "SHN Gear là hệ thống thương mại điện tử chuyên về thiết bị công nghệ, phụ kiện, laptop, điện thoại, tai nghe, và các sản phẩm công nghệ chính hãng.",
                contact = new
                {
                    hotline = "0123 456 789",
                    email = "support@shngear.vn",
                    address = "123 Đường Công Nghệ, Quận 1, TP.HCM"
                },
                policies = new
                {
                    shipping = shipping,
                    @return = returns,
                    warranty = warranty
                },
                faq = faqs,
                products = products
            };

            var jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
            var json = JsonSerializer.Serialize(knowledge, jsonOptions);
            await File.WriteAllTextAsync(filePath, json, System.Text.Encoding.UTF8);
        }
    }
}
