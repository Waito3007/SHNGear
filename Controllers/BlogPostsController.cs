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

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogPostsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BlogPostsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/BlogPosts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetBlogPosts()
        {
            var blogPosts = await _context.BlogPosts
                .Include(bp => bp.Author)
                .Select(bp => new BlogPostDto
                {
                    Id = bp.Id,
                    Title = bp.Title,
                    Content = bp.Content,
                    AuthorId = bp.AuthorId,
                    AuthorName = bp.Author.FullName, // Using FullName property from User model
                    CreatedAt = bp.CreatedAt,
                    UpdatedAt = bp.UpdatedAt,
                    IsPublished = bp.IsPublished
                })
                .ToListAsync();
            return Ok(blogPosts);
        }

        // GET: api/BlogPosts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BlogPostDto>> GetBlogPost(int id)
        {
            var blogPost = await _context.BlogPosts
                .Include(bp => bp.Author)
                .Where(bp => bp.Id == id)
                .Select(bp => new BlogPostDto
                {
                    Id = bp.Id,
                    Title = bp.Title,
                    Content = bp.Content,
                    AuthorId = bp.AuthorId,
                    AuthorName = bp.Author.FullName,
                    CreatedAt = bp.CreatedAt,
                    UpdatedAt = bp.UpdatedAt,
                    IsPublished = bp.IsPublished
                })
                .FirstOrDefaultAsync();

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

            var blogPost = new BlogPost
            {
                Title = createBlogPostDto.Title,
                Content = createBlogPostDto.Content,
                AuthorId = int.Parse(userId),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsPublished = createBlogPostDto.IsPublished
            };

            _context.BlogPosts.Add(blogPost);
            await _context.SaveChangesAsync();

            var createdBlogPost = await _context.BlogPosts
                .Include(bp => bp.Author)
                .Where(bp => bp.Id == blogPost.Id)
                .Select(bp => new BlogPostDto
                {
                    Id = bp.Id,
                    Title = bp.Title,
                    Content = bp.Content,
                    AuthorId = bp.AuthorId,
                    AuthorName = bp.Author.FullName,
                    CreatedAt = bp.CreatedAt,
                    UpdatedAt = bp.UpdatedAt,
                    IsPublished = bp.IsPublished
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetBlogPost), new { id = createdBlogPost.Id }, createdBlogPost);
        }

        // PUT: api/BlogPosts/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Only Admins can update blog posts
        public async Task<IActionResult> UpdateBlogPost(int id, UpdateBlogPostDto updateBlogPostDto)
        {
            var blogPost = await _context.BlogPosts.FindAsync(id);

            if (blogPost == null)
            {
                return NotFound();
            }

            blogPost.Title = updateBlogPostDto.Title;
            blogPost.Content = updateBlogPostDto.Content;
            blogPost.UpdatedAt = DateTime.UtcNow;
            blogPost.IsPublished = updateBlogPostDto.IsPublished;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BlogPostExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/BlogPosts/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admins can delete blog posts
        public async Task<IActionResult> DeleteBlogPost(int id)
        {
            var blogPost = await _context.BlogPosts.FindAsync(id);
            if (blogPost == null)
            {
                return NotFound();
            }

            _context.BlogPosts.Remove(blogPost);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BlogPostExists(int id)
        {
            return _context.BlogPosts.Any(e => e.Id == id);
        }
    }
}
