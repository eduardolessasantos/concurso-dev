using FluentAssertions;
using NSubstitute;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Services;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;
using Xunit;

namespace TeacherTech.Tests.Unit;

public class PaymentApplicationServiceTests
{
    private readonly ITransactionRepository _transactionRepo = Substitute.For<ITransactionRepository>();
    private readonly ICourseRepository _courseRepo = Substitute.For<ICourseRepository>();
    private readonly IEnrollmentRepository _enrollmentRepo = Substitute.For<IEnrollmentRepository>();
    private readonly IProfessorProfileRepository _professorProfileRepo = Substitute.For<IProfessorProfileRepository>();
    private readonly IPaymentDomainService _paymentDomainService = Substitute.For<IPaymentDomainService>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly PaymentApplicationService _service;

    public PaymentApplicationServiceTests()
    {
        _service = new PaymentApplicationService(
            _transactionRepo,
            _courseRepo,
            _enrollmentRepo,
            _professorProfileRepo,
            _paymentDomainService,
            _unitOfWork);
    }

    [Fact]
    public async Task CreateCheckoutAsync_WhenCourseExists_CreatesTransactionAndReturnsPixCheckout()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var courseId = Guid.NewGuid();
        var course = new CourseStudyPlan
        {
            Id = courseId,
            Title = "Trilha Dataprev",
            Price = 100.00m
        };

        _courseRepo.GetByIdAsync(courseId).Returns(course);
        _paymentDomainService.CalculateSplit(100.00m).Returns((100.00m, 10.00m, 90.00m));
        _paymentDomainService.GeneratePixPayload(Arg.Any<Guid>(), 100.00m).Returns("PIX_CODE_MOCK");

        var dto = new CreateCheckoutDto { CourseId = courseId, PaymentMethod = "PIX" };

        // Act
        var result = await _service.CreateCheckoutAsync(userId, dto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Amount.Should().Be(100.00m);
        result.Data.PlatformFee.Should().Be(10.00m);
        result.Data.ProfessorRevenue.Should().Be(90.00m);
        result.Data.PixQrCodeCode.Should().Be("PIX_CODE_MOCK");

        await _transactionRepo.Received(1).AddAsync(Arg.Is<Transaction>(t =>
            t.UserId == userId &&
            t.CourseId == courseId &&
            t.Amount == 100.00m &&
            t.PlatformFee == 10.00m &&
            t.ProfessorRevenue == 90.00m));

        await _unitOfWork.Received(1).CommitAsync();
    }

    [Fact]
    public async Task CreateCheckoutAsync_WhenCourseNotFound_ReturnsFail404()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var courseId = Guid.NewGuid();

        _courseRepo.GetByIdAsync(courseId).Returns((CourseStudyPlan?)null);

        var dto = new CreateCheckoutDto { CourseId = courseId };

        // Act
        var result = await _service.CreateCheckoutAsync(userId, dto);

        // Assert
        result.Success.Should().BeFalse();
        result.StatusCode.Should().Be(404);
        result.ErrorMessage.Should().Be("Curso não encontrado.");
    }
}
