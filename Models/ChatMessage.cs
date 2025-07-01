namespace SHN_Gear.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int ChatSessionId { get; set; }
        public ChatSession ChatSession { get; set; } = null!;
        public string Content { get; set; } = null!;
        public MessageType Type { get; set; }
        public MessageSender Sender { get; set; }
        public int? SenderId { get; set; } // UserId nếu từ user hoặc admin
        public User? SenderUser { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        // AI specific fields
        public decimal? AIConfidenceScore { get; set; } // Độ tin cậy của câu trả lời AI
        public string? AIIntent { get; set; } // Intent mà AI detect được
        public string? AIContext { get; set; } // Context mà AI sử dụng
        public bool RequiresEscalation { get; set; } = false; // AI không trả lời được

        // Rich content support
        public string? AttachmentsJson { get; set; } // JSON cho attachments, images, product links
        public string? SuggestedActionsJson { get; set; } // JSON cho quick replies, buttons

        // Metadata
        public string? MetadataJson { get; set; } // Additional data (product IDs, order IDs, etc.)
    }

    public enum MessageType
    {
        Text,
        Image,
        ProductRecommendation,
        OrderInfo,
        QuickReply,
        SystemMessage,
        EscalationNotice
    }

    public enum MessageSender
    {
        User,
        AI,
        Admin,
        System
    }
}
