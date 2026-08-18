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

public class TeacherCourseManagementTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TeacherCourseManagementTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMyCourses_ReturnsOnlyCoursesCreatedByAuthenticatedProfessor()
    {
        // Arrange: Create Professor A with 2 courses and Professor B with 1 course
        var (clientA, authA) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_a_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Alpha");
        var (clientB, authB) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_b_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Beta");

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.CourseStudyPlans.AddRange(
                new CourseStudyPlan { ProfessorId = authA.UserId, Title = "Curso Alpha 1", Category = "TI", IsPublic = true, Status = "PUBLISHED" },
                new CourseStudyPlan { ProfessorId = authA.UserId, Title = "Curso Alpha 2", Category = "TI", IsPublic = true, Status = "PUBLISHED" },
                new CourseStudyPlan { ProfessorId = authB.UserId, Title = "Curso Beta 1", Category = "Direito", IsPublic = true, Status = "PUBLISHED" }
            );
            await db.SaveChangesAsync();
        }

        // Act
        var responseA = await clientA.GetAsync("/api/courses/my-courses");
        var responseB = await clientB.GetAsync("/api/courses/my-courses");

        // Assert
        responseA.StatusCode.Should().Be(HttpStatusCode.OK);
        var coursesA = await responseA.Content.ReadFromJsonAsync<List<CourseResponseDto>>();
        coursesA.Should().NotBeNull();
        coursesA!.All(c => c.ProfessorId == authA.UserId).Should().BeTrue();
        coursesA!.Count(c => c.Title.StartsWith("Curso Alpha")).Should().Be(2);

        responseB.StatusCode.Should().Be(HttpStatusCode.OK);
        var coursesB = await responseB.Content.ReadFromJsonAsync<List<CourseResponseDto>>();
        coursesB.Should().NotBeNull();
        coursesB!.All(c => c.ProfessorId == authB.UserId).Should().BeTrue();
        coursesB!.Count(c => c.Title.StartsWith("Curso Beta")).Should().Be(1);
    }

    [Fact]
    public async Task GetCourseById_ReturnsCompleteCourseHierarchy()
    {
        // Arrange
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_detail_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Detalhes");

        Guid courseId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var course = new CourseStudyPlan
            {
                ProfessorId = auth.UserId,
                Title = "Arquitetura em Nuvem AWS & Azure",
                Description = "Trilha completa de computação em nuvem para certames",
                Category = "Infraestrutura",
                Price = 99.90m,
                IsPublic = true,
                Status = "PUBLISHED"
            };
            db.CourseStudyPlans.Add(course);
            await db.SaveChangesAsync();
            courseId = course.Id;

            var subject = new Subject
            {
                CourseId = course.Id,
                Name = "Computação em Nuvem",
                OrderIndex = 1
            };
            db.Subjects.Add(subject);
            await db.SaveChangesAsync();

            var topic = new Topic
            {
                SubjectId = subject.Id,
                Title = "Modelos IaaS, PaaS, SaaS e Serverless",
                OrderIndex = 1
            };
            db.Topics.Add(topic);
            await db.SaveChangesAsync();
        }

        // Act
        var response = await client.GetAsync($"/api/courses/{courseId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var courseDetail = await response.Content.ReadFromJsonAsync<CourseStudyPlan>();
        courseDetail.Should().NotBeNull();
        courseDetail!.Id.Should().Be(courseId);
        courseDetail.Title.Should().Be("Arquitetura em Nuvem AWS & Azure");
        courseDetail.Subjects.Should().HaveCount(1);
        courseDetail.Subjects.First().Topics.Should().HaveCount(1);
        courseDetail.Subjects.First().Topics.First().Title.Should().Be("Modelos IaaS, PaaS, SaaS e Serverless");
    }

    [Fact]
    public async Task GetPublicCourses_ReturnsOnlyPublishedAndPublicCourses()
    {
        // Arrange
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(
            $"prof_pub_{Guid.NewGuid():N}@teachertech.com", "Pass123!", "Prof. Publicador");

        var publicCourseTitle = $"Curso Público Teste {Guid.NewGuid():N}";
        var privateCourseTitle = $"Curso Privado Teste {Guid.NewGuid():N}";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.CourseStudyPlans.AddRange(
                new CourseStudyPlan
                {
                    ProfessorId = auth.UserId,
                    Title = publicCourseTitle,
                    IsPublic = true,
                    Status = "PUBLISHED"
                },
                new CourseStudyPlan
                {
                    ProfessorId = auth.UserId,
                    Title = privateCourseTitle,
                    IsPublic = false,
                    Status = "PUBLISHED"
                }
            );
            await db.SaveChangesAsync();
        }

        // Act
        var anonymousClient = _factory.CreateClient();
        var response = await anonymousClient.GetAsync("/api/courses/public");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var publicCourses = await response.Content.ReadFromJsonAsync<List<CourseResponseDto>>();
        publicCourses.Should().NotBeNull();
        publicCourses!.Any(c => c.Title == publicCourseTitle).Should().BeTrue();
        publicCourses!.Any(c => c.Title == privateCourseTitle).Should().BeFalse();
    }
}
