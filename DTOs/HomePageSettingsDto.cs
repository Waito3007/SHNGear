namespace SHN_Gear.DTOs
{
    public class HomePageSettingsDto
    {
        public int Id { get; set; }

        // Hero Section Settings
        public string? HeroTitle { get; set; }
        public string? HeroSubtitle { get; set; }
        public string? HeroDescription { get; set; }
        public string? HeroCtaText { get; set; }
        public string? HeroCtaLink { get; set; }
        public string? HeroBackgroundImage { get; set; }
        public string? HeroBadgeText { get; set; }
        public bool HeroIsActive { get; set; }
        public List<HeroSlideDto>? HeroSlides { get; set; }

        // Featured Categories Settings
        public string? FeaturedCategoriesTitle { get; set; }
        public string? FeaturedCategoriesSubtitle { get; set; }
        public List<FeaturedCategoryDto>? FeaturedCategories { get; set; }
        public bool FeaturedCategoriesIsActive { get; set; }

        // Product Showcase Settings
        public string? ProductShowcaseTitle { get; set; }
        public string? ProductShowcaseSubtitle { get; set; }
        public bool ProductShowcaseIsActive { get; set; }

        // Promotional Banners Settings
        public string? PromotionalBannersTitle { get; set; }
        public string? PromotionalBannersSubtitle { get; set; }
        public List<PromotionalBannerDto>? PromotionalBanners { get; set; }
        public bool PromotionalBannersIsActive { get; set; }

        // Customer Testimonials Settings
        public string? TestimonialsTitle { get; set; }
        public string? TestimonialsSubtitle { get; set; }
        public List<TestimonialDto>? Testimonials { get; set; }
        public bool TestimonialsIsActive { get; set; }

        // Brand Story Settings
        public string? BrandStoryTitle { get; set; }
        public string? BrandStorySubtitle { get; set; }
        public string? BrandStoryDescription { get; set; }
        public string? BrandStoryImage { get; set; }
        public string? BrandStoryCtaText { get; set; }
        public string? BrandStoryCtaLink { get; set; }
        public List<BrandStatDto>? BrandStats { get; set; }
        public bool BrandStoryIsActive { get; set; }

        // Newsletter Settings
        public string? NewsletterTitle { get; set; }
        public string? NewsletterSubtitle { get; set; }
        public string? NewsletterCtaText { get; set; }
        public string? NewsletterBackgroundImage { get; set; }
        public bool NewsletterIsActive { get; set; }

        // Services/Features Settings
        public List<ServiceFeatureDto>? Services { get; set; }
        public bool ServicesIsActive { get; set; }

        // SEO Settings
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }

        // General Settings
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class HeroSlideDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Subtitle { get; set; } = "";
        public string Description { get; set; } = "";
        public string Image { get; set; } = "";
        public string Badge { get; set; } = "";
        public string Price { get; set; } = "";
        public string OriginalPrice { get; set; } = "";
        public string Discount { get; set; } = "";
        public string CtaText { get; set; } = "";
        public string CtaLink { get; set; } = "";
        public string BackgroundColor { get; set; } = "";
        public List<string> Features { get; set; } = new();
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class FeaturedCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Image { get; set; } = "";
        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";
        public int ProductCount { get; set; }
        public bool Trending { get; set; }
        public string Link { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class PromotionalBannerDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = "";
        public string Title { get; set; } = "";
        public string Subtitle { get; set; } = "";
        public string Description { get; set; } = "";
        public string BackgroundImage { get; set; } = "";
        public string BackgroundColor { get; set; } = "";
        public string TextColor { get; set; } = "";
        public string CtaText { get; set; } = "";
        public string CtaLink { get; set; } = "";
        public string Icon { get; set; } = "";
        public string Badge { get; set; } = "";
        public string EndTime { get; set; } = "";
        public string Savings { get; set; } = "";
        public List<string> Features { get; set; } = new();
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class TestimonialDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Avatar { get; set; } = "";
        public string Position { get; set; } = "";
        public string Company { get; set; } = "";
        public string Content { get; set; } = "";
        public int Rating { get; set; }
        public string Product { get; set; } = "";
        public DateTime Date { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class BrandStatDto
    {
        public int Id { get; set; }
        public string Number { get; set; } = "";
        public string Label { get; set; } = "";
        public string Icon { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class ServiceFeatureDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}