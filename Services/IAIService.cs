using System.Collections.Generic;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IAIService
    {
        Task<(string Label, double Confidence)> AnalyzeSentimentAsync(string comment);
        Task<List<(int DrinkId, double Score, string Reason)>> GetRecommendationsAsync(int customerId, List<DrinkDto> availableDrinks);
    }
}
