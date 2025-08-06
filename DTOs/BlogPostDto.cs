using System;
using System.ComponentModel.DataAnnotations;

namespace SHN_Gear.DTOs
{
    public class BlogPostDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } // To display author's name
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsPublished { get; set; }
        public List<string> Images { get; set; } = new List<string>();
    }
}
