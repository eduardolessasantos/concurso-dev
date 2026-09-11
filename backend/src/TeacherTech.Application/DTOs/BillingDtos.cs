using System.Text.Json.Serialization;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Application.DTOs;

public class AsaasOptions
{
    public const string SectionName = "Asaas";
    public string ApiKey { get; set; } = string.Empty;
    public string WebhookToken { get; set; } = string.Empty;
    public string Environment { get; set; } = "Sandbox";

    public string BaseUrl => Environment.Equals("Production", StringComparison.OrdinalIgnoreCase)
        ? "https://api.asaas.com/v3"
        : "https://sandbox.asaas.com/v3";
}

// --- DTOs PARA ASAAS API v3 ---
public class AsaasCreateCustomerRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("cpfCnpj")]
    public string? CpfCnpj { get; set; }

    [JsonPropertyName("mobilePhone")]
    public string? MobilePhone { get; set; }

    [JsonPropertyName("notificationDisabled")]
    public bool NotificationDisabled { get; set; } = false;
}

public class AsaasCustomerResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
}

public class AsaasCreateSubscriptionRequest
{
    [JsonPropertyName("customer")]
    public string Customer { get; set; } = string.Empty;

    [JsonPropertyName("billingType")]
    public string BillingType { get; set; } = "PIX";

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("nextDueDate")]
    public string NextDueDate { get; set; } = string.Empty;

    [JsonPropertyName("cycle")]
    public string Cycle { get; set; } = "MONTHLY";

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Split desabilitado no novo modelo B2B SaaS
    /// </summary>
    [JsonPropertyName("split")]
    public object? Split { get; set; } = null;
}

public class AsaasSubscriptionResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("customer")]
    public string Customer { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("cycle")]
    public string Cycle { get; set; } = string.Empty;

    [JsonPropertyName("nextDueDate")]
    public string? NextDueDate { get; set; }

    [JsonPropertyName("invoiceUrl")]
    public string? InvoiceUrl { get; set; }
}

public class AsaasPaymentItemResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("customer")]
    public string Customer { get; set; } = string.Empty;

    [JsonPropertyName("subscription")]
    public string? Subscription { get; set; }

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("invoiceUrl")]
    public string? InvoiceUrl { get; set; }

    [JsonPropertyName("bankSlipUrl")]
    public string? BankSlipUrl { get; set; }

    [JsonPropertyName("dueDate")]
    public string? DueDate { get; set; }
}

public class AsaasPaymentsListResponse
{
    [JsonPropertyName("data")]
    public List<AsaasPaymentItemResponse> Data { get; set; } = new List<AsaasPaymentItemResponse>();
}

public class AsaasWebhookPayloadDto
{
    [JsonPropertyName("event")]
    public string Event { get; set; } = string.Empty;

    [JsonPropertyName("payment")]
    public AsaasWebhookPaymentDto? Payment { get; set; }
}

public class AsaasWebhookPaymentDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("customer")]
    public string Customer { get; set; } = string.Empty;

    [JsonPropertyName("subscription")]
    public string? Subscription { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("billingType")]
    public string? BillingType { get; set; }

    [JsonPropertyName("invoiceUrl")]
    public string? InvoiceUrl { get; set; }
}

// --- DTOs DE BILLING (TeacherTech API) ---
public class BillingCheckoutRequestDto
{
    public PlanType PlanType { get; set; } = PlanType.Pro;
}

public class BillingCheckoutResponseDto
{
    public string InvoiceUrl { get; set; } = string.Empty;
    public Guid SubscriptionId { get; set; }
    public string AsaasSubscriptionId { get; set; } = string.Empty;
    public PlanType PlanType { get; set; }
    public decimal Price { get; set; }
    public string Status { get; set; } = string.Empty;
}
