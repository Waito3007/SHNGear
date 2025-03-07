namespace SHN_Gear.Models
{
    public class CartItem
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public int ProductVariantId { get; set; }  // 🔹 Thay đổi từ ProductId sang ProductVariantId
    public ProductVariant ProductVariant { get; set; } = null!;  // 🔹 Liên kết đến ProductVariant

    public int Quantity { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

}