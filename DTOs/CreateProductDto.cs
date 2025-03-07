namespace SHN_Gear.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int CategoryId { get; set; }
        public int BrandId { get; set; }
        public List<IFormFile> Images { get; set; } = new();
    }
}
