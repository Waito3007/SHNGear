using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class ChatSession
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [MaxLength(100)]
        public string? GuestName { get; set; }

        [MaxLength(200)]
        public string? GuestEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        public bool IsResolved { get; set; } = false;

        // Navigation properties
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        public ICollection<ChatMessage> Messages { get; set; } = [];
    }
}
