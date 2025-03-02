namespace SHN_Gear.Models
{
    public class Brand
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Logo { get; set; } = null!;

        // Danh sách sản phẩm thuộc Brand này
        public List<Product> Products { get; set; } = new();
    }
}
