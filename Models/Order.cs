using System;
using System.Collections.Generic;

namespace CAFE_AI.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public User? Customer { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Paid, Completed, Cancelled
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Momo, BankTransfer
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
