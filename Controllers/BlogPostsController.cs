using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SHN_Gear.Services;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogPostsController : ControllerBase
    {
        private readonly BlogPostService _service;

        public BlogPostsController(BlogPostService service)
        {
            _service = service;
        }

        // GET: api/BlogPosts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetBlogPosts()
        {
            var blogPosts = await _service.GetAllAsync();
            return Ok(blogPosts);
        }

        // GET: api/BlogPosts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BlogPostDto>> GetBlogPost(int id)
        {
            var blogPost = await _service.GetByIdAsync(id);

            if (blogPost == null)
            {
                return NotFound();
            }

            return Ok(blogPost);
        }

        // POST: api/BlogPosts
        [HttpPost]
        [Authorize(Roles = "Admin")] // Only Admins can create blog posts
        public async Task<ActionResult<BlogPostDto>> CreateBlogPost(CreateBlogPostDto createBlogPostDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var createdBlogPost = await _service.CreateAsync(createBlogPostDto, int.Parse(userId));
            if (createdBlogPost == null) return BadRequest();
            return CreatedAtAction(nameof(GetBlogPost), new { id = createdBlogPost.Id }, createdBlogPost);
        }

        // PUT: api/BlogPosts/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Only Admins can update blog posts
        public async Task<IActionResult> UpdateBlogPost(int id, UpdateBlogPostDto updateBlogPostDto)
        {
            var result = await _service.UpdateAsync(id, updateBlogPostDto);
            if (!result) return NotFound();
            return NoContent();
        }

        // DELETE: api/BlogPosts/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admins can delete blog posts
        public async Task<IActionResult> DeleteBlogPost(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // BlogPostExists logic moved to service if needed
    }
}
