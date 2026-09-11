using Microsoft.Extensions.Logging;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Application.Services;

public class ProgressService : IProgressService
{
    private readonly IStudentProgressRepository _progressRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly ITopicRepository _topicRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProgressService> _logger;

    public ProgressService(
        IStudentProgressRepository progressRepo,
        ICourseRepository courseRepo,
        ITopicRepository topicRepo,
        IUnitOfWork unitOfWork,
        ILogger<ProgressService> logger)
    {
        _progressRepo = progressRepo;
        _courseRepo = courseRepo;
        _topicRepo = topicRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ServiceResult<bool>> RecordAnswerAsync(string studentId, RecordAnswerRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return ServiceResult<bool>.Fail("Estudante não identificado.", 401);

        if (dto.TopicId == Guid.Empty)
            return ServiceResult<bool>.Fail("Tópico é obrigatório.", 400);

        var topic = await _topicRepo.GetByIdAsync(dto.TopicId);
        if (topic == null)
            return ServiceResult<bool>.Fail("Tópico não encontrado.", 404);

        var progress = new StudentProgress
        {
            StudentId = studentId,
            TopicId = dto.TopicId,
            QuestionId = dto.QuestionId,
            IsCorrect = dto.IsCorrect,
            TimeSpentSeconds = Math.Max(0, dto.TimeSpentSeconds),
            AnsweredAt = DateTime.UtcNow
        };

        await _progressRepo.AddAsync(progress);
        await _unitOfWork.CommitAsync();

        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<CourseProgressDto>> GetMyProgressByCourseAsync(string studentId, Guid courseId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return ServiceResult<CourseProgressDto>.Fail("Estudante não identificado.", 401);

        if (courseId == Guid.Empty)
            return ServiceResult<CourseProgressDto>.Fail("Curso não informado.", 400);

        var course = await _courseRepo.GetByIdAsync(courseId);
        if (course == null)
            return ServiceResult<CourseProgressDto>.Fail("Curso não encontrado.", 404);

        var progresses = await _progressRepo.GetProgressByCourseAsync(courseId, studentId);

        int totalAnswered = progresses.Count;
        int totalCorrect = progresses.Count(p => p.IsCorrect);
        double accuracy = totalAnswered > 0 ? Math.Round((double)totalCorrect / totalAnswered * 100, 1) : 0.0;

        var answers = progresses.Select(p => new StudentAnswerDto
        {
            Id = p.Id,
            TopicId = p.TopicId,
            QuestionId = p.QuestionId,
            IsCorrect = p.IsCorrect,
            TimeSpentSeconds = p.TimeSpentSeconds,
            AnsweredAt = p.AnsweredAt
        }).ToList();

        var result = new CourseProgressDto
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            TotalQuestionsAnswered = totalAnswered,
            TotalCorrectAnswers = totalCorrect,
            AccuracyPercentage = accuracy,
            Answers = answers
        };

        return ServiceResult<CourseProgressDto>.Ok(result);
    }
}
