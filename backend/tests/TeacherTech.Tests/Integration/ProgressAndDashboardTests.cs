using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;
using Xunit;

namespace TeacherTech.Tests.Integration;

public class ProgressAndDashboardTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ProgressAndDashboardTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task RecordAnswer_And_GetMyProgress_ReturnsAccurateMetrics()
    {
        // Arrange
        var profEmail = $"prof_prog_{Guid.NewGuid():N}@teachertech.com";
        var (_, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(profEmail);

        var studentEmail = $"stud_prog_{Guid.NewGuid():N}@teachertech.com";
        var (studentClient, studentAuth) = await _factory.CreateAndAuthenticateStudentAsync(studentEmail);

        Guid courseId;
        Guid topicId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var course = new CourseStudyPlan
            {
                ProfessorId = profAuth.UserId,
                Title = "Engenharia de Dados e ETL",
                Status = "PUBLISHED"
            };
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();
            courseId = course.Id;

            var subject = new Subject
            {
                CourseId = course.Id,
                Name = "Pipelines de Dados"
            };
            db.Subjects.Add(subject);
            await db.SaveChangesAsync();

            var topic = new Topic
            {
                SubjectId = subject.Id,
                Title = "Apache Airflow e DAGs"
            };
            db.Topics.Add(topic);
            await db.SaveChangesAsync();
            topicId = topic.Id;
        }

        // Act 1: Student records two answers (1 correct, 1 incorrect)
        var ans1 = new RecordAnswerRequestDto
        {
            TopicId = topicId,
            IsCorrect = true,
            TimeSpentSeconds = 45
        };
        var res1 = await studentClient.PostAsJsonAsync("/api/progress/answer", ans1);
        res1.StatusCode.Should().Be(HttpStatusCode.OK);

        var ans2 = new RecordAnswerRequestDto
        {
            TopicId = topicId,
            IsCorrect = false,
            TimeSpentSeconds = 30
        };
        var res2 = await studentClient.PostAsJsonAsync("/api/progress/answer", ans2);
        res2.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act 2: Get my progress
        var progRes = await studentClient.GetAsync($"/api/progress/my-progress/{courseId}");
        progRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var prog = await progRes.Content.ReadFromJsonAsync<CourseProgressDto>();
        prog.Should().NotBeNull();
        prog!.CourseId.Should().Be(courseId);
        prog.TotalQuestionsAnswered.Should().Be(2);
        prog.TotalCorrectAnswers.Should().Be(1);
        prog.AccuracyPercentage.Should().Be(50.0);
        prog.Answers.Should().HaveCount(2);

        // Verify Database
        using (var verifyScope = _factory.Services.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var count = await db.StudentProgresses.CountAsync(sp => sp.StudentId == studentAuth.UserId);
            count.Should().Be(2);
        }
    }

    [Fact]
    public async Task GetProfessorDashboard_ReturnsB2BMetricsAndInvites()
    {
        // Arrange
        var profEmail = $"prof_dash_{Guid.NewGuid():N}@teachertech.com";
        var (profClient, profAuth) = await _factory.CreateAndAuthenticateProfessorAsync(profEmail);

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var course = new CourseStudyPlan
            {
                ProfessorId = profAuth.UserId,
                Title = "DevOps e Kubernetes",
                Status = "PUBLISHED"
            };
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();

            // Create an invite token
            db.InviteTokens.Add(new InviteToken
            {
                CourseId = course.Id,
                Token = $"tkn_{Guid.NewGuid():N}"[..8],
                CreatedByProfessorId = profAuth.UserId,
                Channel = InviteChannel.WhatsApp,
                TargetPhone = "11999998888",
                MaxUses = 10,
                UsedCount = 2,
                ExpiresAt = DateTime.UtcNow.AddDays(5)
            });
            await db.SaveChangesAsync();
        }

        // Act: Professor calls dashboard endpoint
        var response = await profClient.GetAsync("/api/invites/dashboard");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dash = await response.Content.ReadFromJsonAsync<ProfessorDashboardDto>();
        dash.Should().NotBeNull();
        dash!.PublishedCoursesCount.Should().BeGreaterThanOrEqualTo(1);
        dash.PendingInvitesCount.Should().BeGreaterThanOrEqualTo(1);
        dash.Invites.Should().NotBeEmpty();
        dash.Subscription.Should().NotBeNull();
        dash.Subscription!.Status.Should().Be(SubscriptionStatus.Active);
    }
}
