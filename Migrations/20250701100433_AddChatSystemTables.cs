using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class AddChatSystemTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AIKnowledgeBase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Topic = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Keywords = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductCategoryIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrandIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiresLogin = table.Column<bool>(type: "bit", nullable: false),
                    MinConfidenceScore = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EscalationThreshold = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIKnowledgeBase", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChatSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GuestName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GuestEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    AssignedAdminId = table.Column<int>(type: "int", nullable: true),
                    UserContext = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConfidenceScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RequiresHumanSupport = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatSessions_Users_AssignedAdminId",
                        column: x => x.AssignedAdminId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChatSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChatSessionId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Sender = table.Column<int>(type: "int", nullable: false),
                    SenderId = table.Column<int>(type: "int", nullable: true),
                    SenderUserId = table.Column<int>(type: "int", nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    AIConfidenceScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    AIIntent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AIContext = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiresEscalation = table.Column<bool>(type: "bit", nullable: false),
                    AttachmentsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SuggestedActionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_ChatSessions_ChatSessionId",
                        column: x => x.ChatSessionId,
                        principalTable: "ChatSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Users_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ChatSessionId",
                table: "ChatMessages",
                column: "ChatSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatSessions_AssignedAdminId",
                table: "ChatSessions",
                column: "AssignedAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatSessions_UserId",
                table: "ChatSessions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIKnowledgeBase");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "ChatSessions");
        }
    }
}
