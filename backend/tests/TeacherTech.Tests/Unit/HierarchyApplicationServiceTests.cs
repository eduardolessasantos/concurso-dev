using FluentAssertions;
using NSubstitute;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Services;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;
using Xunit;

namespace TeacherTech.Tests.Unit;

public class HierarchyApplicationServiceTests
{
    private readonly ICourseRepository _courseRepo = Substitute.For<ICourseRepository>();
    private readonly ISubjectRepository _subjectRepo = Substitute.For<ISubjectRepository>();
    private readonly ITopicRepository _topicRepo = Substitute.For<ITopicRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    [Fact]
    public async Task CreateSubjectAsync_WhenCourseDoesNotExist_ReturnsNotFound404()
    {
        // Arrange
        var service = new SubjectApplicationService(_subjectRepo, _courseRepo, _unitOfWork);
        var courseId = Guid.NewGuid();
        _courseRepo.GetByIdAsync(courseId).Returns((CourseStudyPlan?)null);

        var dto = new CreateSubjectDto
        {
            CourseId = courseId,
            Name = "Arquitetura de Software",
            Description = "Padrões DDD e Clean Architecture"
        };

        // Act
        var result = await service.CreateSubjectAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.StatusCode.Should().Be(404);
        result.ErrorMessage.Should().Be("Curso não encontrado.");
        await _subjectRepo.DidNotReceive().AddAsync(Arg.Any<Subject>());
    }

    [Fact]
    public async Task CreateSubjectAsync_WhenCourseExists_CreatesSubjectLinkedToCourse()
    {
        // Arrange
        var service = new SubjectApplicationService(_subjectRepo, _courseRepo, _unitOfWork);
        var courseId = Guid.NewGuid();
        var course = new CourseStudyPlan { Id = courseId, Title = "Curso Dataprev" };
        _courseRepo.GetByIdAsync(courseId).Returns(course);
        _subjectRepo.CountByCourseIdAsync(courseId).Returns(2);

        var dto = new CreateSubjectDto
        {
            CourseId = courseId,
            Name = "Engenharia de Dados",
            Description = "Pipelines e ETL"
        };

        // Act
        var result = await service.CreateSubjectAsync(dto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.CourseId.Should().Be(courseId);
        result.Data.Name.Should().Be("Engenharia de Dados");
        result.Data.OrderIndex.Should().Be(3);

        await _subjectRepo.Received(1).AddAsync(Arg.Is<Subject>(s => s.CourseId == courseId && s.Name == "Engenharia de Dados"));
        await _unitOfWork.Received(1).CommitAsync();
    }

    [Fact]
    public async Task CreateTopicAsync_WhenSubjectDoesNotExist_ReturnsNotFound404()
    {
        // Arrange
        var service = new TopicApplicationService(_topicRepo, _subjectRepo, _unitOfWork);
        var subjectId = Guid.NewGuid();
        _subjectRepo.GetByIdAsync(subjectId).Returns((Subject?)null);

        var dto = new CreateTopicDto
        {
            SubjectId = subjectId,
            Title = "Modelagem Relacional",
            ExamBoard = "FGV"
        };

        // Act
        var result = await service.CreateTopicAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.StatusCode.Should().Be(404);
        result.ErrorMessage.Should().Be("Disciplina não encontrada.");
        await _topicRepo.DidNotReceive().AddAsync(Arg.Any<Topic>());
    }

    [Fact]
    public async Task CreateTopicAsync_WhenSubjectExists_CreatesTopicLinkedToSubject()
    {
        // Arrange
        var service = new TopicApplicationService(_topicRepo, _subjectRepo, _unitOfWork);
        var subjectId = Guid.NewGuid();
        var subject = new Subject { Id = subjectId, Name = "Banco de Dados" };
        _subjectRepo.GetByIdAsync(subjectId).Returns(subject);
        _topicRepo.CountBySubjectIdAsync(subjectId).Returns(4);

        var dto = new CreateTopicDto
        {
            SubjectId = subjectId,
            Title = "Normalização 1FN, 2FN e 3FN",
            ExamBoard = "Cespe"
        };

        // Act
        var result = await service.CreateTopicAsync(dto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.SubjectId.Should().Be(subjectId);
        result.Data.Title.Should().Be("Normalização 1FN, 2FN e 3FN");
        result.Data.OrderIndex.Should().Be(5);

        await _topicRepo.Received(1).AddAsync(Arg.Is<Topic>(t => t.SubjectId == subjectId && t.Title == "Normalização 1FN, 2FN e 3FN"));
        await _unitOfWork.Received(1).CommitAsync();
    }
}
