namespace SHN_Gear.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int CartId { get; set; } // Khóa ngoại liên kết với giỏ hàng
        public Cart Cart { get; set; } = null!; // Khóa ngoại

        public int ProductId { get; set; } // Khóa ngoại liên kết với sản phẩm
        public Product Product { get; set; } = null!; // Khóa ngoại

        public int Quantity { get; set; } // Số lượng sản phẩm
        public DateTime AddedAt { get; set; } = DateTime.UtcNow; // Thời gian thêm sản phẩm vào giỏ hàng
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật sản phẩm trong giỏ hàng
    }
}