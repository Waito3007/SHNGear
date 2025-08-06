public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public BrandDto? Brand { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
    public bool IsFlashSale { get; set; }
    public decimal? FlashSalePrice { get; set; }
    public DateTime? FlashSaleStartDate { get; set; }
    public DateTime? FlashSaleEndDate { get; set; }
}

public class BrandDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Logo { get; set; } = null!;
}

public class ProductImageDto
{
    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }
}

public class ProductVariantDto
{
    public int Id { get; set; }
    public string Color { get; set; } = null!;
    public string Storage { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
}
