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

public class ProfessorManagementTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ProfessorManagementTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMyShowcase_And_UpdateMyShowcase_SavesSuccessfully()
    {
        // Arrange
        var slugUnique = $"prof-vitrine-{Guid.NewGuid():N}"[..20];
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_vitrine_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Roberto Vitrine");

        // Act 1: Get Initial Showcase
        var getResponse = await client.GetAsync("/api/professor/showcase");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var initial = await getResponse.Content.ReadFromJsonAsync<PublicProfessorProfileDto>();
        initial.Should().NotBeNull();
        initial!.UserId.Should().Be(auth.UserId);

        // Act 2: Update Showcase
        var updateDto = new UpdateProfessorShowcaseDto
        {
            Headline = "Especialista em Física Quântica e Mecânica Clássica",
            Bio = "Mais de 10 anos lecionando para vestibulares de elite como ITA e IME.",
            CustomSlug = slugUnique,
            ThemeColor = "#2563EB",
            WhatsAppNumber = "11988887777",
            City = "São José dos Campos",
            State = "SP",
            PublicVisibility = true
        };

        var putResponse = await client.PutAsJsonAsync("/api/professor/showcase", updateDto);
        putResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await putResponse.Content.ReadFromJsonAsync<PublicProfessorProfileDto>();

        // Assert
        updated.Should().NotBeNull();
        updated!.CustomSlug.Should().Be(slugUnique);
        updated.Headline.Should().Be("Especialista em Física Quântica e Mecânica Clássica");
        updated.ThemeColor.Should().Be("#2563EB");
        updated.City.Should().Be("São José dos Campos");
        updated.State.Should().Be("SP");
    }

    [Fact]
    public async Task UpdateMyShowcase_WithDuplicateSlugFromAnotherProfessor_Returns409Conflict()
    {
        // Arrange: Professor A
        var slugA = $"slug-a-{Guid.NewGuid():N}"[..20];
        var (clientA, _) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_a_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Alpha");

        await clientA.PutAsJsonAsync("/api/professor/showcase", new UpdateProfessorShowcaseDto
        {
            Headline = "Professor Alpha",
            Bio = "Bio Alpha",
            CustomSlug = slugA
        });

        // Professor B tenta adotar o mesmo slug
        var (clientB, _) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_b_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Beta");

        // Act
        var putResponse = await clientB.PutAsJsonAsync("/api/professor/showcase", new UpdateProfessorShowcaseDto
        {
            Headline = "Professor Beta",
            Bio = "Bio Beta",
            CustomSlug = slugA
        });

        // Assert
        putResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task OfferingsCrud_AllowsCreationListingUpdatingTogglingAndDeletion()
    {
        // Arrange
        var (client, _) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_offer_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Ofertas");

        var newOffering = new SaveOfferingDto
        {
            Title = "Mentoria VIP de Redação Nota 1000",
            Description = "Correção semanal detalhada e encontros individuais quinzenais.",
            Subject = "Redação",
            Price = 350.00m,
            OfferingType = OfferingType.Mentoring,
            Format = OfferingFormat.Online,
            CtaType = CtaType.WhatsApp,
            CtaWhatsappMessage = "Olá prof! Quero entrar na mentoria de Redação VIP.",
            DisplayOrder = 1,
            IsActive = true
        };

        // 1. Create
        var postResponse = await client.PostAsJsonAsync("/api/professor/offerings", newOffering);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await postResponse.Content.ReadFromJsonAsync<PublicOfferingDto>();
        created.Should().NotBeNull();
        created!.Title.Should().Be(newOffering.Title);
        created.Price.Should().Be(350.00m);
        var offeringId = created.Id;

        // 2. List
        var listResponse = await client.GetAsync("/api/professor/offerings");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await listResponse.Content.ReadFromJsonAsync<List<PublicOfferingDto>>();
        list.Should().Contain(o => o.Id == offeringId);

        // 3. Update
        var updateOffering = new SaveOfferingDto
        {
            Title = "Mentoria VIP de Redação ENEM & Fuvest",
            Description = "Nova descrição com foco duplo.",
            Subject = "Redação",
            Price = 400.00m,
            OfferingType = OfferingType.Mentoring,
            Format = OfferingFormat.Online,
            CtaType = CtaType.WhatsApp
        };
        var updateResponse = await client.PutAsJsonAsync($"/api/professor/offerings/{offeringId}", updateOffering);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await updateResponse.Content.ReadFromJsonAsync<PublicOfferingDto>();
        updated!.Title.Should().Be("Mentoria VIP de Redação ENEM & Fuvest");
        updated.Price.Should().Be(400.00m);

        // 4. Toggle Active
        var toggleResponse = await client.PatchAsync($"/api/professor/offerings/{offeringId}/toggle-active", null);
        toggleResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // 5. Delete
        var deleteResponse = await client.DeleteAsync($"/api/professor/offerings/{offeringId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify gone
        var verifyList = await client.GetFromJsonAsync<List<PublicOfferingDto>>("/api/professor/offerings");
        verifyList.Should().NotContain(o => o.Id == offeringId);
    }

    [Fact]
    public async Task OfferingIsolation_OtherProfessorCannotUpdateOrDeleteThirdPartyOffering()
    {
        // Arrange: Prof A creates offering
        var (clientA, _) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_iso_a_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Dono");

        var createResponse = await clientA.PostAsJsonAsync("/api/professor/offerings", new SaveOfferingDto
        {
            Title = "Ebook de Geometria Analítica",
            Subject = "Matemática",
            Price = 29.90m,
            OfferingType = OfferingType.Ebook
        });
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var offering = await createResponse.Content.ReadFromJsonAsync<PublicOfferingDto>();

        // Prof B attempts to modify / delete offering of Prof A
        var (clientB, _) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_iso_b_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Invasor");

        // Act & Assert: Update
        var putResponse = await clientB.PutAsJsonAsync($"/api/professor/offerings/{offering!.Id}", new SaveOfferingDto
        {
            Title = "Tentativa de alteração indevida",
            Subject = "Matemática"
        });
        putResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);

        // Act & Assert: Delete
        var deleteResponse = await clientB.DeleteAsync($"/api/professor/offerings/{offering.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateLeadStatus_UpdatesSuccessfullyForLeadOwner()
    {
        // Arrange
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_leads_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Leads");

        // Anônimo envia lead
        var publicClient = _factory.CreateClient();
        var leadRes = await publicClient.PostAsJsonAsync("/api/publicshowcase/leads", new CreateShowcaseLeadDto
        {
            ProfessorId = auth.UserId,
            Name = "Aluno Teste Lead",
            Email = $"lead_status_{Guid.NewGuid():N}@teste.com",
            Phone = "(11) 99999-8888",
            TermsAccepted = true
        });
        var createdLead = await leadRes.Content.ReadFromJsonAsync<ShowcaseLeadResponseDto>();

        // Act: Professor atualiza status para Contacted
        var patchResponse = await client.PatchAsJsonAsync($"/api/professor/leads/{createdLead!.Id}/status", new UpdateLeadStatusDto
        {
            Status = LeadStatus.Contacted
        });

        // Assert
        patchResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verifica na listagem de leads do professor
        var leadsResponse = await client.GetAsync("/api/professor/leads");
        leadsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var leads = await leadsResponse.Content.ReadFromJsonAsync<List<ShowcaseLeadResponseDto>>();
        var foundLead = leads!.First(l => l.Id == createdLead.Id);
        foundLead.Status.Should().Be(LeadStatus.Contacted.ToString());
    }
}
