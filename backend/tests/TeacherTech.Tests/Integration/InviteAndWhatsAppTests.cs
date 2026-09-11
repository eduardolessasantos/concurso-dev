using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;
using Xunit;

namespace TeacherTech.Tests.Integration;

public class InviteAndWhatsAppTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public InviteAndWhatsAppTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GenerateInvite_LinkChannel_Creates8CharNanoid_QrCode_AndReturns200()
    {
        // Arrange
        var profEmail = $"prof_invite_{Guid.NewGuid():N}@teachertech.com";
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(profEmail);

        var course = new CourseStudyPlan
        {
            ProfessorId = profAuth.UserId,
            Title = "Desenvolvimento de Software Cloud Native",
            Description = "Preparatório para Concursos de TI",
            Category = "TI",
            IsPublic = true
        };

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();
        }

        var inviteDto = new CreateInviteDto
        {
            CourseId = course.Id,
            Channel = InviteChannel.Link
        };

        // Act
        var response = await profClient.PostAsJsonAsync("/api/invites/generate", inviteDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<InviteGeneratedResponseDto>();
        result.Should().NotBeNull();
        result!.Token.Should().HaveLength(8);
        result.InviteUrl.Should().Contain($"/convite/{result.Token}");
        result.QrCodeBase64.Should().StartWith("data:image/png;base64,");
        result.MaxUses.Should().Be(10);
        result.ExpiresAt.Should().BeAfter(DateTime.UtcNow.AddDays(6));

        // Verify Database state
        using (var verifyScope = _factory.Services.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var tokenEntity = await db.InviteTokens.FirstOrDefaultAsync(t => t.Token == result.Token);
            tokenEntity.Should().NotBeNull();
            tokenEntity!.CourseId.Should().Be(course.Id);
            tokenEntity.MaxUses.Should().Be(10);
            tokenEntity.UsedCount.Should().Be(0);
        }
    }

    [Fact]
    public async Task GenerateInvite_WhatsAppChannel_CallsWhatsAppService_AndPersistsWhatsAppLog()
    {
        // Arrange
        var profEmail = $"prof_waba_{Guid.NewGuid():N}@teachertech.com";
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(profEmail);

        var course = new CourseStudyPlan
        {
            ProfessorId = profAuth.UserId,
            Title = "Arquitetura .NET e Microsserviços",
            Description = "Conteúdo avançado",
            Category = "Engenharia de Software"
        };

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();
        }

        var inviteDto = new CreateInviteDto
        {
            CourseId = course.Id,
            Channel = InviteChannel.WhatsApp,
            TargetPhone = "11987654321"
        };

        // Act
        var response = await profClient.PostAsJsonAsync("/api/invites/generate", inviteDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<InviteGeneratedResponseDto>();
        result.Should().NotBeNull();
        result!.Token.Should().HaveLength(8);

        // Verify WhatsAppLog persisted in database
        using (var verifyScope = _factory.Services.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var tokenEntity = await db.InviteTokens.FirstOrDefaultAsync(t => t.Token == result.Token);
            tokenEntity.Should().NotBeNull();

            var wabaLog = await db.WhatsAppLogs.FirstOrDefaultAsync(l => l.InviteTokenId == tokenEntity!.Id);
            wabaLog.Should().NotBeNull();
            wabaLog!.Status.Should().Be("SENT");
            wabaLog.ToPhone.Should().Contain("11987654321");
            wabaLog.WabaMessageId.Should().NotBeNullOrWhiteSpace();
        }
    }

    [Fact]
    public async Task ValidateAndRedeemInvite_EnrollsStudent_AndIncrementsUsedCount()
    {
        // Arrange: Professor creates course and invite token
        var profEmail = $"prof_redeem_{Guid.NewGuid():N}@teachertech.com";
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(profEmail);

        var course = new CourseStudyPlan
        {
            ProfessorId = profAuth.UserId,
            Title = "Segurança da Informação e LGPD",
            Category = "Segurança"
        };

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();
        }

        var generateRes = await profClient.PostAsJsonAsync("/api/invites/generate", new CreateInviteDto
        {
            CourseId = course.Id,
            Channel = InviteChannel.Link
        });
        var invite = await generateRes.Content.ReadFromJsonAsync<InviteGeneratedResponseDto>();

        // Act 1: Anonymous student validates invite
        var anonClient = _factory.CreateClient();
        var validateRes = await anonClient.GetAsync($"/api/invites/validate/{invite!.Token}");
        validateRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var validateData = await validateRes.Content.ReadFromJsonAsync<ValidateInviteResponseDto>();
        validateData.Should().NotBeNull();
        validateData!.Valid.Should().BeTrue();
        validateData.CourseTitle.Should().Be("Segurança da Informação e LGPD");
        validateData.RemainingUses.Should().Be(10);

        // Arrange: Create and authenticate student
        var studentEmail = $"student_redeem_{Guid.NewGuid():N}@teachertech.com";
        var (studentClient, studentAuth) = await _factory.CreateAndAuthenticateStudentAsync(studentEmail);

        // Act 2: Student redeems invite
        var redeemRes = await studentClient.PostAsync($"/api/invites/redeem/{invite.Token}", null);
        redeemRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var redeemData = await redeemRes.Content.ReadFromJsonAsync<RedeemInviteResponseDto>();
        redeemData.Should().NotBeNull();
        redeemData!.Status.Should().Be("ACTIVE");
        redeemData.CourseId.Should().Be(course.Id);

        // Verify Database
        using (var verifyScope = _factory.Services.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var updatedToken = await db.InviteTokens.FirstOrDefaultAsync(t => t.Token == invite.Token);
            updatedToken.Should().NotBeNull();
            updatedToken!.UsedCount.Should().Be(1);

            var enrollment = await db.Enrollments.FirstOrDefaultAsync(e => e.StudentId == studentAuth.UserId && e.CourseId == course.Id);
            enrollment.Should().NotBeNull();
            enrollment!.Status.Should().Be(EnrollmentStatus.Active);
            enrollment.GrantedVia.Should().Be("INVITE_LINK");
        }
    }

    [Fact]
    public async Task ValidateInvite_WhenExpiredOrExhausted_Returns410Gone()
    {
        // Arrange
        var profEmail = $"prof_expired_{Guid.NewGuid():N}@teachertech.com";
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(profEmail);

        var course = new CourseStudyPlan
        {
            ProfessorId = profAuth.UserId,
            Title = "Engenharia de Prompt",
            Category = "IA"
        };

        var expiredToken = $"exp_{Guid.NewGuid():N}"[..8];
        var exhaustedToken = $"exh_{Guid.NewGuid():N}"[..8];

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.CourseStudyPlans.Add(course);

            db.InviteTokens.Add(new InviteToken
            {
                CourseId = course.Id,
                Token = expiredToken,
                CreatedByProfessorId = profAuth.UserId,
                ExpiresAt = DateTime.UtcNow.AddDays(-2), // Expired 2 days ago
                MaxUses = 10,
                UsedCount = 2,
                Channel = InviteChannel.Link
            });

            db.InviteTokens.Add(new InviteToken
            {
                CourseId = course.Id,
                Token = exhaustedToken,
                CreatedByProfessorId = profAuth.UserId,
                ExpiresAt = DateTime.UtcNow.AddDays(5),
                MaxUses = 10,
                UsedCount = 10, // Max uses reached
                Channel = InviteChannel.QrCode
            });

            await db.SaveChangesAsync();
        }

        var client = _factory.CreateClient();

        // Act & Assert for expired token
        var expRes = await client.GetAsync($"/api/invites/validate/{expiredToken}");
        expRes.StatusCode.Should().Be(HttpStatusCode.Gone);

        // Act & Assert for exhausted token
        var exhRes = await client.GetAsync($"/api/invites/validate/{exhaustedToken}");
        exhRes.StatusCode.Should().Be(HttpStatusCode.Gone);
    }
}
