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

public static class TransactionStatus
{
    public const string Pending = "PENDING";
    public const string Paid = "PAID";
    public const string Refunded = "REFUNDED";
    public const string Failed = "FAILED";
}

public static class FlashcardDifficulty
{
    public const string Easy = "EASY";
    public const string Medium = "MEDIUM";
    public const string Hard = "HARD";
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
    public ICollection<CourseStudyPlan> AuthoredCourses { get; set; } = new List<CourseStudyPlan>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<AccessRequest> AccessRequests { get; set; } = new List<AccessRequest>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
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
    
    public int AiCreditsLimit { get; set; } = 200;
    public int AiCreditsUsed { get; set; } = 0;
    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
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

    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<StudySchedule> StudySchedules { get; set; } = new List<StudySchedule>();
    public ICollection<SimulatedTest> SimulatedTests { get; set; } = new List<SimulatedTest>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<AccessRequest> AccessRequests { get; set; } = new List<AccessRequest>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

public class Subject
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan Course { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

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

    public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
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

    public string GrantedBy { get; set; } = string.Empty;
    public string GrantedVia { get; set; } = "EMAIL_INVITE";
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

public class Transaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string UserId { get; set; } = string.Empty;
    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = null!;

    public Guid? CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public CourseStudyPlan? Course { get; set; }

    public Guid? EnrollmentId { get; set; }
    [ForeignKey(nameof(EnrollmentId))]
    public Enrollment? Enrollment { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PlatformFee { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ProfessorRevenue { get; set; }

    public string PaymentGateway { get; set; } = "ASAAS";
    public string GatewayTransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = TransactionStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
