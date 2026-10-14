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
    Task<ServiceResult<AuthResponseDto>> GoogleLoginAsync(GoogleLoginDto dto);
    Task<ServiceResult<object>> GetCurrentUserAsync(string? userId);
    Task<ServiceResult<object>> SeedTestUsersAsync();
}

public interface ICourseApplicationService
{
    Task<List<CourseResponseDto>> GetPublicCoursesAsync();
    Task<List<CourseResponseDto>> GetMyCoursesAsync(string professorId);
    Task<CourseStudyPlan?> GetCourseByIdAsync(Guid id);
    Task<ServiceResult<CourseStudyPlan>> CreateCourseAsync(string professorId, CreateCourseDto dto);
    Task<ServiceResult<CourseStudyPlan>> UpdateCourseBasicInfoAsync(Guid courseId, UpdateCourseDto dto);
    Task<ServiceResult<CourseModule>> AddModuleAsync(Guid courseId, string name);
    Task<ServiceResult<CourseModule>> UpdateModuleAsync(Guid courseId, Guid moduleId, string name);
    Task<ServiceResult<bool>> DeleteModuleAsync(Guid courseId, Guid moduleId);
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
    Task<ServiceResult<AccessRequestStatusDto>> GetRequestStatusAsync(Guid requestId);
}

public interface IPaymentApplicationService
{
    Task<ServiceResult<CheckoutResponseDto>> CreateCheckoutAsync(string userId, CreateCheckoutDto dto);
    Task<ServiceResult<string>> ProcessWebhookAsync(PaymentWebhookDto dto);
    Task<ServiceResult<string>> ConfirmSimulatedPaymentAsync(Guid transactionId);
    Task<ServiceResult<ProfessorBalanceDto>> GetProfessorBalanceAsync(string professorId);
    Task<ServiceResult<string>> UpdatePixKeyAsync(string professorId, string pixKey);
    Task<ServiceResult<P2pPixCheckoutResponseDto>> CreateP2pPixCheckoutAsync(string? studentId, P2pPixCheckoutDto dto);
}

public interface IPublicShowcaseApplicationService
{
    Task<ServiceResult<PublicProfessorProfileDto>> GetProfessorBySlugAsync(string slug);
    Task<List<PublicCourseExploreDto>> ExploreCoursesAsync(string? search, string? category);
    Task<ServiceResult<object>> GetPublicCourseDetailsAsync(Guid id);
    Task<PagedResult<ExploreItemDto>> ExploreAsync(ExploreQueryParams queryParams);
    Task<ExploreFiltersDto> GetAvailableFiltersAsync();
    Task<ServiceResult<ShowcaseLeadResponseDto>> CreateLeadAsync(CreateShowcaseLeadDto dto);
    Task<ServiceResult<bool>> TrackClickAsync(TrackClickDto dto);
    Task<ServiceResult<List<ShowcaseLeadResponseDto>>> GetProfessorLeadsAsync(string professorId);
    Task<ServiceResult<ShowcaseMetricSummaryDto>> GetProfessorMetricsAsync(string professorId);
}

public interface IProfessorShowcaseManagementService
{
    Task<ServiceResult<PublicProfessorProfileDto>> GetMyShowcaseAsync(string professorId);
    Task<ServiceResult<PublicProfessorProfileDto>> UpdateMyShowcaseAsync(string professorId, UpdateProfessorShowcaseDto dto);
    Task<ServiceResult<bool>> CheckSlugAvailabilityAsync(string professorId, string slug);

    Task<ServiceResult<List<PublicOfferingDto>>> GetMyOfferingsAsync(string professorId);
    Task<ServiceResult<PublicOfferingDto>> CreateOfferingAsync(string professorId, SaveOfferingDto dto);
    Task<ServiceResult<PublicOfferingDto>> UpdateOfferingAsync(string professorId, Guid offeringId, SaveOfferingDto dto);
    Task<ServiceResult<bool>> DeleteOfferingAsync(string professorId, Guid offeringId);
    Task<ServiceResult<bool>> ToggleOfferingActiveAsync(string professorId, Guid offeringId);
    Task<ServiceResult<bool>> ReorderOfferingsAsync(string professorId, ReorderOfferingsDto dto);

    Task<ServiceResult<bool>> UpdateLeadStatusAsync(string professorId, Guid leadId, UpdateLeadStatusDto dto);
}

public interface ISubjectApplicationService
{
    Task<List<Subject>> GetSubjectsByCourseAsync(Guid courseId);
    Task<ServiceResult<Subject>> CreateSubjectAsync(CreateSubjectDto dto);
    Task<ServiceResult<Subject>> UpdateSubjectAsync(Guid id, CreateSubjectDto dto);
    Task<ServiceResult<bool>> DeleteSubjectAsync(Guid id);
}

public interface ITopicApplicationService
{
    Task<List<Topic>> GetTopicsBySubjectAsync(Guid subjectId);
    Task<Topic?> GetTopicByIdAsync(Guid id);
    Task<ServiceResult<Topic>> CreateTopicAsync(CreateTopicDto dto);
    Task<ServiceResult<Topic>> UpdateTopicAsync(Guid id, UpdateTopicDto dto);
    Task<ServiceResult<bool>> DeleteTopicAsync(Guid id);
}

public interface IBillingService
{
    Task<ServiceResult<BillingCheckoutResponseDto>> CreateSubscriptionForProfessor(string professorId, PlanType planType);
    Task<ServiceResult<string>> ProcessAsaasWebhookAsync(string? webhookTokenHeader, string payloadJson);
}

public interface IWhatsAppService
{
    Task<WhatsAppSendResult> SendInviteAsync(string phone, string courseTitle, string inviteLink, Guid inviteTokenId, CancellationToken cancellationToken = default);
}

public interface IInviteService
{
    Task<ServiceResult<InviteGeneratedResponseDto>> GenerateInviteAsync(string professorId, CreateInviteDto dto, string? appBaseUrl = null);
    Task<ServiceResult<ValidateInviteResponseDto>> ValidateInviteAsync(string token);
    Task<ServiceResult<RedeemInviteResponseDto>> RedeemInviteAsync(string studentId, string token);
    Task<ServiceResult<ProfessorDashboardDto>> GetProfessorDashboardAsync(string professorId);
}

public interface IProgressService
{
    Task<ServiceResult<bool>> RecordAnswerAsync(string studentId, RecordAnswerRequestDto dto);
    Task<ServiceResult<CourseProgressDto>> GetMyProgressByCourseAsync(string studentId, Guid courseId);
}
