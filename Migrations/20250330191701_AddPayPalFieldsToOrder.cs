using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class AddPayPalFieldsToOrder : Migration
    {        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check and add PayPalOrderId column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PayPalOrderId')
                BEGIN
                    ALTER TABLE [Orders] ADD [PayPalOrderId] nvarchar(max) NULL;
                END
            ");

            // Check and add PayPalPaymentUrl column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PayPalPaymentUrl')
                BEGIN
                    ALTER TABLE [Orders] ADD [PayPalPaymentUrl] nvarchar(max) NULL;
                END
            ");

            // Check and add PayPalResponse column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PayPalResponse')
                BEGIN
                    ALTER TABLE [Orders] ADD [PayPalResponse] nvarchar(max) NULL;
                END
            ");

            // Check and add PayPalTransactionId column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'PayPalTransactionId')
                BEGIN
                    ALTER TABLE [Orders] ADD [PayPalTransactionId] nvarchar(max) NULL;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PayPalOrderId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PayPalPaymentUrl",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PayPalResponse",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PayPalTransactionId",
                table: "Orders");
        }
    }
}