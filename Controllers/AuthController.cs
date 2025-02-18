using Microsoft.AspNetCore.Mvc;
using SHN_Gear.Models;
using SHN_Gear.Services;
using SHN_Gear.Models.DTOs;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly EmailService _emailService;
        private readonly UserService _userService;

        public AuthController(EmailService emailService, UserService userService)
        {
            _emailService = emailService;
            _userService = userService;
        }

        // Đăng ký tài khoản
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.FullName))
            {
                return BadRequest("Email và họ tên không được để trống.");
            }

            var userExists = await _userService.UserExistsByEmailAsync(request.Email);
            if (userExists)
            {
                return BadRequest("Email đã tồn tại.");
            }

            var newUser = new User
            {
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth,
                Email = request.Email,
                CreatedAt = DateTime.UtcNow,
                Points = 0,
                RoleId = 1 // Giả sử mặc định là User
            };

            var result = await _userService.CreateUserAsync(newUser);
            if (result)
            {
                // Gửi OTP sau khi đăng ký thành công
                await _emailService.SendOTPAsync(request.Email);
                return Ok(new { message = "Đăng ký thành công, mã OTP đã được gửi đến email." });
            }

            return StatusCode(500, "Không thể tạo tài khoản.");
        }

        // Đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.OtpCode))
            {
                return BadRequest("Email và OTP không được để trống.");
            }

            var user = await _userService.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                return NotFound("Người dùng không tồn tại.");
            }

            // Kiểm tra OTP
            if (user.OtpCode == request.OtpCode && user.OtpExpiry > DateTime.UtcNow)
            {
                return Ok(new { message = "Đăng nhập thành công!" });
            }

            return BadRequest("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        // Xác thực và gửi OTP mới
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound("Người dùng không tồn tại.");
            }

            await _emailService.SendOTPAsync(email);
            return Ok(new { message = "Mã OTP đã được gửi lại." });
        }
    }
}
