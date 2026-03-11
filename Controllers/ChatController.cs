using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SHN_Gear.Services;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        // GET /api/chat/sessions?page=1&pageSize=20&resolved=false
        [HttpGet("sessions")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSessions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool? resolved = false)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _chatService.GetAllSessionsAsync(page, pageSize, resolved);
            return Ok(result);
        }

        // GET /api/chat/sessions/{id}
        [HttpGet("sessions/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSession(int id)
        {
            var history = await _chatService.GetSessionHistoryAsync(id);
            if (history == null)
                return NotFound(new { message = "Không tìm thấy phiên chat." });

            return Ok(history);
        }

        // GET /api/chat/my-session — for logged-in users to get their own session history
        [HttpGet("my-session")]
        [Authorize]
        public async Task<IActionResult> GetMySession()
        {
            var sub = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var session = await _chatService.GetOrCreateSessionByUserIdAsync(userId);
            if (session == null)
                return NotFound(new { message = "Không tìm thấy phiên chat." });

            var history = await _chatService.GetSessionHistoryAsync(session.Id);
            return Ok(history);
        }

        // PATCH /api/chat/sessions/{id}/resolve
        [HttpPatch("sessions/{id:int}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveSession(int id)
        {
            var session = await _chatService.GetSessionByIdAsync(id);
            if (session == null)
                return NotFound(new { message = "Không tìm thấy phiên chat." });

            await _chatService.MarkResolvedAsync(id);
            return Ok(new { message = "Phiên chat đã được đánh dấu là đã giải quyết." });
        }
    }
}
