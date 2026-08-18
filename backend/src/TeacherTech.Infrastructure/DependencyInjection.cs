using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Domain.Interfaces;
using TeacherTech.Infrastructure.Repositories;
using TeacherTech.Infrastructure.Services;

namespace TeacherTech.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Repositories & Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IProfessorProfileRepository, ProfessorProfileRepository>();
        services.AddScoped<IStudentProfileRepository, StudentProfileRepository>();
        services.AddScoped<ISubjectRepository, SubjectRepository>();
        services.AddScoped<ITopicRepository, TopicRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<IAccessRequestRepository, AccessRequestRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();

        // Domain Services & Health
        services.AddScoped<IPaymentDomainService, PaymentDomainService>();
        services.AddHttpClient<IAiService, AiService>();
        services.AddScoped<DatabaseHealthCheck>();

        return services;
    }
}
