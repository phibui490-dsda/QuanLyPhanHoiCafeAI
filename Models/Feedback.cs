using System;
using System.Collections.Generic;

namespace CAFE_AI.Models
{
    public class Feedback
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public User? Customer { get; set; }
        public int DrinkId { get; set; }
        public Drink? Drink { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public string SentimentLabel { get; set; } = "Trung lập"; // Tích cực, Tiêu cực, Trung lập
        public double SentimentConfidence { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Processed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<FeedbackReply> Replies { get; set; } = new List<FeedbackReply>();
    }
}
