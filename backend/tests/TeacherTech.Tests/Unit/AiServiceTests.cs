using FluentAssertions;
using Microsoft.Extensions.Configuration;
using TeacherTech.Infrastructure.Services;
using Xunit;

namespace TeacherTech.Tests.Unit;

public class AiServiceTests
{
    private readonly AiService _aiService;

    public AiServiceTests()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Gemini:ApiKey", "" } // Test resilient fallback behavior
            })
            .Build();

        var httpClient = new HttpClient();
        _aiService = new AiService(httpClient, configuration);
    }

    [Fact]
    public async Task GenerateSummaryAsync_ReturnsFormattedMarkdownWithTopicAndExamBoard()
    {
        // Arrange
        var topicTitle = "Estruturas de Dados: Filas e Pilhas";
        var subjectName = "Ciência da Computação";
        var examBoard = "FGV";

        // Act
        var summary = await _aiService.GenerateSummaryAsync(topicTitle, subjectName, examBoard);

        // Assert
        summary.Should().NotBeNullOrWhiteSpace();
        summary.Should().Contain(topicTitle);
        summary.Should().Contain(examBoard);
        summary.Should().Contain(subjectName);
    }

    [Fact]
    public async Task GenerateFlashcardsAsync_ReturnsListOfFrontAndBackCards()
    {
        // Arrange
        var topicTitle = "Protocolos TCP vs UDP";
        var count = 3;

        // Act
        var flashcards = await _aiService.GenerateFlashcardsAsync(topicTitle, count);

        // Assert
        flashcards.Should().NotBeNull();
        flashcards.Should().NotBeEmpty();
        flashcards.All(f => !string.IsNullOrWhiteSpace(f.Front) && !string.IsNullOrWhiteSpace(f.Back)).Should().BeTrue();
    }

    [Fact]
    public async Task GenerateQuestionsAsync_ReturnsQuestionsWithOptionsAndExplanation()
    {
        // Arrange
        var topicTitle = "Gerenciamento de Memória Virtual";
        var examBoard = "CESPE";
        var count = 2;

        // Act
        var questions = await _aiService.GenerateQuestionsAsync(topicTitle, examBoard, count);

        // Assert
        questions.Should().NotBeNull();
        questions.Should().NotBeEmpty();
        
        var firstQ = questions.First();
        firstQ.Statement.Should().NotBeNullOrWhiteSpace();
        firstQ.Statement.Should().Contain(topicTitle);
        firstQ.Options.Should().HaveCountGreaterThanOrEqualTo(2);
        firstQ.CorrectIndex.Should().BeInRange(0, firstQ.Options.Count - 1);
        firstQ.Explanation.Should().NotBeNullOrWhiteSpace();
    }
}
