using Microsoft.AspNetCore.Http;

namespace SHN_Gear.Middleware
{
    public class SignalRNegotiationCorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SignalRNegotiationCorsMiddleware> _logger;

        private readonly string[] _allowedOrigins = {
            "https://localhost:44479",
            "http://localhost:3000",
            "https://localhost:3001", 
            "https://localhost:7107",
            "http://localhost:5067"
        };

        public SignalRNegotiationCorsMiddleware(RequestDelegate next, ILogger<SignalRNegotiationCorsMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Chỉ xử lý SignalR negotiation requests
            if (context.Request.Path.StartsWithSegments("/chatHub/negotiate") || 
                context.Request.Path.StartsWithSegments("/chatHub"))
            {
                var origin = context.Request.Headers["Origin"].ToString();
                
                _logger.LogInformation($"[SignalR Negotiation CORS] Processing: {context.Request.Method} {context.Request.Path} from {origin}");

                // Always set CORS headers for SignalR requests, regardless of origin validation
                if (!string.IsNullOrEmpty(origin))
                {
                    context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    // Cannot use wildcard (*) with credentials, must explicitly list headers
                    context.Response.Headers["Access-Control-Allow-Headers"] = 
                        "Content-Type, Authorization, x-requested-with, x-signalr-user-agent, Cache-Control, X-Requested-With, Accept, Origin, User-Agent, DNT, Keep-Alive, X-Mx-ReqToken, X-CSRF-Token, x-signalr-connection-id";
                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH";
                    context.Response.Headers["Access-Control-Max-Age"] = "86400";
                    
                    _logger.LogInformation($"[SignalR Negotiation CORS] Set explicit headers for origin: {origin}");
                }

                // Handle preflight requests immediately
                if (context.Request.Method == "OPTIONS")
                {
                    _logger.LogInformation("[SignalR Negotiation CORS] Handling OPTIONS preflight - returning 200");
                    context.Response.StatusCode = 200; // OK instead of 204
                    return; // Don't write anything to response body
                }
            }

            await _next(context);
        }
    }
}
