// Models/DTOs/SearchDto.cs
namespace SHN_Gear.Models.DTOs
{
    public class SearchResultDto
    {
        public List<SearchProductDto> Products { get; set; } = new List<SearchProductDto>();
        public List<SearchCategoryDto> Categories { get; set; } = new List<SearchCategoryDto>();
        public List<SearchBrandDto> Brands { get; set; } = new List<SearchBrandDto>();
        public int TotalResults { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class SearchProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
    }

    public class SearchCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class SearchBrandDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string LogoUrl { get; set; }
    }
}