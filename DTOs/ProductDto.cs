public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class ProductImageDto
{
    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }
}

public class ProductVariantDto
{
    public string Color { get; set; } = null!;
    public string Storage { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public DateTime? FlashSaleStart { get; set; }
    public DateTime? FlashSaleEnd { get; set; }
}
