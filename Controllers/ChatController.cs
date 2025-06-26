using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ChatController> _logger;

        public ChatController(AppDbContext context, ILogger<ChatController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("start-session")]
        public async Task<IActionResult> StartChatSession([FromBody] StartChatRequest request)
        {
            try
            {
                var session = new ChatSession
                {
                    SessionId = Guid.NewGuid().ToString(),
                    Subject = request.Subject ?? "Hỗ trợ khách hàng",
                    StartTime = DateTime.UtcNow,
                    LastActivity = DateTime.UtcNow,
                    Status = ChatStatus.Active,
                    Priority = request.Priority ?? ChatPriority.Normal
                };

                // Xử lý user đã đăng nhập
                if (request.UserId.HasValue)
                {
                    session.UserId = request.UserId.Value;
                }
                else
                {
                    // Xử lý guest
                    session.GuestName = request.GuestName;
                    session.GuestEmail = request.GuestEmail;
                    session.GuestPhone = request.GuestPhone;
                }

                // Thêm thông tin khách hàng bổ sung
                if (!string.IsNullOrEmpty(request.CustomerInfo))
                {
                    session.CustomerInfo = request.CustomerInfo;
                }

                _context.ChatSessions.Add(session);

                // Tạo tin nhắn chào mừng tự động
                var welcomeMessage = new ChatMessage
                {
                    SessionId = session.Id,
                    SenderName = "SHNGear Bot",
                    SenderEmail = "support@shngear.com",
                    Message = GetWelcomeMessage(request.GuestName ?? "Bạn"),
                    MessageType = MessageType.System,
                    IsFromAdmin = true,
                    IsAutoResponse = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(welcomeMessage);
                await _context.SaveChangesAsync();

                return Ok(new { sessionId = session.Id, message = "Phiên chat đã được tạo thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting chat session");
                return StatusCode(500, new { message = "Không thể tạo phiên chat" });
            }
        }

        [HttpGet("active-sessions")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetActiveSessions()
        {
            try
            {
                var sessions = await _context.ChatSessions
                    .Include(s => s.User)
                    .Include(s => s.AssignedAdmin)
                    .Where(s => s.IsActive && s.Status != ChatStatus.Closed)
                    .OrderByDescending(s => s.LastActivity)                .Select(s => new
                    {
                        s.Id,
                        sessionId = s.SessionId,
                        userId = s.UserId,
                        userName = s.User != null ? s.User.FullName : null,
                        guestName = s.GuestName,
                        guestEmail = s.GuestEmail,
                        guestPhone = s.GuestPhone,
                        subject = s.Subject,
                        status = s.Status.ToString(),
                        priority = s.Priority.ToString(),
                        startTime = s.StartTime,
                        lastActivity = s.LastActivity,
                        totalMessages = s.TotalMessages,
                        assignedAdminId = s.AssignedAdminId,
                        assignedAdminName = s.AssignedAdmin != null ? s.AssignedAdmin.FullName : null,
                        unreadCount = _context.ChatMessages.Count(m => m.SessionId == s.Id && !m.IsRead && !m.IsFromAdmin)
                    })
                    .ToListAsync();

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active sessions");
                return StatusCode(500, new { message = "Không thể tải danh sách phiên chat" });
            }
        }

        [HttpGet("session/{sessionId}/messages")]
        public async Task<IActionResult> GetMessages(int sessionId)
        {
            try
            {
                var messages = await _context.ChatMessages
                    .Include(m => m.Files)
                    .Include(m => m.ReplyToMessage)
                    .Where(m => m.SessionId == sessionId && !m.IsDeleted)
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new
                    {
                        m.Id,
                        m.SenderName,
                        m.SenderEmail,
                        m.Message,
                        messageType = m.MessageType.ToString(),
                        m.IsFromAdmin,
                        m.IsAutoResponse,
                        m.IsRead,
                        m.IsEdited,
                        m.CreatedAt,
                        m.ReadAt,
                        m.EditedAt,
                        reactions = string.IsNullOrEmpty(m.Reactions) ? null : JsonSerializer.Deserialize<Dictionary<string, List<string>>>(m.Reactions),
                        replyTo = m.ReplyToMessage != null ? new
                        {
                            id = m.ReplyToMessage.Id,
                            message = m.ReplyToMessage.Message,
                            senderName = m.ReplyToMessage.SenderName
                        } : null,
                        files = m.Files.Select(f => new
                        {
                            f.Id,
                            f.FileName,
                            f.FilePath,
                            f.ContentType,
                            f.FileSize,
                            f.ThumbnailPath
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting messages for session {sessionId}");
                return StatusCode(500, new { message = "Không thể tải tin nhắn" });
            }
        }

        [HttpPost("session/{sessionId}/close")]
        [Authorize]
        public async Task<IActionResult> CloseSession(int sessionId, [FromBody] CloseSessionRequest? request)
        {
            try
            {
                var session = await _context.ChatSessions.FindAsync(sessionId);
                if (session == null)
                {
                    return NotFound(new { message = "Không tìm thấy phiên chat" });
                }

                // Kiểm tra quyền đóng session
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (userRole != "Admin" && userRole != "Staff" && session.UserId?.ToString() != currentUserId)
                {
                    return Forbid("Không có quyền đóng phiên chat này");
                }

                session.Status = ChatStatus.Closed;
                session.EndTime = DateTime.UtcNow;
                session.IsActive = false;

                if (request != null)
                {
                    session.Rating = request.Rating;
                    session.Feedback = request.Feedback;
                    session.Notes = request.Notes;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Phiên chat đã được đóng" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error closing session {sessionId}");
                return StatusCode(500, new { message = "Không thể đóng phiên chat" });
            }
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] int sessionId, [FromForm] int? messageId)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Không có file được chọn" });
                }

                // Kiểm tra kích thước file (max 10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File quá lớn. Kích thước tối đa là 10MB" });
                }

                // Kiểm tra loại file
                var allowedTypes = new[] { "image/", "application/pdf", "text/", "application/msword", "application/vnd.openxmlformats-officedocument" };
                if (!allowedTypes.Any(type => file.ContentType.StartsWith(type)))
                {
                    return BadRequest(new { message = "Loại file không được hỗ trợ" });
                }

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "chat");
                Directory.CreateDirectory(uploadsPath);

                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var chatFile = new ChatFile
                {
                    SessionId = sessionId,
                    MessageId = messageId,
                    FileName = file.FileName,
                    FilePath = $"/uploads/chat/{fileName}",
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0")
                };

                // Tạo thumbnail cho hình ảnh
                if (file.ContentType.StartsWith("image/"))
                {
                    // TODO: Implement thumbnail generation
                    chatFile.ThumbnailPath = chatFile.FilePath; // Tạm thời sử dụng ảnh gốc
                }

                _context.ChatFiles.Add(chatFile);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = chatFile.Id,
                    fileName = chatFile.FileName,
                    filePath = chatFile.FilePath,
                    contentType = chatFile.ContentType,
                    fileSize = chatFile.FileSize,
                    thumbnailPath = chatFile.ThumbnailPath
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, new { message = "Không thể tải file lên" });
            }
        }

        [HttpGet("quick-replies")]
        public async Task<IActionResult> GetQuickReplies()
        {
            try
            {
                var quickReplies = await _context.Set<ChatQuickReply>()
                    .Where(qr => qr.IsActive)
                    .OrderBy(qr => qr.Category)
                    .ThenBy(qr => qr.SortOrder)
                    .GroupBy(qr => qr.Category)
                    .ToDictionaryAsync(g => g.Key, g => g.Select(qr => new
                    {
                        qr.Id,
                        qr.Title,
                        qr.Message
                    }).ToList());

                return Ok(quickReplies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting quick replies");
                return StatusCode(500, new { message = "Không thể tải câu trả lời nhanh" });
            }
        }

        [HttpGet("templates")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetTemplates()
        {
            try
            {
                var templates = await _context.Set<ChatTemplate>()
                    .Where(t => t.IsActive)
                    .OrderBy(t => t.Category)
                    .ThenBy(t => t.Name)
                    .GroupBy(t => t.Category)
                    .ToDictionaryAsync(g => g.Key, g => g.Select(t => new
                    {
                        t.Id,
                        t.Name,
                        t.Content
                    }).ToList());

                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates");
                return StatusCode(500, new { message = "Không thể tải mẫu tin nhắn" });
            }
        }

        private string GetWelcomeMessage(string customerName)
        {
            return $"Xin chào {customerName}! 👋\n\n" +
                   "Chào mừng bạn đến với SHNGear! Tôi là trợ lý ảo của SHNGear, sẵn sàng hỗ trợ bạn.\n\n" +
                   "📌 Tôi có thể giúp bạn:\n" +
                   "• Tư vấn sản phẩm\n" +
                   "• Kiểm tra đơn hàng\n" +
                   "• Hỗ trợ thanh toán\n" +
                   "• Giải đáp thắc mắc\n\n" +
                   "Vui lòng cho tôi biết bạn cần hỗ trợ gì ạ? 😊";
        }
    }

    public class StartChatRequest
    {
        public int? UserId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public string? Subject { get; set; }
        public ChatPriority? Priority { get; set; }
        public string? CustomerInfo { get; set; }
    }

    public class CloseSessionRequest
    {
        public int? Rating { get; set; }
        public string? Feedback { get; set; }
        public string? Notes { get; set; }
    }
}