namespace SHN_Gear.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Gender { get; set; }  // Có thể null
        public DateTime? DateOfBirth { get; set; }  // Có thể null
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }  // Có thể null
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Points { get; set; } = 0;
        public string Password { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;  // Mặc định là kích hoạt

        // OTP Login
        public string? OtpCode { get; set; }  // Có thể null
        public DateTime? OtpExpiry { get; set; }  // Có thể null

        // Quan hệ với Role
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;

        // Quan hệ với UserVoucher
        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
    }

}