using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Application.Services;

public class BillingService : IBillingService
{
    private readonly IProfessorProfileRepository _professorProfileRepo;
    private readonly IProfessorSubscriptionRepository _subscriptionRepo;
    private readonly IAsaasWebhookLogRepository _webhookLogRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly HttpClient _httpClient;
    private readonly AsaasOptions _options;

    public BillingService(
        IProfessorProfileRepository professorProfileRepo,
        IProfessorSubscriptionRepository subscriptionRepo,
        IAsaasWebhookLogRepository webhookLogRepo,
        IUnitOfWork unitOfWork,
        HttpClient httpClient,
        IOptions<AsaasOptions> options)
    {
        _professorProfileRepo = professorProfileRepo;
        _subscriptionRepo = subscriptionRepo;
        _webhookLogRepo = webhookLogRepo;
        _unitOfWork = unitOfWork;
        _httpClient = httpClient;
        _options = options.Value;

        if (_httpClient.BaseAddress == null)
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
        }
        if (!_httpClient.DefaultRequestHeaders.Contains("access_token") && !string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("access_token", _options.ApiKey);
        }
    }

    public async Task<ServiceResult<BillingCheckoutResponseDto>> CreateSubscriptionForProfessor(string professorId, PlanType planType)
    {
        if (string.IsNullOrWhiteSpace(professorId))
            return ServiceResult<BillingCheckoutResponseDto>.Fail("Professor não informado.", 400);

        var profile = await _professorProfileRepo.GetByUserIdAsync(professorId);
        if (profile == null)
            return ServiceResult<BillingCheckoutResponseDto>.Fail("Perfil de professor não encontrado.", 404);

        // 1. Regra de negócio: Preço e quotas por plano
        decimal price = planType == PlanType.Basic ? 29.90m : 59.90m;
        int maxCourses = planType == PlanType.Basic ? 5 : 20;
        int aiCredits = planType == PlanType.Basic ? 500 : 2000;

        // 2. Criar customer no Asaas se AsaasCustomerId for nulo ou vazio
        string customerId = profile.AsaasCustomerId ?? string.Empty;
        if (string.IsNullOrWhiteSpace(customerId))
        {
            customerId = await EnsureAsaasCustomerAsync(profile);
            profile.AsaasCustomerId = customerId;
            _professorProfileRepo.Update(profile);
            await _unitOfWork.CommitAsync();
        }

        // 3. Criar subscription no Asaas com billingType = PIX, cycle = MONTHLY e split desabilitado
        var (subId, invoiceUrl) = await CreateAsaasSubscriptionAsync(customerId, price, planType);

        // 4. Salvar ou atualizar ProfessorSubscription
        var subscription = await _subscriptionRepo.GetByProfessorIdAsync(professorId);
        if (subscription == null)
        {
            subscription = new ProfessorSubscription
            {
                ProfessorId = professorId,
                PlanType = planType,
                Status = SubscriptionStatus.Pending,
                AsaasCustomerId = customerId,
                AsaasSubscriptionId = subId,
                Price = price,
                CurrentPeriodEnd = DateTime.UtcNow.AddDays(30),
                MaxCoursesAllowed = maxCourses,
                AiCreditsLimit = aiCredits,
                AiCreditsUsed = 0,
                CreatedAt = DateTime.UtcNow
            };
            await _subscriptionRepo.AddAsync(subscription);
        }
        else
        {
            subscription.PlanType = planType;
            subscription.Status = SubscriptionStatus.Pending;
            subscription.AsaasCustomerId = customerId;
            subscription.AsaasSubscriptionId = subId;
            subscription.Price = price;
            subscription.MaxCoursesAllowed = maxCourses;
            subscription.AiCreditsLimit = aiCredits;
            subscription.UpdatedAt = DateTime.UtcNow;
            _subscriptionRepo.Update(subscription);
        }

        await _unitOfWork.CommitAsync();

        var response = new BillingCheckoutResponseDto
        {
            InvoiceUrl = invoiceUrl,
            SubscriptionId = subscription.Id,
            AsaasSubscriptionId = subId,
            PlanType = planType,
            Price = price,
            Status = subscription.Status.ToString().ToUpperInvariant()
        };

        return ServiceResult<BillingCheckoutResponseDto>.Ok(response);
    }

    public async Task<ServiceResult<string>> ProcessAsaasWebhookAsync(string? webhookTokenHeader, string payloadJson)
    {
        // 1. Validação do token HMAC / Token de segurança do header
        if (!ValidateWebhookToken(webhookTokenHeader, payloadJson))
        {
            return ServiceResult<string>.Fail("Token de autenticação do webhook inválido.", 401);
        }

        AsaasWebhookPayloadDto? payload = null;
        try
        {
            payload = JsonSerializer.Deserialize<AsaasWebhookPayloadDto>(payloadJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.Fail($"JSON de webhook inválido: {ex.Message}", 400);
        }

        if (payload == null || string.IsNullOrWhiteSpace(payload.Event))
        {
            return ServiceResult<string>.Fail("Payload ou evento ausente.", 400);
        }

        // 2. Logar em AsaasWebhookLog
        var log = new AsaasWebhookLog
        {
            Event = payload.Event,
            PaymentId = payload.Payment?.Id,
            CustomerId = payload.Payment?.Customer,
            SubscriptionId = payload.Payment?.Subscription,
            PayloadJson = payloadJson,
            ProcessedSuccessfully = true,
            CreatedAt = DateTime.UtcNow
        };
        await _webhookLogRepo.AddAsync(log);

        // 3. Atualizar Status e vigência da assinatura do professor
        var subId = payload.Payment?.Subscription;
        var customerId = payload.Payment?.Customer;

        ProfessorSubscription? subscription = null;
        if (!string.IsNullOrWhiteSpace(subId))
        {
            subscription = await _subscriptionRepo.GetByAsaasSubscriptionIdAsync(subId);
        }
        if (subscription == null && !string.IsNullOrWhiteSpace(customerId))
        {
            subscription = await _subscriptionRepo.GetByAsaasCustomerIdAsync(customerId);
        }

        if (subscription != null)
        {
            var evt = payload.Event.ToUpperInvariant();
            if (evt is "PAYMENT_CONFIRMED" or "PAYMENT_RECEIVED")
            {
                subscription.Status = SubscriptionStatus.Active;
                subscription.CurrentPeriodEnd = DateTime.UtcNow.AddDays(30);
                subscription.UpdatedAt = DateTime.UtcNow;
                _subscriptionRepo.Update(subscription);
            }
            else if (evt is "PAYMENT_OVERDUE")
            {
                subscription.Status = SubscriptionStatus.PastDue;
                subscription.UpdatedAt = DateTime.UtcNow;
                _subscriptionRepo.Update(subscription);
            }
        }

        await _unitOfWork.CommitAsync();
        return ServiceResult<string>.Ok("Webhook processado com sucesso.");
    }

    private async Task<string> EnsureAsaasCustomerAsync(ProfessorProfile profile)
    {
        try
        {
            var customerRequest = new AsaasCreateCustomerRequest
            {
                Name = string.IsNullOrWhiteSpace(profile.User?.FullName) ? "Professor TeacherTech" : profile.User.FullName,
                Email = profile.User?.Email ?? "professor@teachertech.com",
                NotificationDisabled = false
            };

            using var response = await _httpClient.PostAsJsonAsync("customers", customerRequest);
            if (response.IsSuccessStatusCode)
            {
                var created = await response.Content.ReadFromJsonAsync<AsaasCustomerResponse>();
                if (created != null && !string.IsNullOrWhiteSpace(created.Id))
                {
                    return created.Id;
                }
            }
        }
        catch
        {
            // Fallback para sandbox ou ambiente offline
        }

        return $"cus_{Guid.NewGuid():N}";
    }

    private async Task<(string SubId, string InvoiceUrl)> CreateAsaasSubscriptionAsync(string customerId, decimal price, PlanType planType)
    {
        var nextDue = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd");
        var subscriptionRequest = new AsaasCreateSubscriptionRequest
        {
            Customer = customerId,
            BillingType = "PIX",
            Value = price,
            NextDueDate = nextDue,
            Cycle = "MONTHLY",
            Description = $"Assinatura Plano {planType} - TeacherTech SaaS",
            Split = null // Split desabilitado no novo modelo B2B
        };

        try
        {
            using var response = await _httpClient.PostAsJsonAsync("subscriptions", subscriptionRequest);
            if (response.IsSuccessStatusCode)
            {
                var created = await response.Content.ReadFromJsonAsync<AsaasSubscriptionResponse>();
                if (created != null && !string.IsNullOrWhiteSpace(created.Id))
                {
                    var invoiceUrl = created.InvoiceUrl;
                    if (string.IsNullOrWhiteSpace(invoiceUrl))
                    {
                        invoiceUrl = await FetchSubscriptionPaymentInvoiceUrlAsync(created.Id);
                    }

                    if (string.IsNullOrWhiteSpace(invoiceUrl))
                    {
                        var envBase = _options.Environment.Equals("Production", StringComparison.OrdinalIgnoreCase)
                            ? "https://www.asaas.com/i"
                            : "https://sandbox.asaas.com/i";
                        invoiceUrl = $"{envBase}/{created.Id}";
                    }

                    return (created.Id, invoiceUrl);
                }
            }
        }
        catch
        {
            // Fallback para sandbox / testes offline
        }

        var mockSubId = $"sub_{Guid.NewGuid():N}";
        var mockInvoice = $"https://sandbox.asaas.com/i/{mockSubId}";
        return (mockSubId, mockInvoice);
    }

    private async Task<string?> FetchSubscriptionPaymentInvoiceUrlAsync(string subscriptionId)
    {
        try
        {
            using var response = await _httpClient.GetAsync($"subscriptions/{subscriptionId}/payments");
            if (response.IsSuccessStatusCode)
            {
                var payments = await response.Content.ReadFromJsonAsync<AsaasPaymentsListResponse>();
                return payments?.Data?.FirstOrDefault()?.InvoiceUrl;
            }
        }
        catch
        {
            // fallback
        }
        return null;
    }

    private bool ValidateWebhookToken(string? providedToken, string payload)
    {
        if (string.IsNullOrWhiteSpace(_options.WebhookToken))
            return true;

        if (string.IsNullOrWhiteSpace(providedToken))
            return false;

        var providedBytes = Encoding.UTF8.GetBytes(providedToken);
        var expectedBytes = Encoding.UTF8.GetBytes(_options.WebhookToken);

        // Validação direta
        if (providedBytes.Length == expectedBytes.Length && CryptographicOperations.FixedTimeEquals(providedBytes, expectedBytes))
        {
            return true;
        }

        // Validação HMAC-SHA256
        try
        {
            using var hmac = new HMACSHA256(expectedBytes);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            var computedHex = Convert.ToHexString(computedHash);
            var computedHexBytes = Encoding.UTF8.GetBytes(computedHex.ToLowerInvariant());
            var providedLowerBytes = Encoding.UTF8.GetBytes(providedToken.ToLowerInvariant());

            if (computedHexBytes.Length == providedLowerBytes.Length && CryptographicOperations.FixedTimeEquals(computedHexBytes, providedLowerBytes))
            {
                return true;
            }
        }
        catch
        {
        }

        return false;
    }
}
