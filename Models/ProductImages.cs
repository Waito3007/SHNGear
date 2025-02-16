namespace SHN_Gear.Models
{
    public class ProductImage
    {
        public int Id { get; set; }
        public int ProductId { get; set; } // Khóa ngoại liên kết với sản phẩm
        public string ImageUrl { get; set; } = null!;
        public bool IsPrimary { get; set; } // Ảnh chính hay không

        // Khóa ngoại
        public Product Product { get; set; } = null!;
    }
}
