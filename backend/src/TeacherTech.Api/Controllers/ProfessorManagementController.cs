using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador de gerenciamento da vitrine, ofertas de conteúdo, leads e métricas do professor.
/// Requer autenticação com papel de Professor.
/// </summary>
[ApiController]
[Authorize(Roles = UserRoles.Professor)]
[Route("api/professor")]
public class ProfessorManagementController : ControllerBase
{
    private readonly IProfessorShowcaseManagementService _managementService;
    private readonly IPublicShowcaseApplicationService _publicShowcaseService;

    public ProfessorManagementController(
        IProfessorShowcaseManagementService managementService,
        IPublicShowcaseApplicationService publicShowcaseService)
    {
        _managementService = managementService;
        _publicShowcaseService = publicShowcaseService;
    }

    private string? GetCurrentProfessorId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // ==========================================
    // 1. Vitrine (Showcase)
    // ==========================================

    /// <summary>
    /// Obtém a vitrine completa e configurada do professor autenticado.
    /// </summary>
    [HttpGet("showcase")]
    [ProducesResponseType(typeof(PublicProfessorProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyShowcase()
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.GetMyShowcaseAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Atualiza os dados de personalização da vitrine do professor (bio, slug, tema, WhatsApp, etc.).
    /// </summary>
    [HttpPut("showcase")]
    [ProducesResponseType(typeof(PublicProfessorProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateMyShowcase([FromBody] UpdateProfessorShowcaseDto dto)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.UpdateMyShowcaseAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Verifica a disponibilidade de um slug personalizado para a vitrine.
    /// </summary>
    [HttpGet("showcase/check-slug")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckSlug([FromQuery] string slug)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.CheckSlugAvailabilityAsync(professorId, slug);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { available = result.Data });
    }

    // ==========================================
    // 2. Ofertas de Conteúdo (Offerings)
    // ==========================================

    /// <summary>
    /// Lista todas as ofertas de conteúdo cadastradas pelo professor.
    /// </summary>
    [HttpGet("offerings")]
    [ProducesResponseType(typeof(List<PublicOfferingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOfferings()
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.GetMyOfferingsAsync(professorId);
        return Ok(result.Data);
    }

    /// <summary>
    /// Cria uma nova oferta de conteúdo (aula particular, curso, e-book, mentoria).
    /// </summary>
    [HttpPost("offerings")]
    [ProducesResponseType(typeof(PublicOfferingDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOffering([FromBody] SaveOfferingDto dto)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.CreateOfferingAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return StatusCode(result.StatusCode, result.Data);
    }

    /// <summary>
    /// Atualiza uma oferta de conteúdo existente.
    /// </summary>
    [HttpPut("offerings/{id:guid}")]
    [ProducesResponseType(typeof(PublicOfferingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOffering(Guid id, [FromBody] SaveOfferingDto dto)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.UpdateOfferingAsync(professorId, id, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Exclui uma oferta de conteúdo.
    /// </summary>
    [HttpDelete("offerings/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOffering(Guid id)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.DeleteOfferingAsync(professorId, id);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return NoContent();
    }

    /// <summary>
    /// Ativa ou pausa a exibição de uma oferta de conteúdo na vitrine.
    /// </summary>
    [HttpPatch("offerings/{id:guid}/toggle-active")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleOfferingActive(Guid id)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.ToggleOfferingActiveAsync(professorId, id);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { isActive = result.Data });
    }

    /// <summary>
    /// Reordena as ofertas de conteúdo na vitrine pública.
    /// </summary>
    [HttpPut("offerings/reorder")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ReorderOfferings([FromBody] ReorderOfferingsDto dto)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.ReorderOfferingsAsync(professorId, dto);
        return Ok(new { success = result.Data });
    }

    // ==========================================
    // 3. Métricas e Leads (Story 3.1 & 3.4)
    // ==========================================

    /// <summary>
    /// Retorna as métricas agregadas dos últimos 30 dias (visualizações, cliques no WhatsApp, leads capturados).
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(ShowcaseMetricSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyMetrics()
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _publicShowcaseService.GetProfessorMetricsAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Retorna a lista de leads gerados na vitrine do professor.
    /// </summary>
    [HttpGet("leads")]
    [ProducesResponseType(typeof(List<ShowcaseLeadResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyLeads()
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _publicShowcaseService.GetProfessorLeadsAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Atualiza o status de atendimento de um lead (Novo, Contatado, Convertido, Arquivado).
    /// </summary>
    [HttpPatch("leads/{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLeadStatus(Guid id, [FromBody] UpdateLeadStatusDto dto)
    {
        var professorId = GetCurrentProfessorId();
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _managementService.UpdateLeadStatusAsync(professorId, id, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { success = true });
    }
}
