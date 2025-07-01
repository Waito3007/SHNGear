using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChatSystemModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AIKnowledgeBase",
                table: "AIKnowledgeBase");

            migrationBuilder.RenameTable(
                name: "AIKnowledgeBase",
                newName: "AIKnowledgeBases");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AIKnowledgeBases",
                table: "AIKnowledgeBases",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AIKnowledgeBases",
                table: "AIKnowledgeBases");

            migrationBuilder.RenameTable(
                name: "AIKnowledgeBases",
                newName: "AIKnowledgeBase");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AIKnowledgeBase",
                table: "AIKnowledgeBase",
                column: "Id");
        }
    }
}
