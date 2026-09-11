using System.IO;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador responsável pela gestão de monetização e assinaturas SaaS B2B de professores via Asaas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;

    public BillingController(IBillingService billingService)
    {
        _billingService = billingService;
    }

    /// <summary>
    /// Inicia o checkout da assinatura SaaS para o professor e retorna a URL da fatura (PIX) gerada no Asaas.
    /// </summary>
    /// <remarks>
    /// Cria o cliente no Asaas se ainda não existir, cria a assinatura recorrente com split desabilitado e gera a fatura Pix.
    /// </remarks>
    /// <param name="dto">Plano desejado (BASIC: R$ 29,90/mês ou PRO: R$ 59,90/mês).</param>
    /// <returns>URL de pagamento/fatura no Asaas e identificadores da assinatura.</returns>
    /// <response code="200">Checkout gerado com sucesso com invoiceUrl.</response>
    /// <response code="400">Dados inválidos ou professor não informado.</response>
    /// <response code="401">Usuário não autenticado.</response>
    /// <response code="403">Usuário não possui perfil de Professor.</response>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(BillingCheckoutResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateCheckout([FromBody] BillingCheckoutRequestDto dto)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _billingService.CreateSubscriptionForProfessor(professorId, dto.PlanType);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Endpoint de webhook para receber notificações de eventos de cobrança e pagamentos do Asaas.
    /// </summary>
    /// <remarks>
    /// Valida o header 'asaas-access-token' com HMAC/segurança, registra o evento em AsaasWebhookLog
    /// e ativa a assinatura do professor (ACTIVE e +30 dias) ou marca como PAST_DUE caso vencida.
    /// </remarks>
    /// <returns>Confirmação de recebimento e processamento do webhook.</returns>
    /// <response code="200">Webhook processado com sucesso.</response>
    /// <response code="400">Payload inválido ou ausente.</response>
    /// <response code="401">Token do webhook inválido ou não autorizado.</response>
    [AllowAnonymous]
    [HttpPost("webhook/asaas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AsaasWebhook()
    {
        // 1. Extrair token de autenticação enviado pelo Asaas
        string? token = Request.Headers["asaas-access-token"].FirstOrDefault();
        if (string.IsNullOrEmpty(token))
        {
            token = Request.Headers["access_token"].FirstOrDefault();
        }

        // 2. Ler o corpo completo da requisição
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var rawPayload = await reader.ReadToEndAsync();

        if (string.IsNullOrWhiteSpace(rawPayload))
        {
            return BadRequest(new { message = "Corpo da requisição vazio." });
        }

        var result = await _billingService.ProcessAsaasWebhookAsync(token, rawPayload);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        }

        return Ok(new { message = result.Data });
    }
}
