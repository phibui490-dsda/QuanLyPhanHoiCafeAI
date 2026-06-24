using Microsoft.EntityFrameworkCore;
using CAFE_AI.Models;

namespace CAFE_AI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Drink> Drinks { get; set; } = null!;
        public DbSet<Feedback> Feedbacks { get; set; } = null!;
        public DbSet<FeedbackReply> FeedbackReplies { get; set; } = null!;
        public DbSet<AIConfig> AIConfigs { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Feedback relationships
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.Customer)
                .WithMany()
                .HasForeignKey(f => f.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // FeedbackReply relationships
            modelBuilder.Entity<FeedbackReply>()
                .HasOne(fr => fr.Feedback)
                .WithMany(f => f.Replies)
                .HasForeignKey(fr => fr.FeedbackId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FeedbackReply>()
                .HasOne(fr => fr.Staff)
                .WithMany()
                .HasForeignKey(fr => fr.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // OrderItem relationships
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Drink)
                .WithMany()
                .HasForeignKey(oi => oi.DrinkId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed initial data
            SeedData(modelBuilder);
        }

        private static void SeedData(ModelBuilder modelBuilder)
        {
            // Seed a default AIConfig
            modelBuilder.Entity<AIConfig>().HasData(new AIConfig
            {
                Id = 1,
                AiServiceUrl = "http://127.0.0.1:8000",
                SentimentThreshold = 0.5,
                MaxRecommendations = 5
            });

            // Seed default Admin/Manager, Staff, Customer for testing
            // "$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292" is BCrypt for "123456"
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FullName = "Quản lý Cafe",
                    Email = "manager@cafe.com",
                    PasswordHash = "$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292",
                    Role = "Manager",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 2,
                    FullName = "Nhân viên Phục vụ",
                    Email = "staff@cafe.com",
                    PasswordHash = "$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292",
                    Role = "Staff",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 3,
                    FullName = "Khách hàng VIP",
                    Email = "customer@cafe.com",
                    PasswordHash = "$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292",
                    Role = "Customer",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // Seed some default drinks
            modelBuilder.Entity<Drink>().HasData(
                new Drink { Id = 1, Name = "Cà phê sữa đá", Description = "Cà phê truyền thống Việt Nam", Price = 29000, ImageUrl = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300", IsAvailable = true, Category = "Coffee" },
                new Drink { Id = 2, Name = "Bạc xỉu", Description = "Sữa tươi pha cà phê", Price = 32000, ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300", IsAvailable = true, Category = "Coffee" },
                new Drink { Id = 3, Name = "Cà phê trứng", Description = "Cà phê với trứng béo ngậy", Price = 45000, ImageUrl = "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=300", IsAvailable = true, Category = "Coffee" },
                new Drink { Id = 4, Name = "Trà đào cam sả", Description = "Thanh mát giải nhiệt mùa hè", Price = 39000, ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=300", IsAvailable = true, Category = "Tea" },
                new Drink { Id = 5, Name = "Sinh tố xoài", Description = "Sinh tố xoài tươi mát", Price = 42000, ImageUrl = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=300", IsAvailable = true, Category = "Smoothie" }
            );
        }
    }
}
