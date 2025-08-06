namespace SHN_Gear.Models
{
    public class AIKnowledgeBase
    {
        public int Id { get; set; }
        public string Topic { get; set; } = null!; // Chủ đề: product_info, policy, shipping, etc.
        public string Question { get; set; } = null!; // Câu hỏi mẫu
        public string Answer { get; set; } = null!; // Câu trả lời
        public string[] Keywords { get; set; } = []; // Keywords để match
        public KnowledgeCategory Category { get; set; }
        public int Priority { get; set; } = 1; // Độ ưu tiên (1-10)
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Context conditions
        public string? ProductCategoryIds { get; set; } // JSON array of category IDs
        public string? BrandIds { get; set; } // JSON array of brand IDs
        public bool RequiresLogin { get; set; } = false; // Cần đăng nhập mới trả lời

        // Confidence thresholds
        public decimal MinConfidenceScore { get; set; } = 0.7m; // Threshold để AI trả lời
        public decimal EscalationThreshold { get; set; } = 0.4m; // Dưới ngưỡng này sẽ escalate
    }

    public enum KnowledgeCategory
    {
        ProductInfo,        // Thông tin sản phẩm
        Pricing,           // Giá cả, khuyến mãi
        Shipping,          // Vận chuyển
        Returns,           // Đổi trả
        Account,           // Tài khoản
        Payment,           // Thanh toán
        Technical,         // Hỗ trợ kỹ thuật
        General,           // Chung
        Policy             // Chính sách
    }
}
