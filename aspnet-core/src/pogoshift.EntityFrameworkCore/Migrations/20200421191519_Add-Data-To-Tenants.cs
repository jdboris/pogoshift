using Microsoft.EntityFrameworkCore.Migrations;

namespace pogoshift.Migrations
{
    public partial class AddDataToTenants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressLine1",
                table: "AbpTenants",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressLine2",
                table: "AbpTenants",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DailyAssociateMinimum",
                table: "AbpTenants",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DailyManagerMinimum",
                table: "AbpTenants",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AbpTenants",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "AbpTenants",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StoreNumber",
                table: "AbpTenants",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressLine1",
                table: "AbpTenants");

            migrationBuilder.DropColumn(
                name: "AddressLine2",
                table: "AbpTenants");

            migrationBuilder.DropColumn(
                name: "DailyAssociateMinimum",
                table: "AbpTenants");

            migrationBuilder.DropColumn(
                name: "DailyManagerMinimum",
                table: "AbpTenants");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AbpTenants");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "AbpTenants");

            migrationBuilder.DropColumn(
                name: "StoreNumber",
                table: "AbpTenants");
        }
    }
}
