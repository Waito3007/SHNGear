namespace SHN_Gear.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Image { get; set; } = null!;

        // ✅ Thêm danh sách sản phẩm
        public List<Product> Products { get; set; } = new();
    }
}
