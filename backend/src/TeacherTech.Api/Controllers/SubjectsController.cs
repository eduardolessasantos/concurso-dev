using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pela gestão de matérias e disciplinas pertencentes aos cursos e planos de estudo.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectApplicationService _subjectService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="SubjectsController"/>.
    /// </summary>
    /// <param name="subjectService">Serviço de aplicação responsável pelo gerenciamento de disciplinas.</param>
    public SubjectsController(ISubjectApplicationService subjectService)
    {
        _subjectService = subjectService;
    }

    /// <summary>
    /// Obtém a listagem de todas as matérias / disciplinas associadas a um curso específico.
    /// </summary>
    /// <remarks>
    /// Retorna as disciplinas ordenadas conforme a sequência pedagógica (`OrderIndex`).
    /// </remarks>
    /// <param name="courseId">Identificador único (GUID) do curso pai.</param>
    /// <returns>Lista de disciplinas vinculadas ao curso.</returns>
    /// <response code="200">Lista de disciplinas retornada com sucesso.</response>
    [HttpGet("course/{courseId:guid}")]
    [ProducesResponseType(typeof(List<Subject>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubjectsByCourse(Guid courseId)
    {
        var subjects = await _subjectService.GetSubjectsByCourseAsync(courseId);
        return Ok(subjects);
    }

    /// <summary>
    /// Cria uma nova matéria / disciplina vinculada a um plano de estudos existente.
    /// </summary>
    /// <remarks>
    /// Serviço restrito a usuários com perfil de Professor para estruturação curricular de seus cursos.
    /// </remarks>
    /// <param name="dto">Dados da matéria (ID do curso pai, nome da matéria, descrição e índice de ordenação).</param>
    /// <returns>Objeto da disciplina recém-criada.</returns>
    /// <response code="200">Disciplina criada com sucesso.</response>
    /// <response code="400">Dados inválidos ou curso pai não encontrado.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário autenticado não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost]
    [ProducesResponseType(typeof(Subject), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _subjectService.CreateSubjectAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
