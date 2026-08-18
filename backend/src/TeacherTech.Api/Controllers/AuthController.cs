using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador de autenticação e identificação de usuários, gerenciando registro, login e consulta de perfil ativo.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthApplicationService _authService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="AuthController"/>.
    /// </summary>
    /// <param name="authService">Serviço de aplicação para autenticação e geração de tokens JWT.</param>
    public AuthController(IAuthApplicationService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registra um novo usuário no sistema (Aluno ou Professor), configurando perfil e emitindo token JWT.
    /// </summary>
    /// <remarks>
    /// Cria o registro no ASP.NET Identity, associa a role correspondente e inicializa o perfil especializado.
    /// </remarks>
    /// <param name="dto">Dados de cadastro contendo nome completo, e-mail, senha, perfil pretendido e dados complementares.</param>
    /// <returns>Token JWT gerado e dados básicos do usuário recém-criado.</returns>
    /// <response code="200">Usuário registrado com sucesso e autenticado.</response>
    /// <response code="400">Dados inválidos ou e-mail já cadastrado.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Realiza a autenticação do usuário por e-mail e senha, retornando o token JWT.
    /// </summary>
    /// <remarks>
    /// Valida as credenciais no Identity e emite token de acesso assinado contendo as claims de perfil.
    /// </remarks>
    /// <param name="dto">Credenciais de acesso (e-mail e senha).</param>
    /// <returns>Token JWT e informações cadastrais do usuário autenticado.</returns>
    /// <response code="200">Autenticação bem-sucedida.</response>
    /// <response code="400">Requisição malformatada ou campos obrigatórios ausentes.</response>
    /// <response code="401">Credenciais inválidas (e-mail ou senha incorretos).</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _authService.LoginAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Obtém as informações e perfil do usuário atualmente autenticado a partir do token JWT.
    /// </summary>
    /// <remarks>
    /// Requer cabeçalho Authorization com token Bearer válido.
    /// </remarks>
    /// <returns>Dados do usuário logado (ID, nome, e-mail e perfil/role).</returns>
    /// <response code="200">Dados do usuário obtidos com sucesso.</response>
    /// <response code="401">Usuário não autenticado ou token expirado.</response>
    /// <response code="404">Usuário não encontrado na base de dados.</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _authService.GetCurrentUserAsync(userId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
