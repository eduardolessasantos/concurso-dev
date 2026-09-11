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
    public DbSet<ProfessorSubscription> ProfessorSubscriptions => Set<ProfessorSubscription>();
    public DbSet<CourseStudyPlan> CourseStudyPlans => Set<CourseStudyPlan>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<TopicContent> TopicContents => Set<TopicContent>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<InviteToken> InviteTokens => Set<InviteToken>();
    public DbSet<WhatsAppLog> WhatsAppLogs => Set<WhatsAppLog>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<AccessRequest> AccessRequests => Set<AccessRequest>();
    public DbSet<StudentProgress> StudentProgresses => Set<StudentProgress>();
    public DbSet<StudySchedule> StudySchedules => Set<StudySchedule>();
    public DbSet<SimulatedTest> SimulatedTests => Set<SimulatedTest>();
    public DbSet<SimulatedQuestion> SimulatedQuestions => Set<SimulatedQuestion>();
    public DbSet<AsaasWebhookLog> AsaasWebhookLogs => Set<AsaasWebhookLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // --- 1. PROFILES & SUBSCRIPTION ---
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

        builder.Entity<ProfessorSubscription>()
            .HasOne(s => s.Professor)
            .WithOne(u => u.ProfessorSubscription)
            .HasForeignKey<ProfessorSubscription>(s => s.ProfessorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ProfessorSubscription>()
            .HasIndex(s => s.AsaasSubscriptionId)
            .IsUnique();

        // --- 2. HIERARCHICAL COHESION (Course -> CourseModule -> Subject -> Topic -> TopicContent) ---
        builder.Entity<CourseStudyPlan>()
            .HasOne(c => c.Professor)
            .WithMany(u => u.AuthoredCourses)
            .HasForeignKey(c => c.ProfessorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CourseStudyPlan>()
            .HasIndex(c => c.ProfessorId);

        builder.Entity<CourseModule>()
            .HasOne(m => m.Course)
            .WithMany(c => c.Modules)
            .HasForeignKey(m => m.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Subject>()
            .HasOne(s => s.Module)
            .WithMany(m => m.Subjects)
            .HasForeignKey(s => s.ModuleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Subject>()
            .HasIndex(s => new { s.CourseId, s.Name })
            .IsUnique();

        builder.Entity<Topic>()
            .HasIndex(t => new { t.SubjectId, t.Title })
            .IsUnique();

        builder.Entity<TopicContent>()
            .HasOne(tc => tc.Topic)
            .WithOne(t => t.TopicContent)
            .HasForeignKey<TopicContent>(tc => tc.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- 3. INVITE TOKENS & WHATSAPP LOGS ---
        builder.Entity<InviteToken>()
            .HasIndex(t => t.Token)
            .IsUnique();

        builder.Entity<InviteToken>()
            .HasOne(t => t.Course)
            .WithMany(c => c.InviteTokens)
            .HasForeignKey(t => t.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<InviteToken>()
            .HasOne(t => t.CreatedByProfessor)
            .WithMany(u => u.CreatedInviteTokens)
            .HasForeignKey(t => t.CreatedByProfessorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<WhatsAppLog>()
            .HasOne(w => w.InviteToken)
            .WithMany(t => t.WhatsAppLogs)
            .HasForeignKey(w => w.InviteTokenId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- 4. ENROLLMENTS & ACCESS REQUESTS ---
        builder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Enrollment>()
            .HasOne(e => e.InviteToken)
            .WithMany(t => t.Enrollments)
            .HasForeignKey(e => e.InviteTokenId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Enrollment>()
            .HasIndex(e => new { e.StudentId, e.CourseId });

        builder.Entity<AccessRequest>()
            .HasOne(a => a.Student)
            .WithMany(u => u.AccessRequests)
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AccessRequest>()
            .HasIndex(a => new { a.StudentId, a.CourseId });

        // --- 5. STUDENT PROGRESS ---
        builder.Entity<StudentProgress>()
            .HasOne(sp => sp.Student)
            .WithMany(u => u.StudentProgressRecords)
            .HasForeignKey(sp => sp.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentProgress>()
            .HasOne(sp => sp.Topic)
            .WithMany(t => t.StudentProgressRecords)
            .HasForeignKey(sp => sp.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentProgress>()
            .HasOne(sp => sp.Question)
            .WithMany(q => q.StudentProgressRecords)
            .HasForeignKey(sp => sp.QuestionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<StudentProgress>()
            .HasIndex(sp => new { sp.StudentId, sp.TopicId });
    }
}
