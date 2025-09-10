using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using PayPalHttp;
using System.Text.Json;
using System.Globalization;
using SHN_Gear.Configuration;

namespace SHN_Gear.Services
{
    public class PayPalService
    {
        private readonly PayPalHttpClient _client;
        private readonly IConfiguration _config;
        private readonly ILogger<PayPalService> _logger;

        public PayPalService(IConfiguration config, ILogger<PayPalService> logger)
        {
            _config = config;
            _logger = logger;

            // Sử dụng environment variables hoặc fallback về appsettings
            var clientId = EnvironmentConfig.PayPal.ClientId ?? _config["PayPal:ClientId"] ?? throw new InvalidOperationException("PayPal ClientId not configured");
            var secret = EnvironmentConfig.PayPal.Secret ?? _config["PayPal:Secret"] ?? throw new InvalidOperationException("PayPal Secret not configured");
            var mode = EnvironmentConfig.PayPal.Mode ?? _config["PayPal:Mode"] ?? "Sandbox";

            PayPalEnvironment environment = mode == "Sandbox"
                ? new SandboxEnvironment(clientId, secret)
                : new LiveEnvironment(clientId, secret);

            _client = new PayPalHttpClient(environment);
        }

        public async Task<string> CreateOrder(
            decimal amount,
            string currency,
            string invoiceId,
            string returnUrl,
            string cancelUrl)
        {
            try
            {
                var amountString = amount.ToString("0.00", CultureInfo.InvariantCulture);
                _logger.LogInformation($"Creating PayPal order with amount: {amountString} {currency}");

                var orderRequest = new OrderRequest()
                {
                    CheckoutPaymentIntent = "CAPTURE", // Sử dụng CheckoutPaymentIntent thay vì Intent
                    PurchaseUnits = new List<PurchaseUnitRequest>
                    {
                        new PurchaseUnitRequest
                        {
                            ReferenceId = "default",
                            InvoiceId = invoiceId,
                            AmountWithBreakdown = new AmountWithBreakdown
                            {
                                CurrencyCode = currency,
                                Value = amountString,
                                AmountBreakdown = new AmountBreakdown
                                {
                                    ItemTotal = new Money
                                    {
                                        CurrencyCode = currency,
                                        Value = amountString
                                    }
                                }
                            }
                        }
                    },
                    ApplicationContext = new ApplicationContext
                    {
                        ReturnUrl = returnUrl,
                        CancelUrl = cancelUrl,
                        BrandName = "SHN Gear",
                        UserAction = "PAY_NOW",
                        ShippingPreference = "NO_SHIPPING"
                    }
                };

                var request = new OrdersCreateRequest();
                request.Prefer("return=representation");
                request.RequestBody(orderRequest);

                var response = await _client.Execute(request);
                var result = response.Result<Order>();

                _logger.LogInformation($"Created PayPal Order ID: {result.Id}");
                return result.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create PayPal order");
                return string.Empty;
            }
        }

        public async Task<PayPalCaptureResult> CaptureOrder(string orderId)
        {
            try
            {
                _logger.LogInformation($"Attempting to capture PayPal order: {orderId}");
                
                var request = new OrdersCaptureRequest(orderId);
                request.RequestBody(new OrderActionRequest());
                request.Prefer("return=representation");

                var response = await _client.Execute(request);
                var result = response.Result<Order>();

                var transactionId = result.PurchaseUnits?[0]?.Payments?.Captures?[0]?.Id;
                _logger.LogInformation($"Successfully captured PayPal Order: {orderId}, Transaction ID: {transactionId}, Status: {result.Status}");

                return new PayPalCaptureResult
                {
                    Success = result.Status == "COMPLETED",
                    TransactionId = transactionId,
                    RawResponse = System.Text.Json.JsonSerializer.Serialize(result)
                };
            }
            catch (PayPalHttp.HttpException httpEx)
            {
                _logger.LogError(httpEx, $"PayPal HTTP error when capturing order {orderId}: {httpEx.Message}");
                
                // Parse error details from PayPal response
                var errorDetails = "";
                try
                {
                    // Use Headers or Message for error information since ResponseBody may not be available
                    errorDetails = httpEx.Message;
                }
                catch (Exception parseEx)
                {
                    _logger.LogWarning(parseEx, "Failed to parse PayPal error response");
                }

                return new PayPalCaptureResult
                {
                    Success = false,
                    ErrorMessage = $"PayPal HTTP Error: {httpEx.Message}. Details: {errorDetails}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error when capturing PayPal order {orderId}");
                return new PayPalCaptureResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }
    }

    public class PayPalCaptureResult
    {
        public bool Success { get; set; }
        public string? TransactionId { get; set; }
        public string? RawResponse { get; set; }
        public string? ErrorMessage { get; set; }
    }
}