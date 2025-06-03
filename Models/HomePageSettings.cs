using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class HomePageSettings
    {
        [Key]
        public int Id { get; set; }

        // Hero Section Settings
        public string? HeroTitle { get; set; }
        public string? HeroSubtitle { get; set; }
        public string? HeroDescription { get; set; }
        public string? HeroCtaText { get; set; }
        public string? HeroCtaLink { get; set; }
        public string? HeroBackgroundImage { get; set; }
        public string? HeroBadgeText { get; set; }
        public bool HeroIsActive { get; set; } = true;

        // Hero Slides JSON data
        public string? HeroSlidesJson { get; set; }

        // Featured Categories Settings
        public string? FeaturedCategoriesTitle { get; set; }
        public string? FeaturedCategoriesSubtitle { get; set; }
        public string? FeaturedCategoriesJson { get; set; }
        public bool FeaturedCategoriesIsActive { get; set; } = true;

        // Product Showcase Settings
        public string? ProductShowcaseTitle { get; set; }
        public string? ProductShowcaseSubtitle { get; set; }
        public bool ProductShowcaseIsActive { get; set; } = true;

        // Promotional Banners Settings
        public string? PromotionalBannersTitle { get; set; }
        public string? PromotionalBannersSubtitle { get; set; }
        public string? PromotionalBannersJson { get; set; }
        public bool PromotionalBannersIsActive { get; set; } = true;

        // Customer Testimonials Settings
        public string? TestimonialsTitle { get; set; }
        public string? TestimonialsSubtitle { get; set; }
        public string? TestimonialsJson { get; set; }
        public bool TestimonialsIsActive { get; set; } = true;

        // Brand Story Settings
        public string? BrandStoryTitle { get; set; }
        public string? BrandStorySubtitle { get; set; }
        public string? BrandStoryDescription { get; set; }
        public string? BrandStoryImage { get; set; }
        public string? BrandStoryCtaText { get; set; }
        public string? BrandStoryCtaLink { get; set; }
        public string? BrandStoryStatsJson { get; set; }
        public bool BrandStoryIsActive { get; set; } = true;

        // Newsletter Settings
        public string? NewsletterTitle { get; set; }
        public string? NewsletterSubtitle { get; set; }
        public string? NewsletterCtaText { get; set; }
        public string? NewsletterBackgroundImage { get; set; }
        public bool NewsletterIsActive { get; set; } = true;

        // Services/Features Settings
        public string? ServicesJson { get; set; }
        public bool ServicesIsActive { get; set; } = true;

        // SEO Settings
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }

        // General Settings
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 1;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}