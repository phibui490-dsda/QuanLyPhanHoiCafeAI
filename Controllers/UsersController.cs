using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CAFE_AI.DTOs;
using CAFE_AI.Services;

namespace CAFE_AI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UsersController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Role))
            {
                return BadRequest(new { message = "Vai trò không hợp lệ." });
            }

            // Validate that the role is one of the valid roles
            if (dto.Role != "Customer" && dto.Role != "Staff" && dto.Role != "Manager" && dto.Role != "Admin")
            {
                return BadRequest(new { message = "Vai trò phải là Customer, Staff, Manager, hoặc Admin." });
            }

            var currentUserIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(currentUserIdClaim, out var currentUserId) && currentUserId == id)
            {
                return BadRequest(new { message = "Bạn không thể tự thay đổi vai trò của chính mình." });
            }

            var result = await _authService.UpdateUserRoleAsync(id, dto.Role);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            return Ok(new { message = "Cập nhật vai trò người dùng thành công." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var currentUserIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(currentUserIdClaim, out var currentUserId))
            {
                return Unauthorized(new { message = "Không thể xác định quản trị viên hiện tại." });
            }

            var error = await _authService.DeleteUserAsync(id, currentUserId);
            if (error != null)
            {
                return BadRequest(new { message = error });
            }

            return Ok(new { message = "Xóa người dùng thành công." });
        }
    }
}
