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

namespace TeacherTech.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // Ensure DB and default roles are created
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();

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

    public HttpClient CreateClientWithAuth(string token)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public async Task<(HttpClient Client, AuthResponseDto Auth)> CreateAndAuthenticateProfessorAsync(
        string email = "professor.test@teachertech.com", 
        string password = "Password123!", 
        string fullName = "Prof. Testador da Silva")
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
