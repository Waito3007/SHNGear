using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using SHN_Gear.DTOs;
using SHN_Gear.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
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
        // Cập nhật thông tin người dùng (Admin)
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
            user.PhoneNumber = userUpdateDto.PhoneNumber;
            user.Email = userUpdateDto.Email;
            user.DateOfBirth = userUpdateDto.DateOfBirth;
            user.RoleId = userUpdateDto.RoleId;
            user.IsActive = userUpdateDto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật thông tin người dùng thành công." });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] EditProfileDto dto)
        {
            // Lấy ID người dùng từ token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "Không xác thực được người dùng" });

            // Tìm người dùng trong database
            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại" });

            // Cập nhật thông tin
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;
            user.Gender = dto.Gender;
            user.DateOfBirth = dto.DateOfBirth;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    Message = "Cập nhật thông tin thành công",
                    User = new
                    {
                        user.FullName,
                        user.Email,
                        user.PhoneNumber,
                        user.Gender,
                        DateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd")
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi cập nhật", Error = ex.Message });
            }
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
        //api lấy role của người dùng hiện tại
        // [HttpGet("current/role")]
        // [Authorize]
        // public async Task<IActionResult> GetCurrentUserRole()
        // {
        //     try
        //     {
        //         // Lấy UserId từ claims trong token
        //         var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        //         if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        //         {
        //             return Unauthorized(new { Message = "Token không hợp lệ - Không xác định được người dùng" });
        //         }

        //         // Lấy thông tin user và role từ database
        //         var userWithRole = await _context.Users
        //             .Where(u => u.Id == userId)
        //             .Select(u => new
        //             {
        //                 UserId = u.Id,
        //                 RoleId = u.Role.Id,
        //                 RoleName = u.Role.Name,
        //                 // Thêm các thông tin cần thiết khác
        //                 Email = u.Email,
        //                 IsActive = u.IsActive
        //             })
        //             .FirstOrDefaultAsync();

        //         if (userWithRole == null)
        //         {
        //             return NotFound(new { Message = "Không tìm thấy thông tin người dùng" });
        //         }

        //         // Tạo response object
        //         var response = new
        //         {
        //             userWithRole.UserId,
        //             userWithRole.Email,
        //             userWithRole.IsActive,
        //             Role = new
        //             {
        //                 userWithRole.RoleId,
        //                 userWithRole.RoleName
        //             },
        //             // Thêm thông tin từ token nếu cần
        //             Claims = new
        //             {
        //                 // Lấy trực tiếp từ claims hiện tại
        //                 RoleClaim = User.FindFirst(ClaimTypes.Role)?.Value,
        //                 MicrosoftRoleClaim = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value
        //             }
        //         };

        //         return Ok(response);
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, new
        //         {
        //             Message = "Lỗi server khi lấy thông tin role",
        //             Error = ex.Message
        //         });
        //     }
        // }
    }
}