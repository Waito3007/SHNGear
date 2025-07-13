namespace SHN_Gear.Models;
public class Banner
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public bool Status { get; set; }
    public List<BannerImage> Images { get; set; } = new();
}