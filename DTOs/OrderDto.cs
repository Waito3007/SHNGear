namespace SHN_Gear.DTOs
{
    public class OrderDto
    {
        public int? AddressId { get; set; }  // Địa chỉ của user đã đăng nhập (nếu có)
        public string? GuestAddress { get; set; }  // Địa chỉ của khách chưa đăng nhập
        public int PaymentMethodId { get; set; }  // Phương thức thanh toán
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
