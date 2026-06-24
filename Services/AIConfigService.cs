using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CAFE_AI.Data;
using CAFE_AI.DTOs;
using CAFE_AI.Models;

namespace CAFE_AI.Services
{
    public class AIConfigService : IAIConfigService
    {
        private readonly AppDbContext _context;

        public AIConfigService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AIConfigDto> GetConfigAsync()
        {
            var config = await _context.AIConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new AIConfig
                {
                    Id = 1,
                    AiServiceUrl = "http://127.0.0.1:8000",
                    SentimentThreshold = 0.5,
                    MaxRecommendations = 5
                };
                _context.AIConfigs.Add(config);
                await _context.SaveChangesAsync();
            }

            return new AIConfigDto
            {
                AiServiceUrl = config.AiServiceUrl,
                SentimentThreshold = config.SentimentThreshold,
                MaxRecommendations = config.MaxRecommendations
            };
        }

        public async Task<AIConfigDto> UpdateConfigAsync(AIConfigDto dto)
        {
            var config = await _context.AIConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new AIConfig { Id = 1 };
                _context.AIConfigs.Add(config);
            }

            config.AiServiceUrl = dto.AiServiceUrl;
            config.SentimentThreshold = dto.SentimentThreshold;
            config.MaxRecommendations = dto.MaxRecommendations;

            await _context.SaveChangesAsync();

            return new AIConfigDto
            {
                AiServiceUrl = config.AiServiceUrl,
                SentimentThreshold = config.SentimentThreshold,
                MaxRecommendations = config.MaxRecommendations
            };
        }
    }
}
