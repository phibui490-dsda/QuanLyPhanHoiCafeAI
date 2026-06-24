using System.Collections.Generic;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IMenuService
    {
        Task<List<DrinkDto>> GetMenuAsync();
        Task<DrinkDto?> GetDrinkByIdAsync(int id);
        Task<DrinkDto> CreateDrinkAsync(DrinkCreateUpdateDto dto);
        Task<DrinkDto?> UpdateDrinkAsync(int id, DrinkCreateUpdateDto dto);
        Task<bool> DeleteDrinkAsync(int id);
    }
}
