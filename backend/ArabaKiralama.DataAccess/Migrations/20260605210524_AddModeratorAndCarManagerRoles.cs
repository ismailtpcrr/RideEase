using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ArabaKiralama.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddModeratorAndCarManagerRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "a1b2c3d4-0003-0003-0003-000000000003", null, "Moderator", "MODERATOR" },
                    { "a1b2c3d4-0004-0004-0004-000000000004", null, "CarManager", "CARMANAGER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-0003-0003-0003-000000000003");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a1b2c3d4-0004-0004-0004-000000000004");
        }
    }
}
