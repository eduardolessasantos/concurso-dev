using System.ComponentModel.DataAnnotations;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Application.DTOs;

public class RecordAnswerRequestDto
{
    [Required]
    public Guid TopicId { get; set; }

    public Guid? QuestionId { get; set; }

    public bool IsCorrect { get; set; }

    public int TimeSpentSeconds { get; set; } = 0;
}

public class StudentAnswerDto
{
    public Guid Id { get; set; }
    public Guid TopicId { get; set; }
    public Guid? QuestionId { get; set; }
    public bool IsCorrect { get; set; }
    public int TimeSpentSeconds { get; set; }
    public DateTime AnsweredAt { get; set; }
}

public class CourseProgressDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int TotalQuestionsAnswered { get; set; }
    public int TotalCorrectAnswers { get; set; }
    public double AccuracyPercentage { get; set; }
    public List<StudentAnswerDto> Answers { get; set; } = new List<StudentAnswerDto>();
}

public class ProfessorDashboardDto
{
    public int TotalActiveStudents { get; set; }
    public int PublishedCoursesCount { get; set; }
    public double AverageCompletionRate { get; set; }
    public int PendingInvitesCount { get; set; }
    public ProfessorSubscriptionSummaryDto? Subscription { get; set; }
    public List<ProfessorInviteItemDto> Invites { get; set; } = new List<ProfessorInviteItemDto>();
}

public class ProfessorSubscriptionSummaryDto
{
    public PlanType PlanType { get; set; }
    public SubscriptionStatus Status { get; set; }
    public decimal Price { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public int MaxCoursesAllowed { get; set; }
    public int AiCreditsLimit { get; set; }
    public int AiCreditsUsed { get; set; }
    public int AiCreditsRemaining => Math.Max(0, AiCreditsLimit - AiCreditsUsed);
}

public class ProfessorInviteItemDto
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string? TargetPhone { get; set; }
    public int UsedCount { get; set; }
    public int MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Status { get; set; } = "Ativo";
    public DateTime CreatedAt { get; set; }
}
