using Microsoft.AspNetCore.Http;

namespace SHN_Gear.Middleware
{
    public class HeaderLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<HeaderLoggingMiddleware> _logger;

        public HeaderLoggingMiddleware(RequestDelegate next, ILogger<HeaderLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only log SignalR related requests for debugging
            if (context.Request.Path.StartsWithSegments("/chatHub"))
            {
                _logger.LogInformation($"[Header Logging] Request: {context.Request.Method} {context.Request.Path}");
                _logger.LogInformation($"[Header Logging] Query: {context.Request.QueryString}");
                
                // Log all request headers
                foreach (var header in context.Request.Headers)
                {
                    _logger.LogInformation($"[Header Logging] Request Header: {header.Key} = {header.Value}");
                }
            }

            await _next(context);

            // Log response headers for SignalR requests
            if (context.Request.Path.StartsWithSegments("/chatHub"))
            {
                _logger.LogInformation($"[Header Logging] Response Status: {context.Response.StatusCode}");
                
                foreach (var header in context.Response.Headers)
                {
                    _logger.LogInformation($"[Header Logging] Response Header: {header.Key} = {header.Value}");
                }
            }
        }
    }
}
