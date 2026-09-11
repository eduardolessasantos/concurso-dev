using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pelo registro de progresso, resoluções de questões e hidratação de desempenho do estudante.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    /// <summary>
    /// Registra a resposta de uma questão por parte do estudante autenticado.
    /// </summary>
    /// <param name="dto">Dados da resposta contendo TopicId, QuestionId opcional, IsCorrect e TimeSpentSeconds.</param>
    /// <returns>Confirmação do registro de progresso.</returns>
    /// <response code="200">Resposta registrada com sucesso.</response>
    /// <response code="400">Dados inválidos.</response>
    /// <response code="401">Estudante não autenticado.</response>
    [HttpPost("answer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RecordAnswer([FromBody] RecordAnswerRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(studentId))
            return Unauthorized();

        var result = await _progressService.RecordAnswerAsync(studentId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { success = true, message = "Resposta registrada com sucesso." });
    }

    /// <summary>
    /// Obtém o progresso consolidado e o histórico de respostas do estudante autenticado para um determinado curso.
    /// </summary>
    /// <param name="courseId">Identificador do curso.</param>
    /// <returns>Estatísticas do curso (questões respondidas, acertos, percentual) e lista detalhada de respostas.</returns>
    /// <response code="200">Progresso obtido com sucesso.</response>
    /// <response code="401">Estudante não autenticado.</response>
    /// <response code="404">Curso não encontrado.</response>
    [HttpGet("my-progress/{courseId}")]
    [ProducesResponseType(typeof(CourseProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyProgress(Guid courseId)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(studentId))
            return Unauthorized();

        var result = await _progressService.GetMyProgressByCourseAsync(studentId, courseId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
