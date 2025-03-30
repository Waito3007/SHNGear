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
        [Authorize] // Bắt buộc đăng nhập
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
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role?.Name
            });
        }
        // 🔹 API chỉnh sửa thông tin cá nhân
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> EditProfile([FromBody] EditProfileDto editDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không tìm thấy ID trong token" });
            }

            var updatedUser = await _userService.UpdateUserProfileAsync(int.Parse(userId), editDto);
            if (updatedUser == null)
            {
                return BadRequest(new { message = "Cập nhật thất bại" });
            }

            return Ok(new
            {
                message = "Cập nhật thông tin thành công",
                user = new
                {
                    Id = updatedUser.Id,
                    FullName = updatedUser.FullName,
                    Email = updatedUser.Email
                }
            });
        }

        [HttpPut("profile/{id}")]
        [Authorize]
        public async Task<IActionResult> EditProfile(int id, [FromBody] EditProfileDto editDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Chuyển đổi userId từ string sang int và so sánh
            if (string.IsNullOrEmpty(userId) || int.Parse(userId) != id)
            {
                return Unauthorized(new { message = "Bạn không có quyền chỉnh sửa thông tin người dùng này" });
            }

            var updatedUser = await _userService.UpdateUserProfileAsync(id, editDto);
            if (updatedUser == null)
            {
                return BadRequest(new { message = "Cập nhật thất bại" });
            }

            return Ok(new
            {
                message = "Cập nhật thông tin thành công",
                user = new
                {
                    Id = updatedUser.Id,
                    FullName = updatedUser.FullName,
                    Email = updatedUser.Email,
                    PhoneNumber = updatedUser.PhoneNumber,
                    Gender = updatedUser.Gender,
                    AvatarUrl = updatedUser.AvatarUrl,
                    DateOfBirth = updatedUser.DateOfBirth
                }
            });
        }

        // Tạo JWT Token
        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
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
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
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