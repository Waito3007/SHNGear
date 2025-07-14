using Microsoft.AspNetCore.Mvc;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SHN_Gear.DTOs; // Add this line

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/homepage-config")]
    public class HomepageConfigController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HomepageConfigController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetHomepageConfig()
        {
            var config = await _context.HomepageConfigurations.FirstOrDefaultAsync();

            if (config == null)
            {
                // Create a default configuration if none exists using DTOs
                var defaultHomepageConfig = new HomepageConfigDto
                {
                    Layout = new List<string> {
                        "hero",
                        "hero_slider",
                        "home_banner",
                        "categories",
                        "best_seller",
                        "pinned_products",
                        "special_offer",
                        "brand_trust"
                    },
                    Components = new HomepageComponentsDto
                    {
                        Hero = new HeroSectionDto
                        {
                            Enabled = true,
                            Background_type = "video",
                            Background_url = "/videos/hero-background.mp4",
                            Headline = "GEAR FOR THE NEXT GENERATION",
                            Slogan = "Unleash Your Potential.",
                            Cta_text = "Explore Now",
                            Cta_link = "/products"
                        },
                        Categories = new CategoriesSectionDto
                        {
                            Enabled = true,
                            Items = new List<HomepageCategoryItemDto>
                            {
                                new HomepageCategoryItemDto { CategoryId = 1, DisplayOrder = 1, Name = "Laptops", Image_url = "/images/categories/laptops.png", Link = "/products/laptops" },
                                new HomepageCategoryItemDto { CategoryId = 2, DisplayOrder = 2, Name = "Keyboards", Image_url = "/images/categories/keyboards.png", Link = "/products/keyboards" },
                                new HomepageCategoryItemDto { CategoryId = 3, DisplayOrder = 3, Name = "Mice", Image_url = "/images/categories/mice.png", Link = "/products/mice" },
                                new HomepageCategoryItemDto { CategoryId = 4, DisplayOrder = 4, Name = "Headsets", Image_url = "/images/categories/headsets.png", Link = "/products/headsets" }
                            }
                        },
                        Hero_slider = new HeroSliderSectionDto
                        {
                            Enabled = true,
                            Title = "Featured Products",
                            Description = "Discover our latest gaming gear"
                        },
                        Home_banner = new HomeBannerSectionDto
                        {
                            Enabled = true,
                            Title = "Special Promotions",
                            Description = "Don't miss our amazing deals"
                        },
                        Pinned_products = new PinnedProductsSectionDto
                        {
                            Enabled = true,
                            Title = "Staff Picks",
                            Description = "Our team's favorite products"
                        },
                        Featured_products = new FeaturedProductsSectionDto
                        {
                            Enabled = true,
                            Title = "Best Sellers",
                            Collection_id = "best-sellers"
                        },
                        Special_offer = new SpecialOfferSectionDto
                        {
                            Enabled = true,
                            Image_url = "/images/banners/special-offer.png",
                            Headline = "LIMITED TIME OFFER",
                            Sub_text = "Get 20% off on all gaming mice.",
                            Cta_text = "Shop Now",
                            Cta_link = "/products/mice",
                            Countdown_enabled = true,
                            Countdown_end_date = "2025-07-31T23:59:59"
                        },
                        Best_seller = new BestSellerSectionDto
                        {
                            Enabled = true,
                            Title = "Best Sellers",
                            Items = new List<BestSellerItemDto> { new BestSellerItemDto { ProductId = 1 }, new BestSellerItemDto { ProductId = 2 }, new BestSellerItemDto { ProductId = 3 } } // Example product IDs
                        },
                        Brand_trust = new BrandTrustSectionDto
                        {
                            Enabled = true,
                            Logos = new List<BrandLogoDto>
                            {
                                new BrandLogoDto { Id = 1, Name = "Brand A", Logo_url = "/images/brands/logo-a.svg" },
                                new BrandLogoDto { Id = 2, Name = "Brand B", Logo_url = "/images/brands/logo-b.svg" },
                                new BrandLogoDto { Id = 3, Name = "Brand C", Logo_url = "/images/brands/logo-c.svg" },
                                new BrandLogoDto { Id = 4, Name = "Brand D", Logo_url = "/images/brands/logo-d.svg" }
                            },
                            Commitments = new List<CommitmentDto>
                            {
                                new CommitmentDto { Id = 1, Icon = "shipping", Title = "Fast Shipping", Description = "Nationwide delivery." },
                                new CommitmentDto { Id = 2, Icon = "warranty", Title = "24-Month Warranty", Description = "On all products." },
                                new CommitmentDto { Id = 3, Icon = "support", Title = "24/7 Support", Description = "Always here to help." }
                            }
                        }
                    }
                };

                config = new HomepageConfig
                {
                    ConfigJson = JsonConvert.SerializeObject(defaultHomepageConfig, Formatting.Indented),
                    LastUpdated = DateTime.UtcNow,
                    UpdatedBy = "System"
                };
                _context.HomepageConfigurations.Add(config);
                await _context.SaveChangesAsync();
            }

            var settings = new JsonSerializerSettings
            {
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            var homepageConfigDto = JsonConvert.DeserializeObject<HomepageConfigDto>(config.ConfigJson, settings);
            return Ok(homepageConfigDto);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateHomepageConfig([FromBody] HomepageConfigDto newConfigDto)
        {
            if (newConfigDto == null)
            {
                return BadRequest("Configuration data is required.");
            }

            var config = await _context.HomepageConfigurations.FirstOrDefaultAsync();

            if (config == null)
            {
                // If no config exists, create one (should ideally be handled by Get on first load)
                config = new HomepageConfig();
                _context.HomepageConfigurations.Add(config);
            }

            config.ConfigJson = JsonConvert.SerializeObject(newConfigDto, Formatting.Indented);
            config.LastUpdated = DateTime.UtcNow;
            // You might want to get the current user's name here for UpdatedBy
            config.UpdatedBy = User.Identity?.Name ?? "Admin";

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
