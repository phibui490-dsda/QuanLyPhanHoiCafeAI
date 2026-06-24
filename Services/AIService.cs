using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AIService> _logger;
        private readonly string _apiKey;
        private readonly string _model;

        public AIService(HttpClient httpClient, IConfiguration configuration, ILogger<AIService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini API Key is not configured.");
            _model = configuration["Gemini:Model"] ?? "gemini-2.0-flash";
        }

        public async Task<(string Label, double Confidence)> AnalyzeSentimentAsync(string comment)
        {
            if (string.IsNullOrWhiteSpace(comment))
                return ("Trung lập", 0.5);

            try
            {
                var prompt = $@"Bạn là hệ thống phân tích cảm xúc cho quán cà phê. 
Hãy phân tích cảm xúc của bình luận khách hàng sau đây.

Bình luận: ""{comment}""

Trả về KẾT QUẢ duy nhất theo đúng format JSON (không thêm markdown, không thêm giải thích):
{{""label"": ""Tích cực"" hoặc ""Tiêu cực"" hoặc ""Trung lập"", ""confidence"": số từ 0.0 đến 1.0}}

Quy tắc:
- ""Tích cực"": khen ngợi, hài lòng, vui vẻ
- ""Tiêu cực"": chê bai, thất vọng, không hài lòng  
- ""Trung lập"": không rõ ràng, trung tính
- confidence: mức độ tự tin của phân tích (0.5 = không chắc, 1.0 = rất chắc chắn)";

                var responseText = await CallGeminiAsync(prompt);

                if (!string.IsNullOrEmpty(responseText))
                {
                    // Extract JSON from response (handle markdown code blocks if any)
                    var json = ExtractJson(responseText);
                    var result = JsonSerializer.Deserialize<SentimentResult>(json, _jsonOptions);
                    if (result != null)
                    {
                        // Normalize label
                        var label = NormalizeSentimentLabel(result.Label);
                        var confidence = Math.Clamp(result.Confidence, 0.0, 1.0);
                        _logger.LogInformation("Gemini Sentiment: {Comment} -> {Label} ({Confidence})", comment, label, confidence);
                        return (label, confidence);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API for sentiment analysis. Comment: {Comment}", comment);
            }

            // Fallback default
            return ("Trung lập", 0.5);
        }

        public async Task<List<(int DrinkId, double Score, string Reason)>> GetRecommendationsAsync(int customerId, List<DrinkDto> availableDrinks)
        {
            var results = new List<(int DrinkId, double Score, string Reason)>();

            if (availableDrinks == null || availableDrinks.Count == 0)
                return results;

            try
            {
                // Build drink list for the prompt
                var drinkList = string.Join("\n", availableDrinks.Select(d =>
                    $"- ID: {d.Id}, Tên: \"{d.Name}\", Giá: {d.Price}đ, Loại: \"{d.Category}\", Mô tả: \"{d.Description}\""));

                var prompt = $@"Bạn là hệ thống gợi ý đồ uống AI cho quán cà phê.

Mã khách hàng: {customerId}

Danh sách đồ uống hiện có:
{drinkList}

Hãy gợi ý TOP 5 đồ uống phù hợp nhất cho khách hàng. Đưa ra lý do gợi ý bằng tiếng Việt, ngắn gọn và thân thiện.

Trả về KẾT QUẢ duy nhất theo đúng format JSON array (không thêm markdown, không thêm giải thích):
[{{""drink_id"": số_ID, ""score"": số_từ_0.0_đến_1.0, ""reason"": ""lý do gợi ý""}}]

Quy tắc:
- Chọn đa dạng loại đồ uống (cà phê, trà, sinh tố...)
- score: mức độ phù hợp (0.0 = ít phù hợp, 1.0 = rất phù hợp)
- reason: viết tự nhiên, thân thiện, như nhân viên quán gợi ý
- Chỉ dùng drink_id có trong danh sách trên
- Sắp xếp theo score giảm dần";

                var responseText = await CallGeminiAsync(prompt);

                if (!string.IsNullOrEmpty(responseText))
                {
                    var json = ExtractJson(responseText);
                    var recommendations = JsonSerializer.Deserialize<List<RecommendationResult>>(json, _jsonOptions);

                    if (recommendations != null)
                    {
                        foreach (var rec in recommendations)
                        {
                            // Validate drink_id exists in available drinks
                            if (availableDrinks.Any(d => d.Id == rec.DrinkId))
                            {
                                var score = Math.Clamp(rec.Score, 0.0, 1.0);
                                results.Add((rec.DrinkId, score, rec.Reason ?? "Gợi ý cá nhân hóa bởi AI"));
                            }
                        }
                        _logger.LogInformation("Gemini Recommendation: {Count} drinks recommended for customer {CustomerId}", results.Count, customerId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API for recommendations. CustomerId: {CustomerId}", customerId);
            }

            return results;
        }

        /// <summary>
        /// Core method: call Gemini REST API and return the text response.
        /// </summary>
        private async Task<string?> CallGeminiAsync(string prompt)
        {
            var requestUrl = $"v1beta/models/{_model}:generateContent?key={_apiKey}";

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
                    temperature = 0.3,
                    maxOutputTokens = 1024,
                    responseMimeType = "application/json"
                }
            };

            var response = await _httpClient.PostAsJsonAsync(requestUrl, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini API returned {StatusCode}: {Error}", response.StatusCode, errorBody);
                return null;
            }

            var geminiResponse = await response.Content.ReadFromJsonAsync<GeminiResponse>(_jsonOptions);
            var textContent = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
            return textContent;
        }

        /// <summary>
        /// Extract JSON from response that might be wrapped in markdown code blocks.
        /// </summary>
        private static string ExtractJson(string text)
        {
            text = text.Trim();

            // Remove ```json ... ``` wrapper if present
            if (text.StartsWith("```"))
            {
                var firstNewline = text.IndexOf('\n');
                if (firstNewline > 0)
                    text = text[(firstNewline + 1)..];

                if (text.EndsWith("```"))
                    text = text[..^3];

                text = text.Trim();
            }

            return text;
        }

        private static string NormalizeSentimentLabel(string label)
        {
            if (string.IsNullOrEmpty(label)) return "Trung lập";

            var lower = label.ToLowerInvariant().Trim();
            if (lower.Contains("tích cực") || lower.Contains("positive"))
                return "Tích cực";
            if (lower.Contains("tiêu cực") || lower.Contains("negative"))
                return "Tiêu cực";
            return "Trung lập";
        }

        // JSON serialization options
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        // --- Response Models ---

        private class SentimentResult
        {
            [JsonPropertyName("label")]
            public string Label { get; set; } = "Trung lập";

            [JsonPropertyName("confidence")]
            public double Confidence { get; set; } = 0.5;
        }

        private class RecommendationResult
        {
            [JsonPropertyName("drink_id")]
            public int DrinkId { get; set; }

            [JsonPropertyName("score")]
            public double Score { get; set; }

            [JsonPropertyName("reason")]
            public string? Reason { get; set; }
        }

        // --- Gemini API Response Models ---

        private class GeminiResponse
        {
            [JsonPropertyName("candidates")]
            public List<GeminiCandidate>? Candidates { get; set; }
        }

        private class GeminiCandidate
        {
            [JsonPropertyName("content")]
            public GeminiContent? Content { get; set; }
        }

        private class GeminiContent
        {
            [JsonPropertyName("parts")]
            public List<GeminiPart>? Parts { get; set; }
        }

        private class GeminiPart
        {
            [JsonPropertyName("text")]
            public string? Text { get; set; }
        }
    }
}
