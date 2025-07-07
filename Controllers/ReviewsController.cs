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
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                UserId = r.UserId,
                UserName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsApproved = r.IsApproved,
                HasPurchased = _context.OrderItems
                                .Include(oi => oi.Order)
                                .Include(oi => oi.ProductVariant)
                                .Any(oi => oi.Order.UserId == r.UserId && oi.ProductVariant.ProductId == r.ProductId && oi.Order.OrderStatus == "Delivered")
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
            IsApproved = false // Mặc định là false, cần admin duyệt
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok("Đánh giá thành công, đang chờ duyệt");
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

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound("Không tìm thấy đánh giá");

        review.IsApproved = true;
        await _context.SaveChangesAsync();
        return Ok("Đánh giá đã được duyệt.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound("Không tìm thấy đánh giá");

        review.IsApproved = false;
        await _context.SaveChangesAsync();
        return Ok("Đánh giá đã bị từ chối.");
    }

    [Authorize]
    [HttpGet("user/{userId}/product/{productId}")]
    public async Task<ActionResult<ReviewDto>> GetUserReviewForProduct(int userId, int productId)
    {
        var review = await _context.Reviews
            .Where(r => r.UserId == userId && r.ProductId == productId)
            .Include(r => r.User)
            .Include(r => r.Product)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                UserId = r.UserId,
                UserName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsApproved = r.IsApproved,
                HasPurchased = _context.OrderItems
                                .Include(oi => oi.Order)
                                .Include(oi => oi.ProductVariant)
                                .Any(oi => oi.Order.UserId == r.UserId && oi.ProductVariant.ProductId == r.ProductId && oi.Order.OrderStatus == "Delivered")
            })
            .FirstOrDefaultAsync();

        if (review == null) return NotFound("Không tìm thấy đánh giá của người dùng cho sản phẩm này.");

        return Ok(review);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("analytics")]
    public async Task<ActionResult> GetReviewAnalytics()
    {
        var totalReviews = await _context.Reviews.CountAsync();
        var approvedReviews = await _context.Reviews.CountAsync(r => r.IsApproved);
        var pendingReviews = await _context.Reviews.CountAsync(r => !r.IsApproved);
        var averageRating = await _context.Reviews.AverageAsync(r => (double?)r.Rating) ?? 0;

        var ratingDistribution = await _context.Reviews
            .GroupBy(r => r.Rating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .OrderBy(x => x.Rating)
            .ToListAsync();

        return Ok(new
        {
            TotalReviews = totalReviews,
            ApprovedReviews = approvedReviews,
            PendingReviews = pendingReviews,
            AverageRating = averageRating,
            RatingDistribution = ratingDistribution
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetAllReviews(
        [FromQuery] bool? isApproved = null,
        [FromQuery] int? minRating = null,
        [FromQuery] int? maxRating = null,
        [FromQuery] int? productId = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? searchComment = null)
    {
        var query = _context.Reviews.AsQueryable();

        if (isApproved.HasValue)
        {
            query = query.Where(r => r.IsApproved == isApproved.Value);
        }

        if (minRating.HasValue)
        {
            query = query.Where(r => r.Rating >= minRating.Value);
        }

        if (maxRating.HasValue)
        {
            query = query.Where(r => r.Rating <= maxRating.Value);
        }

        if (productId.HasValue)
        {
            query = query.Where(r => r.ProductId == productId.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(r => r.UserId == userId.Value);
        }

        if (!string.IsNullOrEmpty(searchComment))
        {
            query = query.Where(r => r.Comment.Contains(searchComment));
        }

        var reviews = await query
            .Include(r => r.User)
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                UserId = r.UserId,
                UserName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsApproved = r.IsApproved,
                HasPurchased = _context.OrderItems
                                .Include(oi => oi.Order)
                                .Include(oi => oi.ProductVariant)
                                .Any(oi => oi.Order.UserId == r.UserId && oi.ProductVariant.ProductId == r.ProductId && oi.Order.OrderStatus == "Delivered")
            })
            .ToListAsync();

        return Ok(reviews);
    }
}