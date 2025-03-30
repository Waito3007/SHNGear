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
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return false; // Email đã tồn tại
            }

            var role = await _context.Roles.FindAsync(2);
            if (role == null)
            {
                return false;
            }

            string hashedPassword = HashPassword(registerDto.Password);

            var user = new User
            {
                Email = registerDto.Email,
                Password = hashedPassword,
                CreatedAt = DateTime.UtcNow,
                RoleId = role.Id,
                Role = role,

                // Gán giá trị từ DTO
                FullName = !string.IsNullOrWhiteSpace(registerDto.FullName) ? registerDto.FullName : "",
                PhoneNumber = !string.IsNullOrWhiteSpace(registerDto.PhoneNumber) ? registerDto.PhoneNumber : ""
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<User> AuthenticateUserAsync(LoginDto loginDto)
        {
            // Thêm Include để load thông tin Role
            var user = await _context.Users
                .Include(u => u.Role) // Quan trọng
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !VerifyPassword(loginDto.Password, user.Password))
                return null;

            return user;
        }

        public string HashPassword(string password)
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
        public async Task<User?> UpdateUserProfileAsync(int userId, EditProfileDto editDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            user.FullName = editDto.FullName;
            user.Email = editDto.Email;

            await _context.SaveChangesAsync();
            return user;
        }
    }
}
