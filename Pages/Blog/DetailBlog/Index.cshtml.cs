using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SHN_Gear.DTOs;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System;

namespace SHNGear.Pages.Blog.DetailBlog
{
    public class IndexModel : PageModel
    {
        public BlogPostDto BlogPost { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            try
            {
                using var http = new HttpClient();
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var apiUrl = $"{baseUrl}/api/BlogPosts/{id}";
                BlogPost = await http.GetFromJsonAsync<BlogPostDto>(apiUrl);
                if (BlogPost == null) return NotFound();
            }
            catch (Exception)
            {
                BlogPost = null;
            }
            return Page();
        }
    }
}
