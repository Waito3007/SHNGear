namespace SHN_Gear.DTOs
{
    // DTO cho thông tin trạng thái loyalty
    public class LoyaltyStatusDto
    {
        public string CurrentRank { get; set; } = string.Empty;
        public int CurrentPoints { get; set; }
        public int PointsNeededForNextRank { get; set; }
        public bool CanClaimVoucher { get; set; }
        public decimal VoucherValue { get; set; }
    }

    // DTO cho phản hồi khi claim voucher
    public class VoucherClaimResponseDto
    {
        public VoucherDto Voucher { get; set; } = new VoucherDto();
        public string Message { get; set; } = string.Empty;
    }

    // DTO mở rộng từ VoucherDto để bao gồm thông tin sử dụng
    public class UserVoucherDetailDto : VoucherDto
    {
        public DateTime UsedAt { get; set; }
        public bool IsUsed => UsedAt != DateTime.MinValue;
    }

    // DTO cho thông tin người dùng trong chương trình loyalty
    public class LoyaltyUserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Points { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime MemberSince { get; set; }
    }
}