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
    /// Explora e pesquisa o catálogo de cursos públicos da plataforma com filtros opcionais de busca textual e categoria.
    /// </summary>
    /// <remarks>
    /// Serviço de busca para a vitrine principal da plataforma.
    /// </remarks>
    /// <param name="search">Termo de busca textual para filtrar por título ou descrição (opcional).</param>
    /// <param name="category">Filtro por categoria temática (opcional).</param>
    /// <returns>Lista de cursos públicos correspondentes aos filtros.</returns>
    /// <response code="200">Lista de cursos retornada com sucesso.</response>
    [HttpGet("explore")]
    [ProducesResponseType(typeof(List<PublicCourseExploreDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExploreCourses([FromQuery] string? search, [FromQuery] string? category)
    {
        var courses = await _publicShowcaseService.ExploreCoursesAsync(search, category);
        return Ok(courses);
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
}
