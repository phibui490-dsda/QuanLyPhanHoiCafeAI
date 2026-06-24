using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CAFE_AI.Data;
using CAFE_AI.DTOs;
using CAFE_AI.Models;

namespace CAFE_AI.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<OrderResponseDto?> CreateOrderAsync(int customerId, OrderCreateDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
            {
                return null;
            }

            // Get customer details
            var customer = await _context.Users.FindAsync(customerId);
            if (customer == null) return null;

            // Fetch drink details to get prices
            var drinkIds = dto.Items.Select(i => i.DrinkId).Distinct().ToList();
            var drinks = await _context.Drinks.Where(d => drinkIds.Contains(d.Id) && d.IsAvailable).ToListAsync();
            
            if (drinks.Count == 0) return null;

            var order = new Order
            {
                CustomerId = customerId,
                PaymentMethod = dto.PaymentMethod,
                Status = "Pending", // Default status
                CreatedAt = DateTime.UtcNow
            };

            decimal total = 0;
            var orderItems = new List<OrderItem>();

            foreach (var itemDto in dto.Items)
            {
                var drink = drinks.FirstOrDefault(d => d.Id == itemDto.DrinkId);
                if (drink == null) continue; // Skip if drink is unavailable or non-existent

                var orderItem = new OrderItem
                {
                    DrinkId = drink.Id,
                    Drink = drink,
                    Quantity = itemDto.Quantity,
                    Price = drink.Price // Capture price at purchase time
                };

                total += drink.Price * itemDto.Quantity;
                orderItems.Add(orderItem);
            }

            if (orderItems.Count == 0) return null;

            order.TotalPrice = total;
            order.OrderItems = orderItems;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return MapToResponse(order, customer);
        }

        public async Task<List<OrderResponseDto>> GetCustomerOrdersAsync(int customerId)
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(o => MapToResponse(o, o.Customer!)).ToList();
        }

        public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(o => MapToResponse(o, o.Customer!)).ToList();
        }

        public async Task<OrderResponseDto?> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Drink)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return null;

            // Valid status check: Pending, Processing, Completed, Cancelled
            if (status != "Pending" && status != "Processing" && status != "Completed" && status != "Cancelled")
            {
                return null;
            }

            order.Status = status;
            await _context.SaveChangesAsync();

            return MapToResponse(order, order.Customer!);
        }

        private OrderResponseDto MapToResponse(Order order, User customer)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = customer.FullName,
                CustomerEmail = customer.Email,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    Id = oi.Id,
                    DrinkId = oi.DrinkId,
                    DrinkName = oi.Drink?.Name ?? "Sản phẩm đã ẩn",
                    DrinkImageUrl = oi.Drink?.ImageUrl ?? "",
                    Category = oi.Drink?.Category ?? "",
                    Price = oi.Price,
                    Quantity = oi.Quantity
                }).ToList()
            };
        }
    }
}
