using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class FixChatMessageSenderUserRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Users_SenderUserId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "SenderUserId",
                table: "ChatMessages");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderId",
                table: "ChatMessages",
                column: "SenderId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Users_SenderId",
                table: "ChatMessages",
                column: "SenderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Users_SenderId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_SenderId",
                table: "ChatMessages");

            migrationBuilder.AddColumn<int>(
                name: "SenderUserId",
                table: "ChatMessages",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Users_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
