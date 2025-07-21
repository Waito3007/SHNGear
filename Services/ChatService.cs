using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using SHN_Gear.Hubs;
using System.Text.Json;

namespace SHN_Gear.Services
{
    public class ChatService
    {
        private readonly AppDbContext _context;
        private readonly AIService _aiService;
        private readonly ILogger<ChatService> _logger;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatService(AppDbContext context, AIService aiService, ILogger<ChatService> logger, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _aiService = aiService;
            _logger = logger;
            _hubContext = hubContext;
        }

        public async Task<ChatSessionDto> CreateOrGetSessionAsync(int? userId, string? guestName = null, string? guestEmail = null, string? sessionId = null)
        {
            ChatSession? session = null;

            _logger.LogInformation("CreateOrGetSessionAsync called with userId: {UserId}, guestName: {GuestName}, guestEmail: {GuestEmail}, sessionId: {SessionId}",
                userId, guestName, guestEmail, sessionId);

            // Nếu có userId, tìm session hiện tại của user
            if (userId.HasValue)
            {
                _logger.LogInformation("Looking for existing session for userId: {UserId}", userId.Value);
                session = await _context.ChatSessions
                    .Include(s => s.User)
                    .Include(s => s.AssignedAdmin)
                    .Include(s => s.Messages.OrderBy(m => m.SentAt))
                        .ThenInclude(m => m.SenderUser)
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == ChatSessionStatus.Active);

                if (session != null)
                {
                    _logger.LogInformation("Found existing session {SessionId} for user {UserId}", session.SessionId, userId.Value);
                }
                else
                {
                    _logger.LogInformation("No existing session found for user {UserId}", userId.Value);
                }
            }
            // Nếu không có userId nhưng có sessionId, tìm theo sessionId
            else if (!string.IsNullOrEmpty(sessionId))
            {
                session = await _context.ChatSessions
                    .Include(s => s.User)
                    .Include(s => s.AssignedAdmin)
                    .Include(s => s.Messages.OrderBy(m => m.SentAt))
                        .ThenInclude(m => m.SenderUser)
                    .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.Status == ChatSessionStatus.Active);
            }

            if (session != null)
            {
                // Update last activity and guest info if provided
                session.LastActivityAt = DateTime.UtcNow;

                // Update guest info if provided and not already set
                if (!string.IsNullOrEmpty(guestName) && string.IsNullOrEmpty(session.GuestName))
                {
                    session.GuestName = guestName;
                }
                if (!string.IsNullOrEmpty(guestEmail) && string.IsNullOrEmpty(session.GuestEmail))
                {
                    session.GuestEmail = guestEmail;
                }

                await _context.SaveChangesAsync();
                return MapToDto(session);
            }

            // Tạo session mới
            session = new ChatSession
            {
                UserId = userId,
                SessionId = string.IsNullOrEmpty(sessionId) ? Guid.NewGuid().ToString() : sessionId,
                GuestName = guestName,
                GuestEmail = guestEmail,
                CreatedAt = DateTime.UtcNow,
                LastActivityAt = DateTime.UtcNow,
                Status = ChatSessionStatus.Active,
                Type = ChatType.AI
            };

            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();

            // Gửi welcome message
            await AddWelcomeMessage(session.Id);

            // Reload session với messages và User
            session = await _context.ChatSessions
                .Include(s => s.User)
                .Include(s => s.AssignedAdmin)
                .Include(s => s.Messages.OrderBy(m => m.SentAt))
                    .ThenInclude(m => m.SenderUser)
                .FirstAsync(s => s.Id == session.Id);

            // Thông báo cho admin dashboard về session mới
            await NotifyAdminsNewSession(session);

            return MapToDto(session);
        }

        public async Task<ChatMessageDto> SendMessageAsync(SendMessageDto messageDto, int? userId = null)
        {
            try
            {
                // Get or create session
                var sessionDto = await CreateOrGetSessionAsync(userId, messageDto.GuestName, messageDto.GuestEmail, messageDto.SessionId);
                var session = await _context.ChatSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == sessionDto.Id);

                if (session == null)
                    throw new InvalidOperationException("Session not found");

                // Validate that SessionId is not null
                if (string.IsNullOrEmpty(session.SessionId))
                {
                    _logger.LogError("Session {SessionId} has null or empty SessionId", sessionDto.Id);
                    throw new InvalidOperationException("Session has invalid SessionId");
                }

                // Save user message
                var userMessage = new ChatMessage
                {
                    ChatSessionId = session.Id,
                    Content = messageDto.Content,
                    Type = MessageType.Text,
                    Sender = MessageSender.User,
                    SenderId = userId,
                    SentAt = DateTime.UtcNow,
                    MetadataJson = messageDto.Context != null ? JsonSerializer.Serialize(messageDto.Context) : null
                };

                _context.ChatMessages.Add(userMessage);
                await _context.SaveChangesAsync();

                // Reload message with SenderUser information
                var messageWithUser = await _context.ChatMessages
                    .Include(m => m.SenderUser)
                    .FirstOrDefaultAsync(m => m.Id == userMessage.Id);

                // Gửi tin nhắn user real-time
                await NotifyNewMessage(messageWithUser ?? userMessage, session.SessionId);

                // Process with AI (if session type is AI or Mixed)
                if (session.Type == ChatType.AI || session.Type == ChatType.Mixed)
                {
                    await ProcessAIResponse(session, messageDto.Content, userId, messageDto.Context);
                }

                // Update session activity
                session.LastActivityAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Return the user message
                return MapMessageToDto(messageWithUser ?? userMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message: {Message}", messageDto.Content);
                throw;
            }
        }

        private async Task ProcessAIResponse(ChatSession session, string userMessage, int? userId, object? context)
        {
            try
            {
                if (string.IsNullOrEmpty(session.SessionId))
                {
                    _logger.LogError("Session {SessionId} has a null or empty SessionId, cannot process AI response.", session.Id);
                    return;
                }

                var aiResponse = await _aiService.ProcessMessageAsync(userMessage, session.SessionId, userId);

                var aiMessage = new ChatMessage
                {
                    ChatSessionId = session.Id,
                    Content = aiResponse.Response,
                    Type = MessageType.Text,
                    Sender = MessageSender.AI,
                    SentAt = DateTime.UtcNow,
                    AIConfidenceScore = aiResponse.ConfidenceScore,
                    AIIntent = aiResponse.Intent,
                    RequiresEscalation = aiResponse.RequiresEscalation,
                    SuggestedActionsJson = aiResponse.SuggestedActions != null ? JsonSerializer.Serialize(aiResponse.SuggestedActions) : null
                };

                _context.ChatMessages.Add(aiMessage);
                await _context.SaveChangesAsync();

                await NotifyNewMessage(aiMessage, session.SessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing AI response for session {SessionId}", session.Id);
            }
        }

        public async Task<ChatMessageDto> SendAdminMessageAsync(string sessionId, string content, int adminId)
        {
            try
            {
                var session = await _context.ChatSessions
                    .FirstOrDefaultAsync(s => s.SessionId == sessionId);

                if (session == null)
                    throw new InvalidOperationException("Session not found");

                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminId);
                if (admin == null)
                    throw new InvalidOperationException("Admin not found");

                // Create admin message
                var adminMessage = new ChatMessage
                {
                    ChatSessionId = session.Id,
                    Content = content,
                    Type = MessageType.Text,
                    Sender = MessageSender.Admin,
                    SenderId = adminId,
                    SentAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(adminMessage);

                // Update session to admin mode if not already
                if (session.Type != ChatType.Admin)
                {
                    session.Type = ChatType.Mixed; // Allow both AI and admin
                    session.AssignedAdminId = adminId;
                }

                session.LastActivityAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Gửi tin nhắn admin real-time
                await NotifyNewMessage(adminMessage, session.SessionId);

                return MapMessageToDto(adminMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending admin message to session {SessionId}", sessionId);
                throw;
            }
        }

        public async Task<ChatSessionDto> EscalateToAdminAsync(int sessionId, string reason, int? preferredAdminId = null)
        {
            var session = await _context.ChatSessions
                .Include(s => s.Messages)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
                throw new InvalidOperationException("Session not found");

            // Find available admin
            var admin = preferredAdminId.HasValue
                ? await _context.Users.FirstOrDefaultAsync(u => u.Id == preferredAdminId && u.RoleId == 1)
                : await FindAvailableAdmin();

            session.Type = ChatType.Admin;
            session.Status = ChatSessionStatus.Escalated;
            session.AssignedAdminId = admin?.Id;
            session.RequiresHumanSupport = true;

            // Add escalation message
            var escalationMessage = new ChatMessage
            {
                ChatSessionId = session.Id,
                Content = admin != null
                    ? $"Bạn đã được kết nối với {admin.FullName}. Nhân viên sẽ hỗ trợ bạn trong giây lát."
                    : "Cuộc trò chuyện đã được chuyển đến bộ phận hỗ trợ. Nhân viên sẽ liên hệ với bạn sớm nhất có thể.",
                Type = MessageType.EscalationNotice,
                Sender = MessageSender.System,
                SentAt = DateTime.UtcNow,
                MetadataJson = JsonSerializer.Serialize(new { Reason = reason, AdminId = admin?.Id })
            };

            _context.ChatMessages.Add(escalationMessage);
            await _context.SaveChangesAsync();

            return MapToDto(session);
        }

        public async Task<ChatMessageDto> SendAdminMessageAsync(int sessionId, int adminId, string content)
        {
            var session = await _context.ChatSessions.FindAsync(sessionId);
            if (session == null)
                throw new InvalidOperationException("Session not found");

            var admin = await _context.Users.FindAsync(adminId);
            if (admin == null || admin.RoleId != 1)
                throw new UnauthorizedAccessException("Invalid admin");

            var message = new ChatMessage
            {
                ChatSessionId = sessionId,
                Content = content,
                Type = MessageType.Text,
                Sender = MessageSender.Admin,
                SenderId = adminId,
                SentAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(message);

            // Update session
            session.LastActivityAt = DateTime.UtcNow;
            session.AssignedAdminId = adminId;
            session.Type = ChatType.Admin;

            await _context.SaveChangesAsync();

            return MapMessageToDto(message);
        }

        public async Task<List<ChatSessionDto>> GetActiveChatSessionsAsync(int? adminId = null)
        {
            _logger.LogInformation("GetActiveChatSessionsAsync called with adminId: {AdminId}", adminId);

            // First, check total sessions count
            var totalSessionsCount = await _context.ChatSessions.CountAsync();
            _logger.LogInformation("Total sessions in database: {Count}", totalSessionsCount);

            var query = _context.ChatSessions
                .Include(s => s.User)
                .Include(s => s.AssignedAdmin)
                .Include(s => s.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.SenderUser)
                .Where(s => s.Status == ChatSessionStatus.Active || s.Status == ChatSessionStatus.Escalated);

            // Check count before applying admin filter
            var activeSessionsCount = await query.CountAsync();
            _logger.LogInformation("Active/Escalated sessions count: {Count}", activeSessionsCount);

            // For now, show all active sessions to all admins
            // Later you can implement admin assignment logic
            if (adminId.HasValue)
            {
                // Show all sessions to admin: 
                // 1. Assigned to them
                // 2. Requiring human support  
                // 3. Unassigned sessions (both guest and logged-in users)
                // 4. All logged-in user sessions (so admin can see all customer conversations)
                query = query.Where(s =>
                    s.AssignedAdminId == adminId ||
                    s.RequiresHumanSupport ||
                    s.AssignedAdminId == null); // All unassigned sessions regardless of guest or logged-in
                var filteredCount = await query.CountAsync();
                _logger.LogInformation("Filtered sessions count for admin {AdminId}: {Count}", adminId, filteredCount);
            }

            var sessions = await query
                .OrderByDescending(s => s.LastActivityAt)
                .ToListAsync();

            _logger.LogInformation("Returning {Count} sessions", sessions.Count);
            return sessions.Select(MapToDto).ToList();
        }

        public async Task<ChatSessionDto?> GetSessionAsync(string sessionId)
        {
            var session = await _context.ChatSessions
                .Include(s => s.User)
                .Include(s => s.AssignedAdmin)
                .Include(s => s.Messages.OrderBy(m => m.SentAt))
                    .ThenInclude(m => m.SenderUser)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            return session != null ? MapToDto(session) : null;
        }

        private async Task AddWelcomeMessage(int sessionId)
        {
            var welcomeMessages = new[]
            {
                "Xin chào! Tôi là trợ lý AI của SHN-Gear. Tôi có thể giúp bạn tìm sản phẩm, kiểm tra giá cả, hoặc trả lời các câu hỏi. Bạn cần hỗ trợ gì?",
                "Chào mừng bạn đến với SHN-Gear! Tôi có thể giúp bạn tìm hiểu về điện thoại, laptop, tai nghe và nhiều sản phẩm khác. Hãy cho tôi biết bạn đang quan tâm gì nhé!",
                "Hi! Tôi là AI assistant của SHN-Gear. Bạn có thể hỏi tôi về sản phẩm, giá cả, chính sách, hoặc bất cứ điều gì. Tôi sẵn sàng hỗ trợ!"
            };

            var welcomeMessage = new ChatMessage
            {
                ChatSessionId = sessionId,
                Content = welcomeMessages[Random.Shared.Next(welcomeMessages.Length)],
                Type = MessageType.Text,
                Sender = MessageSender.AI,
                SentAt = DateTime.UtcNow,
                AIConfidenceScore = 1.0m,
                AIIntent = "greeting",
                SuggestedActionsJson = JsonSerializer.Serialize(new[]
                {
                    new SuggestedActionDto { Text = "Tìm điện thoại", Action = "search_phones" },
                    new SuggestedActionDto { Text = "Tìm laptop", Action = "search_laptops" },
                    new SuggestedActionDto { Text = "Tìm tai nghe", Action = "search_headphones" },
                    new SuggestedActionDto { Text = "Xem khuyến mãi", Action = "view_promotions" }
                })
            };

            _context.ChatMessages.Add(welcomeMessage);
            await _context.SaveChangesAsync();
        }

        private async Task NotifyAdminsNewSession(ChatSession session)
        {
            try
            {
                await _hubContext.Clients.Group("admins").SendAsync("NewChatSession", MapToDto(session));
                _logger.LogInformation("Notified admins about new session {SessionId}", session.SessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying admins about new session {SessionId}", session.SessionId);
            }
        }

        private async Task NotifyNewMessage(ChatMessage message, string sessionId)
        {
            try
            {
                var messageDto = MapMessageToDto(message);

                // Tìm session để lấy userId
                var session = await _context.ChatSessions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.SessionId == sessionId);

                // Gửi cho user cụ thể (nếu có userId)
                if (session?.UserId.HasValue == true)
                {
                    await _hubContext.Clients.Group($"user_{session.UserId.Value}").SendAsync("NewMessage", messageDto);
                    _logger.LogInformation("Sent message to user_{UserId} group", session.UserId.Value);
                }

                // Gửi cho tất cả clients trong session (cho guest users và admins trong session)
                await _hubContext.Clients.Group($"session_{sessionId}").SendAsync("NewMessage", messageDto);

                // Gửi cho admin dashboard
                await _hubContext.Clients.Group("admins").SendAsync("NewMessage", messageDto);
                _logger.LogInformation("Sent message to admins group for session {SessionId}", sessionId);

                _logger.LogInformation("Sent real-time message for session {SessionId}", sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time message for session {SessionId}", sessionId);
            }
        }

        private async Task<User?> FindAvailableAdmin()
        {
            // Simple logic: find admin with least active chats
            var adminChatCounts = await _context.ChatSessions
                .Where(s => s.Status == ChatSessionStatus.Active || s.Status == ChatSessionStatus.Escalated)
                .Where(s => s.AssignedAdminId.HasValue)
                .GroupBy(s => s.AssignedAdminId)
                .Select(g => new { AdminId = g.Key, Count = g.Count() })
                .ToListAsync();

            var allAdmins = await _context.Users
                .Where(u => u.RoleId == 1 && u.IsActive)
                .ToListAsync();

            return allAdmins
                .OrderBy(a => adminChatCounts.FirstOrDefault(acc => acc.AdminId == a.Id)?.Count ?? 0)
                .FirstOrDefault();
        }

        private ChatSessionDto MapToDto(ChatSession session)
        {
            return new ChatSessionDto
            {
                Id = session.Id,
                SessionId = session.SessionId,
                GuestName = session.GuestName,
                GuestEmail = session.GuestEmail,
                User = session.User != null ? new UserDto { Id = session.User.Id, FullName = session.User.FullName, Email = session.User.Email } : null,
                CreatedAt = session.CreatedAt,
                LastActivityAt = session.LastActivityAt,
                Status = session.Status.ToString(),
                Type = session.Type.ToString(),
                AssignedAdmin = session.AssignedAdmin != null ? new UserDto { Id = session.AssignedAdmin.Id, FullName = session.AssignedAdmin.FullName } : null,
                RequiresHumanSupport = session.RequiresHumanSupport,
                Messages = session.Messages?.Select(MapMessageToDto).ToList() ?? new List<ChatMessageDto>()
            };
        }

        private ChatMessageDto MapMessageToDto(ChatMessage message)
        {
            return new ChatMessageDto
            {
                Id = message.Id,
                ChatSessionId = message.ChatSessionId, // Add this field
                Content = message.Content,
                Type = message.Type.ToString(),
                Sender = message.Sender.ToString(),
                SenderUser = message.SenderUser != null ? new UserDto { Id = message.SenderUser.Id, FullName = message.SenderUser.FullName } : null,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                AIConfidenceScore = message.AIConfidenceScore,
                AIIntent = message.AIIntent,
                RequiresEscalation = message.RequiresEscalation,
                SuggestedActions = !string.IsNullOrEmpty(message.SuggestedActionsJson)
                    ? JsonSerializer.Deserialize<List<SuggestedActionDto>>(message.SuggestedActionsJson)
                    : null,
                Metadata = !string.IsNullOrEmpty(message.MetadataJson)
                    ? JsonSerializer.Deserialize<object>(message.MetadataJson)
                    : null
            };
        }
    }
}
