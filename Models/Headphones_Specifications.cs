namespace SHN_Gear.Models
{
    public class HeadphoneSpecification
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!; // Khóa ngoại

    public string Weight { get; set; } = null!;
    public string Type { get; set; } = null!; // Không dây, Chụp tai
    public string ConnectionType { get; set; } = null!;
    public string Port { get; set; } = null!;
}

}