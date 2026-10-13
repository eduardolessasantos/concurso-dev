using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador público responsável pela vitrine de mentores, exploração de cursos e páginas institucionais de vendas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PublicShowcaseController : ControllerBase
{
    private readonly IPublicShowcaseApplicationService _publicShowcaseService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="PublicShowcaseController"/>.
    /// </summary>
    /// <param name="publicShowcaseService">Serviço de aplicação para consulta e vitrine pública de mentores e cursos.</param>
    public PublicShowcaseController(IPublicShowcaseApplicationService publicShowcaseService)
    {
        _publicShowcaseService = publicShowcaseService;
    }

    /// <summary>
    /// Obtém a página pública de perfil e os cursos disponíveis de um professor a partir do seu slug personalizado.
    /// </summary>
    /// <remarks>
    /// Utilizado para renderizar a landing page de mentores (ex: `/p/eduardo-lessa`).
    /// </remarks>
    /// <param name="slug">Identificador textual amigável (slug) do professor.</param>
    /// <returns>Dados do perfil público do professor e relação dos seus cursos ativos.</returns>
    /// <response code="200">Perfil público do professor retornado com sucesso.</response>
    /// <response code="404">Professor não encontrado para o slug especificado.</response>
    [HttpGet("professors/{slug}")]
    [ProducesResponseType(typeof(PublicProfessorProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfessorBySlug(string slug)
    {
        var result = await _publicShowcaseService.GetProfessorBySlugAsync(slug);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Explora e pesquisa o catálogo de ofertas e cursos públicos da plataforma com filtros facetados e paginação.
    /// </summary>
    /// <remarks>
    /// Permite filtrar por matéria/disciplina, faixa de preço, formato (online/presencial), cidade e busca textual.
    /// </remarks>
    /// <param name="queryParams">Parâmetros de consulta e filtros facetados.</param>
    /// <returns>Resultado paginado com ofertas e cursos correspondentes.</returns>
    /// <response code="200">Resultado paginado retornado com sucesso.</response>
    [HttpGet("explore")]
    [ProducesResponseType(typeof(PagedResult<ExploreItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Explore([FromQuery] ExploreQueryParams queryParams)
    {
        var result = await _publicShowcaseService.ExploreAsync(queryParams);
        return Ok(result);
    }

    /// <summary>
    /// Obtém os filtros ativos agregados (matérias, cidades e formatos) para compor a interface de busca facetada.
    /// </summary>
    /// <returns>Lista de filtros disponíveis.</returns>
    /// <response code="200">Filtros retornados com sucesso.</response>
    [HttpGet("filters")]
    [ProducesResponseType(typeof(ExploreFiltersDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilters()
    {
        var result = await _publicShowcaseService.GetAvailableFiltersAsync();
        return Ok(result);
    }

    /// <summary>
    /// Obtém a visão pública detalhada de um curso para a página de vendas e checkout (landing page do curso).
    /// </summary>
    /// <remarks>
    /// Retorna detalhes pedagógicos, ementa de disciplinas, perfil do mentor e opções de compra sem expor conteúdo restrito.
    /// </remarks>
    /// <param name="id">Identificador único (GUID) do curso.</param>
    /// <returns>Detalhes públicos do curso para a landing page.</returns>
    /// <response code="200">Detalhes públicos do curso retornados com sucesso.</response>
    /// <response code="404">Curso não encontrado.</response>
    [HttpGet("courses/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublicCourseDetails(Guid id)
    {
        var result = await _publicShowcaseService.GetPublicCourseDetailsAsync(id);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Registra um novo lead de contato na vitrine do professor (sem criação de contas de usuário descartáveis).
    /// </summary>
    /// <param name="dto">Dados do lead interessado com aceite explícito de termos LGPD.</param>
    /// <returns>Lead criado com sucesso.</returns>
    /// <response code="200">Lead registrado com sucesso.</response>
    /// <response code="400">Dados inválidos ou aceite de termos não fornecido.</response>
    /// <response code="404">Professor não encontrado.</response>
    [HttpPost("leads")]
    [ProducesResponseType(typeof(ShowcaseLeadResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateLead([FromBody] CreateShowcaseLeadDto dto)
    {
        var result = await _publicShowcaseService.CreateLeadAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Registra a telemetria de cliques em botões de ação e visualizações de vitrine.
    /// </summary>
    /// <param name="dto">Dados do clique registrado.</param>
    /// <returns>Confirmação do registro da telemetria.</returns>
    /// <response code="200">Telemetria registrada.</response>
    [HttpPost("track-click")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> TrackClick([FromBody] TrackClickDto dto)
    {
        var result = await _publicShowcaseService.TrackClickAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { success = true });
    }

    /// <summary>
    /// Obtém os leads recebidos por um professor específico.
    /// </summary>
    /// <param name="professorId">Identificador do professor.</param>
    /// <returns>Lista de leads capturados.</returns>
    [HttpGet("professors/{professorId}/leads")]
    [ProducesResponseType(typeof(List<ShowcaseLeadResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfessorLeads(string professorId)
    {
        var result = await _publicShowcaseService.GetProfessorLeadsAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Obtém as métricas consolidadas e histórico de visualizações e cliques do professor.
    /// </summary>
    /// <param name="professorId">Identificador do professor.</param>
    /// <returns>Resumo de métricas da vitrine.</returns>
    [HttpGet("professors/{professorId}/metrics")]
    [ProducesResponseType(typeof(ShowcaseMetricSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfessorMetrics(string professorId)
    {
        var result = await _publicShowcaseService.GetProfessorMetricsAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
