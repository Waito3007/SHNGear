using System.Text;
using System.Text.Json;
using System.Globalization;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;
using SHN_Gear.Configuration;

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
        private static int _maxTokensFailureCount = 0; // Đếm số lần fail do MAX_TOKENS

        public GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _cache = cache;

            // Sử dụng environment variables hoặc fallback về appsettings
            _apiKey = EnvironmentConfig.Gemini.ApiKey ?? _configuration["AIConfig:Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini API Key not configured");

            // Auto-fallback logic: nếu 2.5-pro fail nhiều lần, dùng 1.5-flash
            var configuredModel = EnvironmentConfig.Gemini.Model ?? _configuration["AIConfig:Gemini:Model"] ?? "gemini-1.5-flash";
            if (_maxTokensFailureCount > 3 && configuredModel.Contains("2.5-pro"))
            {
                _model = "gemini-1.5-flash"; // Fallback về model nhẹ hơn
                _logger.LogWarning($"[GeminiService] Auto-fallback to gemini-1.5-flash due to {_maxTokensFailureCount} MAX_TOKENS failures");
            }
            else
            {
                _model = configuredModel;
            }

            _baseUrl = EnvironmentConfig.Gemini.BaseUrl ?? _configuration["AIConfig:Gemini:BaseUrl"] ?? "https://generativelanguage.googleapis.com/v1beta/models";
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
                // Tối ưu context để tránh prompt quá dài
                var websiteKnowledge = GetWebsiteKnowledge();

                // Giới hạn độ dài context để tránh vượt quá token limit
                var optimizedContext = OptimizeContext(websiteKnowledge, context, userMessage);
                var prompt = BuildPrompt(userMessage, optimizedContext, intent);

                // Log prompt length để debug
                var estimatedTokens = prompt.Length / 4; // Ước tính 1 token ≈ 4 ký tự
                _logger.LogInformation($"[GeminiService] Prompt length: {prompt.Length} chars (~{estimatedTokens} tokens)");

                if (estimatedTokens > 3000) // Cảnh báo nếu quá lớn
                {
                    _logger.LogWarning($"[GeminiService] Prompt may be too long: ~{estimatedTokens} tokens");
                }

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

                // Parse and validate maxTokens - giảm drastically cho Gemini 2.5 Pro
                var maxTokens = int.Parse(_configuration["AIConfig:Gemini:MaxTokens"] ?? "200", CultureInfo.InvariantCulture);
                if (maxTokens <= 0 || maxTokens > 8192)
                {
                    _logger.LogWarning("MaxTokens value {MaxTokens} is out of range. Using default 200", maxTokens);
                    maxTokens = 200;
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

                    // Kiểm tra và log chi tiết phản hồi
                    var candidate = geminiResponse?.Candidates?.FirstOrDefault();
                    if (candidate == null)
                    {
                        _logger.LogWarning("[GeminiService] No candidates in response");
                        return "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
                    }

                    var parts = candidate.Content?.Parts;
                    if (parts == null || !parts.Any())
                    {
                        _logger.LogWarning("[GeminiService] No content parts in response. FinishReason: {FinishReason}",
                            candidate.FinishReason ?? "Unknown");

                        if (candidate.FinishReason == "MAX_TOKENS")
                        {
                            // Tăng counter và retry với prompt ngắn hơn
                            _maxTokensFailureCount++;
                            _logger.LogWarning($"[GeminiService] MAX_TOKENS failure #{_maxTokensFailureCount}");

                            _logger.LogInformation("[GeminiService] Retrying with shorter prompt...");
                            var shortPrompt = BuildShortPrompt(userMessage, intent);
                            return await GenerateResponseWithShortPrompt(shortPrompt);
                        }
                        return "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
                    }
                    var result = parts.FirstOrDefault()?.Text;
                    if (string.IsNullOrWhiteSpace(result))
                    {
                        _logger.LogWarning("[GeminiService] Empty text in response parts");
                        return "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
                    }

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

        private string OptimizeContext(string websiteKnowledge, string context, string userMessage)
        {
            const int MAX_CONTEXT_LENGTH = 2000; // Giới hạn context ~500 tokens

            var contextBuilder = new StringBuilder();

            // Thêm thông tin website cơ bản (rút gọn)
            if (!string.IsNullOrEmpty(websiteKnowledge))
            {
                var basicInfo = ExtractBasicWebsiteInfo(websiteKnowledge);
                contextBuilder.AppendLine(basicInfo);
            }

            // Thêm context liên quan đến câu hỏi
            if (!string.IsNullOrEmpty(context))
            {
                var relevantContext = ExtractRelevantContext(context, userMessage);
                if (!string.IsNullOrEmpty(relevantContext))
                {
                    contextBuilder.AppendLine(relevantContext);
                }
            }

            var result = contextBuilder.ToString();

            // Cắt ngắn nếu quá dài
            if (result.Length > MAX_CONTEXT_LENGTH)
            {
                result = result.Substring(0, MAX_CONTEXT_LENGTH) + "...";
            }

            return result;
        }

        private string ExtractBasicWebsiteInfo(string websiteKnowledge)
        {
            // Chỉ lấy thông tin cơ bản nhất
            var lines = websiteKnowledge.Split('\n');
            var basicInfo = new StringBuilder();

            foreach (var line in lines.Take(5)) // Chỉ lấy 5 dòng đầu
            {
                if (line.Contains("Tên website:") || line.Contains("Hotline:") || line.Contains("Email:"))
                {
                    basicInfo.AppendLine(line);
                }
            }

            return basicInfo.ToString();
        }

        private string ExtractRelevantContext(string context, string userMessage)
        {
            // Tìm context liên quan đến câu hỏi của user
            var userKeywords = userMessage.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var contextLines = context.Split('\n');
            var relevantLines = new List<string>();

            foreach (var line in contextLines)
            {
                if (userKeywords.Any(keyword => line.ToLower().Contains(keyword)))
                {
                    relevantLines.Add(line);
                    if (relevantLines.Count >= 10) break; // Giới hạn số dòng
                }
            }

            return string.Join("\n", relevantLines);
        }

        private string BuildPrompt(string userMessage, string context, string intent)
        {
            var promptBuilder = new StringBuilder();

            // Prompt cơ bản ngắn gọn
            promptBuilder.AppendLine("Bạn là SHN Assistant của cửa hàng SHN-Gear (điện thoại, laptop, tai nghe).");

            // Context ngắn gọn
            if (!string.IsNullOrEmpty(context))
            {
                promptBuilder.AppendLine("Thông tin:");
                promptBuilder.AppendLine(context);
            }

            // Intent instructions ngắn gọn
            switch (intent.ToLower())
            {
                case "product_search":
                    promptBuilder.AppendLine("Hỗ trợ tìm sản phẩm phù hợp.");
                    break;
                case "price_inquiry":
                    promptBuilder.AppendLine("Hỗ trợ thông tin giá cả.");
                    break;
                case "technical_support":
                    promptBuilder.AppendLine("Hỗ trợ kỹ thuật.");
                    break;
            }

            promptBuilder.AppendLine("Trả lời ngắn gọn bằng tiếng Việt, thân thiện.");
            promptBuilder.AppendLine($"Khách hỏi: {userMessage}");

            return promptBuilder.ToString();
        }

        private string BuildShortPrompt(string userMessage, string intent)
        {
            // Prompt cực kỳ ngắn gọn cho trường hợp emergency
            // Thêm instruction để tắt reasoning mode của Gemini 2.5 Pro
            return $"Trả lời ngắn. SHN-Gear shop assistant. Intent: {intent}. Q: {userMessage}";
        }

        private async Task<string> GenerateResponseWithShortPrompt(string shortPrompt)
        {
            try
            {
                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = shortPrompt }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.7,
                        maxOutputTokens = 100, // Giảm rất thấp cho Gemini 2.5 Pro
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
                    var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
                    var result = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

                    return !string.IsNullOrWhiteSpace(result) ? result : "Xin lỗi, tôi không thể trả lời lúc này.";
                }

                return "Xin lỗi, có lỗi xảy ra.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[GeminiService] Error in short prompt fallback");
                return "Xin lỗi, tôi không thể trả lời lúc này.";
            }
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

        public async Task<string> SummarizeConversationAsync(string conversationHistory)
        {
            try
            {
                var prompt = new StringBuilder();
                prompt.AppendLine("Bạn là một trợ lý AI có nhiệm vụ tóm tắt cuộc trò chuyện giữa khách hàng và chatbot của cửa hàng SHN-Gear.");
                prompt.AppendLine("Hãy đọc đoạn hội thoại sau và tóm tắt lại các ý chính, nhu cầu, và thông tin quan trọng mà khách hàng đã đề cập.");
                prompt.AppendLine("Bản tóm tắt cần ngắn gọn, súc tích, tập trung vào các điểm chính để chatbot sau có thể nắm bắt nhanh chóng bối cảnh.");
                prompt.AppendLine("--- LỊCH SỬ HỘI THOẠI ---");
                prompt.AppendLine(conversationHistory);
                prompt.AppendLine("--- BẢN TÓM TẮT ---");

                // Sử dụng lại logic gọi API của GenerateResponseAsync nhưng với prompt tóm tắt
                // và các tham số cấu hình riêng cho việc tóm tắt.
                var requestBody = new
                {
                    contents = new[]
                    {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt.ToString() }
                        }
                    }
                },
                    generationConfig = new
                    {
                        temperature = 0.5, // Nhiệt độ thấp hơn để tóm tắt cô đọng
                        maxOutputTokens = 100, // Giảm rất thấp cho Gemini 2.5 Pro
                        topP = 0.8,
                        topK = 10
                    }
                };

                var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var url = $"{_baseUrl}/{_model}:generateContent?key={_apiKey}";

                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);

                    var candidate = geminiResponse?.Candidates?.FirstOrDefault();
                    if (candidate?.Content?.Parts != null && candidate.Content.Parts.Any())
                    {
                        var result = candidate.Content.Parts.FirstOrDefault()?.Text;
                        if (!string.IsNullOrWhiteSpace(result))
                        {
                            return result;
                        }
                    }

                    _logger.LogWarning("[GeminiService] Empty summarization response. FinishReason: {FinishReason}",
                        candidate?.FinishReason ?? "Unknown");
                    return "";
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"[GeminiService] Summarization API error: {errorContent}");
                    return ""; // Trả về chuỗi rỗng nếu có lỗi
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[GeminiService] Exception during conversation summarization.");
                return ""; // Trả về chuỗi rỗng nếu có lỗi
            }
        }
    }

    // Response model classes for Gemini API
    public class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public GeminiCandidate[]? Candidates { get; set; }
    }

    public class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent? Content { get; set; }

        [JsonPropertyName("finishReason")]
        public string? FinishReason { get; set; }
    }

    public class GeminiContent
    {
        [JsonPropertyName("parts")]
        public GeminiPart[]? Parts { get; set; }
    }

    public class GeminiPart
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}
