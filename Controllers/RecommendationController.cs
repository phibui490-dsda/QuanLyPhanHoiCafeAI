using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CAFE_AI.Services;

namespace CAFE_AI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationsController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetRecommendations(int customerId)
        {
            // Security check: Customer can only view their own recommendations unless they are Staff or Manager
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserId != customerId.ToString() && currentUserRole != "Staff" && currentUserRole != "Manager")
            {
                return Forbid();
            }

            var recommendations = await _recommendationService.GetRecommendationsAsync(customerId);
            return Ok(recommendations);
        }
    }
}
