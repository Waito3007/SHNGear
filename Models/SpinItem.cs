namespace SHN_Gear.Models
{
    public class SpinItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public double DropRate { get; set; } // Tỉ lệ trúng (0-1)
        public string? VoucherCode { get; set; } // Nếu là voucher
        public bool IsLuckyNextTime { get; set; } // Nếu là "chúc may mắn lần sau"
    }
}
