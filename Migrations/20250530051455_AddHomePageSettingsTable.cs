using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class AddHomePageSettingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HomePageSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HeroTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroCtaText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroCtaLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroBackgroundImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroBadgeText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeroIsActive = table.Column<bool>(type: "bit", nullable: false),
                    HeroSlidesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeaturedCategoriesTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeaturedCategoriesSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeaturedCategoriesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeaturedCategoriesIsActive = table.Column<bool>(type: "bit", nullable: false),
                    ProductShowcaseTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductShowcaseSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductShowcaseIsActive = table.Column<bool>(type: "bit", nullable: false),
                    PromotionalBannersTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PromotionalBannersSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PromotionalBannersJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PromotionalBannersIsActive = table.Column<bool>(type: "bit", nullable: false),
                    TestimonialsTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TestimonialsSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TestimonialsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TestimonialsIsActive = table.Column<bool>(type: "bit", nullable: false),
                    BrandStoryTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStorySubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStoryDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStoryImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStoryCtaText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStoryCtaLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStoryStatsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandStoryIsActive = table.Column<bool>(type: "bit", nullable: false),
                    NewsletterTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewsletterSubtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewsletterCtaText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewsletterBackgroundImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewsletterIsActive = table.Column<bool>(type: "bit", nullable: false),
                    ServicesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServicesIsActive = table.Column<bool>(type: "bit", nullable: false),
                    MetaTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetaKeywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomePageSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomePageSettings");
        }
    }
}
