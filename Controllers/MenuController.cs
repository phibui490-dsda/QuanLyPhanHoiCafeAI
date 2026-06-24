using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using FluentValidation;
using CAFE_AI.DTOs;
using CAFE_AI.Services;

namespace CAFE_AI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;
        private readonly IValidator<DrinkCreateUpdateDto> _drinkValidator;
        private readonly IWebHostEnvironment _env;

        public MenuController(IMenuService menuService, IValidator<DrinkCreateUpdateDto> drinkValidator, IWebHostEnvironment env)
        {
            _menuService = menuService;
            _drinkValidator = drinkValidator;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetMenu()
        {
            var menu = await _menuService.GetMenuAsync();
            return Ok(menu);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDrink(int id)
        {
            var drink = await _menuService.GetDrinkByIdAsync(id);
            if (drink == null) return NotFound(new { message = "Không tìm thấy đồ uống." });
            return Ok(drink);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> CreateDrink([FromBody] DrinkCreateUpdateDto dto)
        {
            var validationResult = await _drinkValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var drink = await _menuService.CreateDrinkAsync(dto);
            return CreatedAtAction(nameof(GetDrink), new { id = drink.Id }, drink);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateDrink(int id, [FromBody] DrinkCreateUpdateDto dto)
        {
            var validationResult = await _drinkValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var drink = await _menuService.UpdateDrinkAsync(id, dto);
            if (drink == null) return NotFound(new { message = "Không tìm thấy đồ uống để cập nhật." });
            return Ok(drink);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> DeleteDrink(int id)
        {
            var result = await _menuService.DeleteDrinkAsync(id);
            if (!result) return NotFound(new { message = "Không tìm thấy đồ uống để xóa." });
            return NoContent();
        }

        [HttpPost("upload-image")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Không có file nào được tải lên." });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Định dạng file không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, GIF, WEBP." });
            }

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/{fileName}";
            return Ok(new { imageUrl });
        }
    }
}
