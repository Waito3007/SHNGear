using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class CompleteSchemaUpdate : Migration
    {        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check and drop foreign key if it exists
            migrationBuilder.Sql(@"
                IF EXISTS(SELECT * FROM sys.foreign_keys WHERE name = 'FK_Reviews_ProductVariants_ProductVariantId')
                BEGIN
                    ALTER TABLE [Reviews] DROP CONSTRAINT [FK_Reviews_ProductVariants_ProductVariantId];
                END
            ");

            // Check and drop tables if they exist
            migrationBuilder.Sql(@"
                IF EXISTS(SELECT * FROM sys.tables WHERE name = 'HeadphoneSpecifications')
                BEGIN
                    DROP TABLE [HeadphoneSpecifications];
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS(SELECT * FROM sys.tables WHERE name = 'LaptopSpecifications')
                BEGIN
                    DROP TABLE [LaptopSpecifications];
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS(SELECT * FROM sys.tables WHERE name = 'PhoneSpecifications')
                BEGIN
                    DROP TABLE [PhoneSpecifications];
                END
            ");

            // Check and rename column if it exists
            migrationBuilder.Sql(@"
                IF EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Reviews') AND name = 'ProductVariantId')
                BEGIN
                    EXEC sp_rename 'Reviews.ProductVariantId', 'ProductId', 'COLUMN';
                END
            ");

            // Check and rename index if it exists
            migrationBuilder.Sql(@"
                IF EXISTS(SELECT * FROM sys.indexes WHERE name = 'IX_Reviews_ProductVariantId')
                BEGIN
                    EXEC sp_rename 'Reviews.IX_Reviews_ProductVariantId', 'IX_Reviews_ProductId', 'INDEX';
                END
            ");

            // Check and add IsApproved column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Reviews') AND name = 'IsApproved')
                BEGIN
                    ALTER TABLE [Reviews] ADD [IsApproved] bit NOT NULL DEFAULT 0;
                END            ");

            // Check and create ProductSpecifications table if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.tables WHERE name = 'ProductSpecifications')
                BEGIN
                    CREATE TABLE [ProductSpecifications] (
                        [Id] int NOT NULL IDENTITY,
                        [ProductId] int NOT NULL,
                        [Name] nvarchar(max) NOT NULL,
                        [Value] nvarchar(max) NOT NULL,
                        [Unit] nvarchar(max) NULL,
                        [DisplayOrder] int NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_ProductSpecifications] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_ProductSpecifications_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
                    );
                    
                    CREATE INDEX [IX_ProductSpecifications_ProductId] ON [ProductSpecifications] ([ProductId]);
                END            ");

            // Check and add foreign key if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.foreign_keys WHERE name = 'FK_Reviews_Products_ProductId')
                BEGIN
                    ALTER TABLE [Reviews] ADD CONSTRAINT [FK_Reviews_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Products_ProductId",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Reviews");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "Reviews",
                newName: "ProductVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_ProductId",
                table: "Reviews",
                newName: "IX_Reviews_ProductVariantId");

            migrationBuilder.CreateTable(
                name: "HeadphoneSpecifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ConnectionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Port = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weight = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HeadphoneSpecifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HeadphoneSpecifications_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaptopSpecifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    CPUNumberOfCores = table.Column<int>(type: "int", nullable: false),
                    CPUType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Material = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxRAMSupport = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RAM = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefreshRate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Resolution = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SSDStorage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScreenSize = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SupportsTouch = table.Column<bool>(type: "bit", nullable: false),
                    Weight = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaptopSpecifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LaptopSpecifications_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhoneSpecifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    BatteryCapacity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CPUCores = table.Column<int>(type: "int", nullable: false),
                    CPUModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FrontCamera = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InternalStorage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Material = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RAM = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RearCamera = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Resolution = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScreenSize = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScreenType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SupportsNFC = table.Column<bool>(type: "bit", nullable: false),
                    Weight = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhoneSpecifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhoneSpecifications_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HeadphoneSpecifications_ProductId",
                table: "HeadphoneSpecifications",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_LaptopSpecifications_ProductId",
                table: "LaptopSpecifications",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PhoneSpecifications_ProductId",
                table: "PhoneSpecifications",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ProductVariants_ProductVariantId",
                table: "Reviews",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
