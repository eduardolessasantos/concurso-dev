using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pelo gerenciamento de tópicos pedagógicos, ementas teóricas e conteúdos de estudo por disciplina.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase
{
    private readonly ITopicApplicationService _topicService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="TopicsController"/>.
    /// </summary>
    /// <param name="topicService">Serviço de aplicação para gestão de tópicos e ementas didáticas.</param>
    public TopicsController(ITopicApplicationService topicService)
    {
        _topicService = topicService;
    }

    /// <summary>
    /// Lista todos os tópicos de estudo associados a uma disciplina / matéria específica.
    /// </summary>
    /// <remarks>
    /// Retorna os tópicos ordenados pelo índice pedagógico de apresentação (`OrderIndex`).
    /// </remarks>
    /// <param name="subjectId">Identificador unico (GUID) da matéria pai.</param>
    /// <returns>Lista de tópicos pertencentes à matéria.</returns>
    /// <response code="200">Lista de tópicos retornada com sucesso.</response>
    [HttpGet("subject/{subjectId:guid}")]
    [ProducesResponseType(typeof(List<Topic>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTopicsBySubject(Guid subjectId)
    {
        var topics = await _topicService.GetTopicsBySubjectAsync(subjectId);
        return Ok(topics);
    }

    /// <summary>
    /// Obtém os detalhes completos de um tópico específico, incluindo seu conteúdo teórico em Markdown, flashcards e questões vinculadas.
    /// </summary>
    /// <remarks>
    /// Utilizado para renderizar a tela de leitura e ambiente de estudo do estudante ou editor do professor.
    /// </remarks>
    /// <param name="id">Identificador único (GUID) do tópico de estudo.</param>
    /// <returns>Objeto completo com os dados do tópico e materiais associados.</returns>
    /// <response code="200">Tópico retornado com sucesso.</response>
    /// <response code="404">Tópico não encontrado para o ID fornecido.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Topic), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTopicById(Guid id)
    {
        var topic = await _topicService.GetTopicByIdAsync(id);
        if (topic == null) return NotFound(new { message = "Tópico não encontrado." });

        return Ok(topic);
    }

    /// <summary>
    /// Cria um novo tópico de estudo associado a uma matéria / disciplina.
    /// </summary>
    /// <remarks>
    /// Serviço restrito a usuários com perfil de Professor para inclusão de itens curriculares e resumos.
    /// </remarks>
    /// <param name="dto">Dados do tópico (ID da disciplina pai, título, banca examinadora alvo, índice de ordenação e conteúdo Markdown).</param>
    /// <returns>Objeto do tópico de estudo criado.</returns>
    /// <response code="200">Tópico criado com sucesso.</response>
    /// <response code="400">Dados inválidos ou disciplina pai não localizada.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário autenticado não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost]
    [ProducesResponseType(typeof(Topic), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateTopic([FromBody] CreateTopicDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _topicService.CreateTopicAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }
}
