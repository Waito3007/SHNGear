namespace SHN_Gear.Models
{
    public class ProductSpecification
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public string Name { get; set; } = null!; // Tên thuộc tính (RAM, CPU, Chất liệu, etc.)
        public string Value { get; set; } = null!; // Giá trị thuộc tính
        public string? Unit { get; set; } // Đơn vị (GB, MHz, cm, etc.) - optional
        public int DisplayOrder { get; set; } = 0; // Thứ tự hiển thị
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
