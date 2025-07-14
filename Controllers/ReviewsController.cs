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

    [HttpGet("product/{productId}/rating-distribution")]
    public async Task<ActionResult> GetProductRatingDistribution(int productId)
    {
        // Kiểm tra sản phẩm có tồn tại không
        if (!await _context.Products.AnyAsync(p => p.Id == productId))
            return NotFound("Sản phẩm không tồn tại");

        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .ToListAsync();

        var totalReviews = reviews.Count;
        var averageRating = totalReviews > 0 ? reviews.Average(r => r.Rating) : 0;

        // Tính phân bố rating từ 1-5 sao
        var ratingDistribution = new Dictionary<int, int>();
        for (int i = 1; i <= 5; i++)
        {
            ratingDistribution[i] = reviews.Count(r => r.Rating == i);
        }

        // Tính phần trăm cho mỗi rating
        var ratingPercentage = new Dictionary<int, double>();
        for (int i = 1; i <= 5; i++)
        {
            ratingPercentage[i] = totalReviews > 0 ? (double)ratingDistribution[i] / totalReviews * 100 : 0;
        }

        return Ok(new
        {
            ProductId = productId,
            TotalReviews = totalReviews,
            AverageRating = Math.Round(averageRating, 2),
            RatingDistribution = ratingDistribution,
            RatingPercentage = ratingPercentage,
            Details = new
            {
                FiveStar = new { Count = ratingDistribution[5], Percentage = Math.Round(ratingPercentage[5], 1) },
                FourStar = new { Count = ratingDistribution[4], Percentage = Math.Round(ratingPercentage[4], 1) },
                ThreeStar = new { Count = ratingDistribution[3], Percentage = Math.Round(ratingPercentage[3], 1) },
                TwoStar = new { Count = ratingDistribution[2], Percentage = Math.Round(ratingPercentage[2], 1) },
                OneStar = new { Count = ratingDistribution[1], Percentage = Math.Round(ratingPercentage[1], 1) }
            }
        });
    }

    [HttpGet("product/{productId}/stats")]
    public async Task<ActionResult> GetProductReviewStats(int productId)
    {
        // Kiểm tra sản phẩm có tồn tại không
        if (!await _context.Products.AnyAsync(p => p.Id == productId))
            return NotFound("Sản phẩm không tồn tại");

        var approvedReviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .ToListAsync();

        var pendingReviews = await _context.Reviews
            .CountAsync(r => r.ProductId == productId && !r.IsApproved);

        var totalReviews = approvedReviews.Count;
        var averageRating = totalReviews > 0 ? approvedReviews.Average(r => r.Rating) : 0;

        // Tính phân bố rating
        var ratingStats = new Dictionary<int, object>();
        for (int i = 1; i <= 5; i++)
        {
            var count = approvedReviews.Count(r => r.Rating == i);
            var percentage = totalReviews > 0 ? (double)count / totalReviews * 100 : 0;
            ratingStats[i] = new { Count = count, Percentage = Math.Round(percentage, 1) };
        }

        // Tính thống kê theo thời gian
        var last30Days = approvedReviews.Where(r => r.CreatedAt >= DateTime.UtcNow.AddDays(-30)).Count();
        var last7Days = approvedReviews.Where(r => r.CreatedAt >= DateTime.UtcNow.AddDays(-7)).Count();

        return Ok(new
        {
            ProductId = productId,
            TotalApprovedReviews = totalReviews,
            PendingReviews = pendingReviews,
            AverageRating = Math.Round(averageRating, 2),
            RatingStats = ratingStats,
            RecentActivity = new
            {
                Last7Days = last7Days,
                Last30Days = last30Days
            },
            LatestReviews = approvedReviews
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment.Length > 100 ? r.Comment.Substring(0, 100) + "..." : r.Comment,
                    CreatedAt = r.CreatedAt,
                    UserId = r.UserId
                })
                .ToList()
        });
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