using System;
using System.Linq;
using System.Security.Claims;
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
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly IValidator<FeedbackCreateDto> _feedbackValidator;
        private readonly IValidator<FeedbackReplyCreateDto> _replyValidator;

        public FeedbackController(
            IFeedbackService feedbackService,
            IValidator<FeedbackCreateDto> feedbackValidator,
            IValidator<FeedbackReplyCreateDto> replyValidator)
        {
            _feedbackService = feedbackService;
            _feedbackValidator = feedbackValidator;
            _replyValidator = replyValidator;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateDto dto)
        {
            var validationResult = await _feedbackValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var customerId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính khách hàng." });
            }

            var result = await _feedbackService.CreateFeedbackAsync(customerId, dto);
            return CreatedAtAction(nameof(GetFeedbacks), new { sentiment = result.SentimentResult }, result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetFeedbacks([FromQuery] string? sentiment)
        {
            var feedbacks = await _feedbackService.GetFeedbacksAsync(sentiment);
            return Ok(feedbacks);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Staff,Manager,Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] FeedbackStatusUpdateDto dto)
        {
            var result = await _feedbackService.UpdateFeedbackStatusAsync(id, dto.Status);
            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi." });
            }
            return Ok(result);
        }

        [HttpPost("{id}/reply")]
        [Authorize(Roles = "Staff,Manager,Admin")]
        public async Task<IActionResult> ReplyToFeedback(int id, [FromBody] FeedbackReplyCreateDto dto)
        {
            var validationResult = await _replyValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var staffIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(staffIdClaim) || !int.TryParse(staffIdClaim, out var staffId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính nhân viên." });
            }

            var result = await _feedbackService.ReplyToFeedbackAsync(id, staffId, dto);
            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi để trả lời." });
            }

            return Ok(result);
        }
    }
}
