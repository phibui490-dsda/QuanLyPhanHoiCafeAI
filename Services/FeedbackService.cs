using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CAFE_AI.Data;
using CAFE_AI.DTOs;
using CAFE_AI.Models;

namespace CAFE_AI.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly AppDbContext _context;
        private readonly IAIService _aiService;

        public FeedbackService(AppDbContext context, IAIService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        public async Task<FeedbackResponseDto> CreateFeedbackAsync(int customerId, FeedbackCreateDto dto)
        {
            var (label, confidence) = await _aiService.AnalyzeSentimentAsync(dto.Comment);

            var feedback = new Feedback
            {
                CustomerId = customerId,
                DrinkId = dto.DrinkId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                SentimentLabel = label,
                SentimentConfidence = confidence,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    _context.Feedbacks.Add(feedback);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            var feedbackDb = await _context.Feedbacks
                .Include(f => f.Customer)
                .Include(f => f.Drink)
                .FirstAsync(f => f.Id == feedback.Id);

            return MapToDto(feedbackDb);
        }

        public async Task<List<FeedbackResponseDto>> GetFeedbacksAsync(string? sentimentLabel)
        {
            var query = _context.Feedbacks
                .Include(f => f.Customer)
                .Include(f => f.Drink)
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Staff)
                .AsQueryable();

            if (!string.IsNullOrEmpty(sentimentLabel))
            {
                query = query.Where(f => f.SentimentLabel == sentimentLabel);
            }

            var feedbacks = await query.OrderByDescending(f => f.CreatedAt).ToListAsync();
            return feedbacks.Select(f => MapToDto(f)).ToList();
        }

        public async Task<FeedbackResponseDto?> UpdateFeedbackStatusAsync(int id, string status)
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.Customer)
                .Include(f => f.Drink)
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Staff)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (feedback == null) return null;

            feedback.Status = status;
            await _context.SaveChangesAsync();

            return MapToDto(feedback);
        }

        public async Task<FeedbackResponseDto?> ReplyToFeedbackAsync(int id, int staffId, FeedbackReplyCreateDto dto)
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.Customer)
                .Include(f => f.Drink)
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Staff)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (feedback == null) return null;

            var reply = new FeedbackReply
            {
                FeedbackId = id,
                StaffId = staffId,
                ReplyText = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    _context.FeedbackReplies.Add(reply);
                    feedback.Status = "Processed";
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            var updatedFeedback = await _context.Feedbacks
                .Include(f => f.Customer)
                .Include(f => f.Drink)
                .Include(f => f.Replies)
                    .ThenInclude(r => r.Staff)
                .FirstAsync(f => f.Id == id);

            return MapToDto(updatedFeedback);
        }

        private static FeedbackResponseDto MapToDto(Feedback f)
        {
            return new FeedbackResponseDto
            {
                Id = f.Id,
                CustomerId = f.CustomerId,
                CustomerName = string.IsNullOrEmpty(f.Customer?.FullName) ? (f.Customer?.Email ?? "Anonymous") : f.Customer.FullName,
                DrinkName = f.Drink?.Name ?? "Unknown Drink",
                Rating = f.Rating,
                Comment = f.Comment,
                SentimentResult = f.SentimentLabel,
                SentimentConfidence = f.SentimentConfidence,
                Status = f.Status,
                CreatedAt = f.CreatedAt,
                Replies = f.Replies.Select(r => new FeedbackReplyDto
                {
                    Id = r.Id,
                    FeedbackId = r.FeedbackId,
                    StaffId = r.StaffId,
                    StaffName = string.IsNullOrEmpty(r.Staff?.FullName) ? (r.Staff?.Email ?? "Staff Member") : r.Staff.FullName,
                    Content = r.ReplyText,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };
        }
    }
}
