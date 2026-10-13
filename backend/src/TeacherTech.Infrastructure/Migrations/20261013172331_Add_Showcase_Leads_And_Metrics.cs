using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeacherTech.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_Showcase_Leads_And_Metrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShowcaseLeads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ProfessorId = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContentOfferingId = table.Column<Guid>(type: "char(36)", nullable: true),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Message = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TermsAccepted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShowcaseLeads", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ShowcaseMetrics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ProfessorId = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MetricDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    PageViews = table.Column<int>(type: "int", nullable: false),
                    WhatsAppClicks = table.Column<int>(type: "int", nullable: false),
                    CtaClicks = table.Column<int>(type: "int", nullable: false),
                    LeadsCount = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShowcaseMetrics", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ShowcaseLeads_ContentOfferingId",
                table: "ShowcaseLeads",
                column: "ContentOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_ShowcaseLeads_CreatedAt",
                table: "ShowcaseLeads",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ShowcaseLeads_ProfessorId",
                table: "ShowcaseLeads",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_ShowcaseMetrics_ProfessorId_MetricDate",
                table: "ShowcaseMetrics",
                columns: new[] { "ProfessorId", "MetricDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShowcaseLeads");

            migrationBuilder.DropTable(
                name: "ShowcaseMetrics");
        }
    }
}
