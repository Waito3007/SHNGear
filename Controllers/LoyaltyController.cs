using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/loyalty")]
    [Authorize]
    public class LoyaltyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoyaltyController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy thông tin loyalty của người dùng hiện tại
        [HttpGet("my-status")]
        public async Task<IActionResult> GetMyLoyaltyStatus()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Tính toán thông tin loyalty
            var currentRank = user.Role.Name;
            var currentPoints = user.Points;

            // Tính điểm cần để lên rank tiếp theo
            int pointsNeeded = CalculatePointsNeededForNextRank(currentRank, currentPoints);

            // Kiểm tra xem có đủ điều kiện nhận voucher không
            bool canClaimVoucher = CanClaimVoucher(currentRank, currentPoints);

            return Ok(new
            {
                CurrentRank = currentRank,
                CurrentPoints = currentPoints,
                PointsNeededForNextRank = pointsNeeded,
                CanClaimVoucher = canClaimVoucher,
                VoucherValue = canClaimVoucher ? CalculateVoucherValue(currentRank) : 0
            });
        }

        // Nhận voucher thưởng
        [HttpPost("claim-voucher")]
        public async Task<IActionResult> ClaimVoucher()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Kiểm tra điều kiện nhận voucher
            if (!CanClaimVoucher(user.Role.Name, user.Points))
            {
                return BadRequest("You don't meet the requirements to claim a voucher");
            }

            // Tạo voucher mới
            var voucher = new Voucher
            {
                Code = GenerateRandomVoucherCode(),
                DiscountAmount = CalculateVoucherValue(user.Role.Name),
                ExpiryDate = DateTime.UtcNow.AddMonths(3),
                IsActive = true
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            // Gán voucher cho người dùng
            var userVoucher = new UserVoucher
            {
                UserId = userId,
                VoucherId = voucher.Id,
                UsedAt = DateTime.MinValue // Chưa sử dụng
            };

            _context.UserVouchers.Add(userVoucher);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Voucher claimed successfully",
                VoucherCode = voucher.Code,
                DiscountAmount = voucher.DiscountAmount,
                ExpiryDate = voucher.ExpiryDate
            });
        }

        // Các hàm hỗ trợ
        private int CalculatePointsNeededForNextRank(string currentRank, int currentPoints)
        {
            // Logic tính điểm cần để lên rank tiếp theo
            switch (currentRank)
            {
                case "VIP 1":
                    return Math.Max(0, 50000 - currentPoints);
                case "VIP 2":
                    return Math.Max(0, 125000 - currentPoints); // 50k + 75k
                case "VIP 3":
                    return Math.Max(0, 225000 - currentPoints); // 50k + 75k + 100k
                case "VIP 4":
                    return Math.Max(0, 350000 - currentPoints); // 50k + 75k + 100k + 125k
                default: // Đã là rank cao nhất
                    return 0;
            }
        }

        private bool CanClaimVoucher(string currentRank, int currentPoints)
        {
            // Kiểm tra xem người dùng đã đạt đủ điểm để nhận voucher chưa
            switch (currentRank)
            {
                case "VIP 1":
                    return currentPoints >= 50000;
                case "VIP 2":
                    return currentPoints >= 125000;
                case "VIP 3":
                    return currentPoints >= 225000;
                case "VIP 4":
                    return currentPoints >= 350000;
                default:
                    return false;
            }
        }

        private decimal CalculateVoucherValue(string currentRank)
        {
            // Giá trị voucher tăng theo rank
            switch (currentRank)
            {
                case "VIP 1":
                    return 100000;
                case "VIP 2":
                    return 200000;
                case "VIP 3":
                    return 350000;
                case "VIP 4":
                    return 500000;
                default:
                    return 0;
            }
        }

        private string GenerateRandomVoucherCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}