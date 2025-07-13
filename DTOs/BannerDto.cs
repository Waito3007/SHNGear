public class BannerDto
{
    public string Title { get; set; } = null!;
    public bool Status { get; set; }
    public List<BannerImageDto> Images { get; set; } = new();
}

public class BannerImageDto
{
    public string ImageUrl { get; set; } = null!;
}