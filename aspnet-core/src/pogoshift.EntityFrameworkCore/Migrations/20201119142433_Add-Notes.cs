using Microsoft.EntityFrameworkCore.Migrations;

namespace pogoshift.Migrations
{
    public partial class AddNotes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Shifts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Availabilities",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Note",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Availabilities");
        }
    }
}
