using System.ComponentModel.DataAnnotations;

namespace SHN_Gear.DTOs
{
    public class ChatSessionDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
        public bool IsResolved { get; set; }
        public int UnreadCount { get; set; }
        public string? LastMessage { get; set; }

        public string DisplayName => UserName ?? GuestName ?? GuestEmail ?? "Khách";
    }

    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int? SenderUserId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsFromAdmin { get; set; }
        public bool IsRead { get; set; }
    }

    public class SendMessageDto
    {
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }

    public class StartGuestSessionDto
    {
        [Required]
        [MaxLength(100)]
        public string GuestName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string GuestEmail { get; set; } = string.Empty;
    }

    public class ChatHistoryDto
    {
        public ChatSessionDto Session { get; set; } = null!;
        public List<ChatMessageDto> Messages { get; set; } = [];
    }

    public class PagedChatSessionsDto
    {
        public List<ChatSessionDto> Items { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int UnreadTotal { get; set; }
    }
}
