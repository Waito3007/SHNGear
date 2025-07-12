namespace SHN_Gear.DTOs
{
    public class VoucherDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!; // Mã voucher
        public decimal DiscountAmount { get; set; } // Số tiền giảm giá
        public DateTime ExpiryDate { get; set; } // Ngày hết hạn
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động của voucher
        public decimal MinimumOrderAmount { get; set; } = 0; // Đơn hàng tối thiểu
        public int MaxUsageCount { get; set; } = 1; // Số lần sử dụng tối đa
    }

    public class UserVoucherDto
    {
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public DateTime UsedAt { get; set; } // Thời gian sử dụng voucher
    }

    public class ApplyVoucherDto
    {
        public string Code { get; set; } = null!;
        public int UserId { get; set; }
        public decimal OrderAmount { get; set; } // Thêm trường này để kiểm tra đơn hàng tối thiểu
    }

    // Thêm DTO mới cho bulk assign
    public class BulkAssignVoucherDto
    {
        public int VoucherId { get; set; }
        public List<int> UserIds { get; set; } = new List<int>();
    }

    // DTO cho thống kê voucher
    public class VoucherStatsDto
    {
        public int TotalVouchers { get; set; }
        public int ActiveVouchers { get; set; }
        public int ExpiredVouchers { get; set; }
        public int TotalUserVouchers { get; set; }
        public int UsedUserVouchers { get; set; }
        public int AvailableUserVouchers { get; set; }
        public double UsageRate { get; set; }
    }
}