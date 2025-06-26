using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class ChatFile
    {
        [Key]
        public int Id { get; set; }

        public int? SessionId { get; set; }
        [ForeignKey("SessionId")]
        public virtual ChatSession? Session { get; set; }

        public int? MessageId { get; set; }
        [ForeignKey("MessageId")]
        public virtual ChatMessage? Message { get; set; }

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        [StringLength(500)]
        public string? ThumbnailPath { get; set; } // Cho hình ảnh/video

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public int? UploadedBy { get; set; }
        [ForeignKey("UploadedBy")]
        public virtual User? Uploader { get; set; }

        public bool IsDeleted { get; set; } = false;
    }

    public class ChatTemplate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [StringLength(50)]
        public string Category { get; set; } = "General";

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User Creator { get; set; }
    }

    public class ChatQuickReply
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Message { get; set; } = string.Empty;

        [StringLength(50)]
        public string Category { get; set; } = "General";

        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
