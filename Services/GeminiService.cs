using System.Text;
using System.Text.Json;
using System.Globalization;
using Microsoft.Extensions.Caching.Memory;
using SHN_Gear.DTOs;

namespace SHN_Gear.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiService> _logger;
        private readonly IMemoryCache _cache;
        private readonly string _apiKey;
        private readonly string _model;
        private readonly string _baseUrl;

        public GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _cache = cache;

            _apiKey = _configuration["AIConfig:Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini API Key not configured");
            _model = _configuration["AIConfig:Gemini:Model"] ?? "gemini-1.5-flash";
            _baseUrl = _configuration["AIConfig:Gemini:BaseUrl"] ?? "https://generativelanguage.googleapis.com/v1beta/models";
        }

        // Đọc tri thức website từ file JSON (cache trong memory)
        private static string? _websiteKnowledgeCache = null;
        private static DateTime _websiteKnowledgeCacheTime = DateTime.MinValue;
        private static readonly object _knowledgeLock = new();

        private string GetWebsiteKnowledge()
        {
            lock (_knowledgeLock)
            {
                if (_websiteKnowledgeCache != null && (DateTime.Now - _websiteKnowledgeCacheTime).TotalMinutes < 10)
                    return _websiteKnowledgeCache;
                try
                {
                    var path = Path.Combine(AppContext.BaseDirectory, "Data", "WebsiteKnowledgeBase.json");
                    if (File.Exists(path))
                    {
                        var json = File.ReadAllText(path);
                        using var doc = JsonDocument.Parse(json);
                        var root = doc.RootElement;
                        var sb = new StringBuilder();
                        if (root.TryGetProperty("websiteName", out var websiteName))
                            sb.AppendLine($"Tên website: {websiteName.GetString()}");
                        if (root.TryGetProperty("description", out var description))
                            sb.AppendLine($"Mô tả: {description.GetString()}");
                        if (root.TryGetProperty("contact", out var contact))
                        {
                            sb.AppendLine("Thông tin liên hệ:");
                            if (contact.TryGetProperty("hotline", out var hotline))
                                sb.AppendLine($"- Hotline: {hotline.GetString()}");
                            if (contact.TryGetProperty("email", out var email))
                                sb.AppendLine($"- Email: {email.GetString()}");
                            if (contact.TryGetProperty("address", out var address))
                                sb.AppendLine($"- Địa chỉ: {address.GetString()}");
                        }
                        if (root.TryGetProperty("policies", out var policies))
                        {
                            sb.AppendLine("\nChính sách:");
                            if (policies.TryGetProperty("shipping", out var shipping) && !string.IsNullOrWhiteSpace(shipping.GetString()))
                                sb.AppendLine($"- Vận chuyển: {shipping.GetString()}");
                            if (policies.TryGetProperty("return", out var returns) && !string.IsNullOrWhiteSpace(returns.GetString()))
                                sb.AppendLine($"- Đổi trả: {returns.GetString()}");
                            if (policies.TryGetProperty("warranty", out var warranty) && !string.IsNullOrWhiteSpace(warranty.GetString()))
                                sb.AppendLine($"- Bảo hành: {warranty.GetString()}");
                        }
                        if (root.TryGetProperty("faq", out var faq) && faq.ValueKind == JsonValueKind.Array && faq.GetArrayLength() > 0)
                        {
                            sb.AppendLine("\nCác câu hỏi thường gặp:");
                            foreach (var item in faq.EnumerateArray())
                            {
                                var q = item.TryGetProperty("question", out var qv) ? qv.GetString() : null;
                                var a = item.TryGetProperty("answer", out var av) ? av.GetString() : null;
                                if (!string.IsNullOrWhiteSpace(q) && !string.IsNullOrWhiteSpace(a))
                                {
                                    sb.AppendLine($"- Q: {q}");
                                    sb.AppendLine($"  A: {a}");
                                }
                            }
                        }
                        if (root.TryGetProperty("products", out var products) && products.ValueKind == JsonValueKind.Array && products.GetArrayLength() > 0)
                        {
                            sb.AppendLine("\nMột số sản phẩm tiêu biểu:");
                            int count = 0;
                            foreach (var item in products.EnumerateArray())
                            {
                                if (count++ >= 10) break; // chỉ lấy 10 sản phẩm đầu
                                var name = item.TryGetProperty("name", out var nv) ? nv.GetString() : null;
                                var cat = item.TryGetProperty("category", out var cv) ? cv.GetString() : null;
                                var brand = item.TryGetProperty("brand", out var bv) ? bv.GetString() : null;
                                var price = item.TryGetProperty("price", out var pv) ? pv.GetString() : null;
                                if (!string.IsNullOrWhiteSpace(name))
                                {
                                    sb.Append("- ");
                                    sb.Append(name);
                                    if (!string.IsNullOrWhiteSpace(cat)) sb.Append($" ({cat}");
                                    if (!string.IsNullOrWhiteSpace(brand)) sb.Append($", {brand}");
                                    if (!string.IsNullOrWhiteSpace(cat) || !string.IsNullOrWhiteSpace(brand)) sb.Append(")");
                                    if (!string.IsNullOrWhiteSpace(price)) sb.Append($": {price}");
                                    sb.AppendLine();
                                }
                            }
                        }
                        _websiteKnowledgeCache = sb.ToString();
                        _websiteKnowledgeCacheTime = DateTime.Now;
                        return _websiteKnowledgeCache;
                    }
                }
                catch { }
                return string.Empty;
            }
        }

        public async Task<string> GenerateResponseAsync(string userMessage, string context = "", string intent = "general")
        {
            try
            {
                // Đưa tri thức website vào context cho Gemini
                var websiteKnowledge = GetWebsiteKnowledge();
                var fullContext = string.IsNullOrEmpty(context) ? websiteKnowledge : (websiteKnowledge + "\n" + context);
                var prompt = BuildPrompt(userMessage, fullContext, intent);
                string cacheKey = $"Gemini:{intent}:{prompt.GetHashCode()}";
                if (_cache.TryGetValue(cacheKey, out string? cachedResponse) && cachedResponse != null)
                {
                    _logger.LogInformation($"[GeminiService] Cache hit for key: {cacheKey}");
                    return cachedResponse;
                }

                // Parse and validate temperature
                var tempValue = double.Parse(_configuration["AIConfig:Gemini:Temperature"] ?? "0.7", CultureInfo.InvariantCulture);
                if (tempValue < 0.0 || tempValue > 2.0)
                {
                    _logger.LogWarning("Temperature value {Temperature} is out of range [0.0, 2.0]. Using default 0.7", tempValue);
                    tempValue = 0.7;
                }

                // Parse and validate maxTokens
                var maxTokens = int.Parse(_configuration["AIConfig:Gemini:MaxTokens"] ?? "150", CultureInfo.InvariantCulture);
                if (maxTokens <= 0 || maxTokens > 8192)
                {
                    _logger.LogWarning("MaxTokens value {MaxTokens} is out of range. Using default 150", maxTokens);
                    maxTokens = 150;
                }

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = tempValue,
                        maxOutputTokens = maxTokens,
                        topP = 0.8,
                        topK = 10
                    }
                };

                var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var url = $"{_baseUrl}/{_model}:generateContent?key={_apiKey}";
                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation($"[GeminiService] Gemini API response: {responseContent}");
                    var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
                    var result = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
                        ?? "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.";
                    _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
                    return result;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"[GeminiService] Gemini API error: StatusCode={response.StatusCode}, Content={errorContent}, Url={url}, Prompt={prompt}");
                    return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[GeminiService] Exception when calling Gemini API. Prompt: {userMessage}, Context: {context}, Intent: {intent}");
                return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.";
            }
        }

        private string BuildPrompt(string userMessage, string context, string intent)
        {
            var promptBuilder = new StringBuilder();

            promptBuilder.AppendLine("Bạn là SHN Assistant, trợ lý AI thông minh của cửa hàng SHN-Gear chuyên bán điện thoại, laptop và tai nghe.");
            promptBuilder.AppendLine("Nhiệm vụ của bạn là hỗ trợ khách hàng một cách thân thiện, chính xác và hữu ích.");
            promptBuilder.AppendLine();

            // Context information
            if (!string.IsNullOrEmpty(context))
            {
                promptBuilder.AppendLine("Bối cảnh cuộc trò chuyện:");
                promptBuilder.AppendLine(context);
                promptBuilder.AppendLine();
            }

            // Intent-specific instructions
            switch (intent.ToLower())
            {
                case "product_search":
                    promptBuilder.AppendLine("Khách hàng đang tìm kiếm sản phẩm. Hãy:");
                    promptBuilder.AppendLine("- Hỏi về nhu cầu cụ thể (mục đích sử dụng, ngân sách)");
                    promptBuilder.AppendLine("- Đưa ra gợi ý phù hợp");
                    promptBuilder.AppendLine("- Giới thiệu ưu điểm của sản phẩm");
                    break;

                case "price_inquiry":
                    promptBuilder.AppendLine("Khách hàng hỏi về giá. Hãy:");
                    promptBuilder.AppendLine("- Thông báo rằng giá có thể thay đổi theo thời gian");
                    promptBuilder.AppendLine("- Đề xuất liên hệ để có giá chính xác nhất");
                    promptBuilder.AppendLine("- Giới thiệu các chương trình khuyến mãi hiện có");
                    break;

                case "technical_support":
                    promptBuilder.AppendLine("Khách hàng cần hỗ trợ kỹ thuật. Hãy:");
                    promptBuilder.AppendLine("- Hỏi chi tiết về vấn đề");
                    promptBuilder.AppendLine("- Đưa ra hướng dẫn cơ bản");
                    promptBuilder.AppendLine("- Đề xuất liên hệ kỹ thuật viên nếu cần");
                    break;

                default:
                    promptBuilder.AppendLine("Hãy trả lời một cách thân thiện và hữu ích.");
                    break;
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Yêu cầu quan trọng:");
            promptBuilder.AppendLine("- Trả lời bằng tiếng Việt");
            promptBuilder.AppendLine("- Giữ phong cách thân thiện, chuyên nghiệp");
            promptBuilder.AppendLine("- Trả lời ngắn gọn, không quá 150 từ");
            promptBuilder.AppendLine("- Nếu không chắc chắn, hãy đề xuất liên hệ nhân viên tư vấn");
            promptBuilder.AppendLine();

            promptBuilder.AppendLine("Tin nhắn của khách hàng:");
            promptBuilder.AppendLine(userMessage);

            return promptBuilder.ToString();
        }

        public async Task<double> CalculateConfidenceScoreAsync(string userMessage, string intent)
        {
            try
            {
                var prompt = $@"
Đánh giá độ tin cậy của việc trả lời câu hỏi sau với ý định '{intent}'.
Trả về một số từ 0.0 đến 1.0 (ví dụ: 0.8):

Câu hỏi: {userMessage}
Ý định: {intent}

Chỉ trả về số, không giải thích:";

                var response = await GenerateResponseAsync(prompt, "", "confidence_evaluation");

                if (double.TryParse(response.Trim(), out double confidence))
                {
                    return Math.Max(0.0, Math.Min(1.0, confidence));
                }

                return 0.5; // Default medium confidence
            }
            catch
            {
                return 0.5; // Default medium confidence on error
            }
        }
    }

    // Response model classes for Gemini API
    public class GeminiResponse
    {
        public GeminiCandidate[]? Candidates { get; set; }
    }

    public class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }

    public class GeminiContent
    {
        public GeminiPart[]? Parts { get; set; }
    }

    public class GeminiPart
    {
        public string? Text { get; set; }
    }
}
