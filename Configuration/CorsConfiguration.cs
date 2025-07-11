using Microsoft.AspNetCore.Cors.Infrastructure;

namespace SHN_Gear.Configuration
{
    public static class CorsConfiguration
    {
        public static void ConfigureCors(this IServiceCollection services, IWebHostEnvironment environment)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    var allowedOrigins = new[]
                    {
                        "https://localhost:44479",
                        "http://localhost:3000", 
                        "https://localhost:3001",
                        "https://localhost:7107",
                        "http://localhost:5067"
                    };

                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials()
                          .SetPreflightMaxAge(TimeSpan.FromSeconds(2520)); // Cache preflight for 42 minutes
                });

                // Policy riêng cho SignalR với cấu hình tối ưu
                options.AddPolicy("SignalRPolicy", policy =>
                {
                    var allowedOrigins = new[]
                    {
                        "https://localhost:44479",
                        "http://localhost:3000", 
                        "https://localhost:3001",
                        "https://localhost:7107",
                        "http://localhost:5067"
                    };

                    policy.WithOrigins(allowedOrigins)
                          .WithHeaders("Content-Type", "Authorization", "x-requested-with", "x-signalr-user-agent", 
                                     "Cache-Control", "X-Requested-With", "Accept", "Origin", "User-Agent", "DNT", "Keep-Alive")
                          .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                          .AllowCredentials()
                          .SetPreflightMaxAge(TimeSpan.FromSeconds(2520));
                });
            });
        }

        public static void UseCorsConfiguration(this WebApplication app)
        {
            // Custom CORS middleware để xử lý SignalR headers
            app.Use(async (context, next) =>
            {
                var origin = context.Request.Headers["Origin"].ToString();
                var isSignalRRequest = context.Request.Path.StartsWithSegments("/chatHub");
                
                if (!string.IsNullOrEmpty(origin))
                {
                    // Kiểm tra nếu origin được phép
                    var allowedOrigins = new[]
                    {
                        "https://localhost:44479",
                        "http://localhost:3000", 
                        "https://localhost:3001",
                        "https://localhost:7107",
                        "http://localhost:5067"
                    };

                    if (allowedOrigins.Contains(origin))
                    {
                        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                        
                        // Đặc biệt xử lý headers cho SignalR
                        if (isSignalRRequest)
                        {
                            context.Response.Headers["Access-Control-Allow-Headers"] = 
                                "Content-Type, Authorization, x-requested-with, x-signalr-user-agent, Cache-Control";
                        }
                        else
                        {
                            context.Response.Headers["Access-Control-Allow-Headers"] = "*";
                        }
                        
                        context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
                        context.Response.Headers["Access-Control-Max-Age"] = "2520";
                    }
                }

                // Xử lý preflight requests
                if (context.Request.Method == "OPTIONS")
                {
                    context.Response.StatusCode = 200;
                    return;
                }

                await next();
            });

            app.UseCors("AllowFrontend");

            // CORS logging cho debugging
            if (app.Environment.IsDevelopment())
            {
                app.Use(async (context, next) =>
                {
                    var origin = context.Request.Headers["Origin"].ToString();
                    var method = context.Request.Method;
                    var path = context.Request.Path;
                    var headers = string.Join(", ", context.Request.Headers.Keys);
                    
                    Console.WriteLine($"[CORS] {method} {path} from {origin}");
                    Console.WriteLine($"[CORS] Headers: {headers}");
                    
                    await next();
                });
            }
        }
    }
}
