namespace SHN_Gear.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int ProductVariantId { get; set; }
        public ProductVariant ProductVariant { get; set; } = null!;
        public string UserId { get; set; } = null!; // Khóa ngoại tới User
        public User User { get; set; } = null!;
        public int Rating { get; set; } // Ví dụ: từ 1 đến 5 sao
        public string Comment { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
