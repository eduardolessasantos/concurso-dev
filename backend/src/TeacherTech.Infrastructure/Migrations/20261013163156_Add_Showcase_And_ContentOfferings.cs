using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeacherTech.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_Showcase_And_ContentOfferings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Pomelo.EntityFrameworkCore.MySql")
            {
                migrationBuilder.Sql(@"
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `BannerImageUrl` longtext CHARACTER SET utf8mb4 NULL;
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `City` longtext CHARACTER SET utf8mb4 NULL;
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `SocialLinksJson` longtext CHARACTER SET utf8mb4 NULL;
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `State` longtext CHARACTER SET utf8mb4 NULL;
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `ThemeColor` longtext CHARACTER SET utf8mb4 NULL;
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `VideoIntroUrl` longtext CHARACTER SET utf8mb4 NULL;
                    ALTER TABLE `ProfessorProfiles` ADD COLUMN IF NOT EXISTS `WhatsAppNumber` longtext CHARACTER SET utf8mb4 NULL;
                ");
            }
            else
            {
                migrationBuilder.AddColumn<string>(name: "BannerImageUrl", table: "ProfessorProfiles", type: "TEXT", nullable: true);
                migrationBuilder.AddColumn<string>(name: "City", table: "ProfessorProfiles", type: "TEXT", nullable: true);
                migrationBuilder.AddColumn<string>(name: "SocialLinksJson", table: "ProfessorProfiles", type: "TEXT", nullable: true);
                migrationBuilder.AddColumn<string>(name: "State", table: "ProfessorProfiles", type: "TEXT", nullable: true);
                migrationBuilder.AddColumn<string>(name: "ThemeColor", table: "ProfessorProfiles", type: "TEXT", nullable: true);
                migrationBuilder.AddColumn<string>(name: "VideoIntroUrl", table: "ProfessorProfiles", type: "TEXT", nullable: true);
                migrationBuilder.AddColumn<string>(name: "WhatsAppNumber", table: "ProfessorProfiles", type: "TEXT", nullable: true);
            }

            migrationBuilder.CreateTable(
                name: "ContentOfferings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ProfessorId = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OfferingType = table.Column<int>(type: "int", nullable: false),
                    Format = table.Column<int>(type: "int", nullable: false),
                    LocationCity = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LocationState = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CtaType = table.Column<int>(type: "int", nullable: false),
                    CtaUrl = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CtaWhatsappMessage = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CoverImageUrl = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsFeatured = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CourseStudyPlanId = table.Column<Guid>(type: "char(36)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentOfferings", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ContentOfferings_CourseStudyPlanId",
                table: "ContentOfferings",
                column: "CourseStudyPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_ContentOfferings_Format",
                table: "ContentOfferings",
                column: "Format");

            migrationBuilder.CreateIndex(
                name: "IX_ContentOfferings_IsActive",
                table: "ContentOfferings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ContentOfferings_LocationCity",
                table: "ContentOfferings",
                column: "LocationCity");

            migrationBuilder.CreateIndex(
                name: "IX_ContentOfferings_ProfessorId",
                table: "ContentOfferings",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_ContentOfferings_Subject",
                table: "ContentOfferings",
                column: "Subject");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentOfferings");

            migrationBuilder.DropColumn(
                name: "BannerImageUrl",
                table: "ProfessorProfiles");

            migrationBuilder.DropColumn(
                name: "City",
                table: "ProfessorProfiles");

            migrationBuilder.DropColumn(
                name: "SocialLinksJson",
                table: "ProfessorProfiles");

            migrationBuilder.DropColumn(
                name: "State",
                table: "ProfessorProfiles");

            migrationBuilder.DropColumn(
                name: "ThemeColor",
                table: "ProfessorProfiles");

            migrationBuilder.DropColumn(
                name: "VideoIntroUrl",
                table: "ProfessorProfiles");

            migrationBuilder.DropColumn(
                name: "WhatsAppNumber",
                table: "ProfessorProfiles");
        }
    }
}
