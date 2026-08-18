using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TeacherTech.Application.DTOs;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;
using Xunit;

namespace TeacherTech.Tests.Integration;

public class TeacherStudyContentGenerationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TeacherStudyContentGenerationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GenerateSummary_DeductsCredit_AndUpdatesTopicContent()
    {
        // Arrange: Authenticate Professor and create Course, Subject, Topic
        var email = $"prof_ai_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Alan Turing");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var course = new CourseStudyPlan
        {
            ProfessorId = auth.UserId,
            Title = "Banco de Dados para Dataprev",
            Description = "Preparatório focado em TI",
            Category = "TI",
            IsPublic = true,
            Status = "PUBLISHED"
        };
        db.CourseStudyPlans.Add(course);
        await db.SaveChangesAsync();

        var subject = new Subject
        {
            CourseId = course.Id,
            Name = "Modelagem Relacional",
            Description = "Conceitos de BD relacional",
            OrderIndex = 1
        };
        db.Subjects.Add(subject);
        await db.SaveChangesAsync();

        var topic = new Topic
        {
            SubjectId = subject.Id,
            Title = "Normalização de Dados (1FN, 2FN, 3FN)",
            ExamBoard = "FGV",
            OrderIndex = 1
        };
        db.Topics.Add(topic);
        await db.SaveChangesAsync();

        var aiDto = new GenerateAiContentDto
        {
            TopicId = topic.Id,
            TopicTitle = topic.Title,
            SubjectName = subject.Name,
            ExamBoard = "FGV"
        };

        // Act: Generate summary via AI endpoint
        var response = await client.PostAsJsonAsync("/api/ai/generate-summary", aiDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        var summary = result.GetProperty("summaryMarkdown").GetString();
        summary.Should().NotBeNullOrWhiteSpace();
        summary.Should().Contain("Normalização de Dados");

        // Verify Topic was updated with generated Markdown
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var updatedTopic = await verifyDb.Topics.FindAsync(topic.Id);
        updatedTopic.Should().NotBeNull();
        updatedTopic!.ContentMarkdown.Should().Be(summary);

        // Verify Professor AI credit was deducted (AiCreditsUsed = 1)
        var profile = await verifyDb.ProfessorProfiles.FirstOrDefaultAsync(p => p.UserId == auth.UserId);
        profile.Should().NotBeNull();
        profile!.AiCreditsUsed.Should().Be(1);
    }

    [Fact]
    public async Task GenerateFlashcards_DeductsCredit_AndSavesFlashcardsToTopic()
    {
        // Arrange
        var email = $"prof_cards_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Claude Shannon");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var course = new CourseStudyPlan { ProfessorId = auth.UserId, Title = "Engenharia de Software" };
        db.CourseStudyPlans.Add(course);
        await db.SaveChangesAsync();

        var subject = new Subject { CourseId = course.Id, Name = "Arquitetura de Software" };
        db.Subjects.Add(subject);
        await db.SaveChangesAsync();

        var topic = new Topic { SubjectId = subject.Id, Title = "Microsserviços vs Monólito", ExamBoard = "CESPE" };
        db.Topics.Add(topic);
        await db.SaveChangesAsync();

        var aiDto = new GenerateAiContentDto
        {
            TopicId = topic.Id,
            TopicTitle = topic.Title,
            SubjectName = subject.Name,
            ExamBoard = "CESPE"
        };

        // Act: Generate flashcards
        var response = await client.PostAsJsonAsync("/api/ai/generate-flashcards", aiDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var flashcards = await response.Content.ReadFromJsonAsync<List<JsonElement>>();
        flashcards.Should().NotBeNull();
        flashcards.Should().NotBeEmpty();

        // Verify Flashcards saved in database for this topic
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCards = await verifyDb.Flashcards.Where(f => f.TopicId == topic.Id).ToListAsync();
        savedCards.Should().NotBeEmpty();
        savedCards.Count.Should().Be(flashcards!.Count);

        // Verify AI Credit deducted
        var profile = await verifyDb.ProfessorProfiles.FirstOrDefaultAsync(p => p.UserId == auth.UserId);
        profile!.AiCreditsUsed.Should().Be(1);
    }

    [Fact]
    public async Task GenerateQuestions_DeductsCredit_AndSavesQuestionsToTopic()
    {
        // Arrange
        var email = $"prof_quest_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Ada Lovelace");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var course = new CourseStudyPlan { ProfessorId = auth.UserId, Title = "Segurança da Informação" };
        db.CourseStudyPlans.Add(course);
        await db.SaveChangesAsync();

        var subject = new Subject { CourseId = course.Id, Name = "Criptografia" };
        db.Subjects.Add(subject);
        await db.SaveChangesAsync();

        var topic = new Topic { SubjectId = subject.Id, Title = "Criptografia Simétrica vs Assimétrica", ExamBoard = "FGV" };
        db.Topics.Add(topic);
        await db.SaveChangesAsync();

        var aiDto = new GenerateAiContentDto
        {
            TopicId = topic.Id,
            TopicTitle = topic.Title,
            SubjectName = subject.Name,
            ExamBoard = "FGV"
        };

        // Act: Generate questions
        var response = await client.PostAsJsonAsync("/api/ai/generate-questions", aiDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var questions = await response.Content.ReadFromJsonAsync<List<JsonElement>>();
        questions.Should().NotBeNull();
        questions.Should().NotBeEmpty();

        // Verify Questions saved in DB
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedQuestions = await verifyDb.Questions.Where(q => q.TopicId == topic.Id).ToListAsync();
        savedQuestions.Should().NotBeEmpty();
        savedQuestions.Count.Should().Be(questions!.Count);

        var firstQ = savedQuestions.First();
        firstQ.Statement.Should().NotBeNullOrWhiteSpace();
        firstQ.OptionsJson.Should().NotBeNullOrWhiteSpace();
        firstQ.Explanation.Should().NotBeNullOrWhiteSpace();
        firstQ.ExamBoard.Should().Be("FGV");

        // Verify AI Credit deducted
        var profile = await verifyDb.ProfessorProfiles.FirstOrDefaultAsync(p => p.UserId == auth.UserId);
        profile!.AiCreditsUsed.Should().Be(1);
    }

    [Fact]
    public async Task AiEndpoints_WhenCreditsExhausted_Returns402PaymentRequired()
    {
        // Arrange: Exhaust professor credits
        var email = $"prof_broke_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof Sem Creditos");

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var profile = await db.ProfessorProfiles.FirstOrDefaultAsync(p => p.UserId == auth.UserId);
            profile!.AiCreditsUsed = profile.AiCreditsLimit; // Max out credits
            await db.SaveChangesAsync();
        }

        var aiDto = new GenerateAiContentDto
        {
            TopicTitle = "Algoritmos de Ordenação",
            SubjectName = "Estrutura de Dados",
            ExamBoard = "FGV"
        };

        // Act
        var responseSummary = await client.PostAsJsonAsync("/api/ai/generate-summary", aiDto);
        var responseCards = await client.PostAsJsonAsync("/api/ai/generate-flashcards", aiDto);
        var responseQuestions = await client.PostAsJsonAsync("/api/ai/generate-questions", aiDto);

        // Assert: All AI generation attempts must be rejected with 402
        responseSummary.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
        responseCards.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
        responseQuestions.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
    }

    [Fact]
    public async Task PublishStudioContent_CreatesFullHierarchy_CourseSubjectTopicFlashcardsQuestionsScheduleSimulated()
    {
        // Arrange
        var email = $"prof_studio_{Guid.NewGuid():N}@teachertech.com";
        var (client, auth) = await _factory.CreateAndAuthenticateProfessorAsync(email, "Pass123!", "Prof. Donald Knuth");

        var studioDto = new SaveStudioContentDto
        {
            CourseTitle = "Trilha Completa Dataprev 2026 - Engenharia de Software",
            SubjectName = "Arquitetura Limpa e Padrões",
            TopicTitle = "Clean Architecture & DDD",
            ExamBoard = "FGV",
            IsPublic = true,
            ContentMarkdown = "### Clean Architecture\n\nPrincípios da arquitetura limpa com isolamento de domínio e infraestrutura.",
            Flashcards = new List<StudioFlashcardDto>
            {
                new() { FrontText = "O que é Inversão de Dependência (DIP)?", BackText = "Módulos de alto nível não devem depender de módulos de baixo nível.", DifficultyLevel = "EASY" },
                new() { FrontText = "O que é uma Entidade no DDD?", BackText = "Objeto definido por sua identidade contínua ao longo do tempo.", DifficultyLevel = "MEDIUM" }
            },
            Questions = new List<StudioQuestionDto>
            {
                new()
                {
                    Statement = "No contexto do DDD, o que define um Value Object?",
                    Options = new List<string> { "Sua identidade única", "Seus atributos imutáveis", "Sua tabela no banco", "Nenhuma das anteriores" },
                    CorrectOptionIndex = 1,
                    Explanation = "Gabarito B: Value Objects são identificados exclusivamente por seus atributos.",
                    ExamBoard = "FGV"
                }
            },
            Schedule = new StudioScheduleDto
            {
                DayOfWeek = "Terça-feira",
                GoalMinutes = 90,
                Notes = "Estudo teórico e resolução de 10 questões."
            },
            Simulated = new StudioSimulatedDto
            {
                Title = "Simulado Express - Arquitetura de Software",
                TimeLimitMinutes = 45
            }
        };

        // Act: Publish full content via Studio endpoint
        var response = await client.PostAsJsonAsync("/api/courses/studio-publish", studioDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SaveStudioResponseDto>();
        result.Should().NotBeNull();
        result!.CourseId.Should().NotBeEmpty();
        result.SubjectId.Should().NotBeEmpty();
        result.TopicId.Should().NotBeEmpty();
        result.SimulatedTestId.Should().NotBeNull();
        result.FlashcardsSavedCount.Should().Be(2);
        result.QuestionsSavedCount.Should().Be(1);

        // Verify Database Persistence
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var course = await verifyDb.CourseStudyPlans
            .Include(c => c.Subjects)
                .ThenInclude(s => s.Topics)
                    .ThenInclude(t => t.Flashcards)
            .Include(c => c.Subjects)
                .ThenInclude(s => s.Topics)
                    .ThenInclude(t => t.Questions)
            .Include(c => c.StudySchedules)
            .Include(c => c.SimulatedTests)
                .ThenInclude(st => st.Questions)
            .FirstOrDefaultAsync(c => c.Id == result.CourseId);

        course.Should().NotBeNull();
        course!.ProfessorId.Should().Be(auth.UserId);
        course.Title.Should().Be("Trilha Completa Dataprev 2026 - Engenharia de Software");
        
        course.Subjects.Should().HaveCount(1);
        var subject = course.Subjects.First();
        subject.Name.Should().Be("Arquitetura Limpa e Padrões");

        subject.Topics.Should().HaveCount(1);
        var topic = subject.Topics.First();
        topic.Title.Should().Be("Clean Architecture & DDD");
        topic.ContentMarkdown.Should().Contain("### Clean Architecture");
        topic.Flashcards.Should().HaveCount(2);
        topic.Questions.Should().HaveCount(1);

        course.StudySchedules.Should().HaveCount(1);
        course.StudySchedules.First().DayOfWeek.Should().Be("Terça-feira");
        course.StudySchedules.First().GoalMinutes.Should().Be(90);

        course.SimulatedTests.Should().HaveCount(1);
        var sim = course.SimulatedTests.First();
        sim.Title.Should().Be("Simulado Express - Arquitetura de Software");
        sim.Questions.Should().HaveCount(1);
        sim.Questions.First().Statement.Should().Contain("Value Object");
    }

    [Fact]
    public async Task AiEndpoints_WhenAccessedByStudent_ReturnsForbidden()
    {
        // Arrange: Authenticate as Student
        var email = $"student_ai_{Guid.NewGuid():N}@teachertech.com";
        var (client, _) = await _factory.CreateAndAuthenticateStudentAsync(email);

        var aiDto = new GenerateAiContentDto
        {
            TopicTitle = "Git e Controle de Versão",
            SubjectName = "DevOps",
            ExamBoard = "FGV"
        };

        // Act: Student attempts to access teacher AI features
        var response = await client.PostAsJsonAsync("/api/ai/generate-summary", aiDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
