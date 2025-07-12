using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using SHN_Gear.DTOs;
using System;

namespace SHNGear.Pages.Blog
{
    public class IndexModel : PageModel
    {
        public List<BlogPostDto> BlogPosts { get; set; }

        public async Task OnGetAsync()
        {
            try
            {
                using var http = new HttpClient();
                // Lấy base URL động từ request
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var apiUrl = $"{baseUrl}/api/BlogPosts";
                BlogPosts = await http.GetFromJsonAsync<List<BlogPostDto>>(apiUrl);
            }
            catch (Exception ex)
            {
                BlogPosts = new List<BlogPostDto>();
                // Có thể log lỗi nếu cần
            }
        }
    }
}
