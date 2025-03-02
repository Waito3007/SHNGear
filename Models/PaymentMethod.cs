namespace SHN_Gear.Models
{
    public class PaymentMethod
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!; // Ví dụ: "Cash on Delivery", "Momo"
        public string Description { get; set; } = null!; // Mô tả ngắn gọn về phương thức thanh toán
    }
}
