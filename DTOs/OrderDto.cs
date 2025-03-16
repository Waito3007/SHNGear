namespace SHN_Gear.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "Pending";
        public int? AddressId { get; set; }
        public int PaymentMethodId { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
        public int? VoucherId { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
    public class UpdateStatusDto
    {
        public string NewStatus { get; set; }
    }
}
