using Microsoft.AspNetCore.Http;

namespace SHN_Gear.Middleware
{
    public class SignalRCorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SignalRCorsMiddleware> _logger;

        private readonly string[] _allowedOrigins = {
            "https://localhost:44479",
            "http://localhost:3000",
            "https://localhost:3001", 
            "https://localhost:7107",
            "http://localhost:5067"
        };

        public SignalRCorsMiddleware(RequestDelegate next, ILogger<SignalRCorsMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Chỉ xử lý requests đến SignalR Hub
            if (context.Request.Path.StartsWithSegments("/chatHub"))
            {
                var origin = context.Request.Headers["Origin"].ToString();
                
                _logger.LogInformation($"[SignalR CORS] Processing request: {context.Request.Method} {context.Request.Path} from {origin}");

                if (!string.IsNullOrEmpty(origin) && _allowedOrigins.Contains(origin))
                {
                    // Đặt headers CORS cho SignalR với tất cả headers cần thiết
                    context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    context.Response.Headers["Access-Control-Allow-Headers"] = 
                        "Content-Type, Authorization, x-requested-with, x-signalr-user-agent, Cache-Control, X-Requested-With, Accept, Origin, User-Agent, DNT, Keep-Alive, X-Mx-ReqToken, X-CSRF-Token";
                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH";
                    context.Response.Headers["Access-Control-Max-Age"] = "86400"; // 24 hours
                    
                    _logger.LogInformation($"[SignalR CORS] Headers set for origin: {origin}");
                }
                else if (!string.IsNullOrEmpty(origin))
                {
                    _logger.LogWarning($"[SignalR CORS] Origin not allowed: {origin}");
                }

                // Xử lý preflight requests
                if (context.Request.Method == "OPTIONS")
                {
                    _logger.LogInformation("[SignalR CORS] Handling OPTIONS preflight request");
                    context.Response.StatusCode = 200;
                    return;
                }
            }

            await _next(context);
        }
    }
}
