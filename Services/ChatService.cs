using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;

namespace SHN_Gear.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _db;

        public ChatService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ChatSession> CreateSessionAsync(int? userId, string? guestName, string? guestEmail)
        {
            var session = new ChatSession
            {
                UserId = userId,
                GuestName = guestName,
                GuestEmail = guestEmail,
                CreatedAt = DateTime.UtcNow,
                LastMessageAt = DateTime.UtcNow
            };

            _db.ChatSessions.Add(session);
            await _db.SaveChangesAsync();
            return session;
        }

        public async Task<ChatSession?> GetOrCreateSessionByUserIdAsync(int userId)
        {
            var session = await _db.ChatSessions
                .Where(s => s.UserId == userId && !s.IsResolved)
                .OrderByDescending(s => s.LastMessageAt)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
                session = await CreateSessionAsync(userId, null, null);
            }

            return session;
        }

        public async Task<ChatSession?> GetSessionByIdAsync(int sessionId)
        {
            return await _db.ChatSessions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == sessionId);
        }

        public async Task<ChatMessage> SaveMessageAsync(int sessionId, int? senderUserId, string senderName, string content, bool isFromAdmin)
        {
            var message = new ChatMessage
            {
                ChatSessionId = sessionId,
                SenderUserId = senderUserId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsFromAdmin = isFromAdmin,
                IsRead = false
            };

            _db.ChatMessages.Add(message);

            // Update session's LastMessageAt
            var session = await _db.ChatSessions.FindAsync(sessionId);
            if (session != null)
                session.LastMessageAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return message;
        }

        public async Task<ChatHistoryDto?> GetSessionHistoryAsync(int sessionId)
        {
            var session = await _db.ChatSessions
                .Include(s => s.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null) return null;

            var messages = await _db.ChatMessages
                .Include(m => m.SenderUser)
                .Where(m => m.ChatSessionId == sessionId)
                .OrderBy(m => m.SentAt)
                .AsNoTracking()
                .ToListAsync();

            return new ChatHistoryDto
            {
                Session = MapSessionToDto(session, messages),
                Messages = messages.Select(MapMessageToDto).ToList()
            };
        }

        public async Task<PagedChatSessionsDto> GetAllSessionsAsync(int page, int pageSize, bool? resolved = false)
        {
            var query = _db.ChatSessions
                .Include(s => s.User)
                .AsNoTracking();

            if (resolved.HasValue)
                query = query.Where(s => s.IsResolved == resolved.Value);

            var total = await query.CountAsync();

            var sessions = await query
                .OrderByDescending(s => s.LastMessageAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var sessionIds = sessions.Select(s => s.Id).ToList();

            // Batch load last messages and unread counts
            var lastMessages = await _db.ChatMessages
                .Where(m => sessionIds.Contains(m.ChatSessionId))
                .GroupBy(m => m.ChatSessionId)
                .Select(g => new
                {
                    SessionId = g.Key,
                    LastContent = g.OrderByDescending(m => m.SentAt).Select(m => m.Content).FirstOrDefault(),
                    UnreadCount = g.Count(m => !m.IsRead && !m.IsFromAdmin)
                })
                .ToListAsync();

            var lookupMessages = lastMessages.ToDictionary(x => x.SessionId);

            var unreadTotal = lastMessages.Sum(x => x.UnreadCount);

            var dtos = sessions.Select(s =>
            {
                lookupMessages.TryGetValue(s.Id, out var info);
                var dto = MapSessionToDto(s, null);
                dto.LastMessage = info?.LastContent;
                dto.UnreadCount = info?.UnreadCount ?? 0;
                return dto;
            }).ToList();

            return new PagedChatSessionsDto
            {
                Items = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize,
                UnreadTotal = unreadTotal
            };
        }

        public async Task MarkMessagesReadAsync(int sessionId, bool byAdmin)
        {
            // byAdmin=true means admin is reading → mark user messages as read
            // byAdmin=false means user is reading → mark admin messages as read
            var unread = await _db.ChatMessages
                .Where(m => m.ChatSessionId == sessionId && !m.IsRead && m.IsFromAdmin != byAdmin)
                .ToListAsync();

            foreach (var m in unread)
                m.IsRead = true;

            await _db.SaveChangesAsync();
        }

        public async Task MarkResolvedAsync(int sessionId)
        {
            var session = await _db.ChatSessions.FindAsync(sessionId);
            if (session != null)
            {
                session.IsResolved = true;
                await _db.SaveChangesAsync();
            }
        }

        public async Task<int> GetAdminUnreadCountAsync()
        {
            return await _db.ChatMessages
                .Where(m => !m.IsRead && !m.IsFromAdmin)
                .CountAsync();
        }

        // ── Mapping helpers ───────────────────────────────────────────────────

        private static ChatSessionDto MapSessionToDto(ChatSession s, IEnumerable<ChatMessage>? messages)
        {
            return new ChatSessionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User?.FullName,
                GuestName = s.GuestName,
                GuestEmail = s.GuestEmail,
                CreatedAt = s.CreatedAt,
                LastMessageAt = s.LastMessageAt,
                IsResolved = s.IsResolved,
                UnreadCount = messages?.Count(m => !m.IsRead && !m.IsFromAdmin) ?? 0,
                LastMessage = messages?.OrderByDescending(m => m.SentAt).FirstOrDefault()?.Content
            };
        }

        public static ChatMessageDto MapMessageToDto(ChatMessage m)
        {
            return new ChatMessageDto
            {
                Id = m.Id,
                SessionId = m.ChatSessionId,
                SenderUserId = m.SenderUserId,
                SenderName = m.IsFromAdmin ? "Admin" : (m.SenderUser?.FullName ?? "Khách"),
                Content = m.Content,
                SentAt = m.SentAt,
                IsFromAdmin = m.IsFromAdmin,
                IsRead = m.IsRead
            };
        }
    }
}
