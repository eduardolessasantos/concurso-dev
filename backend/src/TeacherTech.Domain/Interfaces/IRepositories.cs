using System.Linq.Expressions;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Domain.Interfaces;

public interface IRepository<TEntity, in TKey> where TEntity : class
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);
    Task<List<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);
    void Update(TEntity entity);
    void Remove(TEntity entity);
    void RemoveRange(IEnumerable<TEntity> entities);
}

public interface ICourseRepository : IRepository<CourseStudyPlan, Guid>
{
    Task<CourseStudyPlan?> GetWithHierarchyAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<CourseStudyPlan>> GetByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default);
    Task<List<CourseStudyPlan>> GetPublicPublishedAsync(CancellationToken cancellationToken = default);
    Task<List<CourseStudyPlan>> SearchPublicCoursesAsync(string? search, string? category, CancellationToken cancellationToken = default);
    Task<CourseStudyPlan?> GetPublicCourseDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CourseStudyPlan?> FindByProfessorAndTitleAsync(string professorId, string title, CancellationToken cancellationToken = default);
    Task AddStudyScheduleAsync(StudySchedule schedule, CancellationToken cancellationToken = default);
    Task AddSimulatedTestAsync(SimulatedTest simulatedTest, CancellationToken cancellationToken = default);
    Task AddSimulatedQuestionAsync(SimulatedQuestion question, CancellationToken cancellationToken = default);
}

public interface IProfessorProfileRepository : IRepository<ProfessorProfile, string>
{
    Task<ProfessorProfile?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<ProfessorProfile?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

public interface IStudentProfileRepository : IRepository<StudentProfile, string>
{
    Task<StudentProfile?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
}

public interface ISubjectRepository : IRepository<Subject, Guid>
{
    Task<List<Subject>> GetByCourseIdWithTopicsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<Subject?> FindByCourseAndNameAsync(Guid courseId, string name, CancellationToken cancellationToken = default);
    Task<int> CountByCourseIdAsync(Guid courseId, CancellationToken cancellationToken = default);
}

public interface ITopicRepository : IRepository<Topic, Guid>
{
    Task<List<Topic>> GetBySubjectIdWithContentAsync(Guid subjectId, CancellationToken cancellationToken = default);
    Task<Topic?> GetWithContentAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Topic?> FindBySubjectAndTitleAsync(Guid subjectId, string title, CancellationToken cancellationToken = default);
    Task<int> CountBySubjectIdAsync(Guid subjectId, CancellationToken cancellationToken = default);
    Task AddFlashcardAsync(Flashcard flashcard, CancellationToken cancellationToken = default);
    Task AddQuestionAsync(Question question, CancellationToken cancellationToken = default);
}

public interface IEnrollmentRepository : IRepository<Enrollment, Guid>
{
    Task<Enrollment?> GetByStudentAndCourseAsync(string studentId, Guid courseId, CancellationToken cancellationToken = default);
    Task<List<Enrollment>> GetByCourseIdWithStudentAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<List<Enrollment>> GetActiveStudiesByStudentIdAsync(string studentId, CancellationToken cancellationToken = default);
    Task<Enrollment?> GetByIdWithCourseAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IAccessRequestRepository : IRepository<AccessRequest, Guid>
{
    Task<AccessRequest?> GetPendingByStudentAndCourseAsync(string studentId, Guid courseId, CancellationToken cancellationToken = default);
    Task<List<AccessRequest>> GetPendingByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default);
    Task<AccessRequest?> GetByIdWithCourseAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ITransactionRepository : IRepository<Transaction, Guid>
{
    Task<Transaction?> GetByIdWithCourseAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Transaction>> GetPaidTransactionsByProfessorIdAsync(string professorId, CancellationToken cancellationToken = default);
}
