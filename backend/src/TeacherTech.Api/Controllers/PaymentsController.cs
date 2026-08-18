using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador financeiro responsável pelo processamento de checkouts, simulação de pagamentos,
/// webhooks de gateways e gestão de saldo e chave Pix de professores.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentApplicationService _paymentService;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="PaymentsController"/>.
    /// </summary>
    /// <param name="paymentService">Serviço de aplicação responsável pelas operações financeiras e conciliação de pagamentos.</param>
    public PaymentsController(IPaymentApplicationService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Cria uma nova intenção de pagamento / checkout para compra de um curso.
    /// </summary>
    /// <remarks>
    /// Gera o registro da transação financeira e dados para pagamento via Pix (QRCode, linha digitável e ID de transação).
    /// </remarks>
    /// <param name="dto">Dados do checkout incluindo o ID do curso a ser adquirido e o método de pagamento selecionado.</param>
    /// <returns>Dados do checkout gerado com QR Code Pix e identificador da transação.</returns>
    /// <response code="200">Checkout gerado com sucesso.</response>
    /// <response code="400">Curso inválido, gratuito ou erro na inicialização do pagamento.</response>
    /// <response code="401">Usuário não autenticado.</response>
    [Authorize]
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(CheckoutResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _paymentService.CreateCheckoutAsync(userId, dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Recebe e processa notificações em tempo real (webhooks) de confirmação de pagamento enviadas pelo gateway.
    /// </summary>
    /// <remarks>
    /// Valida o evento, atualiza o status da transação para PAID e libera automaticamente a matrícula do aluno.
    /// </remarks>
    /// <param name="dto">Payload da notificação enviado pelo gateway de pagamento.</param>
    /// <returns>Mensagem de confirmação do processamento do webhook.</returns>
    /// <response code="200">Webhook processado e transação conciliada com sucesso.</response>
    /// <response code="400">Falha no processamento ou evento não reconhecido.</response>
    [HttpPost("webhook")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PaymentWebhook([FromBody] PaymentWebhookDto dto)
    {
        var result = await _paymentService.ProcessWebhookAsync(dto);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }

    /// <summary>
    /// Confirma manualmente um pagamento em ambiente de testes ou simulação (Sandbox Pix).
    /// </summary>
    /// <remarks>
    /// Endpoint utilitário para validar o fluxo completo de compra e ativação imediata de matrículas em ambiente de desenvolvimento.
    /// </remarks>
    /// <param name="transactionId">Identificador único (GUID) da transação de pagamento pendente.</param>
    /// <returns>Mensagem de confirmação da liquidação simulada.</returns>
    /// <response code="200">Pagamento simulado confirmado com sucesso e matrícula ativada.</response>
    /// <response code="400">Transação não encontrada ou já liquidada.</response>
    [HttpPost("confirm-simulated-payment/{transactionId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmSimulatedPayment(Guid transactionId)
    {
        var result = await _paymentService.ConfirmSimulatedPaymentAsync(transactionId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }

    /// <summary>
    /// Obtém o extrato financeiro e saldo consolidado do professor autenticado.
    /// </summary>
    /// <remarks>
    /// Retorna saldo disponível, total bruto de vendas, comissões retidas e chave Pix cadastrada para repasse.
    /// </remarks>
    /// <returns>Objeto contendo métricas financeiras e histórico consolidado do professor.</returns>
    /// <response code="200">Saldo e métricas financeiras retornados com sucesso.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário autenticado não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpGet("professor-balance")]
    [ProducesResponseType(typeof(ProfessorBalanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProfessorBalance()
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _paymentService.GetProfessorBalanceAsync(professorId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Atualiza a chave Pix cadastrada no perfil do professor para recebimento de repasses de vendas.
    /// </summary>
    /// <remarks>
    /// Requer perfil de Professor.
    /// </remarks>
    /// <param name="pixKey">Nova chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória).</param>
    /// <returns>Mensagem de sucesso da atualização.</returns>
    /// <response code="200">Chave Pix atualizada com sucesso.</response>
    /// <response code="400">Chave Pix inválida ou vazia.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPut("update-pix-key")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePixKey([FromBody] string pixKey)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _paymentService.UpdatePixKeyAsync(professorId, pixKey);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }
}
