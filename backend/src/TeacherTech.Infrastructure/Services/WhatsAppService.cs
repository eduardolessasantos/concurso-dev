using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Infrastructure.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly WhatsAppOptions _options;
    private readonly IWhatsAppLogRepository _logRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(
        HttpClient httpClient,
        IOptions<WhatsAppOptions> options,
        IWhatsAppLogRepository logRepo,
        IUnitOfWork unitOfWork,
        ILogger<WhatsAppService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logRepo = logRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<WhatsAppSendResult> SendInviteAsync(
        string phone, 
        string courseTitle, 
        string inviteLink, 
        Guid inviteTokenId, 
        CancellationToken cancellationToken = default)
    {
        var cleanPhone = Regex.Replace(phone ?? string.Empty, @"\D", "");
        if (string.IsNullOrWhiteSpace(cleanPhone) || cleanPhone.Length < 10)
        {
            var invalidLog = new WhatsAppLog
            {
                InviteTokenId = inviteTokenId,
                WabaMessageId = string.Empty,
                ToPhone = phone ?? string.Empty,
                Status = "FAILED",
                ErrorJson = "Número de telefone inválido.",
                CreatedAt = DateTime.UtcNow
            };
            await _logRepo.AddAsync(invalidLog, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
            return WhatsAppSendResult.Fail("Número de telefone inválido.");
        }

        // Garante DDI 55 caso seja número nacional brasileiro
        if (cleanPhone.Length is 10 or 11 && !cleanPhone.StartsWith("55"))
        {
            cleanPhone = "55" + cleanPhone;
        }

        var messageBody = $"Olá! Seu professor liberou seu acesso ao curso '{courseTitle}'.\nAcesse seu link exclusivo:\n{inviteLink}\nBons estudos!";

        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = cleanPhone,
            type = "text",
            text = new
            {
                preview_url = true,
                body = messageBody
            }
        };

        var isSandbox = string.Equals(_options.Environment, "Sandbox", StringComparison.OrdinalIgnoreCase);
        var phoneNumberId = string.IsNullOrWhiteSpace(_options.PhoneNumberId) ? "sandbox_phone_id" : _options.PhoneNumberId;
        var requestUrl = $"https://graph.facebook.com/v20.0/{phoneNumberId}/messages";

        string wabaMessageId = string.Empty;
        string status = "SENT";
        string? errorJson = null;

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Content = JsonContent.Create(payload)
            };

            if (!string.IsNullOrWhiteSpace(_options.AccessToken))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);
            }

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                try
                {
                    var metaResponse = JsonSerializer.Deserialize<MetaWhatsAppMessageResponse>(responseContent);
                    wabaMessageId = metaResponse?.Messages?.FirstOrDefault()?.Id ?? $"wamid_{Guid.NewGuid():N}";
                }
                catch
                {
                    wabaMessageId = $"wamid_{Guid.NewGuid():N}";
                }
                status = "SENT";
            }
            else
            {
                if (isSandbox)
                {
                    // No sandbox/ambiente de testes ou sem token real do Facebook Graph API
                    _logger.LogWarning("WhatsApp Cloud API retornou status {StatusCode}. Utilizando fallback de simulação Sandbox.", response.StatusCode);
                    wabaMessageId = $"wamid_sandbox_{Guid.NewGuid():N}";
                    status = "SENT";
                }
                else
                {
                    _logger.LogError("Erro no envio do WhatsApp Cloud API: {Error}", responseContent);
                    status = "FAILED";
                    errorJson = responseContent;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha na comunicação direta com WhatsApp Graph API.");
            if (isSandbox)
            {
                wabaMessageId = $"wamid_sandbox_{Guid.NewGuid():N}";
                status = "SENT";
            }
            else
            {
                status = "FAILED";
                errorJson = ex.Message;
            }
        }

        // Persiste o log no banco de dados
        var log = new WhatsAppLog
        {
            InviteTokenId = inviteTokenId,
            WabaMessageId = wabaMessageId,
            ToPhone = cleanPhone,
            Status = status,
            ErrorJson = errorJson,
            CreatedAt = DateTime.UtcNow
        };

        await _logRepo.AddAsync(log, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        if (status == "FAILED")
        {
            return WhatsAppSendResult.Fail(errorJson ?? "Falha no envio da mensagem WhatsApp.", wabaMessageId);
        }

        return WhatsAppSendResult.Ok(wabaMessageId, status);
    }
}
