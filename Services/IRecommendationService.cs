using System.Collections.Generic;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IRecommendationService
    {
        Task<List<RecommendationResponseDto>> GetRecommendationsAsync(int customerId);
    }
}
