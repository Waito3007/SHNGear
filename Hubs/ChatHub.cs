using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Security.Claims;
using System.Text.Json;

namespace SHN_Gear.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(AppDbContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            
            _logger.LogInformation($"User connected: {Context.ConnectionId}, UserId: {userId}, Role: {userRole}");

            // Thêm vào group theo role
            if (userRole == "Admin" || userRole == "Staff")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
                _logger.LogInformation($"Added {Context.ConnectionId} to AdminGroup");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation($"User disconnected: {Context.ConnectionId}, UserId: {userId}");

            // Cập nhật trạng thái offline
            await UpdateUserOnlineStatus(false);
            
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChat(string sessionId)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Chat_{sessionId}");
                _logger.LogInformation($"Connection {Context.ConnectionId} joined chat {sessionId}");

                // Cập nhật last activity
                var session = await _context.ChatSessions.FindAsync(int.Parse(sessionId));
                if (session != null)
                {
                    session.LastActivity = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                // Thông báo cho admin nếu có user mới vào chat
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Clients.Group("AdminGroup").SendAsync("UserJoinedChat", new
                    {
                        sessionId,
                        userId,
                        timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining chat {sessionId}");
                await Clients.Caller.SendAsync("Error", "Không thể tham gia phòng chat");
            }
        }

        public async Task LeaveChat(string sessionId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Chat_{sessionId}");
                _logger.LogInformation($"Connection {Context.ConnectionId} left chat {sessionId}");

                // Thông báo cho admin
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Clients.Group("AdminGroup").SendAsync("UserLeftChat", new
                    {
                        sessionId,
                        userId,
                        timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error leaving chat {sessionId}");
            }
        }

        public async Task SendMessage(string sessionId, string message, string messageType = "Text")
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
                var userEmail = Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "";
                var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

                var isFromAdmin = userRole == "Admin" || userRole == "Staff";

                // Lưu tin nhắn vào database
                var chatMessage = new ChatMessage
                {
                    SessionId = int.Parse(sessionId),
                    UserId = !string.IsNullOrEmpty(userId) ? int.Parse(userId) : null,
                    SenderName = userName,
                    SenderEmail = userEmail,
                    Message = message,
                    MessageType = Enum.Parse<MessageType>(messageType),
                    IsFromAdmin = isFromAdmin,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(chatMessage);

                // Cập nhật session
                var session = await _context.ChatSessions.FindAsync(int.Parse(sessionId));
                if (session != null)
                {
                    session.LastActivity = DateTime.UtcNow;
                    session.TotalMessages++;
                    
                    // Cập nhật status nếu cần
                    if (session.Status == ChatStatus.Waiting && isFromAdmin)
                    {
                        session.Status = ChatStatus.Active;
                    }
                    else if (!isFromAdmin)
                    {
                        session.Status = ChatStatus.Waiting;
                    }
                }

                await _context.SaveChangesAsync();

                // Gửi tin nhắn cho tất cả thành viên trong chat
                var messageData = new
                {
                    id = chatMessage.Id,
                    sessionId,
                    senderName = userName,
                    senderEmail = userEmail,
                    message,
                    messageType,
                    isFromAdmin,
                    isAutoResponse = false,
                    createdAt = chatMessage.CreatedAt,
                    userId = chatMessage.UserId
                };

                await Clients.Group($"Chat_{sessionId}").SendAsync("ReceiveMessage", messageData);

                // Thông báo cho admin group về tin nhắn mới
                if (!isFromAdmin)
                {
                    await Clients.Group("AdminGroup").SendAsync("NewMessage", new
                    {
                        sessionId,
                        senderName = userName,
                        message = message.Length > 50 ? message.Substring(0, 50) + "..." : message,
                        timestamp = DateTime.UtcNow
                    });
                }

                _logger.LogInformation($"Message sent in chat {sessionId} by {userName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending message in chat {sessionId}");
                await Clients.Caller.SendAsync("Error", "Không thể gửi tin nhắn");
            }
        }

        public async Task SendTyping(string sessionId, bool isTyping)
        {
            try
            {
                var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
                var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
                var isFromAdmin = userRole == "Admin" || userRole == "Staff";

                // Gửi thông báo typing cho các thành viên khác trong chat
                await Clients.OthersInGroup($"Chat_{sessionId}").SendAsync(
                    isFromAdmin ? "AdminTyping" : "UserTyping", 
                    new { isTyping, senderName = userName }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending typing status in chat {sessionId}");
            }
        }

        public async Task MarkMessageAsRead(string sessionId, int messageId)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var message = await _context.ChatMessages.FindAsync(messageId);
                if (message != null && message.SessionId.ToString() == sessionId)
                {
                    message.IsRead = true;
                    message.ReadAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Thông báo cho người gửi rằng tin nhắn đã được đọc
                    await Clients.Group($"Chat_{sessionId}").SendAsync("MessageRead", new
                    {
                        messageId,
                        readBy = userId,
                        readAt = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking message as read: {messageId}");
            }
        }

        public async Task ReactToMessage(string sessionId, int messageId, string emoji)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";

                var message = await _context.ChatMessages.FindAsync(messageId);
                if (message != null && message.SessionId.ToString() == sessionId)
                {
                    // Parse existing reactions
                    var reactions = string.IsNullOrEmpty(message.Reactions) 
                        ? new Dictionary<string, List<string>>()
                        : JsonSerializer.Deserialize<Dictionary<string, List<string>>>(message.Reactions) ?? new Dictionary<string, List<string>>();

                    // Toggle reaction
                    if (!reactions.ContainsKey(emoji))
                        reactions[emoji] = new List<string>();

                    if (reactions[emoji].Contains(userName))
                        reactions[emoji].Remove(userName);
                    else
                        reactions[emoji].Add(userName);

                    // Remove empty reactions
                    reactions = reactions.Where(r => r.Value.Count > 0).ToDictionary(r => r.Key, r => r.Value);

                    message.Reactions = JsonSerializer.Serialize(reactions);
                    await _context.SaveChangesAsync();

                    // Broadcast reaction update
                    await Clients.Group($"Chat_{sessionId}").SendAsync("ReactionUpdated", new
                    {
                        messageId,
                        reactions,
                        reactedBy = userName,
                        emoji
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error reacting to message: {messageId}");
            }
        }

        public async Task AssignSession(string sessionId, int adminId)
        {
            try
            {
                var currentUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var currentUserRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

                if (currentUserRole != "Admin" && currentUserRole != "Staff")
                {
                    await Clients.Caller.SendAsync("Error", "Không có quyền thực hiện hành động này");
                    return;
                }

                var session = await _context.ChatSessions
                    .Include(s => s.AssignedAdmin)
                    .FirstOrDefaultAsync(s => s.Id.ToString() == sessionId);

                if (session != null)
                {
                    session.AssignedAdminId = adminId;
                    await _context.SaveChangesAsync();                    // Thông báo cho tất cả admin
                    await Clients.Group("AdminGroup").SendAsync("SessionAssigned", new
                    {
                        sessionId,
                        adminId,
                        adminName = session.AssignedAdmin?.FullName ?? "Unknown",
                        assignedBy = currentUserId
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning session {sessionId} to admin {adminId}");
            }
        }

        private async Task UpdateUserOnlineStatus(bool isOnline)
        {
            try
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    // Update user online status in database if needed
                    // This could be added to User model or separate OnlineUsers table
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user online status");
            }
        }
    }
}
