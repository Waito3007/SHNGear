namespace SHN_Gear.Models
{
    public class ProductVariant
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public string Color { get; set; } = null!;
        public string Storage { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int StockQuantity { get; set; }

        public DateTime? FlashSaleStart { get; set; }  // ✅ Flash Sale riêng cho từng variant
        public DateTime? FlashSaleEnd { get; set; }
    }
}
