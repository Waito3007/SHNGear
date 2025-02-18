using SHN_Gear.Models;
using SHN_Gear.Data;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SHN_Gear.Services
{
    public class UserService
    {
        private readonly AppDbContext _dbContext;

        public UserService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Kiểm tra xem email đã tồn tại chưa
        public async Task<bool> UserExistsByEmailAsync(string email)
        {
            return await _dbContext.Users.AnyAsync(u => u.Email == email);
        }

        // Lấy thông tin người dùng theo email
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        // Tạo tài khoản người dùng mới
        public async Task<bool> CreateUserAsync(User user)
        {
            _dbContext.Users.Add(user);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }

        // Cập nhật OTP cho người dùng
        public async Task UpdateUserOtpAsync(User user, string otpCode)
        {
            user.OtpCode = otpCode;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(5); // OTP có hiệu lực trong 5 phút
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
        }
    }
}
