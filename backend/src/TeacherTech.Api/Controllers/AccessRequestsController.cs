using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pela gestão de solicitações de acesso manual de estudantes aos cursos dos professores.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccessRequestsController : ControllerBase
{
    private readonly IAccessRequestApplicationService _accessRequestService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="AccessRequestsController"/>.
    /// </summary>
    /// <param name="accessRequestService">Serviço de aplicação para gestão de solicitações de acesso.</param>
    public AccessRequestsController(IAccessRequestApplicationService accessRequestService)
    {
        _accessRequestService = accessRequestService;
    }

    /// <summary>
    /// Envia uma solicitação de acesso a um curso específico por parte do estudante autenticado.
    /// </summary>
    /// <remarks>
    /// Cria um registro de solicitação com status PENDENTE para aprovação do professor responsável.
    /// </remarks>
    /// <param name="dto">Dados da solicitação contendo o ID do curso e mensagem opcional.</param>
    /// <returns>Mensagem de confirmação do envio da solicitação.</returns>
    /// <response code="200">Solicitação de acesso enviada com sucesso.</response>
    /// <response code="400">Dados inválidos ou aluno já matriculado/com solicitação pendente.</response>
    /// <response code="401">Usuário não autenticado.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RequestAccess([FromBody] CreateAccessRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(studentId)) return Unauthorized();

        var result = await _accessRequestService.RequestAccessAsync(studentId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }

    /// <summary>
    /// Obtém todas as solicitações de acesso pendentes destinadas aos cursos do professor autenticado.
    /// </summary>
    /// <remarks>
    /// Serviço restrito ao perfil de Professor para acompanhamento e triagem de pedidos de acesso.
    /// </remarks>
    /// <returns>Lista de solicitações pendentes com dados do aluno e do curso.</returns>
    /// <response code="200">Lista de solicitações de acesso pendentes.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário autenticado não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpGet("pending")]
    [ProducesResponseType(typeof(List<AccessRequestResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingRequests()
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _accessRequestService.GetPendingRequestsAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Aprova uma solicitação de acesso, gerando automaticamente a matrícula ativa do aluno no curso correspondente.
    /// </summary>
    /// <remarks>
    /// O professor valida a solicitação e libera o acesso do estudante ao conteúdo completo.
    /// </remarks>
    /// <param name="id">Identificador único (GUID) da solicitação de acesso.</param>
    /// <returns>Mensagem de sucesso da aprovação.</returns>
    /// <response code="200">Solicitação aprovada e matrícula efetivada com sucesso.</response>
    /// <response code="400">Solicitação não encontrada ou em estado incompatível.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não é o professor proprietário do curso.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _accessRequestService.ApproveRequestAsync(professorId, id);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }

    /// <summary>
    /// Rejeita uma solicitação de acesso enviada por um estudante.
    /// </summary>
    /// <remarks>
    /// Atualiza o status da solicitação para REJEITADA sem gerar matrícula.
    /// </remarks>
    /// <param name="id">Identificador único (GUID) da solicitação de acesso.</param>
    /// <returns>Mensagem de confirmação da rejeição.</returns>
    /// <response code="200">Solicitação rejeitada com sucesso.</response>
    /// <response code="400">Solicitação não encontrada ou já processada.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não é o professor proprietário do curso.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RejectRequest(Guid id)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _accessRequestService.RejectRequestAsync(professorId, id);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }
}
