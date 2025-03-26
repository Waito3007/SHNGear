using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using SHN_Gear.DTOs;
using SHN_Gear.Services;
namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách người dùng
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Include(u => u.Role).ToListAsync();
            return Ok(users);
        }

        // Lấy thông tin người dùng theo Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("Người dùng không tồn tại.");
            }

            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] UserDto userDto, [FromServices] UserService userService)
        {
            // Kiểm tra RoleId có tồn tại trong bảng Roles không
            var role = await _context.Roles.FindAsync(userDto.RoleId);
            if (role == null)
            {
                return BadRequest("Vai trò không tồn tại.");
            }

            // Kiểm tra email đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
            {
                return BadRequest("Email đã được sử dụng.");
            }

            // Mã hóa mật khẩu
            string hashedPassword = userService.HashPassword(userDto.Password);

            // Tạo đối tượng User từ UserDto
            var user = new User
            {
                FullName = userDto.FullName,
                Email = userDto.Email,
                PhoneNumber = userDto.PhoneNumber,
                Password = hashedPassword, // Lưu mật khẩu đã mã hóa
                RoleId = userDto.RoleId,
                CreatedAt = DateTime.UtcNow
            };

            // Thêm người dùng mới vào cơ sở dữ liệu
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // Cập nhật vai trò của người dùng
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleUpdateDto roleUpdateDto)
        {
            if (roleUpdateDto == null || roleUpdateDto.RoleId <= 0)
            {
                return BadRequest("Dữ liệu vai trò không hợp lệ.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("Người dùng không tồn tại.");
            }

            var role = await _context.Roles.FindAsync(roleUpdateDto.RoleId);
            if (role == null)
            {
                return NotFound("Vai trò không tồn tại.");
            }

            user.RoleId = roleUpdateDto.RoleId;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Vai trò người dùng đã được cập nhật thành công." });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var totalUsers = await _context.Users.CountAsync();

            var today = DateTime.UtcNow.Date;
            var newUsersToday = await _context.Users.CountAsync(u => u.CreatedAt.Date == today);

            return Ok(new
            {
                TotalUsers = totalUsers,
                NewUsersToday = newUsersToday
            });
        }
    }
}