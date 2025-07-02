namespace SHN_Gear.DTOs
{
    public class ProductSpecificationDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductSpecificationDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateProductSpecificationDto
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; }
    }
}
