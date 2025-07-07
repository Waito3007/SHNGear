public class SliderDto
{
    public string Title { get; set; }
public bool Status { get; set; }
    public string? LinkToProduct { get; set; } 
    public List<SliderImageDto> Images { get; set; } = new();
}

public class SliderImageDto
{
    public string ImageUrl { get; set; } = null!;
}