using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomePageSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HomePageSettingsController> _logger;

        public HomePageSettingsController(AppDbContext context, ILogger<HomePageSettingsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/homepagesettings
        [HttpGet]
        public async Task<ActionResult<HomePageSettingsDto>> GetHomePageSettings()
        {
            try
            {
                var settings = await _context.HomePageSettings
                    .FirstOrDefaultAsync(x => x.IsActive);

                if (settings == null)
                {
                    // Tạo settings mặc định nếu chưa có
                    settings = await CreateDefaultSettings();
                }

                var dto = MapToDto(settings);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting homepage settings");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/homepagesettings/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<HomePageSettingsDto>> GetHomePageSettings(int id)
        {
            try
            {
                var settings = await _context.HomePageSettings.FindAsync(id);

                if (settings == null)
                {
                    return NotFound();
                }

                var dto = MapToDto(settings);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting homepage settings by id");
                return StatusCode(500, "Internal server error");
            }
        }        private bool IsCurrentUserAdmin()
        {
            // Kiểm tra bằng role name "Admin"
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);
            return roles.Contains("Admin");
        }// PUT: api/homepagesettings/{id}
        [HttpPut("{id}")]
        [Authorize] // Yêu cầu đăng nhập
        public async Task<IActionResult> UpdateHomePageSettings(int id, HomePageSettingsDto dto)
        {
            try
            {
                // Kiểm tra quyền admin
                if (!IsCurrentUserAdmin())
                {
                    return StatusCode(403, "Chỉ Admin mới có quyền cập nhật homepage settings");
                }

                if (id != dto.Id)
                {
                    return BadRequest();
                }

                var settings = await _context.HomePageSettings.FindAsync(id);
                if (settings == null)
                {
                    return NotFound();
                }

                MapFromDto(dto, settings);
                settings.UpdatedAt = DateTime.UtcNow;

                _context.Entry(settings).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating homepage settings");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/homepagesettings
        [HttpPost]
        [Authorize] // Yêu cầu đăng nhập
        public async Task<ActionResult<HomePageSettingsDto>> CreateHomePageSettings(HomePageSettingsDto dto)
        {
            try
            {
                // Kiểm tra quyền admin
                if (!IsCurrentUserAdmin())
                {
                    return StatusCode(403, "Chỉ Admin mới có quyền tạo homepage settings");
                }

                // Lấy thông tin user hiện tại từ JWT token
                var currentUserId = User.FindFirst("UserId")?.Value;
                var currentUserEmail = User.Identity?.Name;
                var userRoles = User.FindAll("role").Select(c => c.Value);

                _logger.LogInformation($"User {currentUserEmail} (ID: {currentUserId}) with roles [{string.Join(", ", userRoles)}] is creating homepage settings");

                var settings = new HomePageSettings();
                MapFromDto(dto, settings);
                settings.CreatedAt = DateTime.UtcNow;
                settings.UpdatedAt = DateTime.UtcNow;

                _context.HomePageSettings.Add(settings);
                await _context.SaveChangesAsync();

                dto.Id = settings.Id;
                return CreatedAtAction(nameof(GetHomePageSettings), new { id = settings.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating homepage settings");
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/homepagesettings/{id}
        [HttpDelete("{id}")]
        [Authorize] // Yêu cầu đăng nhập
        public async Task<IActionResult> DeleteHomePageSettings(int id)
        {
            try
            {
                // Kiểm tra quyền admin
                if (!IsCurrentUserAdmin())
                {
                    return StatusCode(403, "Chỉ Admin mới có quyền xóa homepage settings");
                }

                var settings = await _context.HomePageSettings.FindAsync(id);
                if (settings == null)
                {
                    return NotFound();
                }

                _context.HomePageSettings.Remove(settings);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting homepage settings");
                return StatusCode(500, "Internal server error");
            }
        }

        // DEBUG: Test authentication
        [HttpGet("debug/auth")]
        [Authorize]
        public IActionResult DebugAuth()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var roleId = User.FindFirst("roleId")?.Value;
            var allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            
            return Ok(new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                UserId = userId,
                Role = role,
                RoleId = roleId,
                IsAdmin = User.IsInRole("Admin"),
                AllClaims = allClaims
            });
        }

        private HomePageSettingsDto MapToDto(HomePageSettings settings)
        {
            var dto = new HomePageSettingsDto
            {
                Id = settings.Id,
                HeroTitle = settings.HeroTitle,
                HeroSubtitle = settings.HeroSubtitle,
                HeroDescription = settings.HeroDescription,
                HeroCtaText = settings.HeroCtaText,
                HeroCtaLink = settings.HeroCtaLink,
                HeroBackgroundImage = settings.HeroBackgroundImage,
                HeroBadgeText = settings.HeroBadgeText,
                HeroIsActive = settings.HeroIsActive,

                FeaturedCategoriesTitle = settings.FeaturedCategoriesTitle,
                FeaturedCategoriesSubtitle = settings.FeaturedCategoriesSubtitle,
                FeaturedCategoriesIsActive = settings.FeaturedCategoriesIsActive,

                ProductShowcaseTitle = settings.ProductShowcaseTitle,
                ProductShowcaseSubtitle = settings.ProductShowcaseSubtitle,
                ProductShowcaseIsActive = settings.ProductShowcaseIsActive,

                PromotionalBannersTitle = settings.PromotionalBannersTitle,
                PromotionalBannersSubtitle = settings.PromotionalBannersSubtitle,
                PromotionalBannersIsActive = settings.PromotionalBannersIsActive,

                TestimonialsTitle = settings.TestimonialsTitle,
                TestimonialsSubtitle = settings.TestimonialsSubtitle,
                TestimonialsIsActive = settings.TestimonialsIsActive,

                BrandStoryTitle = settings.BrandStoryTitle,
                BrandStorySubtitle = settings.BrandStorySubtitle,
                BrandStoryDescription = settings.BrandStoryDescription,
                BrandStoryImage = settings.BrandStoryImage,
                BrandStoryCtaText = settings.BrandStoryCtaText,
                BrandStoryCtaLink = settings.BrandStoryCtaLink,
                BrandStoryIsActive = settings.BrandStoryIsActive,

                NewsletterTitle = settings.NewsletterTitle,
                NewsletterSubtitle = settings.NewsletterSubtitle,
                NewsletterCtaText = settings.NewsletterCtaText,
                NewsletterBackgroundImage = settings.NewsletterBackgroundImage,
                NewsletterIsActive = settings.NewsletterIsActive,

                ServicesIsActive = settings.ServicesIsActive,
                MetaTitle = settings.MetaTitle,
                MetaDescription = settings.MetaDescription,
                MetaKeywords = settings.MetaKeywords,
                IsActive = settings.IsActive,
                DisplayOrder = settings.DisplayOrder,
                CreatedAt = settings.CreatedAt,
                UpdatedAt = settings.UpdatedAt,
                CreatedBy = settings.CreatedBy,
                UpdatedBy = settings.UpdatedBy
            };

            // Parse JSON fields
            if (!string.IsNullOrEmpty(settings.HeroSlidesJson))
            {
                try
                {
                    dto.HeroSlides = JsonSerializer.Deserialize<List<HeroSlideDto>>(settings.HeroSlidesJson);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse HeroSlidesJson");
                    dto.HeroSlides = new List<HeroSlideDto>();
                }
            }

            if (!string.IsNullOrEmpty(settings.FeaturedCategoriesJson))
            {
                try
                {
                    dto.FeaturedCategories = JsonSerializer.Deserialize<List<FeaturedCategoryDto>>(settings.FeaturedCategoriesJson);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse FeaturedCategoriesJson");
                    dto.FeaturedCategories = new List<FeaturedCategoryDto>();
                }
            }

            if (!string.IsNullOrEmpty(settings.PromotionalBannersJson))
            {
                try
                {
                    dto.PromotionalBanners = JsonSerializer.Deserialize<List<PromotionalBannerDto>>(settings.PromotionalBannersJson);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse PromotionalBannersJson");
                    dto.PromotionalBanners = new List<PromotionalBannerDto>();
                }
            }

            if (!string.IsNullOrEmpty(settings.TestimonialsJson))
            {
                try
                {
                    dto.Testimonials = JsonSerializer.Deserialize<List<TestimonialDto>>(settings.TestimonialsJson);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse TestimonialsJson");
                    dto.Testimonials = new List<TestimonialDto>();
                }
            }

            if (!string.IsNullOrEmpty(settings.BrandStoryStatsJson))
            {
                try
                {
                    dto.BrandStats = JsonSerializer.Deserialize<List<BrandStatDto>>(settings.BrandStoryStatsJson);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse BrandStoryStatsJson");
                    dto.BrandStats = new List<BrandStatDto>();
                }
            }

            if (!string.IsNullOrEmpty(settings.ServicesJson))
            {
                try
                {
                    dto.Services = JsonSerializer.Deserialize<List<ServiceFeatureDto>>(settings.ServicesJson);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse ServicesJson");
                    dto.Services = new List<ServiceFeatureDto>();
                }
            }

            return dto;
        }

        private void MapFromDto(HomePageSettingsDto dto, HomePageSettings settings)
        {
            settings.HeroTitle = dto.HeroTitle;
            settings.HeroSubtitle = dto.HeroSubtitle;
            settings.HeroDescription = dto.HeroDescription;
            settings.HeroCtaText = dto.HeroCtaText;
            settings.HeroCtaLink = dto.HeroCtaLink;
            settings.HeroBackgroundImage = dto.HeroBackgroundImage;
            settings.HeroBadgeText = dto.HeroBadgeText;
            settings.HeroIsActive = dto.HeroIsActive;

            settings.FeaturedCategoriesTitle = dto.FeaturedCategoriesTitle;
            settings.FeaturedCategoriesSubtitle = dto.FeaturedCategoriesSubtitle;
            settings.FeaturedCategoriesIsActive = dto.FeaturedCategoriesIsActive;

            settings.ProductShowcaseTitle = dto.ProductShowcaseTitle;
            settings.ProductShowcaseSubtitle = dto.ProductShowcaseSubtitle;
            settings.ProductShowcaseIsActive = dto.ProductShowcaseIsActive;

            settings.PromotionalBannersTitle = dto.PromotionalBannersTitle;
            settings.PromotionalBannersSubtitle = dto.PromotionalBannersSubtitle;
            settings.PromotionalBannersIsActive = dto.PromotionalBannersIsActive;

            settings.TestimonialsTitle = dto.TestimonialsTitle;
            settings.TestimonialsSubtitle = dto.TestimonialsSubtitle;
            settings.TestimonialsIsActive = dto.TestimonialsIsActive;

            settings.BrandStoryTitle = dto.BrandStoryTitle;
            settings.BrandStorySubtitle = dto.BrandStorySubtitle;
            settings.BrandStoryDescription = dto.BrandStoryDescription;
            settings.BrandStoryImage = dto.BrandStoryImage;
            settings.BrandStoryCtaText = dto.BrandStoryCtaText;
            settings.BrandStoryCtaLink = dto.BrandStoryCtaLink;
            settings.BrandStoryIsActive = dto.BrandStoryIsActive;

            settings.NewsletterTitle = dto.NewsletterTitle;
            settings.NewsletterSubtitle = dto.NewsletterSubtitle;
            settings.NewsletterCtaText = dto.NewsletterCtaText;
            settings.NewsletterBackgroundImage = dto.NewsletterBackgroundImage;
            settings.NewsletterIsActive = dto.NewsletterIsActive;

            settings.ServicesIsActive = dto.ServicesIsActive;
            settings.MetaTitle = dto.MetaTitle;
            settings.MetaDescription = dto.MetaDescription;
            settings.MetaKeywords = dto.MetaKeywords;
            settings.IsActive = dto.IsActive;
            settings.DisplayOrder = dto.DisplayOrder;

            // Serialize JSON fields
            if (dto.HeroSlides != null)
            {
                settings.HeroSlidesJson = JsonSerializer.Serialize(dto.HeroSlides);
            }

            if (dto.FeaturedCategories != null)
            {
                settings.FeaturedCategoriesJson = JsonSerializer.Serialize(dto.FeaturedCategories);
            }

            if (dto.PromotionalBanners != null)
            {
                settings.PromotionalBannersJson = JsonSerializer.Serialize(dto.PromotionalBanners);
            }

            if (dto.Testimonials != null)
            {
                settings.TestimonialsJson = JsonSerializer.Serialize(dto.Testimonials);
            }

            if (dto.BrandStats != null)
            {
                settings.BrandStoryStatsJson = JsonSerializer.Serialize(dto.BrandStats);
            }

            if (dto.Services != null)
            {
                settings.ServicesJson = JsonSerializer.Serialize(dto.Services);
            }
        }

        private async Task<HomePageSettings> CreateDefaultSettings()
        {
            var defaultSettings = new HomePageSettings
            {
                HeroTitle = "Chào mừng đến với SHN Gear",
                HeroSubtitle = "Khám phá những sản phẩm công nghệ hàng đầu",
                HeroDescription = "Mang đến cho bạn những trải nghiệm tuyệt vời với các sản phẩm công nghệ chất lượng cao",
                HeroCtaText = "Khám phá ngay",
                HeroCtaLink = "/products",
                HeroBadgeText = "Đáng tin cậy",
                HeroIsActive = true,

                FeaturedCategoriesTitle = "Danh mục nổi bật",
                FeaturedCategoriesSubtitle = "Khám phá các danh mục sản phẩm công nghệ hàng đầu",
                FeaturedCategoriesIsActive = true,

                ProductShowcaseTitle = "Sản phẩm đặc sắc",
                ProductShowcaseSubtitle = "Những sản phẩm được lựa chọn kỹ càng dành cho bạn",
                ProductShowcaseIsActive = true,

                PromotionalBannersTitle = "Ưu đãi đặc biệt",
                PromotionalBannersSubtitle = "Những chương trình khuyến mãi hấp dẫn",
                PromotionalBannersIsActive = true,

                TestimonialsTitle = "Khách hàng nói gì",
                TestimonialsSubtitle = "Trải nghiệm thực tế từ khách hàng của chúng tôi",
                TestimonialsIsActive = true,

                BrandStoryTitle = "Câu chuyện SHN Gear",
                BrandStorySubtitle = "Hành trình mang công nghệ đến mọi người",
                BrandStoryDescription = "Chúng tôi tin rằng công nghệ có thể thay đổi cuộc sống",
                BrandStoryCtaText = "Tìm hiểu thêm",
                BrandStoryCtaLink = "/about",
                BrandStoryIsActive = true,

                NewsletterTitle = "Đăng ký nhận tin",
                NewsletterSubtitle = "Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt",
                NewsletterCtaText = "Đăng ký ngay",
                NewsletterIsActive = true,

                ServicesIsActive = true,
                IsActive = true,
                DisplayOrder = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.HomePageSettings.Add(defaultSettings);
            await _context.SaveChangesAsync();
            return defaultSettings;
        }
    }
}