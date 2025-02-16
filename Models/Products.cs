namespace SHN_Gear.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }  // Giá sau khi giảm, có thể null
        public DateTime? FlashSaleStart { get; set; } // Thời gian bắt đầu flash sale
        public DateTime? FlashSaleEnd { get; set; } // Thời gian kết thúc flash sale
        public List<ProductImage> Images { get; set; } = new();
        public string Category { get; set; } = null!; // Điện thoại, laptop, tai nghe
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}