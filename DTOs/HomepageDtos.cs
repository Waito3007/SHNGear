using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SHN_Gear.DTOs
{
    public class HomepageConfigDto
    {
        public List<string> Layout { get; set; } = new List<string>();
        public HomepageComponentsDto Components { get; set; } = new HomepageComponentsDto();
    }

    public class HomepageComponentsDto
    {
        public HeroSectionDto Hero { get; set; } = new HeroSectionDto();
        public HeroSliderSectionDto Hero_slider { get; set; } = new HeroSliderSectionDto();
        public HomeBannerSectionDto Home_banner { get; set; } = new HomeBannerSectionDto();
        public CategoriesSectionDto Categories { get; set; } = new CategoriesSectionDto();
        public FeaturedProductsSectionDto Featured_products { get; set; } = new FeaturedProductsSectionDto();
        public BestSellerSectionDto Best_seller { get; set; } = new BestSellerSectionDto();
        public PinnedProductsSectionDto Pinned_products { get; set; } = new PinnedProductsSectionDto();
        public SpecialOfferSectionDto Special_offer { get; set; } = new SpecialOfferSectionDto();
        public BrandTrustSectionDto Brand_trust { get; set; } = new BrandTrustSectionDto();
    }

    // New DTO for Categories Section
    public class CategoriesSectionDto
    {
        public bool Enabled { get; set; }
        public List<HomepageCategoryItemDto> Items { get; set; } = new List<HomepageCategoryItemDto>(); // Changed to HomepageCategoryItemDto
    }

    public class HomepageCategoryItemDto
    {
        public int CategoryId { get; set; }
        public int DisplayOrder { get; set; }
        // These will be populated on the fly for GET requests
        public string? Name { get; set; }
        public string? Image_url { get; set; }
        public string? Link { get; set; }
    }

    public class HeroSectionDto
    {
        public bool Enabled { get; set; }
        public string Background_type { get; set; } = "";
        public string Background_url { get; set; } = "";
        public string Headline { get; set; } = "";
        public string Slogan { get; set; } = "";
        public string Cta_text { get; set; } = "";
        public string Cta_link { get; set; } = "";
    }

    public class FeaturedProductsSectionDto
    {
        public bool Enabled { get; set; }
        public string Title { get; set; } = "";
        public string Collection_id { get; set; } = "";
    }

    public class SpecialOfferSectionDto
    {
        public bool Enabled { get; set; }
        public string Image_url { get; set; } = "";
        public string Headline { get; set; } = "";
        public string Sub_text { get; set; } = "";
        public string Cta_text { get; set; } = "";
        public string Cta_link { get; set; } = "";
        public bool Countdown_enabled { get; set; }
        public string Countdown_end_date { get; set; } = "";
        public decimal? OriginalPrice { get; set; }
        public decimal? DiscountPrice { get; set; }
    }

    public class BestSellerSectionDto
    {
        public bool Enabled { get; set; }
        public string Title { get; set; } = "";
        public List<BestSellerItemDto> Items { get; set; } = new List<BestSellerItemDto>();
    }

    public class BestSellerItemDto
    {
        public int ProductId { get; set; }
        public decimal? OverridePrice { get; set; }
    }

    public class BrandTrustSectionDto
    {
        public bool Enabled { get; set; }
        public List<BrandLogoDto> Logos { get; set; } = new List<BrandLogoDto>();
        public List<CommitmentDto> Commitments { get; set; } = new List<CommitmentDto>();
    }

    public class BrandLogoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Logo_url { get; set; } = "";
    }

    public class CommitmentDto
    {
        public int Id { get; set; }
        public string Icon { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
    }

    // New DTO classes for new components
    public class HeroSliderSectionDto
    {
        public bool Enabled { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
    }

    public class HomeBannerSectionDto
    {
        public bool Enabled { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
    }

    public class PinnedProductsSectionDto
    {
        public bool Enabled { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
    }
}