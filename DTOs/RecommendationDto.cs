namespace CAFE_AI.DTOs
{
    public class RecommendationResponseDto
    {
        public int DrinkId { get; set; }
        public string DrinkName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string DrinkImageUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public double MatchScore { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
