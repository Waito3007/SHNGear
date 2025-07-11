using Microsoft.AspNetCore.Http;

namespace SHN_Gear.Middleware
{
    public class CorsDebugMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CorsDebugMiddleware> _logger;

        public CorsDebugMiddleware(RequestDelegate next, ILogger<CorsDebugMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Log detailed information about CORS requests
            if (context.Request.Headers.ContainsKey("Origin"))
            {
                var origin = context.Request.Headers["Origin"].ToString();
                var method = context.Request.Method;
                var path = context.Request.Path;
                var userAgent = context.Request.Headers["User-Agent"].ToString();
                
                _logger.LogInformation($"[CORS DEBUG] {method} {path} from origin: {origin}");
                _logger.LogInformation($"[CORS DEBUG] User-Agent: {userAgent}");
                
                // Log all headers for debugging
                var headers = string.Join(", ", context.Request.Headers.Keys);
                _logger.LogInformation($"[CORS DEBUG] All headers: {headers}");
                
                // Check for specific problematic headers
                if (context.Request.Headers.ContainsKey("x-requested-with"))
                {
                    var xRequestedWith = context.Request.Headers["x-requested-with"].ToString();
                    _logger.LogWarning($"[CORS DEBUG] x-requested-with header found: {xRequestedWith}");
                }
            }

            await _next(context);

            // Log response headers
            if (context.Request.Headers.ContainsKey("Origin"))
            {
                var responseHeaders = string.Join(", ", context.Response.Headers.Keys);
                _logger.LogInformation($"[CORS DEBUG] Response headers: {responseHeaders}");
                
                if (context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
                {
                    var allowOrigin = context.Response.Headers["Access-Control-Allow-Origin"].ToString();
                    _logger.LogInformation($"[CORS DEBUG] Access-Control-Allow-Origin: {allowOrigin}");
                }
            }
        }
    }
}
