using System.Collections.Generic;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto?> LoginAsync(LoginDto dto);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<bool> UpdateUserRoleAsync(int userId, string role);
        Task<string?> DeleteUserAsync(int userId, int currentAdminId);
    }
}
