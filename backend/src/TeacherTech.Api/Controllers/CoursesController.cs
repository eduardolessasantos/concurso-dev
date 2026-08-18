using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pelo gerenciamento de cursos e planos de estudo,
/// permitindo listagem pública, consulta detalhada, criação por professores e publicação em lote via Studio.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseApplicationService _courseService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="CoursesController"/>.
    /// </summary>
    /// <param name="courseService">Serviço de aplicação responsável pela lógica de negócios dos cursos.</param>
    public CoursesController(ICourseApplicationService courseService)
    {
        _courseService = courseService;
    }

    /// <summary>
    /// Obtém a listagem de todos os cursos públicos e publicados disponíveis na plataforma.
    /// </summary>
    /// <remarks>
    /// Serviço voltado para estudantes e visitantes explorarem o catálogo de cursos públicos ativos.
    /// Não requer autenticação.
    /// </remarks>
    /// <returns>Lista com o resumo dos cursos públicos cadastrados.</returns>
    /// <response code="200">Retorna a lista de cursos públicos disponíveis.</response>
    [HttpGet("public")]
    [ProducesResponseType(typeof(List<CourseResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicCourses()
    {
        var courses = await _courseService.GetPublicCoursesAsync();
        return Ok(courses);
    }

    /// <summary>
    /// Obtém todos os cursos e planos de estudo criados pelo professor autenticado.
    /// </summary>
    /// <remarks>
    /// Serviço restrito a usuários com perfil de Professor. Utiliza a claim do token JWT para filtrar os cursos do docente.
    /// </remarks>
    /// <returns>Lista de cursos vinculados ao professor autenticado.</returns>
    /// <response code="200">Retorna a lista de cursos do professor.</response>
    /// <response code="401">Usuário não autenticado ou token inválido.</response>
    /// <response code="403">Usuário autenticado não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpGet("my-courses")]
    [ProducesResponseType(typeof(List<CourseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyCourses()
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var courses = await _courseService.GetMyCoursesAsync(professorId);
        return Ok(courses);
    }

    /// <summary>
    /// Obtém os detalhes completos de um curso pelo seu identificador único (GUID), incluindo disciplinas e tópicos.
    /// </summary>
    /// <remarks>
    /// Serviço público para carregamento da árvore hierárquica e detalhes pedagógicos do curso.
    /// </remarks>
    /// <param name="id">Identificador único (GUID) do curso a ser consultado.</param>
    /// <returns>Objeto completo com as informações e hierarquia do curso.</returns>
    /// <response code="200">Retorna os dados detalhados do curso.</response>
    /// <response code="404">Curso não encontrado para o ID especificado.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CourseStudyPlan), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);
        if (course == null) return NotFound(new { message = "Curso não encontrado." });

        return Ok(course);
    }

    /// <summary>
    /// Cria um novo plano de estudos / curso vinculado ao professor autenticado.
    /// </summary>
    /// <remarks>
    /// Serviço restrito a usuários com perfil de Professor para cadastro inicial de cursos.
    /// </remarks>
    /// <param name="dto">Objeto contendo os dados cadastrais do curso (título, descrição, categoria, preço, visibilidade e imagem de capa).</param>
    /// <returns>Dados do curso criado com link para consulta detalhada.</returns>
    /// <response code="201">Curso criado com sucesso.</response>
    /// <response code="400">Dados inválidos ou falha na validação do modelo.</response>
    /// <response code="401">Usuário não autenticado como professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost]
    [ProducesResponseType(typeof(CourseStudyPlan), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _courseService.CreateCourseAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return CreatedAtAction(nameof(GetCourseById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Publica e sincroniza em lote o conteúdo completo de um curso editado no Studio (disciplinas, tópicos, flashcards e questões).
    /// </summary>
    /// <remarks>
    /// Serviço utilizado pelo Studio de Mentoria para salvar a árvore completa de estudo com persistência atômica.
    /// Requer autenticação ativa.
    /// </remarks>
    /// <param name="dto">Objeto estruturado contendo dados do curso e a lista aninhada de disciplinas, tópicos, flashcards e questões.</param>
    /// <returns>Resumo do processamento com os identificadores gerados e contadores de itens salvos.</returns>
    /// <response code="200">Conteúdo do curso sincronizado e publicado com sucesso.</response>
    /// <response code="400">Dados inválidos ou inconsistência no payload.</response>
    /// <response code="401">Usuário não autenticado.</response>
    [Authorize]
    [HttpPost("studio-publish")]
    [ProducesResponseType(typeof(SaveStudioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> PublishStudioContent([FromBody] SaveStudioContentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _courseService.PublishStudioContentAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
