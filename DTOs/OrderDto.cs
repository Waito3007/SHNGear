namespace SHN_Gear.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "Pending";
        public int? AddressId { get; set; }  // Địa chỉ của user đã đăng nhập (nếu có)
        public string? GuestAddress { get; set; }  // Địa chỉ của khách chưa đăng nhập
        public int PaymentMethodId { get; set; }  // Phương thức thanh toán
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
        public int? VoucherId { get; set; } // Thêm VoucherId để áp dụng giảm giá
    }

    public class OrderItemDto
    {
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
