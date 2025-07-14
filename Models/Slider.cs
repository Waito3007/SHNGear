namespace SHN_Gear.Models;

public class Slider
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public bool Status { get; set; }
    public string? LinkToProduct { get; set; }
    public string ImageUrl { get; set; } = null!;
}