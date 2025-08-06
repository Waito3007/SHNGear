using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace SHN_Gear.Middleware
{
    public class SimpleRateLimitMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly int _limit;
        private readonly TimeSpan _period;

        public SimpleRateLimitMiddleware(RequestDelegate next, IMemoryCache cache, int limit = 10, int seconds = 60)
        {
            _next = next;
            _cache = cache;
            _limit = limit;
            _period = TimeSpan.FromSeconds(seconds);
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";
            if (path.Contains("/api/chat") || path.Contains("/api/gemini"))
            {
                var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var key = $"rl:{ip}";
                var count = _cache.GetOrCreate(key, entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = _period;
                    return 0;
                });
                if (count >= _limit)
                {
                    context.Response.StatusCode = 429;
                    await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
                    return;
                }
                _cache.Set(key, count + 1, _period);
            }
            await _next(context);
        }
    }
}
