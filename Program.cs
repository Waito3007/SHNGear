using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SHN_Gear.Data;
using System.Text.Json.Serialization;
using CloudinaryDotNet;
using SHN_Gear.Services;
using Microsoft.OpenApi.Models;
using SHN_Gear.Middleware;
using SHN_Gear.Configuration;
// using SHN_Gear.Export; // KnowledgeExportService nằm trong SHN_Gear.Services, không cần dòng này

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
EnvironmentConfig.LoadEnvironmentVariables();

builder.Services.AddMemoryCache();

// 🔹 Kết nối SQL Server - sử dụng environment variables
// var connectionString = EnvironmentConfig.GetConnectionString()
//     ?? builder.Configuration.GetConnectionString("DefaultConnection")
//     ?? throw new InvalidOperationException("Database connection string not configured");
// DB cloud 
string dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? "";
string dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "";
string dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "";
string dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";
string dbEncrypt = Environment.GetEnvironmentVariable("DB_ENCRYPT") ?? "True";
string dbTrustServerCertificate = Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE") ?? "True";
string dbMultipleActiveResultSets = Environment.GetEnvironmentVariable("DB_MULTIPLE_ACTIVE_RESULT_SETS") ?? "True";

if (string.IsNullOrWhiteSpace(dbServer) || string.IsNullOrWhiteSpace(dbName) || string.IsNullOrWhiteSpace(dbUser) || string.IsNullOrWhiteSpace(dbPassword))
{
    throw new InvalidOperationException("Database connection environment variables not configured properly.");
}

var connectionString = $"Server={dbServer};Database={dbName};User Id={dbUser};Password={dbPassword};Encrypt={dbEncrypt};TrustServerCertificate={dbTrustServerCertificate};MultipleActiveResultSets={dbMultipleActiveResultSets};";
// DB cloud end
// Debug logging
Console.WriteLine($"Using connection string: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString,
    sqlOptions => sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

// 🔹 Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// 🔹 Các dịch vụ
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddSingleton<PayPalService>();
builder.Services.AddScoped<MoMoPaymentService>();
builder.Services.AddScoped<LoyaltySpinService>();
builder.Services.AddScoped<BlogPostService>();

// 🔹 Repositories
builder.Services.AddScoped(typeof(SHN_Gear.Repositories.IRepository<>), typeof(SHN_Gear.Repositories.Repository<>));
builder.Services.AddScoped<SHN_Gear.Features.Products.IProductRepository, SHN_Gear.Features.Products.ProductRepository>();

// 🔹 Feature Services
builder.Services.AddScoped<SHN_Gear.Features.Products.IProductService, SHN_Gear.Features.Products.ProductService>();

// 🔹 Chat & AI Services
builder.Services.AddScoped<ContextManager>();
builder.Services.AddScoped<KnowledgeBaseService>();
builder.Services.AddScoped<AIService>();

// Đăng ký KnowledgeExportService để export tri thức từ DB
// Ensure KnowledgeExportService exists in your project and the correct namespace is used above.
// If it does not exist, comment out or remove the following line:
// builder.Services.AddScoped<KnowledgeExportService>();
builder.Services.AddScoped<KnowledgeExportService>();
builder.Services.AddScoped<ChatService>();
builder.Services.AddScoped<DatabaseSeeder>();

// 🔹 HttpClient for external API calls
builder.Services.AddHttpClient<GeminiService>();
builder.Services.AddMemoryCache();

// 🔹 SignalR for real-time chat
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
}).AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// 🔹 JWT Authentication - sử dụng environment variables
var jwtKey = EnvironmentConfig.Jwt.SecretKey
    ?? builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key not configured");
var key = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = EnvironmentConfig.Jwt.Issuer ?? builder.Configuration["Jwt:Issuer"],
            ValidAudience = EnvironmentConfig.Jwt.Audience ?? builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };


        // Configure for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                // If the request is for our hub and there's a token, use it
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

// 🔹 CORS Configuration
builder.Services.ConfigureCors(builder.Environment);

// 🔹 Swagger + JWT Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SHN_Gear API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddRazorPages();
// 🔹 JSON vòng lặp
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Ensure UTC DateTimes are serialized with 'Z' suffix for proper timezone handling
        options.JsonSerializerOptions.WriteIndented = false;
        // Default converter will serialize DateTime as ISO 8601 with 'Z' for UTC
    });

builder.Services.AddHttpContextAccessor();
builder.Services.AddRazorPages();

var app = builder.Build();

// 🔹 Unified CORS Middleware - handles ALL CORS scenarios in one place
app.UseMiddleware<UnifiedCorsMiddleware>();

// 🔹 CORS Debug Middleware (development only)
if (app.Environment.IsDevelopment())
{
    app.UseMiddleware<HeaderLoggingMiddleware>();
    app.UseMiddleware<CorsDebugMiddleware>();
}

// Thêm middleware rate limit đơn giản cho API Gemini/chat
app.UseMiddleware<SimpleRateLimitMiddleware>();

// 🔹 Middlewares (đúng thứ tự)
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// 🔹 CORS Configuration
app.UseCorsConfiguration();

app.UseAuthentication();
app.UseAuthorization();

app.UseSession();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDeveloperExceptionPage();

// Tự động export tri thức website ra file JSON khi khởi động (đồng bộ, đảm bảo chắc chắn export xong trước khi app chạy)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var exportService = scope.ServiceProvider.GetService<KnowledgeExportService>();
        if (exportService != null)
        {
            // Đảm bảo export ra đúng thư mục Data ở gốc project
            var projectRoot = AppContext.BaseDirectory;
            while (!string.IsNullOrEmpty(projectRoot) && !File.Exists(Path.Combine(projectRoot, "SHNGear.sln")))
            {
                projectRoot = Directory.GetParent(projectRoot)?.FullName ?? "";
            }
            var dataDir = Path.Combine(projectRoot, "Data");
            if (!Directory.Exists(dataDir)) Directory.CreateDirectory(dataDir);
            var knowledgePath = Path.Combine(dataDir, "WebsiteKnowledgeBase.json");
            exportService.ExportWebsiteKnowledgeBaseAsync(knowledgePath).GetAwaiter().GetResult();
            Console.WriteLine($"[KnowledgeExport] Exported tri thức website ra {knowledgePath}");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[KnowledgeExport] Export failed: {ex.Message}");
}

app.MapControllers();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapFallbackToFile("index.html");

// 🔹 Map SignalR Hub với CORS policy riêng
app.MapHub<SHN_Gear.Hubs.ChatHub>("/chatHub").RequireCors("SignalRPolicy");

// 🔹 Seed database on startup if requested
if (args.Contains("--seed-data"))
{
    using (var scope = app.Services.CreateScope())
    {
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        await seeder.SeedAsync();
        Console.WriteLine("Database seeding completed!");
        return;
    }
}

app.Run();
