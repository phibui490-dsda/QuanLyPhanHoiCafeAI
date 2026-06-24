using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CAFE_AI.Data;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly AppDbContext _context;
        private readonly IAIService _aiService;

        public RecommendationService(AppDbContext context, IAIService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        public async Task<List<RecommendationResponseDto>> GetRecommendationsAsync(int customerId)
        {
            var drinks = await _context.Drinks.Where(d => d.IsAvailable).ToListAsync();
            var drinkDtos = drinks.Select(d => new DrinkDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Price = d.Price,
                ImageUrl = d.ImageUrl,
                IsAvailable = d.IsAvailable,
                Category = d.Category,
                AverageRating = 0.0 // not used by AI
            }).ToList();

            var config = await _context.AIConfigs.FirstOrDefaultAsync();
            int countLimit = config?.MaxRecommendations ?? 5;

            var aiRecs = await _aiService.GetRecommendationsAsync(customerId, drinkDtos);
            var result = new List<RecommendationResponseDto>();

            if (aiRecs != null && aiRecs.Count > 0)
            {
                foreach (var rec in aiRecs.Take(countLimit))
                {
                    var drink = drinks.FirstOrDefault(d => d.Id == rec.DrinkId);
                    if (drink != null)
                    {
                        result.Add(new RecommendationResponseDto
                        {
                            DrinkId = drink.Id,
                            DrinkName = drink.Name,
                            Price = drink.Price,
                            DrinkImageUrl = drink.ImageUrl,
                            Category = drink.Category,
                            MatchScore = rec.Score,
                            Reason = rec.Reason
                        });
                    }
                }
            }

            if (result.Count < countLimit)
            {
                var existingIds = result.Select(r => r.DrinkId).ToHashSet();
                var fallbackDrinks = drinks.Where(d => !existingIds.Contains(d.Id)).Take(countLimit - result.Count);

                foreach (var fd in fallbackDrinks)
                {
                    result.Add(new RecommendationResponseDto
                    {
                        DrinkId = fd.Id,
                        DrinkName = fd.Name,
                        Price = fd.Price,
                        DrinkImageUrl = fd.ImageUrl,
                        Category = fd.Category,
                        MatchScore = 0.5,
                        Reason = "Món bán chạy được yêu thích tại quán"
                    });
                }
            }

            return result.OrderByDescending(r => r.MatchScore).ToList();
        }
    }
}
