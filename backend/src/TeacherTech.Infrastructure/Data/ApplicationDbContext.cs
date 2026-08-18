using TeacherTech.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace TeacherTech.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ProfessorProfile> ProfessorProfiles => Set<ProfessorProfile>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<CourseStudyPlan> CourseStudyPlans => Set<CourseStudyPlan>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<AccessRequest> AccessRequests => Set<AccessRequest>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<StudySchedule> StudySchedules => Set<StudySchedule>();
    public DbSet<SimulatedTest> SimulatedTests => Set<SimulatedTest>();
    public DbSet<SimulatedQuestion> SimulatedQuestions => Set<SimulatedQuestion>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // --- 1. PROFILES ---
        builder.Entity<ProfessorProfile>()
            .HasOne(p => p.User)
            .WithOne(u => u.ProfessorProfile)
            .HasForeignKey<ProfessorProfile>(p => p.UserId);

        builder.Entity<ProfessorProfile>()
            .HasIndex(p => p.CustomSlug);

        builder.Entity<StudentProfile>()
            .HasOne(s => s.User)
            .WithOne(u => u.StudentProfile)
            .HasForeignKey<StudentProfile>(s => s.UserId);

        // --- 2. HIERARCHICAL COHESION (Course -> Subject -> Topic) ---
        builder.Entity<CourseStudyPlan>()
            .HasOne(c => c.Professor)
            .WithMany(u => u.AuthoredCourses)
            .HasForeignKey(c => c.ProfessorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CourseStudyPlan>()
            .HasIndex(c => c.ProfessorId);

        builder.Entity<Subject>()
            .HasIndex(s => new { s.CourseId, s.Name })
            .IsUnique();

        builder.Entity<Topic>()
            .HasIndex(t => new { t.SubjectId, t.Title })
            .IsUnique();

        // --- 3. ENROLLMENTS & ACCESS REQUESTS ---
        builder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Enrollment>()
            .HasIndex(e => new { e.StudentId, e.CourseId });

        builder.Entity<AccessRequest>()
            .HasOne(a => a.Student)
            .WithMany(u => u.AccessRequests)
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AccessRequest>()
            .HasIndex(a => new { a.StudentId, a.CourseId });

        // --- 4. TRANSACTIONS ---
        builder.Entity<Transaction>()
            .HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Transaction>()
            .HasOne(t => t.Enrollment)
            .WithMany()
            .HasForeignKey(t => t.EnrollmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
