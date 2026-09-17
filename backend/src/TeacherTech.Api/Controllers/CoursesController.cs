using System.Globalization;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
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
    private readonly IPublicShowcaseApplicationService _publicShowcaseService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="CoursesController"/>.
    /// </summary>
    /// <param name="courseService">Serviço de aplicação responsável pela lógica de negócios dos cursos.</param>
    /// <param name="publicShowcaseService">Serviço público de vitrine e catálogo de cursos.</param>
    public CoursesController(
        ICourseApplicationService courseService,
        IPublicShowcaseApplicationService publicShowcaseService)
    {
        _courseService = courseService;
        _publicShowcaseService = publicShowcaseService;
    }

    /// <summary>
    /// Obtém a listagem de todos os cursos públicos e publicados disponíveis na plataforma.
    /// Não requer autenticação e não filtra por usuário logado.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("public")]
    [ProducesResponseType(typeof(List<CourseResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicCourses()
    {
        var courses = await _courseService.GetPublicCoursesAsync();
        return Ok(courses);
    }

    /// <summary>
    /// Busca e explora cursos públicos e publicados com suporte a termos de busca (Título, Descrição e Nome do Professor) e categorias.
    /// Acesso livre sem exigência de token.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("explorar")]
    [HttpGet("explore")]
    [ProducesResponseType(typeof(List<PublicCourseExploreDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExploreCourses([FromQuery] string? search, [FromQuery] string? category)
    {
        var courses = await _publicShowcaseService.ExploreCoursesAsync(search, category);
        return Ok(courses);
    }

    /// <summary>
    /// Obtém detalhes públicos de um plano de estudos ou perfil de professor por slug ou GUID.
    /// Acesso livre sem exigência de token.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("public/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublicBySlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest(new { message = "Slug informado é inválido." });

        // 1. GUID de curso
        if (Guid.TryParse(slug, out var courseId))
        {
            var courseRes = await _publicShowcaseService.GetPublicCourseDetailsAsync(courseId);
            if (courseRes.Success) return Ok(courseRes.Data);

            var directCourse = await _courseService.GetCourseByIdAsync(courseId);
            if (directCourse != null) return Ok(directCourse);
        }

        // 2. Slug de professor (ex: 'eduardo-lessa')
        var profRes = await _publicShowcaseService.GetProfessorBySlugAsync(slug);
        if (profRes.Success)
        {
            return Ok(profRes.Data);
        }

        // 3. Slug ou título de curso
        var allPublic = await _publicShowcaseService.ExploreCoursesAsync(null, null);
        var matchedCourse = allPublic.FirstOrDefault(c =>
            Slugify(c.Title) == slug.ToLower() ||
            c.Title.Equals(slug, StringComparison.OrdinalIgnoreCase) ||
            (!string.IsNullOrEmpty(c.ProfessorSlug) && c.ProfessorSlug.Equals(slug, StringComparison.OrdinalIgnoreCase)));

        if (matchedCourse != null)
        {
            var details = await _publicShowcaseService.GetPublicCourseDetailsAsync(matchedCourse.Id);
            if (details.Success) return Ok(details.Data);
            return Ok(matchedCourse);
        }

        return NotFound(new { message = "Plano de estudo ou mentor não encontrado." });
    }

    private static string Slugify(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(c);
            if (uc != UnicodeCategory.NonSpacingMark)
            {
                if (char.IsLetterOrDigit(c))
                    sb.Append(char.ToLowerInvariant(c));
                else if (c == ' ' || c == '-' || c == '_')
                    sb.Append('-');
            }
        }
        return Regex.Replace(sb.ToString(), @"-+", "-").Trim('-');
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
    [Authorize(Policy = "RequireActiveSubscription")]
    [HttpPost("studio-publish")]
    [ProducesResponseType(typeof(SaveStudioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    public async Task<IActionResult> PublishStudioContent([FromBody] SaveStudioContentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _courseService.PublishStudioContentAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    [Authorize(Roles = UserRoles.Professor)]
    [HttpPut("{courseId:guid}")]
    public async Task<IActionResult> UpdateCourseBasicInfo(Guid courseId, [FromBody] UpdateCourseDto dto)
    {
        var result = await _courseService.UpdateCourseBasicInfoAsync(courseId, dto);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return Ok(result.Data);
    }

    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("{courseId:guid}/modules")]
    public async Task<IActionResult> AddModule(Guid courseId, [FromBody] CreateModuleDto dto)
    {
        var result = await _courseService.AddModuleAsync(courseId, dto.Name);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return Ok(result.Data);
    }

    [Authorize(Roles = UserRoles.Professor)]
    [HttpPut("{courseId:guid}/modules/{moduleId:guid}")]
    public async Task<IActionResult> UpdateModule(Guid courseId, Guid moduleId, [FromBody] CreateModuleDto dto)
    {
        var result = await _courseService.UpdateModuleAsync(courseId, moduleId, dto.Name);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return Ok(result.Data);
    }

    [Authorize(Roles = UserRoles.Professor)]
    [HttpDelete("{courseId:guid}/modules/{moduleId:guid}")]
    public async Task<IActionResult> DeleteModule(Guid courseId, Guid moduleId)
    {
        var result = await _courseService.DeleteModuleAsync(courseId, moduleId);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return Ok(new { success = true });
    }
}
