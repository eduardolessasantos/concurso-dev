using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;
using Xunit;

namespace TeacherTech.Tests.Integration;

public class ShowcaseLeadsAndCtaTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ShowcaseLeadsAndCtaTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateLead_WithValidConsent_CreatesLeadInDatabaseWithoutCreatingUser()
    {
        // Arrange: Create a professor
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_lead_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Carlos Mentor");

        var client = _factory.CreateClient();
        var leadEmail = $"aluno_interessado_{Guid.NewGuid():N}@gmail.com";

        var payload = new CreateShowcaseLeadDto
        {
            ProfessorId = profAuth.UserId,
            Name = "Mariana Aluna",
            Email = leadEmail,
            Phone = "(11) 98765-4321",
            Message = "Olá, gostaria de tirar dúvidas sobre o formato das suas mentorias.",
            TermsAccepted = true
        };

        // Act: Anônimo envia lead
        var response = await client.PostAsJsonAsync("/api/publicshowcase/leads", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var created = await response.Content.ReadFromJsonAsync<ShowcaseLeadResponseDto>();
        created.Should().NotBeNull();
        created!.Name.Should().Be("Mariana Aluna");
        created.Email.Should().Be(leadEmail);

        // Verifica o banco: Lead existe em ShowcaseLeads
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var leadInDb = await db.ShowcaseLeads.FirstOrDefaultAsync(l => l.Email == leadEmail);
        leadInDb.Should().NotBeNull();
        leadInDb!.ProfessorId.Should().Be(profAuth.UserId);
        leadInDb.TermsAccepted.Should().BeTrue();

        // AC-2.1.1: Confirma que NENHUM usuário foi criado em AspNetUsers para este lead
        var userInDb = await db.Users.FirstOrDefaultAsync(u => u.Email == leadEmail);
        userInDb.Should().BeNull("leads da vitrine não devem gerar usuários fantasmas ou poluir a tabela de autenticação");

        // Confirma que a métrica do professor foi incrementada
        var metric = await db.ShowcaseMetrics.FirstOrDefaultAsync(m => m.ProfessorId == profAuth.UserId && m.MetricDate == DateTime.UtcNow.Date);
        metric.Should().NotBeNull();
        metric!.LeadsCount.Should().BeGreaterOrEqualTo(1);
    }

    [Fact]
    public async Task CreateLead_WithoutConsent_ReturnsBadRequest400()
    {
        // Arrange: Create a professor
        var (_, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_noconsent_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Sem Consentimento");

        var client = _factory.CreateClient();

        var payload = new CreateShowcaseLeadDto
        {
            ProfessorId = profAuth.UserId,
            Name = "Visitante Sem Aceite",
            Email = "semaceite@gmail.com",
            Phone = "11999998888",
            Message = "Mensagem teste",
            TermsAccepted = false // Recusa os termos LGPD
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/publicshowcase/leads", payload);

        // Assert (AC-2.1.2)
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("LGPD");
    }

    [Fact]
    public async Task TrackClick_IncrementsMetricsAtomically()
    {
        // Arrange
        var (_, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_telemetry_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Telemetria");

        var client = _factory.CreateClient();

        // Act 1: Track WhatsApp Click
        var waTrack = new TrackClickDto
        {
            ProfessorId = profAuth.UserId,
            CtaType = "WhatsApp"
        };
        var r1 = await client.PostAsJsonAsync("/api/publicshowcase/track-click", waTrack);
        r1.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act 2: Track PageView
        var pvTrack = new TrackClickDto
        {
            ProfessorId = profAuth.UserId,
            CtaType = "PageView"
        };
        var r2 = await client.PostAsJsonAsync("/api/publicshowcase/track-click", pvTrack);
        r2.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert: Consultar endpoint de métricas
        var metricsResponse = await client.GetAsync($"/api/publicshowcase/professors/{profAuth.UserId}/metrics");
        metricsResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var metrics = await metricsResponse.Content.ReadFromJsonAsync<ShowcaseMetricSummaryDto>();
        metrics.Should().NotBeNull();
        metrics!.TotalWhatsAppClicks.Should().BeGreaterOrEqualTo(1);
        metrics.TotalPageViews.Should().BeGreaterOrEqualTo(1);
    }

    [Fact]
    public async Task LegacyCourseCheckout_ReturnsBadRequest_IndicatingDiscontinuedModel()
    {
        // Arrange: Usuário autenticado tenta fazer checkout individual legado
        var (studentClient, _) = await _factory.CreateAndAuthenticateStudentAsync(
            $"student_legacy_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Aluno Legado");

        var payload = new CreateCheckoutDto
        {
            CourseId = Guid.NewGuid(),
            PaymentMethod = "PIX"
        };

        // Act: Dispara checkout descontinuado
        var response = await studentClient.PostAsJsonAsync("/api/payments/checkout", payload);

        // Assert (AC-2.3.2)
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("descontinuado");
    }
}
