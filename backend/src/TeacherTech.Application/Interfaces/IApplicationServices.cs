using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Application.Interfaces;

public record ServiceResult<T>(bool Success, T? Data = default, string? ErrorMessage = null, int StatusCode = 200)
{
    public static ServiceResult<T> Ok(T data) => new(true, data, null, 200);
    public static ServiceResult<T> Created(T data) => new(true, data, null, 201);
    public static ServiceResult<T> Fail(string error, int statusCode = 400) => new(false, default, error, statusCode);
}

public interface IAuthApplicationService
{
    Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<ServiceResult<object>> GetCurrentUserAsync(string? userId);
}

public interface ICourseApplicationService
{
    Task<List<CourseResponseDto>> GetPublicCoursesAsync();
    Task<List<CourseResponseDto>> GetMyCoursesAsync(string professorId);
    Task<CourseStudyPlan?> GetCourseByIdAsync(Guid id);
    Task<ServiceResult<CourseStudyPlan>> CreateCourseAsync(string professorId, CreateCourseDto dto);
    Task<ServiceResult<SaveStudioResponseDto>> PublishStudioContentAsync(string? professorId, SaveStudioContentDto dto);
}

public interface IAiContentApplicationService
{
    Task<ServiceResult<string>> GenerateSummaryAsync(string professorId, GenerateAiContentDto dto);
    Task<ServiceResult<List<object>>> GenerateFlashcardsAsync(string professorId, GenerateAiContentDto dto);
    Task<ServiceResult<List<object>>> GenerateQuestionsAsync(string professorId, GenerateAiContentDto dto);
}

public interface IEnrollmentApplicationService
{
    Task<ServiceResult<EnrollmentResponseDto>> InviteStudentByEmailAsync(string professorId, InviteStudentByEmailDto dto);
    Task<ServiceResult<List<EnrollmentResponseDto>>> GetCourseEnrollmentsAsync(string professorId, Guid courseId);
    Task<ServiceResult<List<object>>> GetMyStudiesAsync(string studentId);
    Task<ServiceResult<bool>> RevokeAccessAsync(string professorId, Guid enrollmentId);
}

public interface IAccessRequestApplicationService
{
    Task<ServiceResult<string>> RequestAccessAsync(string studentId, CreateAccessRequestDto dto);
    Task<ServiceResult<List<AccessRequestResponseDto>>> GetPendingRequestsAsync(string professorId);
    Task<ServiceResult<string>> ApproveRequestAsync(string professorId, Guid requestId);
    Task<ServiceResult<string>> RejectRequestAsync(string professorId, Guid requestId);
}

public interface IPaymentApplicationService
{
    Task<ServiceResult<CheckoutResponseDto>> CreateCheckoutAsync(string userId, CreateCheckoutDto dto);
    Task<ServiceResult<string>> ProcessWebhookAsync(PaymentWebhookDto dto);
    Task<ServiceResult<string>> ConfirmSimulatedPaymentAsync(Guid transactionId);
    Task<ServiceResult<ProfessorBalanceDto>> GetProfessorBalanceAsync(string professorId);
    Task<ServiceResult<string>> UpdatePixKeyAsync(string professorId, string pixKey);
}

public interface IPublicShowcaseApplicationService
{
    Task<ServiceResult<PublicProfessorProfileDto>> GetProfessorBySlugAsync(string slug);
    Task<List<PublicCourseExploreDto>> ExploreCoursesAsync(string? search, string? category);
    Task<ServiceResult<object>> GetPublicCourseDetailsAsync(Guid id);
}

public interface ISubjectApplicationService
{
    Task<List<Subject>> GetSubjectsByCourseAsync(Guid courseId);
    Task<ServiceResult<Subject>> CreateSubjectAsync(CreateSubjectDto dto);
}

public interface ITopicApplicationService
{
    Task<List<Topic>> GetTopicsBySubjectAsync(Guid subjectId);
    Task<Topic?> GetTopicByIdAsync(Guid id);
    Task<ServiceResult<Topic>> CreateTopicAsync(CreateTopicDto dto);
}
