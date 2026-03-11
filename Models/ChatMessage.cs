using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }

        public int ChatSessionId { get; set; }

        public int? SenderUserId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsFromAdmin { get; set; } = false;

        public bool IsRead { get; set; } = false;

        // Navigation properties
        [ForeignKey(nameof(ChatSessionId))]
        public ChatSession ChatSession { get; set; } = null!;

        [ForeignKey(nameof(SenderUserId))]
        public User? SenderUser { get; set; }
    }
}
