using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [Route("api/categories")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy tất cả danh mục
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        // 2. Lấy danh mục theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.Include(c => c.Brands).FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return NotFound();
            return category;
        }

        // 3. Tạo danh mục mới
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name) || string.IsNullOrWhiteSpace(category.Description))
            {
                return BadRequest("Tên và mô tả không được để trống.");
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // 4. Cập nhật danh mục
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            if (id != category.Id) return BadRequest();

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null) return NotFound();

            existingCategory.Name = category.Name;
            existingCategory.Description = category.Description;
            existingCategory.Image = category.Image;

            _context.Categories.Update(existingCategory);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. Xóa danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 6. Lấy danh sách brand theo category
        [HttpGet("{id}/brands")]
        public async Task<ActionResult<IEnumerable<Brand>>> GetBrandsByCategory(int id)
        {
            var category = await _context.Categories.Include(c => c.Brands).FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return NotFound();
            return Ok(category.Brands);
        }
    }
}
