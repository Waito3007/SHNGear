using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/roles")]
    public class RoleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoleController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách vai trò
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles.ToListAsync();
            return Ok(roles);
        }

        // Thêm vai trò mới
        [HttpPost]
        public async Task<IActionResult> AddRole([FromBody] Role role)
        {
            if (string.IsNullOrWhiteSpace(role.Name))
            {
                return BadRequest("Tên vai trò không được để trống.");
            }

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            // Tìm vai trò theo Id
            var role = await _context.Roles.Include(r => r.Users).FirstOrDefaultAsync(r => r.Id == id);
            if (role == null)
            {
                return NotFound("Vai trò không tồn tại.");
            }

            // Kiểm tra nếu vai trò đang được sử dụng bởi bất kỳ người dùng nào
            if (role.Users.Any())
            {
                return BadRequest("Không thể xóa vai trò vì đang được sử dụng bởi người dùng.");
            }

            // Xóa vai trò
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Vai trò đã được xóa thành công." });
        }
    }
}