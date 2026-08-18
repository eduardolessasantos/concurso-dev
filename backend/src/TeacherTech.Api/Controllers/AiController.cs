using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pelos serviços de Inteligência Artificial generativa para mentores e professores,
/// incluindo geração de resumos em markdown, flashcards mnemônicos e questões inéditas comentadas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = UserRoles.Professor)]
public class AiController : ControllerBase
{
    private readonly IAiContentApplicationService _aiContentService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="AiController"/>.
    /// </summary>
    /// <param name="aiContentService">Serviço de aplicação para orquestração de IA e controle de créditos.</param>
    public AiController(IAiContentApplicationService aiContentService)
    {
        _aiContentService = aiContentService;
    }

    /// <summary>
    /// Gera um resumo teórico estruturado em Markdown com base no tema, matéria e banca informados.
    /// </summary>
    /// <remarks>
    /// Consome créditos de IA do professor e retorna texto didático pronto para estudo ou edição.
    /// </remarks>
    /// <param name="dto">Parâmetros de geração contendo tópico, matéria, banca examinadora, nível de detalhe e contexto extra.</param>
    /// <returns>Objeto contendo o resumo gerado em formato Markdown.</returns>
    /// <response code="200">Resumo gerado com sucesso pela IA.</response>
    /// <response code="400">Parâmetros inválidos ou erro na chamada ao modelo de IA.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não possui perfil de Professor ou cota de créditos de IA esgotada.</response>
    [HttpPost("generate-summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GenerateSummary([FromBody] GenerateAiContentDto dto)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _aiContentService.GenerateSummaryAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { summaryMarkdown = result.Data });
    }

    /// <summary>
    /// Gera uma coleção de Flashcards (frente e verso com nível de dificuldade) orientados à repetição espaçada.
    /// </summary>
    /// <remarks>
    /// Gera pares de pergunta/conceito e resposta/explicação baseados no conteúdo e banca solicitados.
    /// </remarks>
    /// <param name="dto">Parâmetros de geração com tópico, matéria, banca e quantidade de itens desejados.</param>
    /// <returns>Lista de flashcards gerados.</returns>
    /// <response code="200">Flashcards gerados com sucesso.</response>
    /// <response code="400">Parâmetros inválidos ou erro no provedor de IA.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Perfil de Professor obrigatório ou saldo de créditos insuficiente.</response>
    [HttpPost("generate-flashcards")]
    [ProducesResponseType(typeof(List<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GenerateFlashcards([FromBody] GenerateAiContentDto dto)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _aiContentService.GenerateFlashcardsAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Gera questões inéditas de múltipla escolha com gabarito fundamentado no estilo da banca examinadora solicitada (ex.: FGV, Cebraspe).
    /// </summary>
    /// <remarks>
    /// Cria enunciados, alternativas de A a E, índice correto e explicação pedagógica detalhada.
    /// </remarks>
    /// <param name="dto">Parâmetros de geração incluindo tópico, matéria, banca, quantidade e diretrizes pedagógicas.</param>
    /// <returns>Lista de questões geradas com alternativas e gabarito comentado.</returns>
    /// <response code="200">Questões geradas com sucesso.</response>
    /// <response code="400">Parâmetros inválidos ou falha no processamento da IA.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Perfil de Professor obrigatório ou saldo de créditos insuficiente.</response>
    [HttpPost("generate-questions")]
    [ProducesResponseType(typeof(List<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GenerateQuestions([FromBody] GenerateAiContentDto dto)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _aiContentService.GenerateQuestionsAsync(professorId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
