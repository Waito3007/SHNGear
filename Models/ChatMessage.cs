using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SessionId { get; set; }
        [ForeignKey("SessionId")]
        public virtual ChatSession Session { get; set; }

        // Sender info
        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [Required]
        [StringLength(100)]
        public string SenderName { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string SenderEmail { get; set; } = string.Empty;

        // Message content
        [Required]
        public string Message { get; set; } = string.Empty;

        [Required]
        public MessageType MessageType { get; set; } = MessageType.Text;

        public bool IsFromAdmin { get; set; } = false;
        public bool IsAutoResponse { get; set; } = false;
        public bool IsRead { get; set; } = false;
        public bool IsEdited { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Message metadata
        [StringLength(500)]
        public string? Metadata { get; set; } // JSON cho các thông tin bổ sung

        // Reply functionality
        public int? ReplyToMessageId { get; set; }
        [ForeignKey("ReplyToMessageId")]
        public virtual ChatMessage? ReplyToMessage { get; set; }

        // Reactions (emoji reactions)
        [StringLength(100)]
        public string? Reactions { get; set; } // JSON: {"👍": ["user1", "user2"], "❤️": ["user3"]}

        // File attachments
        public virtual ICollection<ChatFile> Files { get; set; } = new List<ChatFile>();

        // Navigation properties
        public virtual ICollection<ChatMessage> Replies { get; set; } = new List<ChatMessage>();
    }

    public enum MessageType
    {
        Text = 1,
        Image = 2,
        File = 3,
        Audio = 4,
        Video = 5,
        Location = 6,
        System = 7,        // Tin nhắn hệ thống
        QuickReply = 8,    // Câu trả lời nhanh
        Template = 9,      // Template message
        Product = 10       // Chia sẻ sản phẩm
    }
}
