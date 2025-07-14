public class SliderDto
{
    public string Title { get; set; } = null!;
    public bool Status { get; set; }
    public string? LinkToProduct { get; set; }
    public string ImageUrl { get; set; } = null!;
}

// Đã loại bỏ SliderImageDto, chỉ dùng một ảnh duy nhất cho mỗi slider