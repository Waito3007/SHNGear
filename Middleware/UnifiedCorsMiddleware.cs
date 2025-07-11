using Microsoft.AspNetCore.Http;

namespace SHN_Gear.Middleware
{
    public class UnifiedCorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<UnifiedCorsMiddleware> _logger;

        private readonly string[] _allowedOrigins = {
            "https://localhost:44479",
            "http://localhost:3000",
            "https://localhost:3001", 
            "https://localhost:7107",
            "http://localhost:5067"
        };

        // Comprehensive headers list for all scenarios
        private readonly string _allHeaders = 
            "Content-Type, Authorization, x-requested-with, x-signalr-user-agent, Cache-Control, " +
            "X-Requested-With, Accept, Origin, User-Agent, DNT, Keep-Alive, X-Mx-ReqToken, " +
            "X-CSRF-Token, x-signalr-connection-id, x-signalr-negotiateversion";

        public UnifiedCorsMiddleware(RequestDelegate next, ILogger<UnifiedCorsMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            
            // Only process if there's an origin header
            if (!string.IsNullOrEmpty(origin))
            {
                _logger.LogInformation($"[Unified CORS] Processing: {context.Request.Method} {context.Request.Path} from {origin}");

                // Check if origin is allowed
                if (_allowedOrigins.Contains(origin))
                {
                    // Set comprehensive CORS headers
                    context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    context.Response.Headers["Access-Control-Allow-Headers"] = _allHeaders;
                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH";
                    context.Response.Headers["Access-Control-Max-Age"] = "86400";
                    
                    _logger.LogInformation($"[Unified CORS] Set headers for origin: {origin}");
                }
                else
                {
                    _logger.LogWarning($"[Unified CORS] Origin not allowed: {origin}");
                }

                // Handle preflight requests
                if (context.Request.Method == "OPTIONS")
                {
                    _logger.LogInformation("[Unified CORS] Handling OPTIONS preflight request");
                    context.Response.StatusCode = 200;
                    return;
                }
            }

            await _next(context);
        }
    }
}
