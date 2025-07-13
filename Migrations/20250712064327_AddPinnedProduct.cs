using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class AddPinnedProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPinned",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPinned",
                table: "Products");
        }
    }
}
