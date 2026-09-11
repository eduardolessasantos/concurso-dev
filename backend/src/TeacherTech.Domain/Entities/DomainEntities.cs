using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace TeacherTech.Domain.Entities;

// --- DOMAIN CONSTANTS & STATUS VALUE OBJECTS ---
public static class UserRoles
{
    public const string Admin = "ADMIN";
    public const string Professor = "PROFESSOR";
    public const string Student = "STUDENT";
}

public static class CourseStatus
{
    public const string Draft = "DRAFT";
    public const string Published = "PUBLISHED";
    public const string Archived = "ARCHIVED";
}

public static class EnrollmentStatus
{
    public const string Active = "ACTIVE";
    public const string Suspended = "SUSPENDED";
    public const string Expired = "EXPIRED";
}

public static class AccessRequestStatus
{
    public const string Pending = "PENDING";
    public const string Approved = "APPROVED";
    public const string Rejected = "REJECTED";
}

public static class FlashcardDifficulty
{
    public const string Easy = "EASY";
    public const string Medium = "MEDIUM";
    public const string Hard = "HARD";
}

// --- DOMAIN ENUMS (SaaS B2B & Invites) ---
public enum PlanType
{
    Free = 0,
    Basic = 1,
    Pro = 2,
    Premium = 3,
    Enterprise = 4
}

public enum SubscriptionStatus
{
    Active = 1,
    Pending = 2,
    PastDue = 3,
    Overdue = 3,
    Canceled = 4,
    Expired = 5
}

public enum InviteChannel
{
    Link = 1,
    WhatsApp = 2,
    QrCode = 3,
    Email = 4
}

// --- DOMAIN ENTITIES ---
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string UserRole { get; set; } = UserRoles.Student;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ProfessorProfile? ProfessorProfile { get; set; }
    public StudentProfile? StudentProfile { get; set; }
    public ProfessorSubscription? ProfessorSubscription { get; set; }

    public ICollection<CourseStudyPlan> AuthoredCourses { get; set; } = new List<CourseStudyPlan>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<AccessRequest> AccessRequests { get; set; } = new List<AccessRequest>();
    public ICollection<InviteToken> CreatedInviteTokens { get; set; } = new List<InviteToken>();
    public ICollection<StudentProgress> StudentProgressRecords { get; set; } = new List<StudentProgress>();
}

public class ProfessorProfile
{
    [Key, ForeignKey(nameof(User))]
    public string UserId { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? PixKey { get; set; }
    public string CustomSlug { get; set; } = string.Empty;
    public bool PublicVisibility { get; set; } = true;
    
    public string? AsaasCustomerId { get; set; }

    public int AiCreditsLimit { get; set; } = 200;
    public int AiCreditsUsed { get; set; } = 0;
    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public ProfessorSubscription? Subscription { get; set; }
}

public class StudentProfile
{
    [Key, ForeignKey(nameof(User))]
    public string UserId { get; set; } = string.Empty;
    public string GoalExam { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
}

public class ProfessorSubscription
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string ProfessorId { get; set; } = string.Empty;
    [ForeignKey(nameof(ProfessorId))]
    public ApplicationUser Professor { get; set; } = null!;

    public PlanType PlanType { get; set; } = PlanType.Pro;
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    [MaxLength(100)]
    public string AsaasCustomerId { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string AsaasSubscriptionId { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; } = 0.00m;

    public DateTime CurrentPeriodEnd { get; set; } = DateTime.UtcNow.AddMonths(1);
    public int MaxCoursesAllowed { get; set; } = 10;
    public int AiCreditsLimit { get; set; } = 500;
    public int AiCreditsUsed { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class CourseStudyPlan
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string ProfessorId { get; set; } = string.Empty;
    [ForeignKey(nameof(ProfessorId))]
    public ApplicationUser Professor { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Geral";
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; } = 0.00m;
    
    public bool IsPublic { get; set; } = true;
    public string Status { get; set; } = CourseStatus.Published;
    public string? CoverImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<StudySchedule> StudySchedules { get; set; } = new List<StudySchedule>();
    public ICollection<SimulatedTest> SimulatedTests { get; set; } = new List<SimulatedTest>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<AccessRequest> AccessRequests { get; set; } = new List<AccessRequest>();
    public ICollection<InviteToken> InviteTokens { get; set; } = new List<InviteToken>();
}

public class CourseModule
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int OrderIndex { get; set; } = 0;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}

public class Subject
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    public Guid? ModuleId { get; set; }
    [ForeignKey(nameof(ModuleId))]
    public CourseModule? Module { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string Meta { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 0;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Topic> Topics { get; set; } = new List<Topic>();
}

public class Topic
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid SubjectId { get; set; }
    [ForeignKey(nameof(SubjectId))]
    public Subject Subject { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public string ContentMarkdown { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "Geral";
    public int OrderIndex { get; set; } = 0;
    public DateTime? UpdatedAt { get; set; }

    public TopicContent? TopicContent { get; set; }
    public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<StudentProgress> StudentProgressRecords { get; set; } = new List<StudentProgress>();
}

public class TopicContent
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TopicId { get; set; }
    [ForeignKey(nameof(TopicId))]
    public Topic Topic { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string Peso { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;

    public string ExamplesJson { get; set; } = "[]";
    public string KeyPointsJson { get; set; } = "[]";
    public string TipsJson { get; set; } = "[]";
    public string UsefulLinksJson { get; set; } = "[]";
    public DateTime? UpdatedAt { get; set; }
}

public class Flashcard
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TopicId { get; set; }
    [ForeignKey(nameof(TopicId))]
    public Topic Topic { get; set; } = null!;

    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
    public string Difficulty { get; set; } = FlashcardDifficulty.Medium;
    public DateTime? UpdatedAt { get; set; }
}

public class Question
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TopicId { get; set; }
    [ForeignKey(nameof(TopicId))]
    public Topic Topic { get; set; } = null!;

    public string Statement { get; set; } = string.Empty;
    public string OptionsJson { get; set; } = "[]";
    public int CorrectOptionIndex { get; set; } = 0;
    public string Explanation { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "FGV";
    public DateTime? UpdatedAt { get; set; }

    public ICollection<StudentProgress> StudentProgressRecords { get; set; } = new List<StudentProgress>();
}

public class StudySchedule
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    public int WeekNumber { get; set; } = 1;
    public string DayOfWeek { get; set; } = "Segunda-feira";
    public string SubjectName { get; set; } = string.Empty;
    public string TopicTitle { get; set; } = string.Empty;
    public int GoalMinutes { get; set; } = 60;
    public string Notes { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
}

public class SimulatedTest
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; } = 60;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<SimulatedQuestion> Questions { get; set; } = new List<SimulatedQuestion>();
}

public class SimulatedQuestion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid SimulatedTestId { get; set; }
    [ForeignKey(nameof(SimulatedTestId))]
    public SimulatedTest SimulatedTest { get; set; } = null!;

    public string Statement { get; set; } = string.Empty;
    public string OptionsJson { get; set; } = "[]";
    public int CorrectOptionIndex { get; set; } = 0;
    public string Explanation { get; set; } = string.Empty;
    public string ExamBoard { get; set; } = "FGV";
    public DateTime? UpdatedAt { get; set; }
}

public class InviteToken
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string CreatedByProfessorId { get; set; } = string.Empty;
    [ForeignKey(nameof(CreatedByProfessorId))]
    public ApplicationUser CreatedByProfessor { get; set; } = null!;

    public DateTime? ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; } = 0;
    public InviteChannel Channel { get; set; } = InviteChannel.Link;
    public string? TargetPhone { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<WhatsAppLog> WhatsAppLogs { get; set; } = new List<WhatsAppLog>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

public class WhatsAppLog
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid InviteTokenId { get; set; }
    [ForeignKey(nameof(InviteTokenId))]
    public InviteToken InviteToken { get; set; } = null!;

    [Required, MaxLength(150)]
    public string WabaMessageId { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string ToPhone { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Status { get; set; } = "SENT";

    public string? ErrorJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Enrollment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string StudentId { get; set; } = string.Empty;
    [ForeignKey(nameof(StudentId))]
    public ApplicationUser Student { get; set; } = null!;

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    public Guid? InviteTokenId { get; set; }
    [ForeignKey(nameof(InviteTokenId))]
    public InviteToken? InviteToken { get; set; }

    public string GrantedBy { get; set; } = string.Empty;
    public string GrantedVia { get; set; } = "INVITE_LINK";
    public string Status { get; set; } = EnrollmentStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class AccessRequest
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string StudentId { get; set; } = string.Empty;
    [ForeignKey(nameof(StudentId))]
    public ApplicationUser Student { get; set; } = null!;

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = AccessRequestStatus.Pending;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class StudentProgress
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string StudentId { get; set; } = string.Empty;
    [ForeignKey(nameof(StudentId))]
    public ApplicationUser Student { get; set; } = null!;

    [Required]
    public Guid TopicId { get; set; }
    [ForeignKey(nameof(TopicId))]
    public Topic Topic { get; set; } = null!;

    public Guid? QuestionId { get; set; }
    [ForeignKey(nameof(QuestionId))]
    public Question? Question { get; set; }

    public bool IsCorrect { get; set; }
    public int TimeSpentSeconds { get; set; }
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
}

public class AsaasWebhookLog
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Event { get; set; } = string.Empty;

    public string? PaymentId { get; set; }
    public string? CustomerId { get; set; }
    public string? SubscriptionId { get; set; }

    public string PayloadJson { get; set; } = string.Empty;
    public bool ProcessedSuccessfully { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
