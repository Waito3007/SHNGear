using Microsoft.AspNetCore.Http;

namespace SHN_Gear.Middleware
{
    public class GlobalCorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalCorsMiddleware> _logger;

        private readonly string[] _allowedOrigins = {
            "https://localhost:44479",
            "http://localhost:3000",
            "https://localhost:3001", 
            "https://localhost:7107",
            "http://localhost:5067"
        };

        public GlobalCorsMiddleware(RequestDelegate next, ILogger<GlobalCorsMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            var isApiRequest = context.Request.Path.StartsWithSegments("/api");
            var isSignalRRequest = context.Request.Path.StartsWithSegments("/chatHub");
            
            // Log for debugging
            _logger.LogInformation($"[Global CORS] Processing: {context.Request.Method} {context.Request.Path} from {origin}");

            if (!string.IsNullOrEmpty(origin) && _allowedOrigins.Contains(origin))
            {
                // Set CORS headers for all requests
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                
                // Đặt headers khác nhau cho SignalR và API thông thường
                if (isSignalRRequest)
                {
                    context.Response.Headers["Access-Control-Allow-Headers"] = 
                        "Content-Type, Authorization, x-requested-with, x-signalr-user-agent, Cache-Control, X-Requested-With, Accept, Origin, User-Agent, DNT, Keep-Alive";
                }
                else
                {
                    context.Response.Headers["Access-Control-Allow-Headers"] = 
                        "Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With";
                }
                
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD";
                context.Response.Headers["Access-Control-Max-Age"] = "86400"; // 24 hours
                
                _logger.LogInformation($"[Global CORS] Set headers for origin: {origin}");
            }

            // Handle preflight requests
            if (context.Request.Method == "OPTIONS")
            {
                _logger.LogInformation("[Global CORS] Handling OPTIONS preflight request");
                context.Response.StatusCode = 200;
                return;
            }

            await _next(context);
        }
    }
}
