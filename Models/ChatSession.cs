using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class ChatSession
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string SessionId { get; set; } = Guid.NewGuid().ToString();

        // User info (nếu đã đăng nhập)
        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        // Guest info (nếu khách vãng lai)
        [StringLength(100)]
        public string? GuestName { get; set; }

        [StringLength(255)]
        public string? GuestEmail { get; set; }

        [StringLength(20)]
        public string? GuestPhone { get; set; }

        // Session details
        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = "Hỗ trợ khách hàng";

        [Required]
        public ChatStatus Status { get; set; } = ChatStatus.Active;

        [Required]
        public ChatPriority Priority { get; set; } = ChatPriority.Normal;

        public int? AssignedAdminId { get; set; }
        [ForeignKey("AssignedAdminId")]
        public virtual User? AssignedAdmin { get; set; }

        // Timestamps
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }

        // Session metadata
        [StringLength(500)]
        public string? CustomerInfo { get; set; } // JSON với thông tin bổ sung

        [StringLength(1000)]
        public string? Notes { get; set; } // Ghi chú của admin

        public bool IsActive { get; set; } = true;
        public int TotalMessages { get; set; } = 0;
        public TimeSpan? ResponseTime { get; set; } // Thời gian phản hồi trung bình
        
        // Customer satisfaction
        public int? Rating { get; set; } // 1-5 stars
        [StringLength(1000)]
        public string? Feedback { get; set; }

        // Navigation properties
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        public virtual ICollection<ChatFile> Files { get; set; } = new List<ChatFile>();
    }

    public enum ChatStatus
    {
        Active = 1,        // Đang hoạt động
        Waiting = 2,       // Chờ admin phản hồi
        Resolved = 3,      // Đã giải quyết
        Closed = 4,        // Đã đóng
        Escalated = 5      // Chuyển lên cấp cao
    }

    public enum ChatPriority
    {
        Low = 1,
        Normal = 2,
        High = 3,
        Urgent = 4
    }
}
