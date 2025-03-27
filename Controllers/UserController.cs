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
                CreatedAt = DateTime.UtcNow,
                IsActive = true

            };

            // Thêm người dùng mới vào cơ sở dữ liệu
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AdminUpdateUser(int id, [FromBody] AdminUserUpdateDto userUpdateDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("Người dùng không tồn tại.");
            }

            var role = await _context.Roles.FindAsync(userUpdateDto.RoleId);
            if (role == null)
            {
                return BadRequest("Vai trò không hợp lệ.");
            }

            user.FullName = userUpdateDto.FullName;
            user.Gender = userUpdateDto.Gender;
            user.DateOfBirth = userUpdateDto.DateOfBirth;
            user.RoleId = userUpdateDto.RoleId;
            user.IsActive = userUpdateDto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật thông tin người dùng thành công." });
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

        [HttpGet("statistics")]
        public async Task<IActionResult> GetUserStatistics()
        {
            var totalUsers = await _context.Users.CountAsync(); // Tổng số người dùng

            var today = DateTime.UtcNow.Date;
            var newUsersToday = await _context.Users.CountAsync(u => u.CreatedAt.Date == today); // Người dùng mới hôm nay

            var activeUsers = await _context.Users.CountAsync(u => u.IsActive); // Người dùng đang hoạt động

            var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
            var usersLastMonth = await _context.Users.CountAsync(u => u.CreatedAt <= oneMonthAgo); // Người dùng từ tháng trước
                                                                                                   // Tính tỷ lệ duy trì
            double retentionRate = usersLastMonth > 0 ? (double)activeUsers / usersLastMonth * 100 : 0;


            return Ok(new
            {
                TotalUsers = totalUsers,
                NewUsersToday = newUsersToday,
                ActiveUsers = activeUsers,
                RetentionRate = retentionRate.ToString("0.00") + "%"
            });
        }
        [HttpGet("growth")]
        public async Task<IActionResult> GetUserGrowth()
        {
            var userGrowth = await _context.Users
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new
                {
                    Month = g.Key.Month,
                    Year = g.Key.Year,
                    Users = g.Count()
                })
                .OrderBy(g => g.Year)
                .ThenBy(g => g.Month)
                .ToListAsync();

            // Chuyển đổi dữ liệu thành format cần thiết
            var formattedData = userGrowth.Select(g => new
            {
                Month = new DateTime(g.Year, g.Month, 1).ToString("MMM"), // "Jan", "Feb", ...
                Users = g.Users
            });

            return Ok(formattedData);
        }


    }
}