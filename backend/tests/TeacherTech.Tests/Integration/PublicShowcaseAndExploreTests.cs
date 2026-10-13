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

public class PublicShowcaseAndExploreTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public PublicShowcaseAndExploreTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetProfessorBySlug_WithOfferings_ReturnsExpandedProfileAndActiveOfferings()
    {
        // Arrange: Create a professor and add customized profile and content offerings
        var uniqueSlug = $"prof-matematica-{Guid.NewGuid():N}";
        var (_, auth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. João Matemática");

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var profile = await db.ProfessorProfiles.FirstOrDefaultAsync(p => p.UserId == auth.UserId);
            profile.Should().NotBeNull();

            profile!.CustomSlug = uniqueSlug;
            profile.BannerImageUrl = "https://example.com/banner.jpg";
            profile.ThemeColor = "#10B981";
            profile.WhatsAppNumber = "21999998888";
            profile.City = "Rio de Janeiro";
            profile.State = "RJ";
            profile.SocialLinksJson = "{\"instagram\":\"@profjoao\"}";
            profile.PublicVisibility = true;

            db.ContentOfferings.AddRange(
                new ContentOffering
                {
                    ProfessorId = auth.UserId,
                    Title = "Aula Particular de Cálculo I",
                    Description = "Reforço presencial e online",
                    Subject = "Matemática",
                    Price = 120.00m,
                    OfferingType = OfferingType.PrivateClass,
                    Format = OfferingFormat.InPerson,
                    LocationCity = "Rio de Janeiro",
                    LocationState = "RJ",
                    CtaType = CtaType.WhatsApp,
                    CtaWhatsappMessage = "Quero agendar aula",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new ContentOffering
                {
                    ProfessorId = auth.UserId,
                    Title = "E-book 500 Questões de Raciocínio",
                    Description = "PDF com gabarito",
                    Subject = "Raciocínio Lógico",
                    Price = 47.00m,
                    OfferingType = OfferingType.Ebook,
                    Format = OfferingFormat.Online,
                    CtaType = CtaType.ExternalCheckout,
                    CtaUrl = "https://kiwify.com.br/checkout",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new ContentOffering
                {
                    ProfessorId = auth.UserId,
                    Title = "Mentoria Descontinuada",
                    Description = "Não deve aparecer",
                    Subject = "Mentoria",
                    OfferingType = OfferingType.Mentoring,
                    IsActive = false // INATIVA
                }
            );

            await db.SaveChangesAsync();
        }

        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync($"/api/publicshowcase/professors/{uniqueSlug}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PublicProfessorProfileDto>();
        result.Should().NotBeNull();
        result!.CustomSlug.Should().Be(uniqueSlug);
        result.ThemeColor.Should().Be("#10B981");
        result.City.Should().Be("Rio de Janeiro");
        result.State.Should().Be("RJ");
        result.WhatsAppNumber.Should().Be("21999998888");

        // Offerings validation: Only 2 active offerings should be returned
        result.Offerings.Should().NotBeNull();
        result.Offerings.Should().HaveCount(2);
        result.Offerings.Any(o => o.Title == "Mentoria Descontinuada").Should().BeFalse();

        var privateClass = result.Offerings.First(o => o.OfferingType == OfferingType.PrivateClass);
        privateClass.Title.Should().Be("Aula Particular de Cálculo I");
        privateClass.OfferingTypeName.Should().Be("Aula Particular");
        privateClass.PriceFormatted.Should().Match(p => p == "R$ 120,00" || p == "R$ 120.00");
    }

    [Fact]
    public async Task GetProfessorBySlug_NonExistent_ReturnsNotFound()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/publicshowcase/professors/slug-que-nao-existe-999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Explore_FacetedSearch_FiltersBySubjectAndFormatAndPaginates()
    {
        var client = _factory.CreateClient();

        // Act 1: Get all with pagination
        var responseAll = await client.GetAsync("/api/publicshowcase/explore?pageIndex=0&pageSize=5");
        responseAll.StatusCode.Should().Be(HttpStatusCode.OK);
        var pagedAll = await responseAll.Content.ReadFromJsonAsync<PagedResult<ExploreItemDto>>();
        pagedAll.Should().NotBeNull();
        pagedAll!.PageSize.Should().Be(5);
        pagedAll.Items.Count.Should().BeLessThanOrEqualTo(5);

        // Act 2: Filter by subject and format
        var responseFiltered = await client.GetAsync("/api/publicshowcase/explore?subject=Matemática&format=InPerson");
        responseFiltered.StatusCode.Should().Be(HttpStatusCode.OK);
        var pagedFiltered = await responseFiltered.Content.ReadFromJsonAsync<PagedResult<ExploreItemDto>>();
        pagedFiltered.Should().NotBeNull();
        pagedFiltered!.Items.All(i => i.Subject.Contains("Matemática", StringComparison.OrdinalIgnoreCase) && i.Format == "Presencial").Should().BeTrue();
    }

    [Fact]
    public async Task GetFilters_ReturnsAvailableSubjectsCitiesAndFormats()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/publicshowcase/filters");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var filters = await response.Content.ReadFromJsonAsync<ExploreFiltersDto>();
        filters.Should().NotBeNull();
        filters!.AvailableFormats.Should().Contain(new[] { "Online", "Presencial", "Híbrido" });
        filters.AvailableSubjects.Should().NotBeNull();
        filters.AvailableCities.Should().NotBeNull();
    }
}
