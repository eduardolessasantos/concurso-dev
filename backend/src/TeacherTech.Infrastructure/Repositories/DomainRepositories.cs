using Microsoft.EntityFrameworkCore;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;
using TeacherTech.Infrastructure.Data;

namespace TeacherTech.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _dbContext;

    public UnitOfWork(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

public class CourseRepository : Repository<CourseStudyPlan, Guid>, ICourseRepository
{
    public CourseRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<CourseStudyPlan?> GetWithHierarchyAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .Include(c => c.Professor)
            .Include(c => c.Modules.OrderBy(m => m.OrderIndex))
            .Include(c => c.Subjects.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Topics.OrderBy(t => t.OrderIndex))
                    .ThenInclude(t => t.Flashcards)
            .Include(c => c.Subjects)
                .ThenInclude(s => s.Topics)
                    .ThenInclude(t => t.Questions)
            .Include(c => c.Subjects)
                .ThenInclude(s => s.Topics)
                    .ThenInclude(t => t.TopicContent)
            .Include(c => c.StudySchedules.OrderBy(ss => ss.WeekNumber))
            .Include(c => c.SimulatedTests)
                .ThenInclude(st => st.Questions)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<CourseStudyPlan>> GetByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .Include(c => c.Subjects)
            .Include(c => c.Enrollments)
            .Where(c => c.ProfessorId == professorId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CourseStudyPlan>> GetPublicPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .Include(c => c.Professor)
            .Where(c => c.IsPublic && c.Status == "PUBLISHED")
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CourseStudyPlan>> SearchPublicCoursesAsync(string? search, string? category, CancellationToken cancellationToken = default)
    {
        var query = DbContext.CourseStudyPlans
            .Include(c => c.Professor)
            .Include(c => c.Subjects)
            .Where(c => c.IsPublic && c.Status == "PUBLISHED");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => 
                c.Title.ToLower().Contains(s) || 
                c.Description.ToLower().Contains(s) ||
                (c.Professor != null && c.Professor.FullName.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "Todos")
        {
            query = query.Where(c => c.Category == category);
        }

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<CourseStudyPlan?> GetPublicCourseDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .Include(c => c.Professor)
            .Include(c => c.Subjects.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Topics.OrderBy(t => t.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == id && c.IsPublic && c.Status == "PUBLISHED", cancellationToken);
    }

    public async Task<CourseStudyPlan?> FindByProfessorAndTitleAsync(string professorId, string title, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .FirstOrDefaultAsync(c => c.ProfessorId == professorId && c.Title == title, cancellationToken);
    }

    public async Task AddStudyScheduleAsync(StudySchedule schedule, CancellationToken cancellationToken = default)
    {
        await DbContext.StudySchedules.AddAsync(schedule, cancellationToken);
    }

    public async Task AddSimulatedTestAsync(SimulatedTest simulatedTest, CancellationToken cancellationToken = default)
    {
        await DbContext.SimulatedTests.AddAsync(simulatedTest, cancellationToken);
    }

    public async Task AddSimulatedQuestionAsync(SimulatedQuestion question, CancellationToken cancellationToken = default)
    {
        await DbContext.SimulatedQuestions.AddAsync(question, cancellationToken);
    }
}

public class ProfessorProfileRepository : Repository<ProfessorProfile, string>, IProfessorProfileRepository
{
    public ProfessorProfileRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<ProfessorProfile?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.ProfessorProfiles
            .Include(p => p.Subscription)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task<ProfessorProfile?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbContext.ProfessorProfiles
            .Include(p => p.User)
            .Include(p => p.Subscription)
            .FirstOrDefaultAsync(p => p.CustomSlug.ToLower() == slug.ToLower() && p.PublicVisibility, cancellationToken);
    }
}

public class StudentProfileRepository : Repository<StudentProfile, string>, IStudentProfileRepository
{
    public StudentProfileRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<StudentProfile?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
    }
}

public class SubjectRepository : Repository<Subject, Guid>, ISubjectRepository
{
    public SubjectRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<List<Subject>> GetByCourseIdWithTopicsAsync(Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Subjects
            .Include(s => s.Topics.OrderBy(t => t.OrderIndex))
            .Where(s => s.CourseId == courseId)
            .OrderBy(s => s.OrderIndex)
            .ToListAsync(cancellationToken);
    }

    public async Task<Subject?> FindByCourseAndNameAsync(Guid courseId, string name, CancellationToken cancellationToken = default)
    {
        return await DbContext.Subjects
            .FirstOrDefaultAsync(s => s.CourseId == courseId && s.Name == name, cancellationToken);
    }

    public async Task<int> CountByCourseIdAsync(Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Subjects.CountAsync(s => s.CourseId == courseId, cancellationToken);
    }
}

public class CourseModuleRepository : Repository<CourseModule, Guid>, ICourseModuleRepository
{
    public CourseModuleRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<CourseModule?> FindByCourseAndNameAsync(Guid courseId, string name, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseModules
            .FirstOrDefaultAsync(s => s.CourseId == courseId && s.Name == name, cancellationToken);
    }

    public async Task<int> CountByCourseIdAsync(Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseModules.CountAsync(s => s.CourseId == courseId, cancellationToken);
    }
}

public class TopicRepository : Repository<Topic, Guid>, ITopicRepository
{
    public TopicRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<List<Topic>> GetBySubjectIdWithContentAsync(Guid subjectId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Topics
            .Include(t => t.TopicContent)
            .Include(t => t.Flashcards)
            .Include(t => t.Questions)
            .Where(t => t.SubjectId == subjectId)
            .OrderBy(t => t.OrderIndex)
            .ToListAsync(cancellationToken);
    }

    public async Task<Topic?> GetWithContentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.Topics
            .Include(t => t.TopicContent)
            .Include(t => t.Flashcards)
            .Include(t => t.Questions)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Topic?> FindBySubjectAndTitleAsync(Guid subjectId, string title, CancellationToken cancellationToken = default)
    {
        return await DbContext.Topics
            .FirstOrDefaultAsync(t => t.SubjectId == subjectId && t.Title == title, cancellationToken);
    }

    public async Task<int> CountBySubjectIdAsync(Guid subjectId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Topics.CountAsync(t => t.SubjectId == subjectId, cancellationToken);
    }

    public async Task AddFlashcardAsync(Flashcard flashcard, CancellationToken cancellationToken = default)
    {
        await DbContext.Flashcards.AddAsync(flashcard, cancellationToken);
    }

    public async Task AddQuestionAsync(Question question, CancellationToken cancellationToken = default)
    {
        await DbContext.Questions.AddAsync(question, cancellationToken);
    }

    public async Task AddOrUpdateTopicContentAsync(TopicContent topicContent, CancellationToken cancellationToken = default)
    {
        var existing = await DbContext.TopicContents.FirstOrDefaultAsync(tc => tc.TopicId == topicContent.TopicId, cancellationToken);
        if (existing == null)
        {
            await DbContext.TopicContents.AddAsync(topicContent, cancellationToken);
        }
        else
        {
            existing.Title = topicContent.Title;
            existing.Summary = topicContent.Summary;
            existing.Detail = topicContent.Detail;
            existing.Peso = topicContent.Peso;
            existing.ContentMarkdown = topicContent.ContentMarkdown;
            existing.ExamplesJson = topicContent.ExamplesJson;
            existing.KeyPointsJson = topicContent.KeyPointsJson;
            existing.TipsJson = topicContent.TipsJson;
            existing.UsefulLinksJson = topicContent.UsefulLinksJson;
            existing.UpdatedAt = DateTime.UtcNow;
            DbContext.TopicContents.Update(existing);
        }
    }
}

public class EnrollmentRepository : Repository<Enrollment, Guid>, IEnrollmentRepository
{
    public EnrollmentRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<Enrollment?> GetByStudentAndCourseAsync(string studentId, Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId, cancellationToken);
    }

    public async Task<List<Enrollment>> GetByCourseIdWithStudentAsync(Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Include(e => e.InviteToken)
            .Where(e => e.CourseId == courseId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Enrollment>> GetActiveStudiesByStudentIdAsync(string studentId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Professor)
            .Include(e => e.Course.Subjects)
            .Where(e => e.StudentId == studentId && e.Status == "ACTIVE")
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Enrollment?> GetByIdWithCourseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.Enrollments
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }
}

public class AccessRequestRepository : Repository<AccessRequest, Guid>, IAccessRequestRepository
{
    public AccessRequestRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<AccessRequest?> GetPendingByStudentAndCourseAsync(string studentId, Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.AccessRequests
            .FirstOrDefaultAsync(a => a.StudentId == studentId && a.CourseId == courseId && a.Status == "PENDING", cancellationToken);
    }

    public async Task<List<AccessRequest>> GetPendingByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default)
    {
        return await DbContext.AccessRequests
            .Include(a => a.Student)
            .Include(a => a.Course)
            .Where(a => a.Course.ProfessorId == professorId && a.Status == "PENDING")
            .OrderByDescending(a => a.RequestedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<AccessRequest?> GetByIdWithCourseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.AccessRequests
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }
}

public class InviteTokenRepository : Repository<InviteToken, Guid>, IInviteTokenRepository
{
    public InviteTokenRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<InviteToken?> GetByTokenWithCourseAsync(string token, CancellationToken cancellationToken = default)
    {
        return await DbContext.InviteTokens
            .Include(t => t.Course)
            .Include(t => t.CreatedByProfessor)
            .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);
    }

    public async Task<List<InviteToken>> GetByCourseIdAsync(Guid courseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.InviteTokens
            .Include(t => t.WhatsAppLogs)
            .Include(t => t.Enrollments)
            .Where(t => t.CourseId == courseId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<InviteToken>> GetByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default)
    {
        return await DbContext.InviteTokens
            .Include(t => t.Course)
            .Include(t => t.WhatsAppLogs)
            .Include(t => t.Enrollments)
            .Where(t => t.CreatedByProfessorId == professorId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}

public class StudentProgressRepository : Repository<StudentProgress, Guid>, IStudentProgressRepository
{
    public StudentProgressRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<List<StudentProgress>> GetProgressByStudentAndTopicAsync(string studentId, Guid topicId, CancellationToken cancellationToken = default)
    {
        return await DbContext.StudentProgresses
            .Where(sp => sp.StudentId == studentId && sp.TopicId == topicId)
            .OrderByDescending(sp => sp.AnsweredAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<StudentProgress>> GetProgressByCourseAsync(Guid courseId, string? studentId = null, CancellationToken cancellationToken = default)
    {
        var query = DbContext.StudentProgresses
            .Include(sp => sp.Topic)
                .ThenInclude(t => t.Subject)
            .Where(sp => sp.Topic.Subject.CourseId == courseId);

        if (!string.IsNullOrEmpty(studentId))
        {
            query = query.Where(sp => sp.StudentId == studentId);
        }

        return await query
            .OrderByDescending(sp => sp.AnsweredAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAnsweredQuestionsByStudentAsync(string studentId, CancellationToken cancellationToken = default)
    {
        return await DbContext.StudentProgresses
            .Where(sp => sp.StudentId == studentId && sp.QuestionId != null)
            .CountAsync(cancellationToken);
    }
}

public class ProfessorSubscriptionRepository : Repository<ProfessorSubscription, Guid>, IProfessorSubscriptionRepository
{
    public ProfessorSubscriptionRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<ProfessorSubscription?> GetByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default)
    {
        return await DbContext.ProfessorSubscriptions
            .Include(s => s.Professor)
            .FirstOrDefaultAsync(s => s.ProfessorId == professorId, cancellationToken);
    }

    public async Task<ProfessorSubscription?> GetByAsaasSubscriptionIdAsync(string asaasSubscriptionId, CancellationToken cancellationToken = default)
    {
        return await DbContext.ProfessorSubscriptions
            .Include(s => s.Professor)
            .FirstOrDefaultAsync(s => s.AsaasSubscriptionId == asaasSubscriptionId, cancellationToken);
    }

    public async Task<ProfessorSubscription?> GetByAsaasCustomerIdAsync(string asaasCustomerId, CancellationToken cancellationToken = default)
    {
        return await DbContext.ProfessorSubscriptions
            .Include(s => s.Professor)
            .FirstOrDefaultAsync(s => s.AsaasCustomerId == asaasCustomerId, cancellationToken);
    }
}

public class AsaasWebhookLogRepository : Repository<AsaasWebhookLog, Guid>, IAsaasWebhookLogRepository
{
    public AsaasWebhookLogRepository(ApplicationDbContext dbContext) : base(dbContext) { }
}

public class WhatsAppLogRepository : Repository<WhatsAppLog, Guid>, IWhatsAppLogRepository
{
    public WhatsAppLogRepository(ApplicationDbContext dbContext) : base(dbContext) { }
}
