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
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var customerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdClaim) || !int.TryParse(customerIdClaim, out var customerId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin khách hàng đăng nhập." });
            }

            var result = await _orderService.CreateOrderAsync(customerId, dto);
            if (result == null)
            {
                return BadRequest(new { message = "Không thể đặt hàng. Giỏ hàng trống hoặc có món ăn không khả dụng." });
            }

            return CreatedAtAction(nameof(GetMyOrders), null, result);
        }

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var customerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdClaim) || !int.TryParse(customerIdClaim, out var customerId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin khách hàng đăng nhập." });
            }

            var orders = await _orderService.GetCustomerOrdersAsync(customerId);
            return Ok(orders);
        }

        [HttpGet]
        [Authorize(Roles = "Staff,Manager,Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Staff,Manager,Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Status))
            {
                return BadRequest(new { message = "Trạng thái đơn hàng không hợp lệ." });
            }

            var result = await _orderService.UpdateOrderStatusAsync(id, dto.Status);
            if (result == null)
            {
                return BadRequest(new { message = "Cập nhật trạng thái thất bại. Vui lòng kiểm tra lại đơn hàng và trạng thái." });
            }

            return Ok(result);
        }
    }
}
