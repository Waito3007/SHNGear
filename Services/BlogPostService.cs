using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

namespace SHN_Gear.Services
{
    public class BlogPostService
    {
        private readonly AppDbContext _context;
        public BlogPostService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<BlogPostDto>> GetAllAsync()
        {
            return await _context.BlogPosts
                .Include(bp => bp.Author)
                .Include(bp => bp.Images)
                .Select(bp => new BlogPostDto
                {
                    Id = bp.Id,
                    Title = bp.Title,
                    Content = bp.Content,
                    AuthorId = bp.AuthorId,
                    AuthorName = bp.Author.FullName,
                    CreatedAt = bp.CreatedAt,
                    UpdatedAt = bp.UpdatedAt,
                    IsPublished = bp.IsPublished,
                    Images = bp.Images.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();
        }

        public async Task<BlogPostDto> GetByIdAsync(int id)
        {
            return await _context.BlogPosts
                .Include(bp => bp.Author)
                .Include(bp => bp.Images)
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
                    IsPublished = bp.IsPublished,
                    Images = bp.Images.Select(img => img.ImageUrl).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<BlogPostDto> CreateAsync(CreateBlogPostDto dto, int authorId)
        {
            var blogPost = new BlogPost
            {
                Title = dto.Title,
                Content = dto.Content,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsPublished = dto.IsPublished
            };
            _context.BlogPosts.Add(blogPost);
            await _context.SaveChangesAsync();
            // Lấy lại blog vừa tạo (có thể bổ sung ảnh sau)
            return await GetByIdAsync(blogPost.Id);
        }

        public async Task<bool> UpdateAsync(int id, UpdateBlogPostDto dto)
        {
            var blogPost = await _context.BlogPosts.FindAsync(id);
            if (blogPost == null) return false;
            blogPost.Title = dto.Title;
            blogPost.Content = dto.Content;
            blogPost.UpdatedAt = DateTime.UtcNow;
            blogPost.IsPublished = dto.IsPublished;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var blogPost = await _context.BlogPosts.FindAsync(id);
            if (blogPost == null) return false;
            _context.BlogPosts.Remove(blogPost);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
