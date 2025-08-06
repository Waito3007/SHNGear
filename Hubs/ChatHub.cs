using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using SHN_Gear.Services;
using System.Security.Claims;

namespace SHN_Gear.Hubs
{
    [EnableCors("SignalRPolicy")]
    public class ChatHub : Hub
    {
        private readonly ChatService _chatService;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ChatService chatService, ILogger<ChatHub> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        /// <summary>
        /// User joins a chat session
        /// </summary>
        public async Task JoinSession(string sessionId)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{sessionId}");
                _logger.LogInformation("User {ConnectionId} joined session {SessionId}", Context.ConnectionId, sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining session {SessionId}", sessionId);
            }
        }

        /// <summary>
        /// User leaves a chat session
        /// </summary>
        public async Task LeaveSession(string sessionId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session_{sessionId}");
                _logger.LogInformation("User {ConnectionId} left session {SessionId}", Context.ConnectionId, sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving session {SessionId}", sessionId);
            }
        }

        /// <summary>
        /// Admin joins admin group to receive escalation notifications
        /// </summary>
        public async Task JoinAdminGroup()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userName = GetCurrentUserName();
                var isAuthenticated = Context.User?.Identity?.IsAuthenticated == true;

                // Log the attempt with more details
                _logger.LogInformation("Admin join attempt: UserId={UserId}, UserName={UserName}, IsAuthenticated={IsAuthenticated}, ConnectionId={ConnectionId}",
                    userId, userName, isAuthenticated, Context.ConnectionId);

                // Check if user is admin (more flexible than [Authorize])
                var isAdmin = Context.User?.IsInRole("Admin") == true ||
                             Context.User?.FindFirst("role")?.Value == "Admin" ||
                             Context.User?.FindFirst(ClaimTypes.Role)?.Value == "Admin";

                _logger.LogInformation("Admin role check: IsAdmin={IsAdmin} for UserId={UserId}", isAdmin, userId);

                if (isAdmin || (isAuthenticated && userId.HasValue)) // Allow if admin or any authenticated user for now
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
                    _logger.LogInformation("Admin {UserId} ({UserName}) joined admin group with connection {ConnectionId}",
                        userId, userName, Context.ConnectionId);
                }
                else
                {
                    _logger.LogWarning("Non-admin user attempted to join admin group: IsAuthenticated={IsAuthenticated}, UserId={UserId}, ConnectionId={ConnectionId}",
                        isAuthenticated, userId, Context.ConnectionId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining admin group for connection {ConnectionId}", Context.ConnectionId);
            }
        }

        /// <summary>
        /// Admin leaves admin group
        /// </summary>
        public async Task LeaveAdminGroup()
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
                var userId = GetCurrentUserId();
                var userName = GetCurrentUserName();
                _logger.LogInformation("Admin {UserId} ({UserName}) left admin group with connection {ConnectionId}",
                    userId, userName, Context.ConnectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving admin group for connection {ConnectionId}", Context.ConnectionId);
            }
        }

        /// <summary>
        /// Send typing indicator
        /// </summary>
        public async Task SendTypingIndicator(string sessionId, bool isTyping)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userName = GetCurrentUserName();

                await Clients.GroupExcept($"session_{sessionId}", Context.ConnectionId)
                    .SendAsync("TypingIndicator", new
                    {
                        SessionId = sessionId,
                        UserId = userId,
                        UserName = userName,
                        IsTyping = isTyping,
                        Timestamp = DateTime.UtcNow
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending typing indicator for session {SessionId}", sessionId);
            }
        }

        /// <summary>
        /// Mark messages as read
        /// </summary>
        public async Task MarkMessagesAsRead(string sessionId, int lastMessageId)
        {
            try
            {
                // Here you could update message read status in database
                await Clients.Group($"session_{sessionId}")
                    .SendAsync("MessagesRead", new
                    {
                        SessionId = sessionId,
                        LastMessageId = lastMessageId,
                        ReadBy = GetCurrentUserId(),
                        ReadAt = DateTime.UtcNow
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking messages as read for session {SessionId}", sessionId);
            }
        }

        /// <summary>
        /// Quick action from suggested actions
        /// </summary>
        public async Task ExecuteQuickAction(string sessionId, string action, object? data = null)
        {
            try
            {
                var userId = GetCurrentUserId();

                await Clients.Group($"session_{sessionId}")
                    .SendAsync("QuickActionExecuted", new
                    {
                        SessionId = sessionId,
                        Action = action,
                        Data = data,
                        ExecutedBy = userId,
                        ExecutedAt = DateTime.UtcNow
                    });

                _logger.LogInformation("Quick action {Action} executed in session {SessionId}", action, sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing quick action {Action} for session {SessionId}", action, sessionId);
            }
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userName = GetCurrentUserName();
                var isAdmin = Context.User?.IsInRole("Admin") == true;
                var isAuthenticated = Context.User?.Identity?.IsAuthenticated == true;

                _logger.LogInformation("User connected: UserId={UserId}, UserName={UserName}, IsAdmin={IsAdmin}, IsAuthenticated={IsAuthenticated}, ConnectionId={ConnectionId}",
                    userId, userName, isAdmin, isAuthenticated, Context.ConnectionId);

                // Auto-join user to their personal group for receiving messages
                if (userId.HasValue)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
                    _logger.LogInformation("User {UserId} auto-joined to user_{UserId} group", userId.Value, userId.Value);
                }

                // Auto-join admins to admin group if they are authenticated as admin
                if (isAdmin && isAuthenticated)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
                    _logger.LogInformation("Admin {UserId} ({UserName}) auto-joined admin group with connection {ConnectionId}",
                        userId, userName, Context.ConnectionId);
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnConnectedAsync for connection {ConnectionId}", Context.ConnectionId);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = Context.User?.IsInRole("Admin") == true;

                _logger.LogInformation("User {UserId} disconnected from connection {ConnectionId}", userId, Context.ConnectionId);

                // Auto-cleanup: remove from user group
                if (userId.HasValue)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
                    _logger.LogInformation("User {UserId} removed from user_{UserId} group on disconnect", userId.Value, userId.Value);
                }

                // Auto-cleanup: remove from admin group if was admin
                if (isAdmin)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
                    _logger.LogInformation("Admin {UserId} removed from admin group on disconnect", userId);
                }

                if (exception != null)
                {
                    _logger.LogError(exception, "User disconnected with error");
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnDisconnectedAsync");
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        private string? GetCurrentUserName()
        {
            return Context.User?.FindFirst(ClaimTypes.Name)?.Value ??
                   Context.User?.FindFirst("fullName")?.Value;
        }
    }
}