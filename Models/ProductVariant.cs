namespace SHN_Gear.Models
{
    public class ProductVariant
    {
        public int Id { get; set; }
        public int ProductId { get; set; } // Khóa ngoại liên kết với sản phẩm
        public Product Product { get; set; } = null!; // Khóa ngoại

        public string Color { get; set; } = null!;
        public string Storage { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; } // Số lượng tồn kho
    }
}