using System;
using System.Collections.Generic;

namespace CAFE_AI.DTOs
{
    public class FeedbackCreateDto
    {
        public int DrinkId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class FeedbackReplyCreateDto
    {
        public string Content { get; set; } = string.Empty;
    }

    public class FeedbackStatusUpdateDto
    {
        public string Status { get; set; } = "Processed"; // Pending, Processed
    }

    public class FeedbackReplyDto
    {
        public int Id { get; set; }
        public int FeedbackId { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class FeedbackResponseDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string DrinkName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string SentimentResult { get; set; } = string.Empty;
        public double SentimentConfidence { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<FeedbackReplyDto> Replies { get; set; } = new List<FeedbackReplyDto>();
    }
}
