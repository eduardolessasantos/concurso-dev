using System.Net.Http.Json;
using System.Text.Json;
using TeacherTech.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TeacherTech.Infrastructure.Services;

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public AiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
    }

    public async Task<string> GenerateSummaryAsync(string topicTitle, string subjectName, string examBoard)
    {
        var prompt = $"Atue como um Professor Especialista em Concursos Públicos da banca {examBoard}. Escreva um resumo didático, direto ao ponto e em formato Markdown sobre o tópico '{topicTitle}' da disciplina '{subjectName}'. Inclua: 1) Conceitos Chave, 2) O que a banca {examBoard} mais cobra em prova, 3) Pegadinhas Frequentes.";

        var response = await CallGeminiApiAsync(prompt);
        return response ?? $"### Resumo Didático: {topicTitle}\n\nConteúdo teórico focado na banca {examBoard}. Os principais pontos de atenção nesta disciplina de {subjectName} incluem a memorização de conceitos fundamentais e a prática constante com questões de certames anteriores.";
    }

    public async Task<List<(string Front, string Back)>> GenerateFlashcardsAsync(string topicTitle, int count)
    {
        var prompt = $"Gere {count} flashcards de memorização em formato JSON sobre o tópico '{topicTitle}'. Retorne estritamente um array JSON com objetos contendo 'front' e 'back'. Exemplo: [{{\"front\":\"...\",\"back\":\"...\"}}]";

        var responseText = await CallGeminiApiAsync(prompt);
        var flashcards = new List<(string Front, string Back)>();

        if (!string.IsNullOrWhiteSpace(responseText))
        {
            try
            {
                var cleanJson = ExtractJson(responseText);
                using var doc = JsonDocument.Parse(cleanJson);
                foreach (var elem in doc.RootElement.EnumerateArray())
                {
                    var front = elem.GetProperty("front").GetString() ?? "";
                    var back = elem.GetProperty("back").GetString() ?? "";
                    flashcards.Add((front, back));
                }
            }
            catch {}
        }

        if (flashcards.Count == 0)
        {
            flashcards.Add(($"O que é {topicTitle}?", $"Definição e aplicação prática de {topicTitle} no contexto de provas e certames públicos."));
            flashcards.Add(($"Qual a principal pegadinha sobre {topicTitle}?", $"Confundir os conceitos fundamentais do tópico com terminologias similares cobradas pelas bancas."));
        }

        return flashcards;
    }

    public async Task<List<(string Statement, List<string> Options, int CorrectIndex, string Explanation)>> GenerateQuestionsAsync(string topicTitle, string examBoard, int count)
    {
        var prompt = $"Crie {count} questões de múltipla escolha inéditas no estilo da banca {examBoard} sobre '{topicTitle}'. Retorne estritamente um array JSON com objetos: {{\x22statement\x22:\x22...\x22, \x22options\x22:[\x22A\x22,\x22B\x22,\x22C\x22,\x22D\x22], \x22correctIndex\x22:0, \x22explanation\x22:\x22...\x22}}";

        var responseText = await CallGeminiApiAsync(prompt);
        var questions = new List<(string Statement, List<string> Options, int CorrectIndex, string Explanation)>();

        if (!string.IsNullOrWhiteSpace(responseText))
        {
            try
            {
                var cleanJson = ExtractJson(responseText);
                using var doc = JsonDocument.Parse(cleanJson);
                foreach (var elem in doc.RootElement.EnumerateArray())
                {
                    var statement = elem.GetProperty("statement").GetString() ?? "";
                    var options = new List<string>();
                    foreach (var opt in elem.GetProperty("options").EnumerateArray())
                    {
                        options.Add(opt.GetString() ?? "");
                    }
                    var correctIndex = elem.GetProperty("correctIndex").GetInt32();
                    var explanation = elem.GetProperty("explanation").GetString() ?? "";

                    questions.Add((statement, options, correctIndex, explanation));
                }
            }
            catch {}
        }

        if (questions.Count == 0)
        {
            questions.Add((
                $"Em relação a {topicTitle}, assinale a alternativa correta de acordo com a banca {examBoard}:",
                new List<string> { "Trata-se de um conceito fundamental amplamente cobrado.", "É uma definição obsoleta não utilizada na prática.", "Aplica-se exclusivamente a ambientes de testes.", "Nenhuma das alternativas." },
                0,
                $"Gabarito A: O tópico {topicTitle} é uma matéria de alta relevância no edital."
            ));
        }

        return questions;
    }

    private async Task<string?> CallGeminiApiAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(_apiKey)) return null;

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);
            if (!response.IsSuccessStatusCode) return null;

            var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>();
            var candidateText = jsonResult
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return candidateText;
        }
        catch
        {
            return null;
        }
    }

    private string ExtractJson(string text)
    {
        var startIndex = text.IndexOf('[');
        var endIndex = text.LastIndexOf(']');
        if (startIndex >= 0 && endIndex > startIndex)
        {
            return text.Substring(startIndex, endIndex - startIndex + 1);
        }
        return text;
    }
}
