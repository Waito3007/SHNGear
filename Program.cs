using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FirebaseAdmin;
using SHN_Gear.Data; // Thay YourNamespace bằng namespace của bạn
using Google.Apis.Auth.OAuth2;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Thêm kết nối SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// Kiểm tra kết nối đến database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
try
{
    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();
        Console.WriteLine("✅ Kết nối đến database thành công!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Lỗi kết nối database: {ex.Message}");
}

// Thêm JWT Authentication
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });
//firebase
var firebasePath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp/src/assets/firebase_connect/adminsdk.json");

if (!File.Exists(firebasePath))
{
    Console.WriteLine($"❌ Không tìm thấy file: {firebasePath}");
}
else
{
    Console.WriteLine($"✅ Đã tìm thấy file: {firebasePath}");
    FirebaseApp.Create(new AppOptions
    {
        Credential = GoogleCredential.FromFile(firebasePath)
    });
}

// Thêm Swagger ( kiểm thử api)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Add services to the container.
builder.Services.AddControllersWithViews();
var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
// Cấu hình Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//
// Cấu hình Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//
app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
