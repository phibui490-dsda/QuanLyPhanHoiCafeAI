using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using CAFE_AI.DTOs;
using CAFE_AI.Services;

namespace CAFE_AI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager,Admin")]
    public class AIConfigController : ControllerBase
    {
        private readonly IAIConfigService _aiConfigService;
        private readonly IValidator<AIConfigDto> _configValidator;

        public AIConfigController(IAIConfigService aiConfigService, IValidator<AIConfigDto> configValidator)
        {
            _aiConfigService = aiConfigService;
            _configValidator = configValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfig()
        {
            var config = await _aiConfigService.GetConfigAsync();
            return Ok(config);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateConfig([FromBody] AIConfigDto dto)
        {
            var validationResult = await _configValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var config = await _aiConfigService.UpdateConfigAsync(dto);
            return Ok(config);
        }
    }
}
