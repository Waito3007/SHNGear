namespace SHN_Gear.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public List<ProductImage> Images { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public int BrandId { get; set; } // ✅ Thêm BrandId vào model
        public Brand Brand { get; set; } = null!; // ✅ Thiết lập quan hệ với Brand
        public List<ProductVariant> Variants { get; set; } = new();

        // Flash Sale Properties
        public bool IsFlashSale { get; set; } = false;
        public decimal? FlashSalePrice { get; set; } // Nullable decimal
        public DateTime? FlashSaleStartDate { get; set; } // Nullable DateTime
        public DateTime? FlashSaleEndDate { get; set; } // Nullable DateTime

        public bool IsBestSeller { get; set; } = false; // New property for best sellers

        public ICollection<ProductSpecification> ProductSpecifications { get; set; } = new List<ProductSpecification>();

        public bool IsOutOfStock()
        {
            return Variants.Sum(v => v.StockQuantity) <= 0;
        }
    }
}
