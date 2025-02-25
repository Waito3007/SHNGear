namespace SHN_Gear.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;  // Họ và Tên
        public string PhoneNumber { get; set; } = string.Empty;  // Số điện thoại (dùng để đăng nhập)
        public string Gender { get; set; } = "Khác";  // Giới tính (Nam, Nữ, Khác)
        public DateTime DateOfBirth { get; set; }  // Ngày sinh
        public string Email { get; set; } = string.Empty;  // Email (không bắt buộc)
        public string AvatarUrl { get; set; } = string.Empty;  // Link ảnh đại diện
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Ngày tạo tài khoản
        public int Points { get; set; } = 0;  // Điểm thành viên
        public string Password { get; set; } = string.Empty;  // Mật khẩu

        // OTP Login
        public string OtpCode { get; set; } = string.Empty;  // Mã OTP (lưu tạm thời)
        public DateTime OtpExpiry { get; set; }  // Thời gian hết hạn OTP

        // Quan hệ với Role 
        public int RoleId { get; set; }  
        public Role Role { get; set; } = null!;
    }
}