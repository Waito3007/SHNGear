using SHN_Gear.DTOs;
using SHN_Gear.Models;

namespace SHN_Gear.Services
{
    public interface IChatService
    {
        Task<ChatSession> CreateSessionAsync(int? userId, string? guestName, string? guestEmail);
        Task<ChatSession?> GetOrCreateSessionByUserIdAsync(int userId);
        Task<ChatSession?> GetSessionByIdAsync(int sessionId);
        Task<ChatMessage> SaveMessageAsync(int sessionId, int? senderUserId, string senderName, string content, bool isFromAdmin);
        Task<ChatHistoryDto?> GetSessionHistoryAsync(int sessionId);
        Task<PagedChatSessionsDto> GetAllSessionsAsync(int page, int pageSize, bool? resolved = false);
        Task MarkMessagesReadAsync(int sessionId, bool byAdmin);
        Task MarkResolvedAsync(int sessionId);
        Task<int> GetAdminUnreadCountAsync();
    }
}
