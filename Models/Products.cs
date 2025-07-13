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
        public bool IsPinned { get; set; } = false;

        public bool IsOutOfStock()
        {
            return Variants.Sum(v => v.StockQuantity) <= 0;
        }
    }
}
