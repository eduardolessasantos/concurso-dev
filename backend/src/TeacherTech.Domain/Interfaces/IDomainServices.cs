using TeacherTech.Domain.Entities;

namespace TeacherTech.Domain.Interfaces;

public interface IAiService
{
    Task<string> GenerateSummaryAsync(string topicTitle, string subjectName, string examBoard);
    Task<List<(string Front, string Back)>> GenerateFlashcardsAsync(string topicTitle, int count);
    Task<List<(string Statement, List<string> Options, int CorrectIndex, string Explanation)>> GenerateQuestionsAsync(string topicTitle, string examBoard, int count);
}
