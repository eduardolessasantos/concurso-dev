using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using TeacherTech.Application.DTOs;
using Xunit;

namespace TeacherTech.Tests.Integration;

public class HealthCheckEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public HealthCheckEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetHealth_NativeEndpoint_ReturnsOkAndHealthyStatus()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");

        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.TryGetProperty("entries", out var entries).Should().BeTrue();
        entries.TryGetProperty("database", out var dbEntry).Should().BeTrue();
        dbEntry.GetProperty("status").GetString().Should().Be("Healthy");
        entries.TryGetProperty("self", out var selfEntry).Should().BeTrue();
        selfEntry.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetHealthLive_NativeEndpoint_ReturnsOk()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/live");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.GetProperty("entries").TryGetProperty("self", out var selfEntry).Should().BeTrue();
        selfEntry.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetHealthReady_NativeEndpoint_ReturnsOkWithDatabaseCheck()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/ready");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.GetProperty("entries").TryGetProperty("database", out var dbEntry).Should().BeTrue();
        dbEntry.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetHealth_ControllerEndpoint_ReturnsFullTelemetryDto()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var health = await response.Content.ReadFromJsonAsync<HealthResponseDto>();

        health.Should().NotBeNull();
        health!.Status.Should().Be("Healthy");
        health.Environment.Should().Be("Testing");
        health.Version.Should().NotBeNullOrWhiteSpace();
        health.Uptime.Should().NotBeNullOrWhiteSpace();
        health.Database.Should().NotBeNull();
        health.Database.CanConnect.Should().BeTrue();
        health.Database.Status.Should().Be("Healthy");
        health.Database.Provider.Should().NotBeNullOrWhiteSpace();
        health.System.Should().NotBeNull();
        health.System.DotNetVersion.Should().NotBeNullOrWhiteSpace();
        health.System.ProcessorCount.Should().BeGreaterThan(0);
        health.System.AllocatedMemoryMb.Should().BeGreaterThan(0);
        health.Entries.Should().ContainKey("database");
        health.Entries.Should().ContainKey("self");
    }

    [Fact]
    public async Task GetHealthLive_ControllerEndpoint_ReturnsOk()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/health/live");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.GetProperty("service").GetString().Should().Be("TeacherTech API");
    }

    [Fact]
    public async Task GetHealthReady_ControllerEndpoint_ReturnsOk()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/health/ready");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetHealthPing_ControllerEndpoint_ReturnsPong()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/health/ping");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        root.GetProperty("ping").GetString().Should().Be("pong");
    }
}
