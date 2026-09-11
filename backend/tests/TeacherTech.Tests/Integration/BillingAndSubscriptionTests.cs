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

public class BillingAndSubscriptionTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public BillingAndSubscriptionTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Checkout_CreatesSubscription_AndReturnsInvoiceUrl()
    {
        // Arrange
        var email = $"prof_billing_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Monetizado", activateSubscription: false);

        var checkoutDto = new BillingCheckoutRequestDto
        {
            PlanType = PlanType.Basic
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/billing/checkout", checkoutDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<BillingCheckoutResponseDto>();
        result.Should().NotBeNull();
        result!.InvoiceUrl.Should().NotBeNullOrWhiteSpace();
        result.Status.Should().Be("PENDING");
        result.PlanType.Should().Be(PlanType.Basic);
        result.Price.Should().Be(29.90m);

        // Verify Database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var sub = await db.ProfessorSubscriptions.FirstOrDefaultAsync(s => s.ProfessorId == auth.UserId);
        sub.Should().NotBeNull();
        sub!.PlanType.Should().Be(PlanType.Basic);
        sub.Price.Should().Be(29.90m);
        sub.MaxCoursesAllowed.Should().Be(5);
        sub.AiCreditsLimit.Should().Be(500);
    }

    [Fact]
    public async Task RequireActiveSubscription_WhenProfessorHasNoActiveSubscription_Returns402PaymentRequired()
    {
        // Arrange: Professor without active subscription
        var email = $"prof_unpaid_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Sem Assinatura", activateSubscription: false);

        // Act: Attempt to publish studio content
        var studioDto = new SaveStudioContentDto
        {
            CourseId = Guid.NewGuid(),
            CourseTitle = "Curso Sem Assinatura",
            SubjectName = "Banco de Dados",
            TopicTitle = "Normalização"
        };
        var studioResponse = await client.PostAsJsonAsync("/api/courses/studio-publish", studioDto);

        // Act: Attempt to generate AI summary
        var aiDto = new GenerateAiContentDto
        {
            TopicTitle = "Docker e Containers",
            SubjectName = "DevOps",
            ExamBoard = "Cebraspe"
        };
        var aiResponse = await client.PostAsJsonAsync("/api/ai/generate-summary", aiDto);

        // Assert: Both must return 402 Payment Required
        studioResponse.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
        aiResponse.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);

        var jsonStudio = await studioResponse.Content.ReadFromJsonAsync<JsonElement>();
        jsonStudio.GetProperty("statusCode").GetInt32().Should().Be(402);
        jsonStudio.GetProperty("error").GetString().Should().Be("Payment Required");
    }

    [Fact]
    public async Task Webhook_WhenInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/billing/webhook/asaas")
        {
            Content = JsonContent.Create(new { @event = "PAYMENT_CONFIRMED" })
        };
        request.Headers.Add("asaas-access-token", "invalid_token_xyz");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Webhook_WhenPaymentConfirmed_ActivatesSubscriptionAndLogsWebhook()
    {
        // Arrange
        var email = $"prof_webhook_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Webhook", activateSubscription: false);

        var asaasSubId = $"sub_webhook_test_{Guid.NewGuid():N}";
        var asaasCustId = $"cus_webhook_test_{Guid.NewGuid():N}";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var initialSub = new ProfessorSubscription
            {
                ProfessorId = auth.UserId,
                PlanType = PlanType.Pro,
                Status = SubscriptionStatus.Pending,
                AsaasCustomerId = asaasCustId,
                AsaasSubscriptionId = asaasSubId,
                Price = 59.90m,
                CurrentPeriodEnd = DateTime.UtcNow,
                MaxCoursesAllowed = 20,
                AiCreditsLimit = 2000,
                AiCreditsUsed = 0,
                CreatedAt = DateTime.UtcNow
            };
            db.ProfessorSubscriptions.Add(initialSub);
            await db.SaveChangesAsync();
        }

        var webhookPayload = new
        {
            @event = "PAYMENT_CONFIRMED",
            payment = new
            {
                id = "pay_test_12345",
                customer = asaasCustId,
                subscription = asaasSubId,
                value = 59.90,
                billingType = "PIX",
                status = "CONFIRMED"
            }
        };

        var webhookClient = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/billing/webhook/asaas")
        {
            Content = JsonContent.Create(webhookPayload)
        };
        // Token configurado no appsettings de teste/desenvolvimento
        request.Headers.Add("asaas-access-token", "asaas_webhook_secret_token_2026");

        // Act
        var response = await webhookClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify Database State
        using (var verifyScope = _factory.Services.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var updatedSub = await db.ProfessorSubscriptions.FirstOrDefaultAsync(s => s.ProfessorId == auth.UserId);
            updatedSub.Should().NotBeNull();
            updatedSub!.Status.Should().Be(SubscriptionStatus.Active);
            updatedSub.CurrentPeriodEnd.Should().BeAfter(DateTime.UtcNow.AddDays(28));

            // Verify AsaasWebhookLog entry
            var log = await db.AsaasWebhookLogs.FirstOrDefaultAsync(l => l.SubscriptionId == asaasSubId);
            log.Should().NotBeNull();
            log!.Event.Should().Be("PAYMENT_CONFIRMED");
            log.ProcessedSuccessfully.Should().BeTrue();
        }
    }

    [Fact]
    public async Task Webhook_WhenPaymentOverdue_MarksSubscriptionPastDue()
    {
        // Arrange
        var email = $"prof_overdue_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Inadimplente", activateSubscription: false);

        var asaasSubId = $"sub_overdue_test_{Guid.NewGuid():N}";
        var asaasCustId = $"cus_overdue_test_{Guid.NewGuid():N}";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var initialSub = new ProfessorSubscription
            {
                ProfessorId = auth.UserId,
                PlanType = PlanType.Basic,
                Status = SubscriptionStatus.Active,
                AsaasCustomerId = asaasCustId,
                AsaasSubscriptionId = asaasSubId,
                Price = 29.90m,
                CurrentPeriodEnd = DateTime.UtcNow.AddDays(1),
                MaxCoursesAllowed = 5,
                AiCreditsLimit = 500,
                AiCreditsUsed = 0,
                CreatedAt = DateTime.UtcNow
            };
            db.ProfessorSubscriptions.Add(initialSub);
            await db.SaveChangesAsync();
        }

        var webhookPayload = new
        {
            @event = "PAYMENT_OVERDUE",
            payment = new
            {
                id = "pay_overdue_999",
                customer = asaasCustId,
                subscription = asaasSubId,
                value = 29.90,
                billingType = "PIX",
                status = "OVERDUE"
            }
        };

        var webhookClient = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/billing/webhook/asaas")
        {
            Content = JsonContent.Create(webhookPayload)
        };
        request.Headers.Add("asaas-access-token", "asaas_webhook_secret_token_2026");

        // Act
        var response = await webhookClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify Database State
        using (var verifyScope = _factory.Services.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var updatedSub = await db.ProfessorSubscriptions.FirstOrDefaultAsync(s => s.ProfessorId == auth.UserId);
            updatedSub.Should().NotBeNull();
            updatedSub!.Status.Should().Be(SubscriptionStatus.PastDue);
        }
    }
}
