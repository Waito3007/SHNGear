namespace SHN_Gear.Models
{
    public class UserVoucher
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int VoucherId { get; set; }
        public Voucher Voucher { get; set; } = null!;

        public DateTime UsedAt { get; set; } // Thời gian sử dụng voucher
    }
}