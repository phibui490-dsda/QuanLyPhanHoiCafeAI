using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CAFE_AI.Data;
using CAFE_AI.DTOs;
using CAFE_AI.Models;

namespace CAFE_AI.Services
{
    public class MenuService : IMenuService
    {
        private readonly AppDbContext _context;

        public MenuService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DrinkDto>> GetMenuAsync()
        {
            var drinks = await _context.Drinks.ToListAsync();
            // Optional: calculate average rating per drink by joining feedbacks if performance is ok
            var feedbackGroups = await _context.Feedbacks.GroupBy(f => f.DrinkId)
                .Select(g => new { DrinkId = g.Key, Avg = g.Average(f => f.Rating) })
                .ToDictionaryAsync(g => g.DrinkId, g => g.Avg);

            return drinks.Select(d => {
                var dto = MapToDto(d);
                dto.AverageRating = feedbackGroups.GetValueOrDefault(d.Id, 0.0);
                return dto;
            }).ToList();
        }

        public async Task<DrinkDto?> GetDrinkByIdAsync(int id)
        {
            var drink = await _context.Drinks.FindAsync(id);
            if (drink == null) return null;
            
            var avg = await _context.Feedbacks.Where(f => f.DrinkId == id).Select(f => (double?)f.Rating).AverageAsync() ?? 0.0;
            var dto = MapToDto(drink);
            dto.AverageRating = avg;
            return dto;
        }

        public async Task<DrinkDto> CreateDrinkAsync(DrinkCreateUpdateDto dto)
        {
            var drink = new Drink
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                IsAvailable = dto.IsAvailable,
                Category = dto.Category
            };

            _context.Drinks.Add(drink);
            await _context.SaveChangesAsync();

            return MapToDto(drink);
        }

        public async Task<DrinkDto?> UpdateDrinkAsync(int id, DrinkCreateUpdateDto dto)
        {
            var drink = await _context.Drinks.FindAsync(id);
            if (drink == null) return null;

            drink.Name = dto.Name;
            drink.Description = dto.Description;
            drink.Price = dto.Price;
            drink.ImageUrl = dto.ImageUrl;
            drink.IsAvailable = dto.IsAvailable;
            drink.Category = dto.Category;

            await _context.SaveChangesAsync();
            return MapToDto(drink);
        }

        public async Task<bool> DeleteDrinkAsync(int id)
        {
            var drink = await _context.Drinks.FindAsync(id);
            if (drink == null) return false;

            _context.Drinks.Remove(drink);
            await _context.SaveChangesAsync();
            return true;
        }

        private static DrinkDto MapToDto(Drink d)
        {
            return new DrinkDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Price = d.Price,
                ImageUrl = d.ImageUrl,
                IsAvailable = d.IsAvailable,
                Category = d.Category,
                AverageRating = 0.0
            };
        }
    }
}
