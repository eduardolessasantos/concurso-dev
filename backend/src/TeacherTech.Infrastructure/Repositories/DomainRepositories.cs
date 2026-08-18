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
            .Include(c => c.Subjects.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Topics.OrderBy(t => t.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<CourseStudyPlan>> GetByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .Include(c => c.Professor)
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
            .Include(c => c.Subjects)
            .Include(c => c.Enrollments)
            .Where(c => c.IsPublic && c.Status == "PUBLISHED")
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CourseStudyPlan>> SearchPublicCoursesAsync(string? search, string? category, CancellationToken cancellationToken = default)
    {
        var query = DbContext.CourseStudyPlans
            .Include(c => c.Professor)
                .ThenInclude(p => p.ProfessorProfile)
            .Include(c => c.Subjects)
            .Where(c => c.IsPublic && c.Status == "PUBLISHED");

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search) || c.Professor.FullName.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(c => c.Category.ToLower() == category.ToLower());
        }

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<CourseStudyPlan?> GetPublicCourseDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.CourseStudyPlans
            .Include(c => c.Professor)
                .ThenInclude(p => p.ProfessorProfile)
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
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task<ProfessorProfile?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await DbContext.ProfessorProfiles
            .Include(p => p.User)
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

public class TopicRepository : Repository<Topic, Guid>, ITopicRepository
{
    public TopicRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<List<Topic>> GetBySubjectIdWithContentAsync(Guid subjectId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Topics
            .Include(t => t.Flashcards)
            .Include(t => t.Questions)
            .Where(t => t.SubjectId == subjectId)
            .OrderBy(t => t.OrderIndex)
            .ToListAsync(cancellationToken);
    }

    public async Task<Topic?> GetWithContentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.Topics
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

public class TransactionRepository : Repository<Transaction, Guid>, ITransactionRepository
{
    public TransactionRepository(ApplicationDbContext dbContext) : base(dbContext) { }

    public async Task<Transaction?> GetByIdWithCourseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.Transactions
            .Include(t => t.Course)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<List<Transaction>> GetPaidTransactionsByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Transactions
            .Include(t => t.Course)
            .Include(t => t.User)
            .Where(t => t.Course != null && t.Course.ProfessorId == professorId && t.Status == "PAID")
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
