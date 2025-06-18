using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using Microsoft.Extensions.Logging;
using SHN_Gear.Data;
using SHN_Gear.Services;
using System.Globalization;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayPalController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PayPalService _payPalService;
        private readonly ILogger<PayPalController> _logger;
        private const decimal VND_TO_USD_RATE = 25000m;
        private const string CLIENT_URL = "https://localhost:44479";

        public PayPalController(
            AppDbContext context,
            PayPalService payPalService,
            ILogger<PayPalController> logger)
        {
            _context = context;
            _payPalService = payPalService;
            _logger = logger;
        }
        // tạo đơn hàng PayPal
        [HttpPost("create-order")]
        public async Task<ActionResult<PayPalOrderResponse>> CreatePayPalOrder([FromBody] OrderDto orderDto)
        {
            if (orderDto.PaymentMethodId != 3)
            {
                return BadRequest(new { Message = "Invalid payment method. Only PayPal is accepted." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate and create order in database
                var order = await CreateDatabaseOrder(orderDto);
                if (order is null)
                {
                    return BadRequest(new { Message = "Could not create order. Please check your request." });
                }

                // Convert VND to USD (minimum $0.01 USD)
                decimal amountInUSD = Math.Max(order.TotalAmount / VND_TO_USD_RATE, 0.01m);
                amountInUSD = Math.Round(amountInUSD, 2);

                // Create PayPal order
                var payPalOrderId = await _payPalService.CreateOrder(
                    amountInUSD,
                    "USD",
                    $"SHN{order.Id}",
                    $"https://localhost:7107/api/paypal/capture-order?orderId={order.Id}",
                    $"{CLIENT_URL}/payment-canceled?orderId={order.Id}"
                );

                if (string.IsNullOrEmpty(payPalOrderId))
                {
                    throw new Exception("Failed to create PayPal order");
                }

                // Update order with PayPal information
                order.PayPalOrderId = payPalOrderId;
                order.PayPalPaymentUrl = $"https://www.sandbox.paypal.com/checkoutnow?token={payPalOrderId}";
                await _context.SaveChangesAsync();

                // Remove purchased items from cart (if user is authenticated)
                if (orderDto.UserId.HasValue)
                {
                    var productVariantIds = orderDto.OrderItems.Select(oi => oi.ProductVariantId).ToList();

                    var cartItemsToRemove = await _context.CartItems
                        .Where(ci => ci.Cart.UserId == orderDto.UserId.Value &&
                                    productVariantIds.Contains(ci.ProductVariantId))
                        .ToListAsync();

                    if (cartItemsToRemove.Any())
                    {
                        _context.CartItems.RemoveRange(cartItemsToRemove);
                        await _context.SaveChangesAsync();
                    }
                }

                await transaction.CommitAsync();

                return Ok(new PayPalOrderResponse
                {
                    OrderId = order.Id,
                    PayPalOrderId = payPalOrderId,
                    ApprovalUrl = order.PayPalPaymentUrl,
                    TotalAmount = amountInUSD,
                    Currency = "USD",
                    CartItemsRemoved = orderDto.UserId.HasValue
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Failed to create PayPal order");
                return StatusCode(500, new
                {
                    Error = "Payment processing failed",
                    Details = ex.Message
                });
            }
        }

        private async Task<Models.Order?> CreateDatabaseOrder(OrderDto orderDto)
        {
            try
            {
                // Validate user
                if (orderDto.UserId.HasValue &&
                    !await _context.Users.AnyAsync(u => u.Id == orderDto.UserId.Value))
                {
                    return null;
                }

                // Validate product variants
                foreach (var item in orderDto.OrderItems)
                {
                    var variant = await _context.ProductVariants
                        .Include(pv => pv.Product)
                        .FirstOrDefaultAsync(pv => pv.Id == item.ProductVariantId);

                    if (variant is null || variant.StockQuantity < item.Quantity)
                    {
                        return null;
                    }
                }

                // Create order
                var order = new Models.Order
                {
                    UserId = orderDto.UserId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = orderDto.TotalAmount,
                    OrderStatus = "WaitingForPayment",
                    AddressId = orderDto.AddressId,
                    PaymentMethodId = 3, // PayPal
                    VoucherId = orderDto.VoucherId,
                    OrderItems = orderDto.OrderItems.Select(oi => new OrderItem
                    {
                        ProductVariantId = oi.ProductVariantId,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Update stock
                foreach (var item in orderDto.OrderItems)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                    if (variant is not null)
                    {
                        variant.StockQuantity -= item.Quantity;
                    }
                }
                await _context.SaveChangesAsync();

                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create order in database");
                return null;
            }
        }

        [HttpGet("capture-order")]
        public async Task<IActionResult> CaptureOrder([FromQuery] string token, [FromQuery] int orderId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order is null || order.PayPalOrderId != token)
                {
                    return BadRequest(new { Message = "Order not found or invalid PayPal token" });
                }

                var captureResult = await _payPalService.CaptureOrder(token);

                if (!captureResult.Success)
                {
                    order.OrderStatus = "PaymentFailed";
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new RedirectResult($"{CLIENT_URL}/payment-failed?orderId={order.Id}", true);
                }

                // Update order status
                order.OrderStatus = "Paid";
                order.PayPalTransactionId = captureResult.TransactionId;
                order.PayPalResponse = captureResult.RawResponse;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Redirect to payment success page
                var redirectUrl = $"{CLIENT_URL}/payment-success?orderId={order.Id}";
                return new RedirectResult(redirectUrl, true);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Failed to capture PayPal payment for order {orderId}");
                return Redirect($"{CLIENT_URL}/payment-error?message={Uri.EscapeDataString(ex.Message)}");
            }
        }
    }

    public class PayPalOrderResponse
    {
        public int OrderId { get; set; }
        public string PayPalOrderId { get; set; } = null!;
        public string ApprovalUrl { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = null!;
        public bool CartItemsRemoved { get; set; }
    }
}