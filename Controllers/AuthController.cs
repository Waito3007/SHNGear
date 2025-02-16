using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System;
using System.Net.Http;
using System.Threading.Tasks;

using Newtonsoft.Json;


namespace SHN_Gear.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;

            // Khởi tạo Firebase chỉ một lần
            if (FirebaseApp.DefaultInstance == null)
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile("ClientApp/assets/firebase_connect/adminsdk.json")
                });
            }
        }

        // 🔹 1️⃣ API Gửi OTP (Tích hợp Firebase)
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);

                if (user == null)
                {
                    // Đăng ký tự động nếu số điện thoại chưa tồn tại
                    user = new User
                    {
                        FullName = "Người dùng mới",
                        PhoneNumber = request.PhoneNumber,
                        Gender = "Khác",
                        DateOfBirth = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        Points = 0,
                        RoleId = 2 // Mặc định VIP 1
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                // 🔥 Gửi OTP qua Firebase Authentication REST API
                var firebaseApiKey = "AIzaSyBdiEVqtxxMFw2FdhHwE7UdRDtwjyrxx70"; // Thay bằng API Key của Firebase
                var client = new HttpClient();
                var requestUri = $"https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key={firebaseApiKey}";

                var requestBody = new
                {
                    phoneNumber = request.PhoneNumber,
                    recaptchaToken = "" // Nếu chưa có reCAPTCHA, có thể thử bỏ trống
                };

                var jsonRequest = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(requestUri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                return Ok(new { Message = "OTP đã được gửi qua SMS", FirebaseResponse = responseString });
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi gửi OTP: {ex.Message}");
            }
        }

        // 🔹 2️⃣ API Xác thực OTP (Firebase)
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
                if (user == null) return BadRequest("Số điện thoại không tồn tại.");

                // Xác minh OTP bằng Firebase
                var signInResult = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.Otp);
                
                if (signInResult == null) return BadRequest("OTP không hợp lệ.");

                // Tạo JWT Token cho người dùng
                var token = GenerateJwtToken(user);

                return Ok(new { Token = token, Message = "Đăng nhập thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi xác thực OTP: {ex.Message}");
            }
        }

        // 🔹 3️⃣ Hàm tạo JWT Token
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("PhoneNumber", user.PhoneNumber),
                new Claim("Role", user.RoleId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // 🔹 4️⃣ Model Request
    public class OtpRequest
    {
        public string PhoneNumber { get; set; }
    }

    public class VerifyOtpRequest
    {
        public string PhoneNumber { get; set; }
        public string Otp { get; set; }
    }
}
