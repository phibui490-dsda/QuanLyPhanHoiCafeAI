using System.Collections.Generic;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IFeedbackService
    {
        Task<FeedbackResponseDto> CreateFeedbackAsync(int customerId, FeedbackCreateDto dto);
        Task<List<FeedbackResponseDto>> GetFeedbacksAsync(string? sentimentLabel);
        Task<FeedbackResponseDto?> UpdateFeedbackStatusAsync(int id, string status);
        Task<FeedbackResponseDto?> ReplyToFeedbackAsync(int id, int staffId, FeedbackReplyCreateDto dto);
    }
}
