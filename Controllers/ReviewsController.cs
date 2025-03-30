using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    // 📌 Lấy danh sách đánh giá của một sản phẩm
    [HttpGet("product/{productVariantId}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByProduct(int productVariantId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductVariantId == productVariantId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }

    // 📌 Lấy trung bình đánh giá của sản phẩm
    [HttpGet("product/{productVariantId}/average-rating")]
    public async Task<ActionResult<double>> GetAverageRating(int productVariantId)
    {
        var averageRating = await _context.Reviews
            .Where(r => r.ProductVariantId == productVariantId)
            .AverageAsync(r => (double?)r.Rating) ?? 0;

        return Ok(averageRating);
    }

    // 📌 Thêm đánh giá mới
    [HttpPost]
    public async Task<ActionResult<Review>> AddReview([FromBody] Review reviewDto)
    {
        if (reviewDto == null || reviewDto.Rating < 1 || reviewDto.Rating > 5)
            return BadRequest("Dữ liệu đánh giá không hợp lệ.");

        var review = new Review
        {
            ProductVariantId = reviewDto.ProductVariantId,
            UserId = reviewDto.UserId,
            Rating = reviewDto.Rating,
            Comment = reviewDto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReviewsByProduct), new { productVariantId = review.ProductVariantId }, review);
    }

    // 📌 Chỉnh sửa đánh giá
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] Review reviewDto)
    {
        if (reviewDto == null)
            return BadRequest("Dữ liệu đánh giá không hợp lệ.");

        var existingReview = await _context.Reviews.FindAsync(id);
        if (existingReview == null)
            return NotFound("Không tìm thấy đánh giá.");

        existingReview.Rating = reviewDto.Rating;
        existingReview.Comment = reviewDto.Comment;

        _context.Reviews.Update(existingReview);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // 📌 Xóa đánh giá
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound("Không tìm thấy đánh giá.");

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}