namespace SHN_Gear.DTOs
{
    public class ProductDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }  // Giá sau khi giảm, có thể null
        public DateTime? FlashSaleStart { get; set; } // Thời gian bắt đầu flash sale
        public DateTime? FlashSaleEnd { get; set; } // Thời gian kết thúc flash sale
        public string Category { get; set; } = null!;
        public List<string>? ImageUrls { get; set; } // Danh sách URL ảnh sản phẩm
        public int StockQuantity { get; set; } // Số lượng tồn kho
    }
}
