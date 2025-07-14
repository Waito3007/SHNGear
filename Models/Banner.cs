namespace SHN_Gear.Models;

public class Banner
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public bool Status { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? LinkTo { get; set; }
}