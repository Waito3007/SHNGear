using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class AddProductQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_Price",
                table: "ProductVariants",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "IX_Products_IsFlashSale",
                table: "Products",
                column: "IsFlashSale");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductVariants_Price",
                table: "ProductVariants");

            migrationBuilder.DropIndex(
                name: "IX_Products_IsFlashSale",
                table: "Products");
        }
    }
}
