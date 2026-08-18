using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pelo gerenciamento de matrículas e acessos de estudantes aos cursos e trilhas de estudo.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentApplicationService _enrollmentService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="EnrollmentsController"/>.
    /// </summary>
    /// <param name="enrollmentService">Serviço de aplicação para controle de matrículas e acessos.</param>
    public EnrollmentsController(IEnrollmentApplicationService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    /// <summary>
    /// Convida e matricula diretamente um estudante em um curso através do endereço de e-mail.
    /// </summary>
    /// <remarks>
    /// Serviço restrito a Professores para concessão direta de acesso aos seus respectivos cursos.
    /// </remarks>
    /// <param name="dto">Dados do convite contendo o ID do curso e o e-mail do estudante.</param>
    /// <returns>Dados da matrícula gerada ou atualizada.</returns>
    /// <response code="200">Estudante matriculado/convidado com sucesso.</response>
    /// <response code="400">Estudante não encontrado com o e-mail fornecido ou dados inválidos.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário autenticado não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("invite-by-email")]
    [ProducesResponseType(typeof(EnrollmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> InviteStudentByEmail([FromBody] InviteStudentByEmailDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _enrollmentService.InviteStudentByEmailAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Lista todos os alunos matriculados em um curso específico do professor autenticado.
    /// </summary>
    /// <remarks>
    /// Permite ao docente visualizar a relação de alunos, datas de matrícula e status de acesso.
    /// </remarks>
    /// <param name="courseId">Identificador único (GUID) do curso.</param>
    /// <returns>Lista de alunos matriculados no curso.</returns>
    /// <response code="200">Lista de matrículas obtida com sucesso.</response>
    /// <response code="400">Curso não pertence ao professor ou não foi encontrado.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não é professor proprietário do curso.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpGet("course/{courseId:guid}")]
    [ProducesResponseType(typeof(List<EnrollmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCourseEnrollments(Guid courseId)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _enrollmentService.GetCourseEnrollmentsAsync(professorId, courseId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Obtém a listagem de todos os cursos nos quais o estudante autenticado está matriculado (painel Meu Estudo).
    /// </summary>
    /// <remarks>
    /// Retorna os planos de estudo com progresso, quantidade de matérias e dados dos professores mentores.
    /// </remarks>
    /// <returns>Lista de cursos matriculados do estudante.</returns>
    /// <response code="200">Lista de estudos do aluno retornada com sucesso.</response>
    /// <response code="401">Usuário não autenticado.</response>
    [HttpGet("my-studies")]
    [ProducesResponseType(typeof(List<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyStudies()
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(studentId)) return Unauthorized();

        var result = await _enrollmentService.GetMyStudiesAsync(studentId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Revoga ou cancela a matrícula de um aluno em um curso do professor autenticado.
    /// </summary>
    /// <remarks>
    /// Remove o acesso do estudante ao curso especificado.
    /// </remarks>
    /// <param name="id">Identificador único (GUID) da matrícula a ser revogada.</param>
    /// <returns>Sem conteúdo em caso de sucesso.</returns>
    /// <response code="204">Acesso revogado com sucesso.</response>
    /// <response code="400">Matrícula não encontrada ou não pertence a um curso do professor.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário autenticado não é o professor proprietário.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RevokeAccess(Guid id)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _enrollmentService.RevokeAccessAsync(professorId, id);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return NoContent();
    }
}
