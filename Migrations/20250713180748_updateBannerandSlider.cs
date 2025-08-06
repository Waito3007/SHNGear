using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class updateBannerandSlider : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Banner: thêm cột ImageUrl (không null)
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Banners",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Banner: thêm cột LinkTo (nullable)
            migrationBuilder.AddColumn<string>(
                name: "LinkTo",
                table: "Banners",
                type: "nvarchar(max)",
                nullable: true);

            // Slider: thêm cột ImageUrl (không null)
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Sliders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Banners");
            migrationBuilder.DropColumn(
                name: "LinkTo",
                table: "Banners");
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Sliders");
        }
    }
}
