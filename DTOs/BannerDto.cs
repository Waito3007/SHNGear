public class BannerDto
{
    public string Title { get; set; } = null!;
    public bool Status { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? LinkTo { get; set; }
}

// Đã loại bỏ BannerImageDto, chỉ dùng một ảnh duy nhất cho mỗi banner