using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using System.Text.Json;

namespace SHN_Gear.Services
{
    public class ContextManager
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ContextManager> _logger;

        // In-memory cache for active sessions (Redis in production)
        private static readonly Dictionary<string, ConversationContext> _activeContexts = new();
        private static readonly object _lock = new object();

        public ContextManager(AppDbContext context, ILogger<ContextManager> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ConversationContext> GetOrCreateContextAsync(string sessionId, int? userId = null)
        {
            // Validate sessionId
            if (string.IsNullOrEmpty(sessionId))
            {
                _logger.LogError("SessionId cannot be null or empty");
                throw new ArgumentException("SessionId cannot be null or empty", nameof(sessionId));
            }

            lock (_lock)
            {
                if (_activeContexts.TryGetValue(sessionId, out var existingContext))
                {
                    // Check if context is still valid (not expired)
                    if (existingContext.LastActivity.AddMinutes(30) > DateTime.UtcNow)
                    {
                        return existingContext;
                    }
                    else
                    {
                        // Context expired, remove from cache
                        _activeContexts.Remove(sessionId);
                    }
                }
            }

            // Load from database or create new
            var session = await _context.ChatSessions
                .Include(s => s.Messages.OrderByDescending(m => m.SentAt).Take(50))
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            var context = new ConversationContext
            {
                SessionId = sessionId,
                UserId = userId,
                LastActivity = DateTime.UtcNow,
                CurrentState = ConversationState.Discovery,
                MessageHistory = session?.Messages?.Select(m => new ContextMessage
                {
                    Content = m.Content,
                    Sender = m.Sender.ToString(),
                    Timestamp = m.SentAt,
                    Intent = m.AIIntent ?? "",
                    Entities = string.IsNullOrEmpty(m.MetadataJson) ? new() :
                              JsonSerializer.Deserialize<Dictionary<string, object>>(m.MetadataJson) ?? new()
                }).ToList() ?? new(),
                UserProfile = userId.HasValue ? await LoadUserProfile(userId.Value) : new(),
                Topics = new(),
                Entities = new(),
                Preferences = new()
            };

            // Analyze conversation state from history
            AnalyzeConversationState(context);

            lock (_lock)
            {
                _activeContexts[sessionId] = context;
            }

            return context;
        }

        public Task UpdateContextAsync(string sessionId, string message, string intent,
            Dictionary<string, object>? entities = null, string? response = null)
        {
            lock (_lock)
            {
                if (_activeContexts.TryGetValue(sessionId, out var context))
                {
                    // Add new message to history
                    context.MessageHistory.Add(new ContextMessage
                    {
                        Content = message,
                        Sender = "user",
                        Timestamp = DateTime.UtcNow,
                        Intent = intent,
                        Entities = entities ?? new()
                    });

                    if (!string.IsNullOrEmpty(response))
                    {
                        context.MessageHistory.Add(new ContextMessage
                        {
                            Content = response,
                            Sender = "ai",
                            Timestamp = DateTime.UtcNow,
                            Intent = "response",
                            Entities = new()
                        });
                    }

                    // Update entities and topics
                    UpdateEntitiesAndTopics(context, intent, entities);

                    // Update conversation state
                    UpdateConversationState(context, intent);

                    // Keep only last 50 messages
                    if (context.MessageHistory.Count > 50)
                    {
                        context.MessageHistory = context.MessageHistory
                            .OrderByDescending(m => m.Timestamp)
                            .Take(50)
                            .ToList();
                    }

                    context.LastActivity = DateTime.UtcNow;
                }
            }
            return Task.CompletedTask;
        }

        public string BuildContextualPrompt(ConversationContext context, string currentMessage)
        {
            var prompt = new List<string>();

            // System context
            prompt.Add("CONVERSATION CONTEXT:");
            prompt.Add($"- User: {context.UserProfile.Name ?? "Guest"}");
            prompt.Add($"- State: {context.CurrentState}");
            prompt.Add($"- Session Duration: {DateTime.UtcNow - context.MessageHistory.FirstOrDefault()?.Timestamp ?? TimeSpan.Zero}");

            // Current topics and entities
            if (context.Topics.Any())
            {
                prompt.Add($"- Current Topics: {string.Join(", ", context.Topics.Keys)}");
            }

            if (context.Entities.Any())
            {
                prompt.Add("- Mentioned Entities:");
                foreach (var entity in context.Entities.Take(5))
                {
                    prompt.Add($"  * {entity.Key}: {entity.Value}");
                }
            }

            // Recent conversation
            var recentMessages = context.MessageHistory
                .OrderByDescending(m => m.Timestamp)
                .Take(6)
                .Reverse()
                .ToList();

            if (recentMessages.Any())
            {
                prompt.Add("\nRECENT CONVERSATION:");
                foreach (var msg in recentMessages)
                {
                    prompt.Add($"{msg.Sender}: {msg.Content}");
                }
            }

            // User preferences
            if (context.Preferences.Any())
            {
                prompt.Add("\nUSER PREFERENCES:");
                foreach (var pref in context.Preferences)
                {
                    prompt.Add($"- {pref.Key}: {pref.Value}");
                }
            }

            prompt.Add($"\nCURRENT MESSAGE: {currentMessage}");

            return string.Join("\n", prompt);
        }

        public void ResetContext(string sessionId)
        {
            lock (_lock)
            {
                if (_activeContexts.ContainsKey(sessionId))
                {
                    var context = _activeContexts[sessionId];
                    context.CurrentState = ConversationState.Discovery;
                    context.Topics.Clear();
                    context.Entities.Clear();
                    context.LastActivity = DateTime.UtcNow;
                }
            }
        }

        public bool ShouldEscalate(ConversationContext context, double confidenceScore)
        {
            // Escalate if confidence is too low
            if (confidenceScore < 0.5) return true;

            // Escalate if user seems frustrated (multiple failed attempts)
            var recentFailures = context.MessageHistory
                .Where(m => m.Sender == "ai" && m.Timestamp > DateTime.UtcNow.AddMinutes(-10))
                .Count(m => m.Content.Contains("không hiểu") || m.Content.Contains("chuyển chuyên viên"));

            if (recentFailures >= 2) return true;

            // Escalate for complex technical issues
            var complexKeywords = new[] { "lỗi phức tạp", "không khắc phục được", "cần kỹ thuật viên" };
            var hasComplexIssue = context.MessageHistory
                .Where(m => m.Sender == "user" && m.Timestamp > DateTime.UtcNow.AddMinutes(-5))
                .Any(m => complexKeywords.Any(k => m.Content.ToLower().Contains(k)));

            return hasComplexIssue;
        }

        private async Task<UserProfile> LoadUserProfile(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new UserProfile();

            // Load user order history for context
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new { o.Id, o.OrderStatus, o.TotalAmount, o.OrderDate })
                .ToListAsync();

            return new UserProfile
            {
                Name = user.FullName,
                Email = user.Email,
                Phone = user.PhoneNumber,
                IsVIP = false, // Simplified for now
                TotalOrders = orders.Count(),
                RecentOrders = orders.Select(o => $"#{o.Id} - {o.OrderStatus} - {o.TotalAmount:C}").ToList(),
                JoinDate = user.CreatedAt
            };
        }

        private void AnalyzeConversationState(ConversationContext context)
        {
            if (!context.MessageHistory.Any())
            {
                context.CurrentState = ConversationState.Greeting;
                return;
            }

            var recentIntents = context.MessageHistory
                .Where(m => m.Sender == "user")
                .OrderByDescending(m => m.Timestamp)
                .Take(3)
                .Select(m => m.Intent)
                .ToList();

            // Determine state based on recent intents
            if (recentIntents.Any(i => i == "product_search" || i == "product_compare"))
            {
                context.CurrentState = ConversationState.ProductDiscovery;
            }
            else if (recentIntents.Any(i => i == "price_inquiry"))
            {
                context.CurrentState = ConversationState.PriceNegotiation;
            }
            else if (recentIntents.Any(i => i == "order_status"))
            {
                context.CurrentState = ConversationState.OrderSupport;
            }
            else if (recentIntents.Any(i => i == "technical_support"))
            {
                context.CurrentState = ConversationState.TechnicalSupport;
            }
            else
            {
                context.CurrentState = ConversationState.Discovery;
            }
        }

        private void UpdateEntitiesAndTopics(ConversationContext context, string intent,
            Dictionary<string, object>? entities)
        {
            // Update current topic
            context.Topics[intent] = DateTime.UtcNow;

            // Clean old topics (older than 10 minutes)
            var cutoff = DateTime.UtcNow.AddMinutes(-10);
            var oldTopics = context.Topics.Where(t => t.Value < cutoff).Select(t => t.Key).ToList();
            foreach (var topic in oldTopics)
            {
                context.Topics.Remove(topic);
            }

            // Update entities
            if (entities != null)
            {
                foreach (var entity in entities)
                {
                    context.Entities[entity.Key] = entity.Value;
                }
            }
        }

        private void UpdateConversationState(ConversationContext context, string intent)
        {
            context.CurrentState = intent switch
            {
                "greeting" => ConversationState.Greeting,
                "product_search" or "product_compare" => ConversationState.ProductDiscovery,
                "price_inquiry" => ConversationState.PriceNegotiation,
                "order_status" => ConversationState.OrderSupport,
                "technical_support" => ConversationState.TechnicalSupport,
                "thanks" => ConversationState.Closing,
                _ => ConversationState.Discovery
            };
        }

        // Cleanup old contexts periodically
        public void CleanupExpiredContexts()
        {
            lock (_lock)
            {
                var expiredKeys = _activeContexts
                    .Where(kvp => kvp.Value.LastActivity.AddMinutes(30) < DateTime.UtcNow)
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var key in expiredKeys)
                {
                    _activeContexts.Remove(key);
                }
            }
        }
    }

    public class ConversationContext
    {
        public string SessionId { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public DateTime LastActivity { get; set; }
        public ConversationState CurrentState { get; set; }
        public List<ContextMessage> MessageHistory { get; set; } = new();
        public UserProfile UserProfile { get; set; } = new();
        public Dictionary<string, DateTime> Topics { get; set; } = new();
        public Dictionary<string, object> Entities { get; set; } = new();
        public Dictionary<string, string> Preferences { get; set; } = new();
    }

    public class ContextMessage
    {
        public string Content { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Intent { get; set; } = string.Empty;
        public Dictionary<string, object> Entities { get; set; } = new();
    }

    public class UserProfile
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool IsVIP { get; set; }
        public int TotalOrders { get; set; }
        public List<string> RecentOrders { get; set; } = new();
        public DateTime? JoinDate { get; set; }
    }

    public enum ConversationState
    {
        Greeting,
        Discovery,
        ProductDiscovery,
        PriceNegotiation,
        OrderSupport,
        TechnicalSupport,
        Closing,
        Escalated
    }
}
