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
        public int CategoryId { get; set; } // ID của danh mục
        public List<int> BrandIds { get; set; } = new(); // Danh sách ID của các thương hiệu
        public List<string>? ImageUrls { get; set; } // Danh sách URL ảnh sản phẩm
        public int StockQuantity { get; set; } // Số lượng tồn kho
        public List<ProductVariantDto> Variants { get; set; } = new(); // Danh sách biến thể sản phẩm
    }

    public class ProductVariantDto
    {
        public string Color { get; set; } = null!;
        public string Storage { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; } // Số lượng tồn kho
    }
}
