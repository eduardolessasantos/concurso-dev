using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Application.Common;
using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;
using Xunit;

namespace TeacherTech.Tests.Integration;

public class P2pPixCheckoutTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public P2pPixCheckoutTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public void PixBrCodeGenerator_GeneratesStandardBacenEmvPayload()
    {
        // Arrange
        var pixKey = "professor@teachertech.com";
        var name = "José da Silva";
        var city = "São Paulo";
        var amount = 150.00m;
        var txId = "TEST123456";

        // Act
        var payload = PixBrCodeGenerator.GeneratePayload(pixKey, name, city, amount, txId);

        // Assert
        payload.Should().NotBeNullOrEmpty();
        payload.Should().StartWith("000201"); // Payload Format Indicator
        payload.Should().Contain("br.gov.bcb.pix"); // GUI BACEN
        payload.Should().Contain(pixKey); // Pix Key
        payload.Should().Contain("52040000"); // Category Code
        payload.Should().Contain("5303986"); // BRL Currency
        payload.Should().Contain("5406150.00"); // Amount
        payload.Should().Contain("5802BR"); // Country
        payload.Should().Contain("JOSE DA SILVA"); // Normalized name (without accents)
        payload.Should().Contain("SAO PAULO"); // Normalized city (without accents)
        payload.Should().Contain("TEST123456"); // TxId
        payload.Should().Contain("6304"); // CRC tag

        // CRC verification: CRC at the end must match CalculateCrc16
        var payloadWithoutCrc = payload[..^4];
        var expectedCrc = PixBrCodeGenerator.CalculateCrc16(payloadWithoutCrc).ToString("X4");
        payload.Should().EndWith(expectedCrc);
    }

    [Fact]
    public async Task P2pPixCheckout_WithValidCourseAndProfessorPixKey_ReturnsBRCodeAndPendingRequest()
    {
        // Arrange: Create a professor and configure PixKey
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_pix_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Roberto Pix");

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var profile = await db.ProfessorProfiles.FirstAsync(p => p.UserId == profAuth.UserId);
            profile.PixKey = "roberto@pix.com";
            profile.WhatsAppNumber = "11999998888";
            profile.City = "São Paulo";

            // Add a course
            var course = new CourseStudyPlan
            {
                ProfessorId = profAuth.UserId,
                Title = "Direito Constitucional para Concursos",
                Description = "Curso completo com questões e resumos",
                Category = "Direito",
                Price = 89.90m,
                IsPublic = true,
                Status = CourseStatus.Published
            };
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();

            var client = _factory.CreateClient();
            var studentEmail = $"aluno_pix_{Guid.NewGuid():N}@gmail.com";

            var checkoutDto = new P2pPixCheckoutDto
            {
                CourseId = course.Id,
                Name = "Lucas Aluno",
                Email = studentEmail,
                Phone = "11988887777"
            };

            // Act 1: Student initiates P2P Pix Checkout
            var response = await client.PostAsJsonAsync("/api/payments/p2p-pix-checkout", checkoutDto);

            // Assert 1: Checkout response is OK with Pix BR Code and WhatsApp URL
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var checkoutResult = await response.Content.ReadFromJsonAsync<P2pPixCheckoutResponseDto>();
            checkoutResult.Should().NotBeNull();
            checkoutResult!.CourseId.Should().Be(course.Id);
            checkoutResult.ProfessorPixKey.Should().Be("roberto@pix.com");
            checkoutResult.Amount.Should().Be(89.90m);
            checkoutResult.PixPayload.Should().StartWith("000201");
            checkoutResult.PixPayload.Should().Contain("roberto@pix.com");
            checkoutResult.WhatsAppUrl.Should().Contain("wa.me/5511999998888");
            checkoutResult.Status.Should().Be("PENDING_PIX");

            // Act 2: Check status via student polling endpoint
            var statusResponse = await client.GetAsync($"/api/accessrequests/{checkoutResult.AccessRequestId}/status");
            statusResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var statusResult = await statusResponse.Content.ReadFromJsonAsync<AccessRequestStatusDto>();
            statusResult.Should().NotBeNull();
            statusResult!.Status.Should().Be("PENDING_PIX");
            statusResult.IsApproved.Should().BeFalse();

            // Act 3: Professor views pending requests in dashboard
            var pendingResponse = await profClient.GetAsync("/api/accessrequests/pending");
            pendingResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var pendingList = await pendingResponse.Content.ReadFromJsonAsync<List<AccessRequestResponseDto>>();
            pendingList.Should().NotBeNull();
            var pendingItem = pendingList!.FirstOrDefault(p => p.Id == checkoutResult.AccessRequestId);
            pendingItem.Should().NotBeNull();
            pendingItem!.StudentEmail.Should().Be(studentEmail);
            pendingItem.Status.Should().Be("PENDING_PIX");

            // Act 4: Professor approves request (AC-5.1.3 & AC-5.3.1)
            var approveResponse = await profClient.PostAsync($"/api/accessrequests/{checkoutResult.AccessRequestId}/approve", null);
            approveResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert 4: Status polling now returns isApproved = true
            var updatedStatusResponse = await client.GetAsync($"/api/accessrequests/{checkoutResult.AccessRequestId}/status");
            var updatedStatusResult = await updatedStatusResponse.Content.ReadFromJsonAsync<AccessRequestStatusDto>();
            updatedStatusResult.Should().NotBeNull();
            updatedStatusResult!.IsApproved.Should().BeTrue();
            updatedStatusResult.Status.Should().Be(AccessRequestStatus.Approved);

            // Assert 5: Active Enrollment exists in database with GrantedVia = "PIX_P2P"
            using var verifyScope = _factory.Services.CreateScope();
            var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var enrollment = await verifyDb.Enrollments.FirstOrDefaultAsync(e => e.CourseId == course.Id && e.Student.Email == studentEmail);
            enrollment.Should().NotBeNull();
            enrollment!.Status.Should().Be(EnrollmentStatus.Active);
            enrollment.GrantedVia.Should().Be("PIX_P2P");
        }
    }

    [Fact]
    public async Task P2pPixCheckout_ProfessorWithoutPixKey_ReturnsBadRequestExplainingMissingKey()
    {
        // Arrange: Create a professor WITHOUT PixKey
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_nopix_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Sem Pix");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var course = new CourseStudyPlan
        {
            ProfessorId = profAuth.UserId,
            Title = "Curso Sem Chave Pix",
            Price = 50.00m,
            IsPublic = true,
            Status = CourseStatus.Published
        };
        db.CourseStudyPlans.Add(course);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var checkoutDto = new P2pPixCheckoutDto
        {
            CourseId = course.Id,
            Name = "Aluno Teste",
            Email = $"aluno_{Guid.NewGuid():N}@test.com"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/payments/p2p-pix-checkout", checkoutDto);

        // Assert: 400 Bad Request instructing the user
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("Chave Pix");
    }

    [Fact]
    public async Task ApproveRequest_ByDifferentProfessor_ReturnsForbidden()
    {
        // Arrange: Professor A creates a course and student requests access
        var (profClientA, profAuthA) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_a_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Alice");
        var (profClientB, profAuthB) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_b_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Bob");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var profProfileA = await db.ProfessorProfiles.FirstAsync(p => p.UserId == profAuthA.UserId);
        profProfileA.PixKey = "alice@pix.com";

        var course = new CourseStudyPlan
        {
            ProfessorId = profAuthA.UserId,
            Title = "Curso da Alice",
            Price = 99.00m,
            IsPublic = true,
            Status = CourseStatus.Published
        };
        db.CourseStudyPlans.Add(course);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var checkoutDto = new P2pPixCheckoutDto
        {
            CourseId = course.Id,
            Email = $"aluno_sec_{Guid.NewGuid():N}@test.com"
        };

        var checkoutRes = await client.PostAsJsonAsync("/api/payments/p2p-pix-checkout", checkoutDto);
        checkoutRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var checkoutData = await checkoutRes.Content.ReadFromJsonAsync<P2pPixCheckoutResponseDto>();

        // Act: Professor B tries to approve Alice's request (AC-5.1.2 Security)
        var approveRes = await profClientB.PostAsync($"/api/accessrequests/{checkoutData!.AccessRequestId}/approve", null);

        // Assert
        approveRes.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
