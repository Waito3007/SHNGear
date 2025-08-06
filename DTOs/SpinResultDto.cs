namespace SHN_Gear.DTOs
{
    public class SpinResultDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SpinItemId { get; set; }
        public DateTime SpinAt { get; set; }
        public int PointsUsed { get; set; }
        
        // Thông tin voucher nếu có
        public string? VoucherCode { get; set; }
        public decimal? VoucherAmount { get; set; }
        public DateTime? VoucherExpiryDate { get; set; }
        public bool HasVoucher { get; set; }
    }
}
