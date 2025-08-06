using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Cors;
using SHN_Gear.Services;
using SHN_Gear.DTOs;
using SHN_Gear.Hubs;
using System.Security.Claims;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<ChatController> _logger;

        public ChatController(ChatService chatService, IHubContext<ChatHub> hubContext, ILogger<ChatController> logger)
        {
            _chatService = chatService;
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// Tạo hoặc lấy session chat hiện tại
        /// </summary>
        [HttpPost("session")]
        public async Task<IActionResult> CreateOrGetSession([FromBody] CreateSessionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                _logger.LogInformation("Creating/getting session for userId: {UserId}, guestName: {GuestName}, guestEmail: {GuestEmail}",
                    userId, dto.GuestName, dto.GuestEmail);

                var session = await _chatService.CreateOrGetSessionAsync(
                    userId,
                    dto.GuestName,
                    dto.GuestEmail,
                    dto.SessionId
                );

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating/getting chat session");
                return StatusCode(500, new { message = "Lỗi khi tạo phiên chat" });
            }
        }

        /// <summary>
        /// Gửi tin nhắn từ user
        /// </summary>
        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var message = await _chatService.SendMessageAsync(dto, userId);

                // SignalR notification is handled by ChatService.NotifyNewMessage
                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message: {Message}", dto.Content);
                return StatusCode(500, new { message = "Lỗi khi gửi tin nhắn" });
            }
        }

        /// <summary>
        /// Escalate chat to admin
        /// </summary>
        [HttpPost("{sessionId}/escalate")]
        public async Task<IActionResult> EscalateToAdmin(int sessionId, [FromBody] EscalateChatDto dto)
        {
            try
            {
                var session = await _chatService.EscalateToAdminAsync(sessionId, dto.Reason, dto.PreferredAdminId);

                // Notify admins via SignalR
                await _hubContext.Clients.Group("admins")
                    .SendAsync("ChatEscalated", session);

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error escalating chat session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Lỗi khi chuyển chat sang admin" });
            }
        }

        /// <summary>
        /// Get chat session by session ID
        /// </summary>
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetSession(string sessionId)
        {
            try
            {
                var session = await _chatService.GetSessionAsync(sessionId);
                if (session == null)
                    return NotFound(new { message = "Không tìm thấy phiên chat" });

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chat session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin chat" });
            }
        }

        /// <summary>
        /// Admin: Get all active chat sessions
        /// </summary>
        [HttpGet("admin/sessions")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActiveSessions()
        {
            try
            {
                var adminId = GetCurrentUserId();
                var sessions = await _chatService.GetActiveChatSessionsAsync(adminId);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active chat sessions");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách chat" });
            }
        }

        /// <summary>
        /// Admin: Send message as admin
        /// </summary>
        [HttpPost("{sessionId}/admin-message")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendAdminMessage(string sessionId, [FromBody] AdminMessageDto dto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                if (!adminId.HasValue)
                    return Unauthorized();

                var message = await _chatService.SendAdminMessageAsync(sessionId, dto.Content, adminId.Value);

                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending admin message to session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Lỗi khi gửi tin nhắn admin" });
            }
        }

        /// <summary>
        /// Test AI response (for development)
        /// </summary>
        [HttpPost("test-ai")]
        public async Task<IActionResult> TestAI([FromBody] TestAIDto dto)
        {
            try
            {
                var aiService = HttpContext.RequestServices.GetRequiredService<AIService>();
                var response = await aiService.ProcessMessageAsync(dto.Message, dto.Context, dto.UserId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing AI: {Message}", dto.Message);
                return StatusCode(500, new { message = "Lỗi khi test AI" });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    // Additional DTOs
    public class CreateSessionDto
    {
        public string? SessionId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
    }

    public class AdminMessageDto
    {
        public string Content { get; set; } = null!;
    }

    public class TestAIDto
    {
        public string Message { get; set; } = null!;
        public string? Context { get; set; }
        public int? UserId { get; set; }
    }
}