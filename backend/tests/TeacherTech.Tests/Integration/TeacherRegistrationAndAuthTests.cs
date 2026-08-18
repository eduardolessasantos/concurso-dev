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

public class TeacherRegistrationAndAuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TeacherRegistrationAndAuthTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_AsProfessor_CreatesAccountAndProfileWithAiCredits()
    {
        // Arrange
        var client = _factory.CreateClient();
        var email = $"prof_{Guid.NewGuid():N}@teachertech.com";
        var registerDto = new RegisterDto
        {
            Email = email,
            Password = "StrongPassword123!",
            FullName = "Professora Maria Silva",
            UserRole = UserRoles.Professor,
            Headline = "Especialista em Banco de Dados e SQL"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrWhiteSpace();
        authResponse.Email.Should().Be(email);
        authResponse.FullName.Should().Be("Professora Maria Silva");
        authResponse.UserRole.Should().Be(UserRoles.Professor);

        // Verify Database State
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        var user = await db.Users
            .Include(u => u.ProfessorProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        user.Should().NotBeNull();
        user!.UserRole.Should().Be(UserRoles.Professor);
        user.ProfessorProfile.Should().NotBeNull();
        user.ProfessorProfile!.Headline.Should().Be("Especialista em Banco de Dados e SQL");
        user.ProfessorProfile.AiCreditsLimit.Should().Be(200);
        user.ProfessorProfile.AiCreditsUsed.Should().Be(0);
        user.ProfessorProfile.PublicVisibility.Should().BeTrue();
        user.ProfessorProfile.CustomSlug.Should().Be("professora-maria-silva");
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var email = $"prof_dup_{Guid.NewGuid():N}@teachertech.com";
        var registerDto = new RegisterDto
        {
            Email = email,
            Password = "Password123!",
            FullName = "Professor Repetido",
            UserRole = UserRoles.Professor
        };

        var firstResponse = await client.PostAsJsonAsync("/api/auth/register", registerDto);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act
        var duplicateResponse = await client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        duplicateResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidProfessorCredentials_ReturnsJwtToken()
    {
        // Arrange
        var client = _factory.CreateClient();
        var email = $"prof_login_{Guid.NewGuid():N}@teachertech.com";
        var password = "SafePassword999!";

        await client.PostAsJsonAsync("/api/auth/register", new RegisterDto
        {
            Email = email,
            Password = password,
            FullName = "Professor Login Teste",
            UserRole = UserRoles.Professor
        });

        var loginDto = new LoginDto
        {
            Email = email,
            Password = password
        };

        // Act
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrWhiteSpace();
        authResponse.Email.Should().Be(email);
        authResponse.UserRole.Should().Be(UserRoles.Professor);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();
        var email = $"prof_wrong_{Guid.NewGuid():N}@teachertech.com";

        await client.PostAsJsonAsync("/api/auth/register", new RegisterDto
        {
            Email = email,
            Password = "CorrectPassword123!",
            FullName = "Professor Senha Errada",
            UserRole = UserRoles.Professor
        });

        var loginDto = new LoginDto
        {
            Email = email,
            Password = "WrongPassword999!"
        };

        // Act
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        loginResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetCurrentUser_WithProfessorToken_ReturnsProfessorDetails()
    {
        // Arrange
        var email = $"prof_me_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof Me Tester");

        // Act
        var response = await client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var meResult = await response.Content.ReadFromJsonAsync<MeResponseDto>();
        meResult.Should().NotBeNull();
        meResult!.Email.Should().Be(email);
        meResult.FullName.Should().Be("Prof Me Tester");
        meResult.UserRole.Should().Be(UserRoles.Professor);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutToken_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private record MeResponseDto(string UserId, string Email, string FullName, string UserRole);
}
