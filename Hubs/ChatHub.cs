using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SHN_Gear.DTOs;
using SHN_Gear.Services;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace SHN_Gear.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private static readonly ConcurrentDictionary<string, int> _guestConnectionSessionMap = new();

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        // ── Lifecycle ─────────────────────────────────────────────────────────

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            var isAdmin = IsAdmin();

            if (isAdmin)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");

                // Send current open sessions snapshot to admin
                var snapshot = await _chatService.GetAllSessionsAsync(1, 50, resolved: false);
                await Clients.Caller.SendAsync("SessionsSnapshot", snapshot);
            }
            else if (userId.HasValue)
            {
                // Authenticated user: get or create their session and join group
                var session = await _chatService.GetOrCreateSessionByUserIdAsync(userId.Value);
                if (session != null)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{session.Id}");
                    var history = await _chatService.GetSessionHistoryAsync(session.Id);
                    await Clients.Caller.SendAsync("ChatInitialized", history);
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _guestConnectionSessionMap.TryRemove(Context.ConnectionId, out _);
            await base.OnDisconnectedAsync(exception);
        }

        // ── Guest: Start new session ──────────────────────────────────────────

        public async Task StartGuestSession(StartGuestSessionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.GuestName) || string.IsNullOrWhiteSpace(dto.GuestEmail))
            {
                await Clients.Caller.SendAsync("Error", "Tên và email là bắt buộc.");
                return;
            }

            var session = await _chatService.CreateSessionAsync(null, dto.GuestName.Trim(), dto.GuestEmail.Trim().ToLower());

            _guestConnectionSessionMap[Context.ConnectionId] = session.Id;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{session.Id}");

            var history = new ChatHistoryDto
            {
                Session = new ChatSessionDto
                {
                    Id = session.Id,
                    GuestName = session.GuestName,
                    GuestEmail = session.GuestEmail,
                    CreatedAt = session.CreatedAt,
                    LastMessageAt = session.LastMessageAt,
                    IsResolved = session.IsResolved
                },
                Messages = []
            };

            await Clients.Caller.SendAsync("ChatInitialized", history);

            // Notify admins of new session
            var sessionDto = new ChatSessionDto
            {
                Id = session.Id,
                GuestName = session.GuestName,
                GuestEmail = session.GuestEmail,
                CreatedAt = session.CreatedAt,
                LastMessageAt = session.LastMessageAt,
                IsResolved = false,
                UnreadCount = 0,
                LastMessage = null
            };
            await Clients.Group("Admins").SendAsync("SessionCreated", sessionDto);
        }

        // ── Guest: Rejoin existing session ────────────────────────────────────

        public async Task RejoinGuestSession(int sessionId)
        {
            var session = await _chatService.GetSessionByIdAsync(sessionId);
            if (session == null)
            {
                await Clients.Caller.SendAsync("Error", "Không tìm thấy phiên chat.");
                return;
            }

            _guestConnectionSessionMap[Context.ConnectionId] = session.Id;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{session.Id}");

            var history = await _chatService.GetSessionHistoryAsync(session.Id);
            await Clients.Caller.SendAsync("ChatInitialized", history);
        }

        // ── User / Guest: Send message ────────────────────────────────────────

        public async Task SendMessage(SendMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                return;

            var userId = GetUserId();
            int? sessionId = null;
            string senderName;

            if (userId.HasValue)
            {
                var session = await _chatService.GetOrCreateSessionByUserIdAsync(userId.Value);
                if (session == null)
                {
                    await Clients.Caller.SendAsync("Error", "Không thể tạo phiên chat.");
                    return;
                }
                sessionId = session.Id;
                senderName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Người dùng";
            }
            else
            {
                // Guest: look up their session from the connection map
                if (!_guestConnectionSessionMap.TryGetValue(Context.ConnectionId, out var guestSessionId))
                {
                    await Clients.Caller.SendAsync("Error", "Vui lòng bắt đầu phiên chat trước.");
                    return;
                }
                sessionId = guestSessionId;
                senderName = "Khách";
            }

            var message = await _chatService.SaveMessageAsync(sessionId.Value, userId, senderName, dto.Content.Trim(), isFromAdmin: false);

            var messageDto = ChatService.MapMessageToDto(message);

            // Push to this session group (so user sees their own message confirmed)
            await Clients.Group($"session_{sessionId}").SendAsync("ReceiveMessage", messageDto);

            // Push to all connected admins
            await Clients.Group("Admins").SendAsync("ReceiveMessage", messageDto);
        }

        // ── Admin: Reply ──────────────────────────────────────────────────────

        [Authorize(Roles = "Admin")]
        public async Task SendAdminReply(int sessionId, SendMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                return;

            var adminUserId = GetUserId();
            var adminName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";

            var session = await _chatService.GetSessionByIdAsync(sessionId);
            if (session == null)
            {
                await Clients.Caller.SendAsync("Error", "Không tìm thấy phiên chat.");
                return;
            }

            var message = await _chatService.SaveMessageAsync(sessionId, adminUserId, adminName, dto.Content.Trim(), isFromAdmin: true);
            var messageDto = ChatService.MapMessageToDto(message);

            // Push to user/guest in this session
            await Clients.Group($"session_{sessionId}").SendAsync("ReceiveMessage", messageDto);

            // Sync to all other connected admins
            await Clients.Group("Admins").SendAsync("ReceiveMessage", messageDto);
        }

        // ── Mark read ─────────────────────────────────────────────────────────

        public async Task MarkRead(int sessionId)
        {
            bool byAdmin = IsAdmin();
            await _chatService.MarkMessagesReadAsync(sessionId, byAdmin);
            await Clients.Group($"session_{sessionId}").SendAsync("MessagesRead", sessionId);
            await Clients.Group("Admins").SendAsync("MessagesRead", sessionId);
        }

        // ── Admin: Resolve session ────────────────────────────────────────────

        [Authorize(Roles = "Admin")]
        public async Task ResolveSession(int sessionId)
        {
            await _chatService.MarkResolvedAsync(sessionId);
            await Clients.Group("Admins").SendAsync("SessionResolved", sessionId);
            await Clients.Group($"session_{sessionId}").SendAsync("SessionResolved", sessionId);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private int? GetUserId()
        {
            var sub = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(sub, out var id) ? id : null;
        }

        private bool IsAdmin()
        {
            var roleId = Context.User?.FindFirst("roleId")?.Value;
            return roleId == "1" || Context.User?.IsInRole("Admin") == true;
        }
    }
}
