namespace SHN_Gear.Models
{
    public class ChatSession
    {
        public int Id { get; set; }
        public int? UserId { get; set; } // Null cho guest users
        public User? User { get; set; }
        public string SessionId { get; set; } = Guid.NewGuid().ToString(); // Unique session ID
        public string? GuestName { get; set; } // Tên khách nếu không đăng nhập
        public string? GuestEmail { get; set; } // Email khách nếu có

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;
        public ChatSessionStatus Status { get; set; } = ChatSessionStatus.Active;
        public ChatType Type { get; set; } = ChatType.AI; // AI hoặc Admin
        public int? AssignedAdminId { get; set; } // Admin được gán
        public User? AssignedAdmin { get; set; }

        // Context để AI hiểu về user
        public string? UserContext { get; set; } // JSON context về user preferences, cart, etc.
        public decimal? ConfidenceScore { get; set; } // Độ tin cậy của AI
        public bool RequiresHumanSupport { get; set; } = false; // Cần chuyển sang admin

        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }

    public enum ChatSessionStatus
    {
        Active,
        Resolved,
        Escalated, // Chuyển lên admin
        Closed
    }

    public enum ChatType
    {
        AI,
        Admin,
        Mixed // Cả AI và Admin
    }
}
