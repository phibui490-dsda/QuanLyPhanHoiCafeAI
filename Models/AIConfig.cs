namespace CAFE_AI.Models
{
    public class AIConfig
    {
        public int Id { get; set; }
        public string AiServiceUrl { get; set; } = "http://127.0.0.1:8000";
        public double SentimentThreshold { get; set; } = 0.5;
        public int MaxRecommendations { get; set; } = 5;
    }
}
