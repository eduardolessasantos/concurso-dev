using System.ComponentModel.DataAnnotations;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Application.DTOs;

// --- AUTH DTOS ---
public class RegisterDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    public string UserRole { get; set; } = "STUDENT";
    public string GoalExam { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class GoogleLoginDto
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
    public string? PreferredRole { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Role => UserRole;
    public string? AvatarUrl { get; set; }
    public AuthUserDto User => new()
    {
        Id = UserId,
        Email = Email,
        FullName = FullName,
        Role = UserRole,
        UserRole = UserRole,
        AvatarUrl = AvatarUrl
    };
}

public class AuthUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

// --- COURSE DTOS ---
public class CreateCourseDto
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Geral";
    public decimal Price { get; set; } = 0.00m;
    public bool IsPublic { get; set; } = true;
    public string? CoverImageUrl { get; set; }
}

public class CourseResponseDto
{
    public Guid Id { get; set; }
    public string ProfessorId { get; set; } = string.Empty;
    public string ProfessorName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsPublic { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int SubjectsCount { get; set; }
    public int EnrollmentsCount { get; set; }
}

public class CreateSubjectDto
{
    [Required]
    public Guid CourseId { get; set; }
    public Guid? SessionId { get; set; }
    public Guid? ModuleId { get => SessionId; set => SessionId = value; }
    public string SessionName { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public string Meta { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateModuleDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}

public class UpdateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Geral";
    public decimal Price { get; set; }
    public bool IsPublic { get; set; } = true;
}

public class CourseModuleDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public class StudySessionDto : CourseModuleDto {}

public class TopicExampleDto
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string Application { get; set; } = string.Empty;
}

public class UsefulLinkDto
{
    public string Label { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = "estudo";
    public string? YoutubeId { get; set; }
}

public class TopicContentDto
{
    public Guid? Id { get; set; }
    public Guid? TopicId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string Peso { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public List<TopicExampleDto> Examples { get; set; } = new List<TopicExampleDto>();
    public List<string> KeyPoints { get; set; } = new List<string>();
    public List<string> Tips { get; set; } = new List<string>();
    public List<UsefulLinkDto> UsefulLinks { get; set; } = new List<UsefulLinkDto>();
}

public class TopicDetailDto : TopicContentDto {}

public class CreateTopicDto
{
    [Required]
    public Guid SubjectId { get; set; }
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "Geral";
    public TopicContentDto? TopicContent { get; set; }
    public TopicDetailDto? TopicDetail { get => TopicContent as TopicDetailDto; set => TopicContent = value; }
}

public class UpdateTopicDto
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "Geral";
    public string ContentMarkdown { get; set; } = string.Empty;
    public TopicContentDto? TopicContent { get; set; }
    public TopicDetailDto? TopicDetail { get => TopicContent as TopicDetailDto; set => TopicContent = value; }
    public List<StudioFlashcardDto>? Flashcards { get; set; }
    public List<StudioQuestionDto>? Questions { get; set; }
}

public class GenerateAiContentDto
{
    public Guid? TopicId { get; set; }
    public string TopicTitle { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "FGV";
    public string PromptCustom { get; set; } = string.Empty;
}

// --- ENROLLMENT DTOS ---
public class InviteStudentByEmailDto
{
    [Required]
    public Guid CourseId { get; set; }
    [Required, EmailAddress]
    public string StudentEmail { get; set; } = string.Empty;
    public string? WelcomeMessage { get; set; }
}

public class EnrollmentResponseDto
{
    public Guid Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string GrantedVia { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateAccessRequestDto
{
    [Required]
    public Guid CourseId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Message { get; set; }
}

public class AccessRequestResponseDto
{
    public Guid Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}

// --- PAYMENT DTOS ---
public class CreateCheckoutDto
{
    [Required]
    public Guid CourseId { get; set; }
    public string PaymentMethod { get; set; } = "PIX";
}

public class CheckoutResponseDto
{
    public Guid TransactionId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal ProfessorRevenue { get; set; }
    public string PaymentMethod { get; set; } = "PIX";
    public string? PixQrCodeCode { get; set; }
    public string? PixQrCodeImageUrl { get; set; }
    public string Status { get; set; } = "PENDING";
    public DateTime ExpiresAt { get; set; }
}

public class ProfessorBalanceDto
{
    public decimal TotalRevenue { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal PendingBalance { get; set; }
    public int SalesCount { get; set; }
    public string? PixKey { get; set; }
    public List<TransactionHistoryDto> Transactions { get; set; } = new List<TransactionHistoryDto>();
}

public class TransactionHistoryDto
{
    public Guid Id { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal ProfessorRevenue { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class PaymentWebhookDto
{
    public string Event { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

// --- PUBLIC SHOWCASE DTOS ---
public class PublicProfessorProfileDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string CustomSlug { get; set; } = string.Empty;
    public string? BannerImageUrl { get; set; }
    public string? ThemeColor { get; set; }
    public string? WhatsAppNumber { get; set; }
    public string? VideoIntroUrl { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? SocialLinksJson { get; set; }
    public int PublicCoursesCount { get; set; }
    public List<CourseResponseDto> Courses { get; set; } = new List<CourseResponseDto>();
    public List<PublicOfferingDto> Offerings { get; set; } = new List<PublicOfferingDto>();
}

public class PublicOfferingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string PriceFormatted { get; set; } = "Sob Consulta";
    public OfferingType OfferingType { get; set; }
    public string OfferingTypeName { get; set; } = string.Empty;
    public OfferingFormat Format { get; set; }
    public string FormatName { get; set; } = string.Empty;
    public string? LocationCity { get; set; }
    public string? LocationState { get; set; }
    public CtaType CtaType { get; set; }
    public string CtaTypeName { get; set; } = string.Empty;
    public string? CtaUrl { get; set; }
    public string? CtaWhatsappMessage { get; set; }
    public string? CoverImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public Guid? CourseStudyPlanId { get; set; }
}

public class PublicCourseExploreDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? CoverImageUrl { get; set; }
    public string ProfessorId { get; set; } = string.Empty;
    public string ProfessorName { get; set; } = string.Empty;
    public string ProfessorSlug { get; set; } = string.Empty;
    public string? ProfessorAvatar { get; set; }
    public int SubjectsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasPreviousPage => PageIndex > 0;
    public bool HasNextPage => PageIndex + 1 < TotalPages;
}

public class ExploreFiltersDto
{
    public List<string> AvailableSubjects { get; set; } = new List<string>();
    public List<string> AvailableCities { get; set; } = new List<string>();
    public List<string> AvailableFormats { get; set; } = new List<string>();
}

public class ExploreItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string PriceFormatted { get; set; } = "Sob Consulta";
    public string ItemType { get; set; } = "OFFERING"; // OFFERING ou COURSE
    public string OfferingType { get; set; } = "Curso";
    public string Format { get; set; } = "Online";
    public string? City { get; set; }
    public string? State { get; set; }
    public string? CoverImageUrl { get; set; }
    public string ProfessorId { get; set; } = string.Empty;
    public string ProfessorName { get; set; } = string.Empty;
    public string ProfessorSlug { get; set; } = string.Empty;
    public string? ProfessorAvatar { get; set; }
    public string? ProfessorHeadline { get; set; }
    public string CtaType { get; set; } = "WhatsApp";
    public string? CtaUrl { get; set; }
    public string? CtaWhatsappMessage { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ExploreQueryParams
{
    public string? Search { get; set; }
    public string? Subject { get; set; }
    public string? Category { get; set; }
    public string? Format { get; set; }
    public string? City { get; set; }
    public decimal? PriceMin { get; set; }
    public decimal? PriceMax { get; set; }
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 12;
}

// --- SHOWCASE LEAD & CTA METRICS DTOS ---
public class CreateShowcaseLeadDto
{
    [Required]
    public string ProfessorId { get; set; } = string.Empty;
    public Guid? ContentOfferingId { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public bool TermsAccepted { get; set; }
}

public class ShowcaseLeadResponseDto
{
    public Guid Id { get; set; }
    public string ProfessorId { get; set; } = string.Empty;
    public Guid? ContentOfferingId { get; set; }
    public string? OfferingTitle { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "New";
    public DateTime CreatedAt { get; set; }
}

public class TrackClickDto
{
    [Required]
    public string ProfessorId { get; set; } = string.Empty;
    public Guid? ContentOfferingId { get; set; }
    [Required]
    public string CtaType { get; set; } = "WhatsApp"; // "WhatsApp", "Scheduling", "ExternalCheckout", "PlatformCourse", "PageView"
}

public class ShowcaseMetricSummaryDto
{
    public string ProfessorId { get; set; } = string.Empty;
    public int TotalPageViews { get; set; }
    public int TotalWhatsAppClicks { get; set; }
    public int TotalCtaClicks { get; set; }
    public int TotalLeads { get; set; }
    public List<ShowcaseMetricDailyDto> DailyMetrics { get; set; } = new List<ShowcaseMetricDailyDto>();
}

public class ShowcaseMetricDailyDto
{
    public DateTime Date { get; set; }
    public int PageViews { get; set; }
    public int WhatsAppClicks { get; set; }
    public int CtaClicks { get; set; }
    public int LeadsCount { get; set; }
}

// --- PROFESSOR SHOWCASE MANAGEMENT & OFFERINGS CRUD DTOS ---
public class UpdateProfessorShowcaseDto
{
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    [Required, RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "O slug deve conter apenas letras minúsculas, números e hífens.")]
    public string CustomSlug { get; set; } = string.Empty;
    public string? BannerImageUrl { get; set; }
    public string? ThemeColor { get; set; }
    public string? WhatsAppNumber { get; set; }
    public string? VideoIntroUrl { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? SocialLinksJson { get; set; }
    public bool PublicVisibility { get; set; } = true;
}

public class SaveOfferingDto
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Subject { get; set; } = string.Empty;

    public decimal? Price { get; set; }

    public OfferingType OfferingType { get; set; } = OfferingType.Course;
    public OfferingFormat Format { get; set; } = OfferingFormat.Online;

    public string? LocationCity { get; set; }
    public string? LocationState { get; set; }

    public CtaType CtaType { get; set; } = CtaType.WhatsApp;
    public string? CtaUrl { get; set; }
    public string? CtaWhatsappMessage { get; set; }
    public string? CoverImageUrl { get; set; }

    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;

    public Guid? CourseStudyPlanId { get; set; }
}

public class UpdateLeadStatusDto
{
    public LeadStatus Status { get; set; } = LeadStatus.Contacted;
}

public class ReorderOfferingsDto
{
    public List<Guid> OrderedIds { get; set; } = new List<Guid>();
}

// --- PROFESSOR STUDIO DTOS ---
public class SaveStudioContentDto
{
    public Guid? CourseId { get; set; }
    [Required]
    public string CourseTitle { get; set; } = string.Empty;

    public Guid? SessionId { get; set; }
    public string SessionName { get; set; } = string.Empty;

    public Guid? SubjectId { get; set; }
    [Required]
    public string SubjectName { get; set; } = string.Empty;
    public string SubjectMeta { get; set; } = string.Empty;
    public string SubjectDescription { get; set; } = string.Empty;

    public Guid? TopicId { get; set; }
    [Required]
    public string TopicTitle { get; set; } = string.Empty;

    public string ExamBoard { get; set; } = "Geral";
    public bool IsPublic { get; set; } = true;
    public string ContentMarkdown { get; set; } = string.Empty;

    public TopicDetailDto? TopicDetail { get; set; }
    public List<StudioFlashcardDto> Flashcards { get; set; } = new List<StudioFlashcardDto>();
    public List<StudioQuestionDto> Questions { get; set; } = new List<StudioQuestionDto>();
    public StudioScheduleDto? Schedule { get; set; }
    public StudioSimulatedDto? Simulated { get; set; }
}

public class StudioFlashcardDto
{
    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = "MEDIUM";
}

public class StudioQuestionDto
{
    public string Statement { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new List<string>();
    public string OptionsJson { get; set; } = "[]";
    public int CorrectOptionIndex { get; set; } = 0;
    public string Explanation { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "Geral";
}

public class StudioScheduleDto
{
    public string DayOfWeek { get; set; } = "Segunda-feira";
    public int GoalMinutes { get; set; } = 60;
    public string Notes { get; set; } = string.Empty;
}

public class StudioSimulatedDto
{
    public string Title { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; } = 60;
}

public class SaveStudioResponseDto
{
    public Guid CourseId { get; set; }
    public Guid? SessionId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid TopicId { get; set; }
    public Guid? SimulatedTestId { get; set; }
    public int FlashcardsSavedCount { get; set; }
    public int QuestionsSavedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

