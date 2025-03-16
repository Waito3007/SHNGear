using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/vouchers")]
    public class VoucherController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VoucherController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách tất cả các voucher
        [HttpGet]
        public async Task<IActionResult> GetAllVouchers()
        {
            var vouchers = await _context.Vouchers
                .Select(v => new VoucherDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    DiscountAmount = v.DiscountAmount,
                    ExpiryDate = v.ExpiryDate,
                    IsActive = v.IsActive
                })
                .ToListAsync();

            return Ok(vouchers);
        }

        // Lấy thông tin chi tiết của một voucher
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoucherById(int id)
        {
            var voucher = await _context.Vouchers
                .Where(v => v.Id == id)
                .Select(v => new VoucherDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    DiscountAmount = v.DiscountAmount,
                    ExpiryDate = v.ExpiryDate,
                    IsActive = v.IsActive
                })
                .FirstOrDefaultAsync();

            if (voucher == null)
            {
                return NotFound("Voucher không tồn tại.");
            }

            return Ok(voucher);
        }

        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetVoucherByCode(string code)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
            if (voucher == null)
            {
                return NotFound("Voucher không tồn tại.");
            }

            return Ok(new { id = voucher.Id });
        }

        // Thêm mới một voucher
        [HttpPost]
        public async Task<IActionResult> AddVoucher([FromBody] VoucherDto dto)
        {
            var voucher = new Voucher
            {
                Code = dto.Code,
                DiscountAmount = dto.DiscountAmount,
                ExpiryDate = dto.ExpiryDate,
                IsActive = dto.IsActive
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Voucher đã được thêm.", VoucherId = voucher.Id });
        }

        // Cập nhật thông tin của một voucher
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] VoucherDto dto)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
            {
                return NotFound("Voucher không tồn tại.");
            }

            voucher.Code = dto.Code;
            voucher.DiscountAmount = dto.DiscountAmount;
            voucher.ExpiryDate = dto.ExpiryDate;
            voucher.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Voucher đã được cập nhật." });
        }

        // Xóa một voucher
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
            {
                return NotFound("Voucher không tồn tại.");
            }

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Voucher đã được xóa." });
        }

        // Gán voucher cho người dùng
        [HttpPost("assign")]
        public async Task<IActionResult> AssignVoucherToUser([FromBody] UserVoucherDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return NotFound("Người dùng không tồn tại.");
            }

            var voucher = await _context.Vouchers.FindAsync(dto.VoucherId);
            if (voucher == null)
            {
                return NotFound("Voucher không tồn tại.");
            }

            var userVoucher = new UserVoucher
            {
                UserId = dto.UserId,
                VoucherId = dto.VoucherId,
                UsedAt = dto.UsedAt
            };

            _context.UserVouchers.Add(userVoucher);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Voucher đã được gán cho người dùng." });
        }

        // Áp dụng voucher
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyVoucher([FromBody] ApplyVoucherDto dto)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == dto.Code && v.IsActive && v.ExpiryDate >= DateTime.UtcNow);
            if (voucher == null)
            {
                return BadRequest("Voucher không hợp lệ hoặc đã hết hạn.");
            }

            // Kiểm tra xem người dùng đã sử dụng voucher này chưa
            var userVoucher = await _context.UserVouchers.FirstOrDefaultAsync(uv => uv.UserId == dto.UserId && uv.VoucherId == voucher.Id);
            if (userVoucher != null)
            {
                return BadRequest("Bạn đã sử dụng voucher này.");
            }

            return Ok(new { discountAmount = voucher.DiscountAmount });
        }
    }
}