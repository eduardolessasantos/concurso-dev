using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Application.Interfaces;
using TeacherTech.Application.Services;

namespace TeacherTech.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthApplicationService, AuthApplicationService>();
        services.AddScoped<ICourseApplicationService, CourseApplicationService>();
        services.AddScoped<IAiContentApplicationService, AiContentApplicationService>();
        services.AddScoped<IEnrollmentApplicationService, EnrollmentApplicationService>();
        services.AddScoped<IAccessRequestApplicationService, AccessRequestApplicationService>();
        services.AddScoped<IPaymentApplicationService, PaymentApplicationService>();
        services.AddScoped<IPublicShowcaseApplicationService, PublicShowcaseApplicationService>();
        services.AddScoped<ISubjectApplicationService, SubjectApplicationService>();
        services.AddScoped<ITopicApplicationService, TopicApplicationService>();

        return services;
    }
}
