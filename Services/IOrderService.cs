using System.Collections.Generic;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IOrderService
    {
        Task<OrderResponseDto?> CreateOrderAsync(int customerId, OrderCreateDto dto);
        Task<List<OrderResponseDto>> GetCustomerOrdersAsync(int customerId);
        Task<List<OrderResponseDto>> GetAllOrdersAsync();
        Task<OrderResponseDto?> UpdateOrderStatusAsync(int orderId, string status);
    }
}
