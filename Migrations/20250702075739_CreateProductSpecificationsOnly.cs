using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHN_Gear.Migrations
{
    /// <inheritdoc />
    public partial class CreateProductSpecificationsOnly : Migration
    {        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ProductSpecifications table already exists in database (manually created)
            // This migration just updates the EF model state to match existing database structure
            // No actual database changes needed
        }        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No changes to revert since we didn't modify database structure
            // ProductSpecifications table should remain as it was manually created
        }
    }
}
