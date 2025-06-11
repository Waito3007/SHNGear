namespace SHN_Gear.DTOs
{
    public class ProductSpecificationDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; } = null!;
        public string Value { get; set; } = null!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateProductSpecificationDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = null!;
        public string Value { get; set; } = null!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateProductSpecificationDto
    {
        public string Name { get; set; } = null!;
        public string Value { get; set; } = null!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }
}