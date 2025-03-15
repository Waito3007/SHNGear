namespace SHN_Gear.DTOs
{
    public class CartDto
    {
        public int UserId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }

    public class CartItemSession
    {
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }

    }

}