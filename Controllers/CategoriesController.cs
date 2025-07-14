using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                                           .Select(c => new CategoryDto
                                           {
                                               Id = c.Id,
                                               Name = c.Name,
                                               Description = c.Description,
                                               Image = c.Image
                                           })
                                           .ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Image = category.Image
            });
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> PostCategory(CreateCategoryDto categoryDto)
        {
            var category = new Category
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                Image = categoryDto.Image
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var categoryResult = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Image = category.Image
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryResult);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, CreateCategoryDto categoryDto) // Using CreateCategoryDto for update as well
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            category.Image = categoryDto.Image;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("product-count")]
        public async Task<ActionResult<IEnumerable<object>>> GetCategoryProductCount()
        {
            var categoryData = await _context.Categories
                .Select(c => new
                {
                    name = c.Name,
                    value = c.Products.Count()
                })
                .Where(x => x.value > 0) // Only include categories with products
                .ToListAsync();

            return Ok(categoryData);
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}