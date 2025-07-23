using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

namespace SHN_Gear.Services
{
    public class LoyaltySpinService
    {
        private readonly AppDbContext _context;
        public LoyaltySpinService(AppDbContext context)
        {
            _context = context;
        }
        // Cập nhật point quay may mắn của user
        public async Task UpdateUserPointsAsync(int userId, int newPoints)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null) throw new Exception("User not found");

            int oldPoints = user.Points;
            user.Points = newPoints;
            await _context.SaveChangesAsync();

            int diff = newPoints - oldPoints;
            if (diff > 0)
            {
                // Cộng thêm vào LoyaltyPoint
                var lp = await _context.LoyaltyPoints.FirstOrDefaultAsync(x => x.UserId == userId);
                if (lp == null)
                {
                    lp = new LoyaltyPoint { UserId = userId, Points = diff, LastUpdated = DateTime.UtcNow };
                    _context.LoyaltyPoints.Add(lp);
                }
                else
                {
                    lp.Points += diff;
                    lp.LastUpdated = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }
        }
        // Lấy điểm loyalty của user
        public async Task<int> GetUserPointsAsync(int userId)
        {
            var lp = await _context.LoyaltyPoints.FirstOrDefaultAsync(x => x.UserId == userId);
            return lp?.Points ?? 0;
        }

        // Cập nhật điểm loyalty
        public async Task SetUserPointsAsync(int userId, int points)
        {
            var lp = await _context.LoyaltyPoints.FirstOrDefaultAsync(x => x.UserId == userId);
            if (lp == null)
            {
                lp = new LoyaltyPoint { UserId = userId, Points = points, LastUpdated = DateTime.UtcNow };
                _context.LoyaltyPoints.Add(lp);
            }
            else
            {
                lp.Points = points;
                lp.LastUpdated = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }

        // Lấy cấu hình vòng quay
        public async Task<SpinConfig> GetSpinConfigAsync()
        {
            return await _context.SpinConfigs.OrderByDescending(x => x.UpdatedAt).FirstOrDefaultAsync();
        }
        // Cập nhật cấu hình vòng quay
        public async Task UpdateSpinConfigAsync(SpinConfig config)
        {
            // Nếu đã có config, cập nhật; nếu chưa có, thêm mới
            var current = await _context.SpinConfigs.OrderByDescending(x => x.UpdatedAt).FirstOrDefaultAsync();
            if (current != null)
            {
                current.SpinCost = config.SpinCost;
                current.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                config.UpdatedAt = DateTime.UtcNow;
                _context.SpinConfigs.Add(config);
            }
            await _context.SaveChangesAsync();
        }
        // Lấy danh sách vật phẩm vòng quay
        public async Task<List<SpinItem>> GetSpinItemsAsync()
        {
            return await _context.SpinItems.ToListAsync();
        }

        // Thực hiện quay may mắn
        public async Task<SpinResultDto> SpinAsync(int userId)
        {
            var config = await GetSpinConfigAsync();
            var items = await GetSpinItemsAsync();
            var lp = await _context.LoyaltyPoints.FirstOrDefaultAsync(x => x.UserId == userId);
            if (lp == null || lp.Points < config.SpinCost)
                throw new Exception("Không đủ điểm để quay");

            // Random theo tỉ lệ
            var rand = new Random();
            double r = rand.NextDouble();
            double acc = 0;
            SpinItem selected = null;
            foreach (var item in items)
            {
                acc += item.DropRate;
                if (r <= acc)
                {
                    selected = item;
                    break;
                }
            }
            if (selected == null) selected = items.Last();

            // Trừ điểm
            lp.Points -= config.SpinCost;
            lp.LastUpdated = DateTime.UtcNow;

            // Nếu vật phẩm có voucher, tạo voucher và gán cho user
            Voucher? newVoucher = null;
            UserVoucher? userVoucher = null;
            if (!string.IsNullOrEmpty(selected.VoucherCode))
            {
                // Parse giá trị voucher từ code (ví dụ: VOUCHER20K -> 20000, VOUCHER500K -> 500000)
                decimal voucherAmount = ParseVoucherAmount(selected.VoucherCode);
                
                // Tạo mã voucher ngẫu nhiên
                var voucherCode = selected.VoucherCode + "-" + Guid.NewGuid().ToString().Substring(0, 8);
                newVoucher = new Voucher
                {
                    Code = voucherCode,
                    DiscountAmount = voucherAmount > 0 ? voucherAmount : config.SpinCost,
                    ExpiryDate = DateTime.UtcNow.AddDays(30), // voucher có hạn 30 ngày
                    IsActive = true
                };
                _context.Vouchers.Add(newVoucher);
                await _context.SaveChangesAsync();

                userVoucher = new UserVoucher
                {
                    UserId = userId,
                    VoucherId = newVoucher.Id,
                    UsedAt = DateTime.UtcNow,
                    IsUsed = false
                };
                _context.UserVouchers.Add(userVoucher);
                await _context.SaveChangesAsync();
            }

            var history = new SpinHistory
            {
                UserId = userId,
                SpinItemId = selected.Id,
                SpinAt = DateTime.UtcNow,
                PointsUsed = config.SpinCost
            };
            _context.SpinHistories.Add(history);
            await _context.SaveChangesAsync();

            // Trả về DTO với thông tin voucher
            return new SpinResultDto
            {
                Id = history.Id,
                UserId = history.UserId,
                SpinItemId = history.SpinItemId,
                SpinAt = history.SpinAt,
                PointsUsed = history.PointsUsed,
                HasVoucher = newVoucher != null,
                VoucherCode = newVoucher?.Code,
                VoucherAmount = newVoucher?.DiscountAmount,
                VoucherExpiryDate = newVoucher?.ExpiryDate
            };
        }

        // Lấy lịch sử quay của user
        public async Task<List<SpinHistory>> GetUserSpinHistoryAsync(int userId)
        {
            return await _context.SpinHistories.Where(x => x.UserId == userId).OrderByDescending(x => x.SpinAt).ToListAsync();
        }

        // Parse giá trị voucher từ mã code (VOUCHER20K -> 20000, VOUCHER500K -> 500000)
        private decimal ParseVoucherAmount(string voucherCode)
        {
            try
            {
                // Tìm vị trí của chữ "VOUCHER" và phần số + đơn vị
                var upperCode = voucherCode.ToUpper();
                if (!upperCode.StartsWith("VOUCHER")) return 0;

                // Lấy phần sau "VOUCHER"
                var amountPart = upperCode.Substring(7); // Bỏ qua "VOUCHER"
                
                // Parse số và đơn vị (K = nghìn)
                if (amountPart.EndsWith("K"))
                {
                    var numberPart = amountPart.Substring(0, amountPart.Length - 1);
                    if (decimal.TryParse(numberPart, out decimal amount))
                    {
                        return amount * 1000; // K = nghìn
                    }
                }
                else if (decimal.TryParse(amountPart, out decimal directAmount))
                {
                    return directAmount; // Số trực tiếp
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }
    }
}
