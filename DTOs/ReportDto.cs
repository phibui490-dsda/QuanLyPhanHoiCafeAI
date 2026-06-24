using System;
using System.Collections.Generic;

namespace CAFE_AI.DTOs
{
    public class FeedbackTimeGroupDto
    {
        public string Period { get; set; } = string.Empty; // e.g. "2026-06-23" or "Week 25"
        public int Count { get; set; }
    }

    public class SentimentDistributionDto
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class DrinkRatingStatsDto
    {
        public int DrinkId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
    }

    public class ReportSummaryDto
    {
        public int TotalUsers { get; set; }
        public int TotalDrinks { get; set; }
        public int TotalFeedbacks { get; set; }
        public int PositiveFeedbacks { get; set; }
        public int NegativeFeedbacks { get; set; }
        public double AverageRating { get; set; }
        public int TotalFeedbacksPeriod { get; set; }
        public int PositiveCount { get; set; }
        public int NegativeCount { get; set; }
        public double AverageRatingPeriod { get; set; }
        public List<DrinkRatingStatsDto> TopRatedDrinks { get; set; } = new();
        public List<DrinkRatingStatsDto> LowestRatedDrinks { get; set; } = new();
        public List<SentimentDistributionDto> SentimentDistribution { get; set; } = new();
        public List<FeedbackTimeGroupDto> FeedbackOverTime { get; set; } = new();
    }
}
