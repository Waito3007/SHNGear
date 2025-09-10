namespace SHN_Gear.DTOs
{
    public class VoucherDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!; // Mã voucher
        public decimal DiscountAmount { get; set; } // Số tiền giảm giá
        public DateTime ExpiryDate { get; set; } // Ngày hết hạn
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động của voucher
    }
    public class UserVoucherDto
    {
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public DateTime UsedAt { get; set; } // Thời gian sử dụng voucher
        public string? Code { get; set; } // Mã voucher
        public decimal? DiscountAmount { get; set; } // Số tiền giảm giá
        public DateTime? ExpiryDate { get; set; } // Ngày hết hạn
        public bool? IsActive { get; set; } // Trạng thái hoạt động
    }
    public class ApplyVoucherDto
    {
        public string Code { get; set; } = null!;
        public int UserId { get; set; }
    }
}