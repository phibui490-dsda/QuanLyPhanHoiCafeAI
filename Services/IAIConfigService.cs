using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IAIConfigService
    {
        Task<AIConfigDto> GetConfigAsync();
        Task<AIConfigDto> UpdateConfigAsync(AIConfigDto dto);
    }
}
