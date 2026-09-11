using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace TeacherTech.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"teachertech_test_{Guid.NewGuid():N}.db";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlite($"Data Source={_dbName}");
                options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureDeleted();
        db.Database.Migrate();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        string[] roles = [UserRoles.Admin, UserRoles.Professor, UserRoles.Student];
        foreach (var role in roles)
        {
            if (!roleManager.RoleExistsAsync(role).GetAwaiter().GetResult())
            {
                roleManager.CreateAsync(new IdentityRole(role)).GetAwaiter().GetResult();
            }
        }

        return host;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        try
        {
            if (File.Exists(_dbName)) File.Delete(_dbName);
        }
        catch { }
    }

    public HttpClient CreateClientWithAuth(string token)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public async Task<(HttpClient Client, AuthResponseDto Auth)> CreateAndAuthenticateProfessorAsync(
        string email = "professor.test@teachertech.com", 
        string password = "Password123!", 
        string fullName = "Prof. Testador da Silva",
        bool activateSubscription = true)
    {
        var client = CreateClient();
        var registerDto = new RegisterDto
        {
            Email = email,
            Password = password,
            FullName = fullName,
            UserRole = UserRoles.Professor,
            Headline = "Especialista em Concursos Públicos"
        };

        var response = await client.PostAsJsonAsync("/api/auth/register", registerDto);
        response.EnsureSuccessStatusCode();

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResponse!.Token);

        if (activateSubscription)
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var sub = new ProfessorSubscription
            {
                ProfessorId = authResponse!.UserId,
                PlanType = PlanType.Pro,
                Status = SubscriptionStatus.Active,
                AsaasCustomerId = $"cus_{Guid.NewGuid():N}",
                AsaasSubscriptionId = $"sub_{Guid.NewGuid():N}",
                Price = 59.90m,
                CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
                MaxCoursesAllowed = 20,
                AiCreditsLimit = 2000,
                AiCreditsUsed = 0,
                CreatedAt = DateTime.UtcNow
            };
            db.ProfessorSubscriptions.Add(sub);
            await db.SaveChangesAsync();
        }

        return (client, authResponse);
    }

    public async Task<(HttpClient Client, AuthResponseDto Auth)> CreateAndAuthenticateStudentAsync(
        string email = "student.test@teachertech.com", 
        string password = "Password123!", 
        string fullName = "Aluno Estudioso")
    {
        var client = CreateClient();
        var registerDto = new RegisterDto
        {
            Email = email,
            Password = password,
            FullName = fullName,
            UserRole = UserRoles.Student,
            GoalExam = "Dataprev 2026"
        };

        var response = await client.PostAsJsonAsync("/api/auth/register", registerDto);
        response.EnsureSuccessStatusCode();

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResponse!.Token);

        return (client, authResponse);
    }
}
