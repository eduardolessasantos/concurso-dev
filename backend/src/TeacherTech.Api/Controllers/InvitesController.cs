using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pela gestão de convites de alunos sem e-mail:
/// Link direto, QR Code e envio via WhatsApp Cloud API.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class InvitesController : ControllerBase
{
    private readonly IInviteService _inviteService;

    public InvitesController(IInviteService inviteService)
    {
        _inviteService = inviteService;
    }

    /// <summary>
    /// Gera um novo token de convite curto (Nanoid 8 chars), link exclusivo e QR Code em Base64.
    /// Se o canal for WHATSAPP, dispara mensagem via Meta WhatsApp Cloud API.
    /// </summary>
    /// <param name="dto">Parâmetros do convite contendo CourseId, canal (Link, WhatsApp, QrCode) e telefone opcional.</param>
    /// <returns>Dados do convite gerado contendo inviteUrl, qrCodeBase64, maxUses e expiração.</returns>
    /// <response code="200">Convite gerado com sucesso.</response>
    /// <response code="400">Dados inválidos.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não é professor ou não possui acesso ao curso.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("generate")]
    [ProducesResponseType(typeof(InviteGeneratedResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GenerateInvite([FromBody] CreateInviteDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId))
            return Unauthorized();

        // Determina a URL base da aplicação cliente a partir do request ou header Origin/Referer
        var origin = Request.Headers.Origin.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(origin))
        {
            origin = $"{Request.Scheme}://{Request.Host}";
        }

        var result = await _inviteService.GenerateInviteAsync(professorId, dto, origin);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Valida um token de convite verificando expiração e quantidade máxima de utilizações.
    /// Aberto para consulta prévia à matrícula do aluno.
    /// </summary>
    /// <param name="token">Token curto de 8 caracteres do convite.</param>
    /// <returns>Dados informativos do curso e status de validade do convite.</returns>
    /// <response code="200">Convite válido.</response>
    /// <response code="404">Convite inexistente.</response>
    /// <response code="410">Convite expirado ou limite de usos esgotado.</response>
    [AllowAnonymous]
    [HttpGet("validate/{token}")]
    [ProducesResponseType(typeof(ValidateInviteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<IActionResult> ValidateInvite(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Token é obrigatório." });

        var result = await _inviteService.ValidateInviteAsync(token);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Resgata o convite para o estudante autenticado, criando a matrícula imediata (Enrollment)
    /// e incrementando o número de utilizações do token.
    /// </summary>
    /// <param name="token">Token curto de 8 caracteres do convite.</param>
    /// <returns>Dados da matrícula confirmada no curso.</returns>
    /// <response code="200">Matrícula realizada ou já existente.</response>
    /// <response code="400">Token inválido.</response>
    /// <response code="401">Estudante não autenticado.</response>
    /// <response code="404">Convite não encontrado.</response>
    /// <response code="410">Convite expirado ou esgotado.</response>
    [Authorize]
    [HttpPost("redeem/{token}")]
    [ProducesResponseType(typeof(RedeemInviteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<IActionResult> RedeemInvite(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Token é obrigatório." });

        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(studentId))
            return Unauthorized();

        var result = await _inviteService.RedeemInviteAsync(studentId, token);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    [Authorize]
    [HttpPost("redeem")]
    [ProducesResponseType(typeof(RedeemInviteResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> RedeemInviteQueryOrBody([FromQuery] string? token, [FromBody] RedeemTokenRequestDto? dto)
    {
        var finalToken = !string.IsNullOrWhiteSpace(token) ? token : dto?.Token;
        if (string.IsNullOrWhiteSpace(finalToken))
            return BadRequest(new { message = "Token é obrigatório." });

        return await RedeemInvite(finalToken);
    }

    /// <summary>
    /// Obtém métricas B2B consolidadas para o painel do professor:
    /// total de alunos ativos, cursos publicados, taxa de acerto de StudentProgress, convites pendentes e lista de tokens.
    /// </summary>
    /// <returns>Objeto contendo estatísticas e lista de convites gerados.</returns>
    /// <response code="200">Painel retornado com sucesso.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não é professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ProfessorDashboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProfessorDashboard()
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId))
            return Unauthorized();

        var result = await _inviteService.GetProfessorDashboardAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}

public class RedeemTokenRequestDto
{
    public string? Token { get; set; }
}
