namespace SHN_Gear.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; } // Khóa ngoại tới Order
        public Order Order { get; set; } = null!;
        public int ProductVariantId { get; set; } // Khóa ngoại tới ProductVariant
        public ProductVariant ProductVariant { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Price { get; set; } // Giá sản phẩm tại thời điểm đặt hàng (có thể khác với giá hiện tại)
    }
}
