namespace SHN_Gear.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public string ShippingMethod { get; set; } = null!;
        public decimal ShippingCost { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string TrackingNumber { get; set; } = null!;
    }
}
