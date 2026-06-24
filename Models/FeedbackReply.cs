using System;

namespace CAFE_AI.Models
{
    public class FeedbackReply
    {
        public int Id { get; set; }
        public int FeedbackId { get; set; }
        public Feedback? Feedback { get; set; }
        public int StaffId { get; set; }
        public User? Staff { get; set; }
        public string ReplyText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
