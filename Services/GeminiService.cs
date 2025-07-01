using System.Text;
using System.Text.Json;
using System.Globalization;
using SHN_Gear.DTOs;

namespace SHN_Gear.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiService> _logger;
        private readonly string _apiKey;
        private readonly string _model;
        private readonly string _baseUrl;

        public GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            _apiKey = _configuration["AIConfig:Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini API Key not configured");
            _model = _configuration["AIConfig:Gemini:Model"] ?? "gemini-1.5-flash";
            _baseUrl = _configuration["AIConfig:Gemini:BaseUrl"] ?? "https://generativelanguage.googleapis.com/v1beta/models";
        }

        public async Task<string> GenerateResponseAsync(string userMessage, string context = "", string intent = "general")
        {
            try
            {
                var prompt = BuildPrompt(userMessage, context, intent);

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
                    var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);

                    return geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
                           ?? "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.";
                }
                else
                {
                    _logger.LogError("Gemini API error: {StatusCode} - {Content}",
                        response.StatusCode, await response.Content.ReadAsStringAsync());
                    return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API");
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
