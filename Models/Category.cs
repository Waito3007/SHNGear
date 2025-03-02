namespace SHN_Gear.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;   
        public string Description { get; set; } = null!;
        public string Image { get; set; } = null!; // URL or path to the category image
        public List<Brand> Brands { get; set; } = new(); // List of brands associated with the category
    }
}