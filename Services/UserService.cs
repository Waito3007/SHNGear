using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;

namespace SHN_Gear.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        public User? GetUserById(int userId)
        {
            return _context.Users
                .Include(u => u.Role) // Nếu User có Role, ta include vào để lấy thông tin
                .FirstOrDefault(u => u.Id == userId);
        }

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> RegisterUserAsync(RegisterDto registerDto)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return false; // Email đã tồn tại
            }

            // Tìm role có Id = 2
            var role = await _context.Roles.FindAsync(2);
            if (role == null)
            {
                return false; // Nếu không tìm thấy role, đăng ký thất bại
            }

            // Mã hóa mật khẩu
            string hashedPassword = HashPassword(registerDto.Password);

            var user = new User
            {
                Email = registerDto.Email,
                Password = hashedPassword,
                CreatedAt = DateTime.UtcNow,
                RoleId = role.Id, // Gán RoleId từ database
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<User?> AuthenticateUserAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !VerifyPassword(loginDto.Password, user.Password))
            {
                return null; // Không tìm thấy user hoặc sai mật khẩu
            }

            return user;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            return HashPassword(inputPassword) == storedHash;
        }
        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    }
}
