using Microsoft.EntityFrameworkCore.Migrations;

namespace pogoshift.Migrations
{
    public partial class AddUsertoShift : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "Shifts",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_UserId",
                table: "Shifts",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Shifts_AbpUsers_UserId",
                table: "Shifts",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shifts_AbpUsers_UserId",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_UserId",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Shifts");
        }
    }
}
