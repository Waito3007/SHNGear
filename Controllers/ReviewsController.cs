using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;
    public ReviewController(AppDbContext context) => _context = context;

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByProduct(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsApproved = r.IsApproved
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("product/{productId}/average-rating")]
    public async Task<ActionResult<double>> GetAverageRating(int productId)
    {
        var avg = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .AverageAsync(r => (double?)r.Rating) ?? 0;

        return Ok(avg);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (!await _context.Products.AnyAsync(p => p.Id == dto.ProductId))
            return NotFound("Sản phẩm không tồn tại");

        bool purchased = await _context.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.ProductVariant)
            .AnyAsync(oi => oi.Order.UserId == userId && oi.ProductVariant.ProductId == dto.ProductId && oi.Order.OrderStatus == "Delivered");

        if (!purchased)
            return BadRequest("Bạn cần mua và nhận hàng để đánh giá");

        bool reviewed = await _context.Reviews.AnyAsync(r => r.UserId == userId && r.ProductId == dto.ProductId);

        if (reviewed)
            return BadRequest("Bạn đã đánh giá sản phẩm này rồi");

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow,
            IsApproved = true
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok("Đánh giá thành công");
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var review = await _context.Reviews.FindAsync(id);

        if (review == null) return NotFound("Không tìm thấy đánh giá");
        if (review.UserId != userId) return Forbid("Không có quyền");

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var review = await _context.Reviews.FindAsync(id);

        if (review == null) return NotFound("Không tìm thấy đánh giá");
        if (review.UserId != userId) return Forbid("Không có quyền");

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
