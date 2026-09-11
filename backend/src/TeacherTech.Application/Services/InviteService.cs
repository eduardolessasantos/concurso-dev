using System.Security.Cryptography;
using Microsoft.Extensions.Logging;
using QRCoder;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Application.Services;

public class InviteService : IInviteService
{
    private static readonly char[] NanoidAlphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();
    private const int NanoidLength = 8;

    private readonly IInviteTokenRepository _inviteTokenRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly IProfessorSubscriptionRepository _subscriptionRepo;
    private readonly IStudentProgressRepository _progressRepo;
    private readonly IWhatsAppService _whatsAppService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InviteService> _logger;

    public InviteService(
        IInviteTokenRepository inviteTokenRepo,
        ICourseRepository courseRepo,
        IEnrollmentRepository enrollmentRepo,
        IProfessorSubscriptionRepository subscriptionRepo,
        IStudentProgressRepository progressRepo,
        IWhatsAppService whatsAppService,
        IUnitOfWork unitOfWork,
        ILogger<InviteService> logger)
    {
        _inviteTokenRepo = inviteTokenRepo;
        _courseRepo = courseRepo;
        _enrollmentRepo = enrollmentRepo;
        _subscriptionRepo = subscriptionRepo;
        _progressRepo = progressRepo;
        _whatsAppService = whatsAppService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ServiceResult<InviteGeneratedResponseDto>> GenerateInviteAsync(
        string professorId, 
        CreateInviteDto dto, 
        string? appBaseUrl = null)
    {
        if (dto.CourseId == Guid.Empty)
            return ServiceResult<InviteGeneratedResponseDto>.Fail("Curso não informado.", 400);

        var course = await _courseRepo.GetByIdAsync(dto.CourseId);
        if (course == null)
            return ServiceResult<InviteGeneratedResponseDto>.Fail("Curso não encontrado.", 404);

        if (course.ProfessorId != professorId)
            return ServiceResult<InviteGeneratedResponseDto>.Fail("Acesso negado. O curso pertence a outro professor.", 403);

        // 1. Gera token curto de 8 caracteres com Nanoid
        var token = GenerateNanoid(NanoidLength);

        var baseUrl = string.IsNullOrWhiteSpace(appBaseUrl) ? "https://seuapp.com" : appBaseUrl.TrimEnd('/');
        var inviteUrl = $"{baseUrl}/convite/{token}";

        // 2. Gera QR Code em Base64 PNG
        var qrCodeBase64 = GenerateQrCodeBase64(inviteUrl);

        // 3. Cria entidade InviteToken com MaxUses = 10 e ExpiresAt = 7 dias
        var inviteToken = new InviteToken
        {
            CourseId = dto.CourseId,
            Token = token,
            CreatedByProfessorId = professorId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            MaxUses = 10,
            UsedCount = 0,
            Channel = dto.Channel,
            TargetPhone = dto.TargetPhone,
            CreatedAt = DateTime.UtcNow
        };

        await _inviteTokenRepo.AddAsync(inviteToken);
        await _unitOfWork.CommitAsync();

        // 4. Se canal for WHATSAPP ou houver telefone informado, envia via WhatsApp Cloud API
        if (dto.Channel == InviteChannel.WhatsApp || !string.IsNullOrWhiteSpace(dto.TargetPhone))
        {
            var phone = dto.TargetPhone ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(phone))
            {
                var sendResult = await _whatsAppService.SendInviteAsync(phone, course.Title, inviteUrl, inviteToken.Id);
                if (!sendResult.Success)
                {
                    _logger.LogWarning("Falha no disparo WhatsApp para o convite {Token}: {Error}", token, sendResult.ErrorMessage);
                }
            }
        }

        var response = new InviteGeneratedResponseDto
        {
            Token = token,
            InviteUrl = inviteUrl,
            QrCodeBase64 = qrCodeBase64,
            ExpiresAt = inviteToken.ExpiresAt,
            MaxUses = inviteToken.MaxUses ?? 10,
            UsedCount = 0,
            Channel = inviteToken.Channel,
            TargetPhone = inviteToken.TargetPhone,
            CourseTitle = course.Title
        };

        return ServiceResult<InviteGeneratedResponseDto>.Ok(response);
    }

    public async Task<ServiceResult<ValidateInviteResponseDto>> ValidateInviteAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return ServiceResult<ValidateInviteResponseDto>.Fail("Token não informado.", 400);

        var invite = await _inviteTokenRepo.GetByTokenWithCourseAsync(token);
        if (invite == null)
        {
            return ServiceResult<ValidateInviteResponseDto>.Fail("Convite não encontrado ou inválido.", 404);
        }

        if (invite.ExpiresAt.HasValue && invite.ExpiresAt.Value < DateTime.UtcNow)
        {
            return ServiceResult<ValidateInviteResponseDto>.Fail("Este convite expirou.", 410);
        }

        if (invite.MaxUses.HasValue && invite.UsedCount >= invite.MaxUses.Value)
        {
            return ServiceResult<ValidateInviteResponseDto>.Fail("O limite de utilizações deste convite foi atingido.", 410);
        }

        var response = new ValidateInviteResponseDto
        {
            Valid = true,
            Token = invite.Token,
            CourseId = invite.CourseId,
            CourseTitle = invite.Course?.Title ?? "Curso TeacherTech",
            CourseDescription = invite.Course?.Description ?? string.Empty,
            ProfessorName = invite.CreatedByProfessor?.FullName ?? "Professor",
            ExpiresAt = invite.ExpiresAt,
            MaxUses = invite.MaxUses ?? 10,
            UsedCount = invite.UsedCount,
            Channel = invite.Channel,
            Message = "Convite válido e pronto para resgate."
        };

        return ServiceResult<ValidateInviteResponseDto>.Ok(response);
    }

    public async Task<ServiceResult<RedeemInviteResponseDto>> RedeemInviteAsync(string studentId, string token)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return ServiceResult<RedeemInviteResponseDto>.Fail("Aluno não identificado.", 401);

        if (string.IsNullOrWhiteSpace(token))
            return ServiceResult<RedeemInviteResponseDto>.Fail("Token não informado.", 400);

        var invite = await _inviteTokenRepo.GetByTokenWithCourseAsync(token);
        if (invite == null)
            return ServiceResult<RedeemInviteResponseDto>.Fail("Convite não encontrado.", 404);

        if (invite.ExpiresAt.HasValue && invite.ExpiresAt.Value < DateTime.UtcNow)
            return ServiceResult<RedeemInviteResponseDto>.Fail("Este convite já expirou.", 410);

        if (invite.MaxUses.HasValue && invite.UsedCount >= invite.MaxUses.Value)
            return ServiceResult<RedeemInviteResponseDto>.Fail("O limite de utilizações deste convite foi atingido.", 410);

        // Verifica se já está matriculado
        var existingEnrollment = await _enrollmentRepo.GetByStudentAndCourseAsync(studentId, invite.CourseId);
        if (existingEnrollment != null && existingEnrollment.Status == EnrollmentStatus.Active)
        {
            var alreadyEnrolledResponse = new RedeemInviteResponseDto
            {
                EnrollmentId = existingEnrollment.Id,
                CourseId = invite.CourseId,
                CourseTitle = invite.Course?.Title ?? "Curso TeacherTech",
                Status = existingEnrollment.Status,
                GrantedVia = existingEnrollment.GrantedVia,
                EnrolledAt = existingEnrollment.CreatedAt
            };
            return ServiceResult<RedeemInviteResponseDto>.Ok(alreadyEnrolledResponse);
        }

        // Cria matrícula
        var channelName = invite.Channel.ToString().ToUpperInvariant();
        var enrollment = new Enrollment
        {
            StudentId = studentId,
            CourseId = invite.CourseId,
            InviteTokenId = invite.Id,
            GrantedBy = invite.CreatedByProfessorId,
            GrantedVia = $"INVITE_{channelName}",
            Status = EnrollmentStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _enrollmentRepo.AddAsync(enrollment);

        // Incrementa contagem de uso do token
        invite.UsedCount++;
        invite.UpdatedAt = DateTime.UtcNow;
        _inviteTokenRepo.Update(invite);

        await _unitOfWork.CommitAsync();

        var response = new RedeemInviteResponseDto
        {
            EnrollmentId = enrollment.Id,
            CourseId = invite.CourseId,
            CourseTitle = invite.Course?.Title ?? "Curso TeacherTech",
            Status = enrollment.Status,
            GrantedVia = enrollment.GrantedVia,
            EnrolledAt = enrollment.CreatedAt
        };

        return ServiceResult<RedeemInviteResponseDto>.Ok(response);
    }

    public async Task<ServiceResult<ProfessorDashboardDto>> GetProfessorDashboardAsync(string professorId)
    {
        if (string.IsNullOrWhiteSpace(professorId))
            return ServiceResult<ProfessorDashboardDto>.Fail("Professor não informado.", 400);

        // 1. Cursos do professor
        var courses = await _courseRepo.GetByProfessorIdAsync(professorId);
        int publishedCoursesCount = courses.Count(c => c.Status == "PUBLISHED");

        // 2. Alunos ativos únicos
        var allEnrollments = new List<Enrollment>();
        foreach (var c in courses)
        {
            var enr = await _enrollmentRepo.GetByCourseIdWithStudentAsync(c.Id);
            allEnrollments.AddRange(enr.Where(e => e.Status == EnrollmentStatus.Active));
        }
        int totalActiveStudents = allEnrollments.Select(e => e.StudentId).Distinct().Count();

        // 3. Taxa de acerto média calculada a partir de StudentProgress
        int totalAnswered = 0;
        int totalCorrect = 0;
        foreach (var c in courses)
        {
            var progress = await _progressRepo.GetProgressByCourseAsync(c.Id);
            totalAnswered += progress.Count;
            totalCorrect += progress.Count(p => p.IsCorrect);
        }
        double avgCompletion = totalAnswered > 0 ? Math.Round((double)totalCorrect / totalAnswered * 100, 1) : 0.0;

        // 4. Convites pendentes e lista
        var tokens = await _inviteTokenRepo.GetByProfessorIdAsync(professorId);
        int pendingInvitesCount = tokens.Count(t => 
            (!t.ExpiresAt.HasValue || t.ExpiresAt.Value >= DateTime.UtcNow) && 
            (!t.MaxUses.HasValue || t.UsedCount < t.MaxUses.Value));

        var inviteDtos = tokens.Select(t =>
        {
            string status = "Ativo";
            if (t.ExpiresAt.HasValue && t.ExpiresAt.Value < DateTime.UtcNow)
                status = "Expirado";
            else if (t.MaxUses.HasValue && t.UsedCount >= t.MaxUses.Value)
                status = "Esgotado";

            return new ProfessorInviteItemDto
            {
                Id = t.Id,
                Token = t.Token,
                CourseId = t.CourseId,
                CourseTitle = t.Course?.Title ?? "Curso",
                Channel = t.Channel.ToString(),
                TargetPhone = t.TargetPhone,
                UsedCount = t.UsedCount,
                MaxUses = t.MaxUses ?? 10,
                ExpiresAt = t.ExpiresAt,
                Status = status,
                CreatedAt = t.CreatedAt
            };
        }).ToList();

        // 5. Assinatura Asaas do professor
        var sub = await _subscriptionRepo.GetByProfessorIdAsync(professorId);
        ProfessorSubscriptionSummaryDto? subDto = null;
        if (sub != null)
        {
            subDto = new ProfessorSubscriptionSummaryDto
            {
                PlanType = sub.PlanType,
                Status = sub.Status,
                Price = sub.Price,
                CurrentPeriodEnd = sub.CurrentPeriodEnd,
                MaxCoursesAllowed = sub.MaxCoursesAllowed,
                AiCreditsLimit = sub.AiCreditsLimit,
                AiCreditsUsed = sub.AiCreditsUsed
            };
        }

        var dashboard = new ProfessorDashboardDto
        {
            TotalActiveStudents = totalActiveStudents,
            PublishedCoursesCount = publishedCoursesCount,
            AverageCompletionRate = avgCompletion,
            PendingInvitesCount = pendingInvitesCount,
            Subscription = subDto,
            Invites = inviteDtos
        };

        return ServiceResult<ProfessorDashboardDto>.Ok(dashboard);
    }

    private static string GenerateNanoid(int length = 8)
    {
        var chars = new char[length];
        for (int i = 0; i < length; i++)
        {
            chars[i] = NanoidAlphabet[RandomNumberGenerator.GetInt32(NanoidAlphabet.Length)];
        }
        return new string(chars);
    }

    private static string GenerateQrCodeBase64(string payload)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(20);
        return "data:image/png;base64," + Convert.ToBase64String(qrCodeBytes);
    }
}
