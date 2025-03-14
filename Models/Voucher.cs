namespace SHN_Gear.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!; // Mã voucher
        public decimal DiscountAmount { get; set; } // Số tiền giảm giá
        public DateTime ExpiryDate { get; set; } // Ngày hết hạn
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động của voucher

        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>(); // Quan hệ với UserVoucher
    }
}