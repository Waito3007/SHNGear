using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Services;
var builder = WebApplication.CreateBuilder(args);

// 🔹 Thêm kết nối SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// Thêm Dịch vụ gửi mail
builder.Services.AddSingleton<EmailService>();
// Đăng ký UserService vào DI container
builder.Services.AddScoped<UserService>();
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
app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
