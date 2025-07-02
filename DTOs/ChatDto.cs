namespace SHN_Gear.DTOs
{
    public class ChatSessionDto
    {
        public int Id { get; set; }
        public string SessionId { get; set; } = null!;
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public UserDto? User { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastActivityAt { get; set; }
        public string Status { get; set; } = null!;
        public string Type { get; set; } = null!;
        public UserDto? AssignedAdmin { get; set; }
        public bool RequiresHumanSupport { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new();
    }

    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int ChatSessionId { get; set; } // Add this field for frontend filtering
        public string Content { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string Sender { get; set; } = null!;
        public UserDto? SenderUser { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        public decimal? AIConfidenceScore { get; set; }
        public string? AIIntent { get; set; }
        public bool RequiresEscalation { get; set; }
        public List<object>? Attachments { get; set; }
        public List<SuggestedActionDto>? SuggestedActions { get; set; }
        public object? Metadata { get; set; }
    }

    public class SuggestedActionDto
    {
        public string Text { get; set; } = null!;
        public string Action { get; set; } = null!; // "quick_reply", "view_product", "contact_admin"
        public object? Data { get; set; } // Additional data cho action
    }

    public class SendMessageDto
    {
        public string Content { get; set; } = null!;
        public string? SessionId { get; set; } // Null để tạo session mới
        public string? GuestName { get; set; } // Cho guest users
        public string? GuestEmail { get; set; }
        public object? Context { get; set; } // Context về user preferences, current product, etc.
    }

    public class AIResponseDto
    {
        public string Response { get; set; } = null!;
        public decimal ConfidenceScore { get; set; }
        public string Intent { get; set; } = null!;
        public bool RequiresEscalation { get; set; }
        public List<SuggestedActionDto>? SuggestedActions { get; set; }
        public List<ProductRecommendationDto>? ProductRecommendations { get; set; }
        public object? Context { get; set; }
    }

    public class ProductRecommendationDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string Brand { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Reason { get; set; } = null!; // Lý do recommend
    }

    public class EscalateChatDto
    {
        public int SessionId { get; set; }
        public string Reason { get; set; } = null!;
        public int? PreferredAdminId { get; set; }
    }
}
