using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SHN_Gear.Services;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;
using SHN_Gear.Configuration;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthController(UserService userService, EmailService emailService, IConfiguration config)
        {
            _userService = userService;
            _emailService = emailService;
            _config = config;
        }

        // Kiểm tra email có tồn tại không
        [HttpPost("check-email")]
        public async Task<IActionResult> CheckEmailExists([FromBody] EmailDto emailDto)
        {
            if (!ModelState.IsValid || string.IsNullOrEmpty(emailDto.Email))
                return BadRequest(new { message = "Email không hợp lệ" });

            bool exists = await _userService.CheckEmailExistsAsync(emailDto.Email);
            return Ok(new { exists });
        }

        // Đăng ký tài khoản
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var result = await _userService.RegisterUserAsync(registerDto);
            if (!result)
                return BadRequest(new { message = "Email đã tồn tại" });

            return Ok(new { message = "Đăng ký thành công" });
        }

        // Đăng nhập bằng Email
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var user = await _userService.AuthenticateUserAsync(loginDto);
            if (user == null)
                return Unauthorized(new { message = "Sai email hoặc mật khẩu" });

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        // Gửi OTP qua Email
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequestDto otpDto)
        {
            if (!ModelState.IsValid || string.IsNullOrEmpty(otpDto.Email))
                return BadRequest(new { message = "Email không hợp lệ" });

            var success = await _emailService.SendOTPAsync(otpDto.Email);
            if (!success)
                return BadRequest(new { message = "Gửi OTP thất bại" });

            return Ok(new { message = "OTP đã được gửi" });
        }
        // 🔹 API lấy thông tin người dùng đang đăng nhập
        [HttpGet("profile")]
        [Authorize]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không tìm thấy ID trong token" });
            }

            var user = _userService.GetUserById(int.Parse(userId));

            if (user == null)
            {
                return NotFound(new { message = "User không tồn tại" });
            }

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.Gender,
                DateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd")
            });
        }
        // 🔹 API chỉnh sửa thông tin cá nhân
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] EditProfileDto editDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var updatedUser = await _userService.UpdateUserProfileAsync(int.Parse(userId), editDto);
            if (updatedUser == null)
                return BadRequest();

            return Ok(new
            {
                updatedUser.Id,
                updatedUser.FullName,
                updatedUser.Email,
                updatedUser.PhoneNumber,
                updatedUser.Gender,
                DateOfBirth = updatedUser.DateOfBirth?.ToString("yyyy-MM-dd")
            });
        }

        // 🔹 API chỉnh sửa thông tin cá nhân
        [HttpPut("profile/{id}")]
        [Authorize]
        public async Task<IActionResult> EditProfile([FromBody] EditProfileDto editDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var updatedUser = await _userService.UpdateUserProfileAsync(int.Parse(userId), editDto);
            if (updatedUser == null)
                return BadRequest();

            return Ok(new
            {
                updatedUser.Id,
                updatedUser.FullName,
                updatedUser.Email,
                updatedUser.PhoneNumber,
                updatedUser.Gender,
                DateOfBirth = updatedUser.DateOfBirth?.ToString("yyyy-MM-dd")
            });
        }



        // Tạo JWT Token
        private string GenerateJwtToken(User user)
        {
            var jwtKey = EnvironmentConfig.Jwt.SecretKey 
                ?? _config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key not configured");
            
            var key = Encoding.UTF8.GetBytes(jwtKey);
            var roleName = user.Role?.Name ?? "User";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                // Chỉ dùng MỘT trong hai cách sau:
                
                new Claim("roleId", user.RoleId.ToString()), // Quan trọng
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
                new Claim("http://schemas.microsoft.com/.../role", user.Role?.Name ?? "User"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: EnvironmentConfig.Jwt.Issuer ?? _config["Jwt:Issuer"],
                audience: EnvironmentConfig.Jwt.Audience ?? _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}