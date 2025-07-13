using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SHN_Gear.Services
{
    // Đổi tên class để tránh trùng lặp
    public class AIService_New
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AIService> _logger;
        private readonly ContextManager _contextManager;

        public AIService_New(AppDbContext context, ILogger<AIService> logger, ContextManager contextManager)
        {
            _context = context;
            _logger = logger;
            _contextManager = contextManager;
        }

        public async Task<AIResponseDto> ProcessMessageAsync(string userMessage, string sessionId, int? userId = null)
        {
            try
            {
                // 1. Get conversation context
                var context = await _contextManager.GetOrCreateContextAsync(sessionId, userId);

                // 2. Detect intent và extract keywords với context
                var intent = DetectIntentWithContext(userMessage, context);
                var keywords = ExtractKeywords(userMessage);
                var entities = ExtractEntities(userMessage, intent);

                // 3. Tìm kiếm trong knowledge base
                var knowledgeMatches = await FindKnowledgeMatches(userMessage, keywords, intent);

                // 4. Calculate confidence score
                var confidenceScore = CalculateConfidenceScore(intent, knowledgeMatches, context);

                // 5. Check if should escalate
                if (_contextManager.ShouldEscalate(context, confidenceScore))
                {
                    var escalationResponse = CreateEscalationResponse(context, userMessage);
                    await _contextManager.UpdateContextAsync(sessionId, userMessage, intent, entities, escalationResponse.Response);
                    return escalationResponse;
                }

                // 6. Xử lý theo intent với context
                AIResponseDto response = intent.ToLower() switch
                {
                    "product_search" => await HandleProductSearchWithContext(userMessage, keywords, context),
                    "product_compare" => await HandleProductSearch(userMessage, keywords),
                    "price_inquiry" => await HandlePriceInquiry(userMessage, keywords),
                    "order_status" => await HandleOrderStatus(userMessage, userId),
                    "shipping_info" => await HandleShippingInfo(userMessage),
                    "return_policy" => await HandleReturnPolicy(userMessage),
                    "technical_support" => await HandleTechnicalSupport(userMessage, keywords),
                    "greeting" => await HandleGreetingWithContext(context),
                    "thanks" => await HandleThanks(),
                    _ => await HandleGeneralQuery(userMessage, knowledgeMatches)
                };

                // 7. Update confidence score
                response.ConfidenceScore = (decimal)confidenceScore;

                // 8. Add suggested actions with context
                response.SuggestedActions = GenerateSuggestedActionsWithContext(intent, response, context);

                // 9. Update conversation context
                await _contextManager.UpdateContextAsync(sessionId, userMessage, intent, entities, response.Response);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing AI message: {Message}", userMessage);
                return CreateFallbackResponse();
            }
        }

        private string DetectIntentWithContext(string message, ConversationContext context)
        {
            var basicIntent = DetectIntent(message);

            // Enhance intent detection with context
            if (basicIntent == "general" && context.CurrentState != ConversationState.Discovery)
            {
                // If in middle of conversation, try to infer intent from current state
                return context.CurrentState switch
                {
                    ConversationState.ProductDiscovery => "product_search",
                    ConversationState.PriceNegotiation => "price_inquiry",
                    ConversationState.OrderSupport => "order_status",
                    ConversationState.TechnicalSupport => "technical_support",
                    _ => basicIntent
                };
            }

            return basicIntent;
        }

        private string DetectIntent(string message)
        {
            var lowerMessage = message.ToLower();

            // Product search patterns
            if (Regex.IsMatch(lowerMessage, @"(tìm|kiếm|xem|có|bán).*?(điện thoại|laptop|tai nghe|iphone|samsung|macbook)"))
                return "product_search";

            // Product compare patterns  
            if (Regex.IsMatch(lowerMessage, @"(so sánh|khác nhau|nên chọn|tốt hơn)"))
                return "product_compare";

            // Price patterns
            if (Regex.IsMatch(lowerMessage, @"(giá|bao nhiêu|tiền|cost|price|khuyến mãi|giảm giá)"))
                return "price_inquiry";

            // Order patterns
            if (Regex.IsMatch(lowerMessage, @"(đơn hàng|order|giao hàng|vận chuyển|ship)"))
                return "order_status";

            // Shipping patterns
            if (Regex.IsMatch(lowerMessage, @"(giao hàng|vận chuyển|ship|delivery|khi nào nhận)"))
                return "shipping_info";

            // Return patterns
            if (Regex.IsMatch(lowerMessage, @"(đổi trả|return|hoàn tiền|bảo hành|warranty)"))
                return "return_policy";

            // Technical patterns
            if (Regex.IsMatch(lowerMessage, @"(lỗi|bug|không hoạt động|hỏng|sửa|fix)"))
                return "technical_support";

            // Greeting patterns
            if (Regex.IsMatch(lowerMessage, @"^(xin chào|hello|hi|chào|hế lô)"))
                return "greeting";

            // Thanks patterns
            if (Regex.IsMatch(lowerMessage, @"(cảm ơn|thank|thanks|tks)"))
                return "thanks";

            return "general";
        }

        private List<string> ExtractKeywords(string message)
        {
            var keywords = new List<string>();
            var words = message.ToLower().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            var productKeywords = new[] { "điện thoại", "phone", "smartphone", "laptop", "máy tính", "tai nghe", "headphone" };
            var brandKeywords = new[] { "iphone", "samsung", "xiaomi", "oppo", "vivo", "macbook", "dell", "hp", "asus" };
            var featureKeywords = new[] { "camera", "pin", "màn hình", "bộ nhớ", "ram", "ssd", "gaming", "văn phòng" };

            foreach (var word in words)
            {
                if (productKeywords.Contains(word) || brandKeywords.Contains(word) || featureKeywords.Contains(word))
                {
                    keywords.Add(word);
                }
            }

            return keywords.Distinct().ToList();
        }

        private async Task<List<AIKnowledgeBase>> FindKnowledgeMatches(string message, List<string> keywords, string intent)
        {
            var matches = new List<AIKnowledgeBase>();

            try
            {
                // Tìm kiếm theo keywords
                var knowledgeItems = await _context.AIKnowledgeBases
                    .Where(k => keywords.Any(kw => k.Keywords.Contains(kw)))
                    .ToListAsync();

                foreach (var item in knowledgeItems)
                {
                    var score = CalculateRelevanceScore(message, item);
                    if (score > (double)item.MinConfidenceScore)
                    {
                        matches.Add(item);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding knowledge matches");
            }

            return matches.OrderByDescending(m => CalculateRelevanceScore(message, m)).ToList();
        }

        private double CalculateRelevanceScore(string message, AIKnowledgeBase knowledgeItem)
        {
            var score = 0.0;
            var lowerMessage = message.ToLower();
            var keywords = knowledgeItem.Keywords ?? Array.Empty<string>();

            foreach (var keyword in keywords)
            {
                if (lowerMessage.Contains(keyword.Trim().ToLower()))
                {
                    score += 0.2;
                }
            }

            if (!string.IsNullOrEmpty(knowledgeItem.Question) && lowerMessage.Contains(knowledgeItem.Question.ToLower()))
            {
                score += 0.5;
            }

            return Math.Min(score, 1.0);
        }

        private Dictionary<string, object> ExtractEntities(string message, string intent)
        {
            var entities = new Dictionary<string, object>();
            var lowerMessage = message.ToLower();

            // Extract product categories
            if (Regex.IsMatch(lowerMessage, @"(điện thoại|phone|smartphone)"))
                entities["product_category"] = "phone";
            else if (Regex.IsMatch(lowerMessage, @"(laptop|máy tính|computer)"))
                entities["product_category"] = "laptop";
            else if (Regex.IsMatch(lowerMessage, @"(tai nghe|headphone|earphone)"))
                entities["product_category"] = "headphone";

            // Extract brands
            var brands = new[] { "iphone", "samsung", "xiaomi", "oppo", "vivo", "macbook", "dell", "hp", "asus", "sony", "jbl" };
            foreach (var brand in brands)
            {
                if (lowerMessage.Contains(brand))
                {
                    entities["brand"] = brand;
                    break;
                }
            }

            // Extract budget
            var budgetMatch = Regex.Match(lowerMessage, @"(\d+)\s*(triệu|tr|million|k|nghìn)");
            if (budgetMatch.Success)
            {
                var amount = int.Parse(budgetMatch.Groups[1].Value);
                var unit = budgetMatch.Groups[2].Value.ToLower();

                var budget = unit switch
                {
                    "triệu" or "tr" or "million" => amount * 1000000,
                    "k" or "nghìn" => amount * 1000,
                    _ => amount
                };

                entities["budget"] = budget;
            }

            // Extract order ID
            var orderMatch = Regex.Match(message, @"#?(\d{4,})");
            if (orderMatch.Success && intent == "order_status")
            {
                entities["order_id"] = orderMatch.Groups[1].Value;
            }

            return entities;
        }

        private double CalculateConfidenceScore(string intent, List<AIKnowledgeBase> knowledgeMatches, ConversationContext context)
        {
            double baseScore = 0.5;

            // Intent confidence
            if (intent != "general") baseScore += 0.2;

            // Knowledge base matches
            if (knowledgeMatches.Any()) baseScore += 0.2;
            if (knowledgeMatches.Any(k => k.MinConfidenceScore > 0.8m)) baseScore += 0.1;

            // Context continuity
            if (context.Topics.ContainsKey(intent)) baseScore += 0.1;

            // User profile completeness
            if (!string.IsNullOrEmpty(context.UserProfile.Name)) baseScore += 0.05;
            if (context.UserProfile.TotalOrders > 0) baseScore += 0.05;

            return Math.Min(baseScore, 1.0);
        }

        private AIResponseDto CreateEscalationResponse(ConversationContext context, string userMessage)
        {
            return new AIResponseDto
            {
                Response = GetEscalationMessage(context),
                Intent = "escalation",
                ConfidenceScore = 1.0m,
                SuggestedActions = new List<SuggestedActionDto>
                {
                    new SuggestedActionDto { Text = "Chuyển đến chuyên viên", Action = "escalate" },
                    new SuggestedActionDto { Text = "Tiếp tục với AI", Action = "continue" },
                    new SuggestedActionDto { Text = "Gọi hotline", Action = "call", Data = "1900-xxx-xxx" }
                },
                RequiresEscalation = true
            };
        }

        private string GetEscalationMessage(ConversationContext context)
        {
            if (context.UserProfile.IsVIP)
            {
                return "Tôi sẽ kết nối bạn với chuyên viên VIP của chúng tôi ngay lập tức để được hỗ trợ tốt nhất! ⭐";
            }

            return "Để đảm bảo bạn nhận được hỗ trợ chính xác nhất, tôi sẽ chuyển bạn đến chuyên viên tư vấn. Thời gian chờ dự kiến: 2-3 phút. 👨‍💼";
        }

        private AIResponseDto CreateFallbackResponse()
        {
            return new AIResponseDto
            {
                Response = "Xin lỗi, hiện tại tôi gặp một chút trục trặc. Vui lòng thử lại sau ít phút hoặc liên hệ với nhân viên tư vấn để được hỗ trợ ngay lập tức.",
                Intent = "error",
                ConfidenceScore = 0.0m,
                RequiresEscalation = true,
                SuggestedActions = new List<SuggestedActionDto>
                {
                    new SuggestedActionDto { Text = "Thử lại", Action = "retry" },
                    new SuggestedActionDto { Text = "Liên hệ nhân viên", Action = "escalate" }
                }
            };
        }

        // Enhanced handlers with context
        private async Task<AIResponseDto> HandleProductSearchWithContext(string message, List<string> keywords, ConversationContext context)
        {
            // Check if user has mentioned preferences before
            var category = context.Entities.GetValueOrDefault("product_category")?.ToString();
            var brand = context.Entities.GetValueOrDefault("brand")?.ToString();
            var budget = context.Entities.GetValueOrDefault("budget");

            // Continue from where we left off
            if (!string.IsNullOrEmpty(category) && context.CurrentState == ConversationState.ProductDiscovery)
            {
                return ContinueProductDiscovery(message, category, brand, budget, context);
            }

            // Fresh product search
            return await HandleProductSearch(message, keywords);
        }

        private AIResponseDto ContinueProductDiscovery(string message, string category, string? brand, object? budget, ConversationContext context)
        {
            var response = new AIResponseDto
            {
                Response = $"Dựa trên cuộc trò chuyện trước, tôi hiểu bạn đang tìm {category}" +
                         (brand != null ? $" {brand}" : "") +
                         (budget != null ? $" trong khoảng {budget}" : "") +
                         ". Hãy cho tôi biết thêm về nhu cầu sử dụng cụ thể?",
                Intent = "product_search",
                ConfidenceScore = 0.8m
            };

            return response;
        }

        private Task<AIResponseDto> HandleGreetingWithContext(ConversationContext context)
        {
            string greeting;

            if (!string.IsNullOrEmpty(context.UserProfile.Name))
            {
                if (context.UserProfile.IsVIP)
                {
                    greeting = $"Xin chào {context.UserProfile.Name}! Rất vui được phục vụ thành viên VIP của SHN-Gear. Tôi có thể hỗ trợ gì cho bạn hôm nay? ⭐";
                }
                else
                {
                    greeting = $"Chào {context.UserProfile.Name}! Rất vui được gặp lại bạn tại SHN-Gear. Tôi có thể giúp gì cho bạn? 😊";
                }
            }
            else
            {
                greeting = "Xin chào! Tôi là SHN Assistant, trợ lý AI của SHN-Gear. Tôi có thể hỗ trợ bạn tìm sản phẩm, kiểm tra đơn hàng, hoặc giải đáp thắc mắc. Bạn cần tôi giúp gì? 🤖";
            }

            return Task.FromResult(new AIResponseDto
            {
                Response = greeting,
                Intent = "greeting",
                ConfidenceScore = 1.0m,
                SuggestedActions = new List<SuggestedActionDto>
                {
                    new SuggestedActionDto { Text = "Tìm sản phẩm", Action = "search_products" },
                    new SuggestedActionDto { Text = "Kiểm tra đơn hàng", Action = "check_order" },
                    new SuggestedActionDto { Text = "Hỏi về chính sách", Action = "policies" },
                    new SuggestedActionDto { Text = "Hỗ trợ kỹ thuật", Action = "technical_support" }
                }
            });
        }

        private List<SuggestedActionDto> GenerateSuggestedActionsWithContext(string intent, AIResponseDto response, ConversationContext context)
        {
            var actions = new List<SuggestedActionDto>();

            switch (intent)
            {
                case "product_search":
                    actions.Add(new SuggestedActionDto { Text = "So sánh sản phẩm", Action = "compare" });
                    actions.Add(new SuggestedActionDto { Text = "Xem khuyến mãi", Action = "promotions" });
                    actions.Add(new SuggestedActionDto { Text = "Đặt mua ngay", Action = "order" });
                    if (context.UserProfile.TotalOrders > 0)
                        actions.Add(new SuggestedActionDto { Text = "Xem lịch sử mua hàng", Action = "order_history" });
                    break;

                case "price_inquiry":
                    actions.Add(new SuggestedActionDto { Text = "Xem khuyến mãi", Action = "promotions" });
                    actions.Add(new SuggestedActionDto { Text = "So sánh giá", Action = "compare_price" });
                    actions.Add(new SuggestedActionDto { Text = "Đặt mua", Action = "order" });
                    if (context.UserProfile.IsVIP)
                        actions.Add(new SuggestedActionDto { Text = "Ưu đãi VIP", Action = "vip_deals" });
                    break;

                case "order_status":
                    actions.Add(new SuggestedActionDto { Text = "Theo dõi vận chuyển", Action = "track_shipping" });
                    actions.Add(new SuggestedActionDto { Text = "Đổi địa chỉ", Action = "change_address" });
                    actions.Add(new SuggestedActionDto { Text = "Hủy đơn hàng", Action = "cancel_order" });
                    break;

                default:
                    actions.Add(new SuggestedActionDto { Text = "Tìm sản phẩm", Action = "search_products" });
                    actions.Add(new SuggestedActionDto { Text = "Liên hệ tư vấn", Action = "contact_advisor" });
                    break;
            }

            return actions;
        }

        // Basic handlers
        private async Task<AIResponseDto> HandleProductSearch(string message, List<string> keywords)
        {
            var products = await SearchProducts(keywords);

            if (products.Any())
            {
                return new AIResponseDto
                {
                    Response = "Tôi tìm thấy một số sản phẩm phù hợp với yêu cầu của bạn:",
                    Intent = "product_search",
                    ConfidenceScore = 0.8m,
                    ProductRecommendations = products.Take(3).ToList()
                };
            }

            return new AIResponseDto
            {
                Response = "Tôi chưa tìm thấy sản phẩm nào phù hợp. Bạn có thể mô tả chi tiết hơn nhu cầu của mình không?",
                Intent = "product_search",
                ConfidenceScore = 0.4m,
                RequiresEscalation = false
            };
        }

        private Task<AIResponseDto> HandlePriceInquiry(string message, List<string> keywords)
        {
            return Task.FromResult(new AIResponseDto
            {
                Response = "Để biết giá chính xác nhất và các chương trình khuyến mãi hiện tại, vui lòng liên hệ với nhân viên tư vấn hoặc xem trực tiếp trên website.",
                Intent = "price_inquiry",
                ConfidenceScore = 0.7m,
                RequiresEscalation = true
            });
        }

        private async Task<AIResponseDto> HandleOrderStatus(string message, int? userId)
        {
            if (userId.HasValue)
            {
                try
                {
                    var recentOrder = await _context.Orders
                        .Where(o => o.UserId == userId)
                        .OrderByDescending(o => o.Id)
                        .FirstOrDefaultAsync();

                    if (recentOrder != null)
                    {
                        return new AIResponseDto
                        {
                            Response = $"Đơn hàng gần nhất #{recentOrder.Id} của bạn đang được xử lý",
                            Intent = "order_status",
                            ConfidenceScore = 0.9m
                        };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error retrieving order status");
                }
            }

            return new AIResponseDto
            {
                Response = "Để kiểm tra trạng thái đơn hàng, vui lòng cung cấp mã đơn hàng hoặc đăng nhập vào tài khoản.",
                Intent = "order_status",
                ConfidenceScore = 0.6m,
                RequiresEscalation = false
            };
        }

        private Task<AIResponseDto> HandleShippingInfo(string message)
        {
            return Task.FromResult(new AIResponseDto
            {
                Response = "SHN-Gear hỗ trợ giao hàng toàn quốc với nhiều hình thức:\n" +
                          "• Giao hàng tiêu chuẩn: 2-3 ngày làm việc\n" +
                          "• Giao hàng nhanh: 1-2 ngày làm việc\n" +
                          "• Giao hàng siêu tốc: Trong ngày (khu vực nội thành)\n" +
                          "• Miễn phí giao hàng cho đơn từ 500,000đ",
                ConfidenceScore = 0.95m,
                Intent = "shipping_info",
                RequiresEscalation = false
            });
        }

        private Task<AIResponseDto> HandleReturnPolicy(string message)
        {
            return Task.FromResult(new AIResponseDto
            {
                Response = "Chính sách đổi trả của SHN-Gear:\n" +
                          "• Đổi trả trong 7 ngày kể từ ngày mua\n" +
                          "• Sản phẩm còn nguyên seal, chưa sử dụng\n" +
                          "• Giữ nguyên hộp và phụ kiện đi kèm\n" +
                          "• Bảo hành 12-24 tháng tùy sản phẩm\n" +
                          "• Hỗ trợ đổi trả tại cửa hàng hoặc qua ship",
                ConfidenceScore = 0.95m,
                Intent = "return_policy",
                RequiresEscalation = false
            });
        }

        private Task<AIResponseDto> HandleTechnicalSupport(string message, List<string> keywords)
        {
            return Task.FromResult(new AIResponseDto
            {
                Response = "Tôi hiểu bạn đang gặp vấn đề kỹ thuật. Để được hỗ trợ tốt nhất, tôi sẽ kết nối bạn với team kỹ thuật chuyên nghiệp của chúng tôi.",
                ConfidenceScore = 0.7m,
                Intent = "technical_support",
                RequiresEscalation = true
            });
        }

        private Task<AIResponseDto> HandleThanks()
        {
            return Task.FromResult(new AIResponseDto
            {
                Response = "Cảm ơn bạn! Tôi luôn sẵn sàng hỗ trợ bạn. Chúc bạn có trải nghiệm tuyệt vời tại SHN-Gear! 😊",
                Intent = "thanks",
                ConfidenceScore = 1.0m
            });
        }

        private async Task<AIResponseDto> HandleGeneralQuery(string message, List<AIKnowledgeBase> knowledgeMatches)
        {
            if (knowledgeMatches.Any())
            {
                var bestMatch = knowledgeMatches.First();
                return new AIResponseDto
                {
                    Response = bestMatch.Answer ?? "Tôi chưa có thông tin chi tiết về vấn đề này.",
                    Intent = "general",
                    ConfidenceScore = (decimal)CalculateRelevanceScore(message, bestMatch)
                };
            }

            return new AIResponseDto
            {
                Response = "Tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể nói rõ hơn hoặc để tôi kết nối với nhân viên tư vấn?",
                Intent = "general",
                ConfidenceScore = 0.3m,
                RequiresEscalation = true
            };
        }

        private async Task<List<ProductRecommendationDto>> SearchProducts(List<string> keywords)
        {
            var products = new List<ProductRecommendationDto>();

            try
            {
                var productQuery = await _context.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Where(p => keywords.Any(k => p.Name.ToLower().Contains(k) ||
                                                p.Brand.Name.ToLower().Contains(k) ||
                                                p.Category.Name.ToLower().Contains(k)))
                    .Take(5)
                    .ToListAsync();

                products = productQuery.Select(p => new ProductRecommendationDto
                {
                    ProductId = p.Id,
                    Name = p.Name,
                    ImageUrl = "/images/no-image.jpg", // Default image
                    Price = 0, // Needs actual price field
                    DiscountPrice = null,
                    Brand = p.Brand.Name,
                    Category = p.Category.Name,
                    Reason = "Phù hợp với tìm kiếm của bạn"
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products");
            }

            return products;
        }
    }
}
