using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Application.DTOs;

public class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public string PhoneNumberId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string WabaId { get; set; } = string.Empty;
    public string Environment { get; set; } = "Sandbox";
}

public class CreateInviteDto
{
    [Required]
    public Guid CourseId { get; set; }

    public InviteChannel Channel { get; set; } = InviteChannel.Link;

    public string? TargetPhone { get; set; }
}

public class InviteGeneratedResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string InviteUrl { get; set; } = string.Empty;
    public string QrCodeBase64 { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public int MaxUses { get; set; }
    public int UsedCount { get; set; }
    public InviteChannel Channel { get; set; }
    public string? TargetPhone { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
}

public class ValidateInviteResponseDto
{
    public bool Valid { get; set; }
    public string Token { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseDescription { get; set; } = string.Empty;
    public string ProfessorName { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public int MaxUses { get; set; }
    public int UsedCount { get; set; }
    public int RemainingUses => Math.Max(0, MaxUses - UsedCount);
    public InviteChannel Channel { get; set; }
    public string? Message { get; set; }
}

public class RedeemInviteResponseDto
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = "ACTIVE";
    public string GrantedVia { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
}

public class WhatsAppSendResult
{
    public bool Success { get; set; }
    public string WabaMessageId { get; set; } = string.Empty;
    public string Status { get; set; } = "SENT";
    public string? ErrorMessage { get; set; }

    public static WhatsAppSendResult Ok(string wabaMessageId, string status = "SENT") =>
        new() { Success = true, WabaMessageId = wabaMessageId, Status = status };

    public static WhatsAppSendResult Fail(string error, string? wabaMessageId = null) =>
        new() { Success = false, WabaMessageId = wabaMessageId ?? string.Empty, Status = "FAILED", ErrorMessage = error };
}

public class MetaWhatsAppMessageResponse
{
    [JsonPropertyName("messaging_product")]
    public string MessagingProduct { get; set; } = string.Empty;

    [JsonPropertyName("messages")]
    public List<MetaWhatsAppMessageItem>? Messages { get; set; }

    [JsonPropertyName("contacts")]
    public List<MetaWhatsAppContactItem>? Contacts { get; set; }
}

public class MetaWhatsAppMessageItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
}

public class MetaWhatsAppContactItem
{
    [JsonPropertyName("input")]
    public string Input { get; set; } = string.Empty;

    [JsonPropertyName("wa_id")]
    public string WaId { get; set; } = string.Empty;
}
