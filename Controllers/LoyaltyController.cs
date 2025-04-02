using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Models;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using System;
using System.Threading.Tasks;
using System.Linq;

[Route("api/loyalty")]
[ApiController]
public class LoyaltyController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly Random _random = new Random();

    public LoyaltyController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("my-status")]
    public async Task<IActionResult> GetMyLoyaltyStatus([FromQuery] int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("Invalid user ID");
        }

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found");
        }

        if (!user.IsActive)
        {
            return BadRequest("User account is not active");
        }

        string currentRank = user.Role.Name == "Admin" ? "Admin" : DetermineRank(user.Points);

        // Cập nhật Role nếu không phải Admin
        if (user.Role.Name != "Admin" && user.Role.Name != currentRank)
        {
            var newRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == currentRank);
            if (newRole == null)
            {
                return StatusCode(500, $"Role '{currentRank}' not found in database");
            }
            user.RoleId = newRole.Id;
            user.Role = newRole;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        string nextRank = currentRank == "Admin" ? null : DetermineNextRank(currentRank);
        int pointsNeeded = currentRank == "Admin" ? 0 : CalculatePointsNeededForNextRank(user.Points, currentRank, nextRank);
        int spinCost = CalculateSpinCost(currentRank);

        return Ok(new
        {
            CurrentRank = currentRank,
            CurrentPoints = user.Points,
            PointsNeededForNextRank = pointsNeeded,
            CanSpin = user.Points >= spinCost, // Chỉ Admin quay với 0 điểm, còn lại cần đủ điểm
            SpinCost = spinCost
        });
    }

    [HttpPost("spin-wheel")]
    public async Task<IActionResult> SpinWheel([FromQuery] int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("Invalid user ID");
        }

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found");
        }

        if (!user.IsActive)
        {
            return BadRequest("User account is not active");
        }

        string currentRank = user.Role.Name == "Admin" ? "Admin" : DetermineRank(user.Points);
        int spinCost = CalculateSpinCost(currentRank);

        // Kiểm tra đủ điểm để quay (Admin miễn phí, các rank khác cần đủ điểm)
        if (currentRank != "Admin" && user.Points < spinCost)
        {
            return BadRequest("Not enough points to spin the wheel.");
        }

        // Trừ điểm khi quay (Admin không bị trừ, các rank khác bị trừ)
        if (currentRank != "Admin")
        {
            user.Points -= spinCost;
        }

        // Tạo phần thưởng ngẫu nhiên
        var (voucherValue, prizeType) = GenerateRandomPrize(currentRank);
        object responseData;

        if (prizeType == "Voucher")
        {
            var voucher = new Voucher
            {
                Code = $"SPIN-{currentRank}-{Guid.NewGuid().ToString().Substring(0, 8)}",
                DiscountAmount = voucherValue,
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                IsActive = true
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            var userVoucher = new UserVoucher
            {
                UserId = user.Id,
                VoucherId = voucher.Id,
                UsedAt = DateTime.UtcNow,
                IsUsed = false // Trạng thái sử dụng mặc định là false khi nhận từ vòng quay
            };

            _context.UserVouchers.Add(userVoucher);

            responseData = new
            {
                PrizeType = prizeType,
                Voucher = new VoucherDto
                {
                    Id = voucher.Id,
                    Code = voucher.Code,
                    DiscountAmount = voucher.DiscountAmount,
                    ExpiryDate = voucher.ExpiryDate,
                    IsActive = voucher.IsActive
                },
                RemainingPoints = user.Points
            };
        }
        else
        {
            responseData = new
            {
                PrizeType = prizeType,
                Voucher = (object)null,
                RemainingPoints = user.Points
            };
        }

        // Cập nhật điểm người dùng vào cơ sở dữ liệu
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(responseData);
    }

    private string DetermineRank(int points)
    {
        if (points >= 225000) return "VIP 3";
        if (points >= 125000) return "VIP 2";
        if (points >= 50000) return "VIP 1";
        return "VIP 0";
    }

    private string DetermineNextRank(string currentRank)
    {
        return currentRank switch
        {
            "VIP 0" => "VIP 1",
            "VIP 1" => "VIP 2",
            "VIP 2" => "VIP 3",
            "VIP 3" => null,
            _ => "VIP 1"
        };
    }

    private int CalculatePointsNeededForNextRank(int currentPoints, string currentRank, string nextRank)
    {
        if (nextRank == null) return 0;
        return nextRank switch
        {
            "VIP 1" => 50000 - currentPoints,
            "VIP 2" => 125000 - currentPoints,
            "VIP 3" => 225000 - currentPoints,
            _ => 50000 - currentPoints
        };
    }

    private int CalculateSpinCost(string currentRank)
    {
        return currentRank switch
        {
            "Admin" => 0,     // 
            "VIP 0" => 500, // 
            "VIP 1" => 5000,
            "VIP 2" => 5000,
            "VIP 3" => 5000,  // 
            _ => 10000
        };
    }

    private (decimal voucherValue, string prizeType) GenerateRandomPrize(string currentRank)
    {
        int chance = _random.Next(1, 101);
        switch (currentRank)
        {
            case "Admin":
                if (chance <= 50) return (500000, "Voucher"); // 50% nhận 500k
                else if (chance <= 80) return (350000, "Voucher"); // 30% nhận 350k
                else return (200000, "Voucher"); // 20% nhận 200k
            case "VIP 0":
                if (chance <= 50) return (50000, "Voucher"); // 50% nhận 50k
                else if (chance <= 80) return (20000, "Voucher"); // 30% nhận 20k
                else return (0, "No Prize"); // 20% không trúng
            case "VIP 1":
                if (chance <= 40) return (100000, "Voucher"); // 40% nhận 100k
                else if (chance <= 70) return (50000, "Voucher"); // 30% nhận 50k
                else return (20000, "Voucher"); // 30% nhận 20k
            case "VIP 2":
                if (chance <= 30) return (200000, "Voucher"); // 30% nhận 200k
                else if (chance <= 60) return (100000, "Voucher"); // 30% nhận 100k
                else return (50000, "Voucher"); // 40% nhận 50k
            case "VIP 3":
                if (chance <= 20) return (350000, "Voucher"); // 20% nhận 350k
                else if (chance <= 50) return (200000, "Voucher"); // 30% nhận 200k
                else return (100000, "Voucher"); // 50% nhận 100k
            default:
                return (0, "No Prize");
        }
    }
}