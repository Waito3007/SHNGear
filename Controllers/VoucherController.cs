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
                    IsActive = v.IsActive,
                    MinimumOrderAmount = v.MinimumOrderAmount,
                    MaxUsageCount = v.MaxUsageCount
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
                    IsActive = v.IsActive,
                    MinimumOrderAmount = v.MinimumOrderAmount,
                    MaxUsageCount = v.MaxUsageCount
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
                IsActive = dto.IsActive,
                MinimumOrderAmount = dto.MinimumOrderAmount,
                MaxUsageCount = dto.MaxUsageCount
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
            voucher.MinimumOrderAmount = dto.MinimumOrderAmount;
            voucher.MaxUsageCount = dto.MaxUsageCount;

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

        // Cải thiện API apply voucher với validation đầy đủ
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyVoucher([FromBody] ApplyVoucherDto dto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Code))
                {
                    return BadRequest("Mã voucher không được để trống.");
                }

                if (dto.UserId <= 0)
                {
                    return BadRequest("User ID không hợp lệ.");
                }

                // Kiểm tra voucher tồn tại và còn hiệu lực
                var voucher = await _context.Vouchers
                    .Include(v => v.UserVouchers.Where(uv => uv.UserId == dto.UserId))
                    .FirstOrDefaultAsync(v => 
                        v.Code == dto.Code && 
                        v.IsActive && 
                        v.ExpiryDate >= DateTime.UtcNow);

                if (voucher == null)
                {
                    return BadRequest("Voucher không tồn tại hoặc đã hết hạn.");
                }

                // Kiểm tra voucher có được gán cho user này không
                var userVoucher = voucher.UserVouchers.FirstOrDefault();
                if (userVoucher == null)
                {
                    return BadRequest("Bạn chưa sở hữu voucher này.");
                }

                // Kiểm tra voucher đã được sử dụng chưa
                if (userVoucher.IsUsed)
                {
                    return BadRequest("Voucher đã được sử dụng.");
                }

                // Kiểm tra số lần sử dụng tổng cộng
                var totalUsageCount = await _context.UserVouchers
                    .CountAsync(uv => uv.VoucherId == voucher.Id && uv.IsUsed);
                
                if (voucher.MaxUsageCount > 0 && totalUsageCount >= voucher.MaxUsageCount)
                {
                    return BadRequest("Voucher đã hết lượt sử dụng.");
                }

                // Kiểm tra đơn hàng tối thiểu
                if (dto.OrderAmount < voucher.MinimumOrderAmount)
                {
                    return BadRequest($"Đơn hàng tối thiểu phải từ {voucher.MinimumOrderAmount:N0}đ.");
                }

                // Trả về thông tin giảm giá
                return Ok(new 
                { 
                    voucherId = voucher.Id,
                    discountAmount = voucher.DiscountAmount,
                    minimumOrderAmount = voucher.MinimumOrderAmount,
                    expiryDate = voucher.ExpiryDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi áp dụng voucher.", Error = ex.Message });
            }
        }

        // Cải thiện API validate voucher với thông tin chi tiết
        [HttpGet("validate/{code}")]
        public async Task<IActionResult> ValidateVoucher(string code, [FromQuery] int? userId = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                {
                    return BadRequest("Mã voucher không được để trống.");
                }

                var voucher = await _context.Vouchers
                    .Include(v => v.UserVouchers.Where(uv => userId.HasValue && uv.UserId == userId.Value))
                    .FirstOrDefaultAsync(v => v.Code == code);

                if (voucher == null)
                {
                    return NotFound("Voucher không tồn tại.");
                }

                // Kiểm tra trạng thái cơ bản
                var isActive = voucher.IsActive && voucher.ExpiryDate >= DateTime.UtcNow;
                
                // Kiểm tra số lần sử dụng tổng cộng
                var totalUsageCount = await _context.UserVouchers
                    .CountAsync(uv => uv.VoucherId == voucher.Id && uv.IsUsed);
                var hasUsageLimit = voucher.MaxUsageCount > 0 && totalUsageCount >= voucher.MaxUsageCount;

                // Kiểm tra quyền sở hữu nếu có userId
                var userOwnsVoucher = false;
                var userVoucherStatus = "not_owned";
                
                if (userId.HasValue)
                {
                    var userVoucher = voucher.UserVouchers.FirstOrDefault();
                    if (userVoucher != null)
                    {
                        userOwnsVoucher = true;
                        userVoucherStatus = userVoucher.IsUsed ? "used" : "available";
                    }
                }

                var isValid = isActive && !hasUsageLimit && (userId == null || userOwnsVoucher);

                return Ok(new
                {
                    isValid,
                    voucherId = voucher.Id,
                    code = voucher.Code,
                    discountAmount = voucher.DiscountAmount,
                    minimumOrderAmount = voucher.MinimumOrderAmount,
                    expiryDate = voucher.ExpiryDate,
                    maxUsageCount = voucher.MaxUsageCount,
                    currentUsageCount = totalUsageCount,
                    isActive = voucher.IsActive,
                    userOwnsVoucher,
                    userVoucherStatus,
                    validationDetails = new
                    {
                        isActive,
                        notExpired = voucher.ExpiryDate >= DateTime.UtcNow,
                        hasUsageLimit,
                        userOwnsVoucher
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi validate voucher.", Error = ex.Message });
            }
        }

        // Cải thiện API lấy danh sách voucher của user
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetVouchersOfUser(int userId)
        {
            try
            {
                if (userId <= 0)
                {
                    return BadRequest("User ID không hợp lệ.");
                }

                var vouchers = await _context.UserVouchers
                    .Where(uv => uv.UserId == userId)
                    .Include(uv => uv.Voucher)
                    .Select(uv => new {
                        id = uv.Voucher.Id,
                        code = uv.Voucher.Code,
                        discountAmount = uv.Voucher.DiscountAmount,
                        minimumOrderAmount = uv.Voucher.MinimumOrderAmount,
                        expiryDate = uv.Voucher.ExpiryDate,
                        isActive = uv.Voucher.IsActive,
                        isUsed = uv.IsUsed,
                        usedAt = uv.UsedAt,
                        canUse = uv.Voucher.IsActive && 
                                uv.Voucher.ExpiryDate >= DateTime.UtcNow && 
                                !uv.IsUsed,
                        daysUntilExpiry = (uv.Voucher.ExpiryDate - DateTime.UtcNow).Days
                    })
                    .OrderByDescending(v => v.canUse)
                    .ThenBy(v => v.expiryDate)
                    .ToListAsync();

                return Ok(new
                {
                    totalCount = vouchers.Count,
                    availableCount = vouchers.Count(v => v.canUse),
                    usedCount = vouchers.Count(v => v.isUsed),
                    expiredCount = vouchers.Count(v => !v.canUse && !v.isUsed),
                    vouchers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi lấy danh sách voucher.", Error = ex.Message });
            }
        }

        // Thêm API để gán voucher cho nhiều user
        [HttpPost("assign-bulk")]
        public async Task<IActionResult> AssignVoucherToMultipleUsers([FromBody] BulkAssignVoucherDto dto)
        {
            try
            {
                if (dto.UserIds == null || !dto.UserIds.Any())
                {
                    return BadRequest("Danh sách user không được để trống.");
                }

                var voucher = await _context.Vouchers.FindAsync(dto.VoucherId);
                if (voucher == null)
                {
                    return NotFound("Voucher không tồn tại.");
                }

                if (!voucher.IsActive)
                {
                    return BadRequest("Voucher không còn hoạt động.");
                }

                var existingUserVouchers = await _context.UserVouchers
                    .Where(uv => uv.VoucherId == dto.VoucherId && dto.UserIds.Contains(uv.UserId))
                    .Select(uv => uv.UserId)
                    .ToListAsync();

                var newUserIds = dto.UserIds.Except(existingUserVouchers).ToList();
                var userVouchers = newUserIds.Select(userId => new UserVoucher
                {
                    UserId = userId,
                    VoucherId = dto.VoucherId,
                    UsedAt = DateTime.UtcNow,
                    IsUsed = false
                }).ToList();

                _context.UserVouchers.AddRange(userVouchers);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = $"Đã gán voucher cho {userVouchers.Count} người dùng.",
                    AssignedCount = userVouchers.Count,
                    AlreadyAssignedCount = existingUserVouchers.Count,
                    AlreadyAssignedUserIds = existingUserVouchers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi gán voucher.", Error = ex.Message });
            }
        }

        // Thêm API để lấy thống kê voucher
        [HttpGet("stats")]
        public async Task<IActionResult> GetVoucherStats()
        {
            try
            {
                var totalVouchers = await _context.Vouchers.CountAsync();
                var activeVouchers = await _context.Vouchers.CountAsync(v => v.IsActive && v.ExpiryDate >= DateTime.UtcNow);
                var expiredVouchers = await _context.Vouchers.CountAsync(v => v.ExpiryDate < DateTime.UtcNow);
                var totalUserVouchers = await _context.UserVouchers.CountAsync();
                var usedUserVouchers = await _context.UserVouchers.CountAsync(uv => uv.IsUsed);

                return Ok(new
                {
                    totalVouchers,
                    activeVouchers,
                    expiredVouchers,
                    totalUserVouchers,
                    usedUserVouchers,
                    availableUserVouchers = totalUserVouchers - usedUserVouchers,
                    usageRate = totalUserVouchers > 0 ? (double)usedUserVouchers / totalUserVouchers * 100 : 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi lấy thống kê voucher.", Error = ex.Message });
            }
        }
    }
}