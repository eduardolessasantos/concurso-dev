using System.ComponentModel.DataAnnotations;

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

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
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
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateTopicDto
{
    [Required]
    public Guid SubjectId { get; set; }
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "Geral";
}

public class GenerateAiContentDto
{
    public Guid? TopicId { get; set; }
    public string TopicTitle { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "FGV";
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
    public int PublicCoursesCount { get; set; }
    public List<CourseResponseDto> Courses { get; set; } = new List<CourseResponseDto>();
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

// --- PROFESSOR STUDIO DTOS ---
public class SaveStudioContentDto
{
    public Guid? CourseId { get; set; }
    [Required]
    public string CourseTitle { get; set; } = string.Empty;

    public Guid? SubjectId { get; set; }
    [Required]
    public string SubjectName { get; set; } = string.Empty;

    public Guid? TopicId { get; set; }
    [Required]
    public string TopicTitle { get; set; } = string.Empty;

    public string ExamBoard { get; set; } = "Geral";
    public bool IsPublic { get; set; } = true;
    public string ContentMarkdown { get; set; } = string.Empty;

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
    public Guid SubjectId { get; set; }
    public Guid TopicId { get; set; }
    public Guid? SimulatedTestId { get; set; }
    public int FlashcardsSavedCount { get; set; }
    public int QuestionsSavedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

