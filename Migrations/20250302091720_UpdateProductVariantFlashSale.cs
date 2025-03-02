using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductVariantFlashSale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPrice",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FlashSaleEnd",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FlashSaleStart",
                table: "Products");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPrice",
                table: "ProductVariants",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FlashSaleEnd",
                table: "ProductVariants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FlashSaleStart",
                table: "ProductVariants",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPrice",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "FlashSaleEnd",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "FlashSaleStart",
                table: "ProductVariants");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPrice",
                table: "Products",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FlashSaleEnd",
                table: "Products",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FlashSaleStart",
                table: "Products",
                type: "datetime2",
                nullable: true);
        }
    }
}
