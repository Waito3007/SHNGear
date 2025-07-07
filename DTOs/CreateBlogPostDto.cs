using System.ComponentModel.DataAnnotations;

namespace SHN_Gear.DTOs
{
    public class CreateBlogPostDto
    {
        [Required]
        [MaxLength(250)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public bool IsPublished { get; set; } = false;
    }
}
