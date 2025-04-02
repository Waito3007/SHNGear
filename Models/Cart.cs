namespace SHN_Gear.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Id của người dùng hoặc khách vãng lai
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời gian tạo giỏ hàng
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật giỏ hàng

        public ICollection<CartItem> Items { get; set; } = new List<CartItem>(); // Danh sách sản phẩm trong giỏ hàng
    }
}