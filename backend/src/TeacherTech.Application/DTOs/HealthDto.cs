namespace TeacherTech.Application.DTOs;

/// <summary>
/// Representa o relatório consolidado de saúde da API e seus serviços dependentes.
/// </summary>
public class HealthResponseDto
{
    /// <summary>
    /// Status geral da aplicação (Healthy, Degraded, Unhealthy).
    /// </summary>
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Timestamp UTC da verificação de saúde.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Tempo decorrido desde a inicialização do processo da API.
    /// </summary>
    public string Uptime { get; set; } = string.Empty;

    /// <summary>
    /// Ambiente de execução da aplicação (Development, Staging, Production, Testing).
    /// </summary>
    public string Environment { get; set; } = string.Empty;

    /// <summary>
    /// Versão do assembly da API TeacherTech.
    /// </summary>
    public string Version { get; set; } = "1.0.0";

    /// <summary>
    /// Duração total da execução de todas as verificações de saúde.
    /// </summary>
    public string TotalDuration { get; set; } = string.Empty;

    /// <summary>
    /// Informações detalhadas sobre a conectividade com o banco de dados.
    /// </summary>
    public HealthCheckDatabaseInfoDto Database { get; set; } = new();

    /// <summary>
    /// Informações do sistema operacional e ambiente de execução .NET.
    /// </summary>
    public HealthCheckSystemInfoDto System { get; set; } = new();

    /// <summary>
    /// Dicionário com o resultado de cada verificação individual (ex: banco de dados, memória, liveness).
    /// </summary>
    public Dictionary<string, HealthCheckItemDto> Entries { get; set; } = new();
}

/// <summary>
/// Informações de integridade e conectividade do banco de dados relacional.
/// </summary>
public class HealthCheckDatabaseInfoDto
{
    /// <summary>
    /// Status da conexão com o banco de dados (Healthy, Degraded, Unhealthy).
    /// </summary>
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Provedor de banco de dados em uso (ex: Pomelo.EntityFrameworkCore.MySql, Microsoft.EntityFrameworkCore.Sqlite).
    /// </summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Indica se a conexão com o banco foi estabelecida com sucesso.
    /// </summary>
    public bool CanConnect { get; set; } = true;

    /// <summary>
    /// Tempo de resposta do teste de conexão em milissegundos.
    /// </summary>
    public double ResponseTimeMs { get; set; }

    /// <summary>
    /// Mensagem de erro caso a conexão tenha falhado.
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Métricas de consumo de recursos e plataforma do servidor de aplicação.
/// </summary>
public class HealthCheckSystemInfoDto
{
    /// <summary>
    /// Memória gerenciada alocada pelo processo em Megabytes (MB).
    /// </summary>
    public double AllocatedMemoryMb { get; set; }

    /// <summary>
    /// Versão do runtime .NET em execução.
    /// </summary>
    public string DotNetVersion { get; set; } = string.Empty;

    /// <summary>
    /// Descrição da plataforma / Sistema Operacional do servidor.
    /// </summary>
    public string OsPlatform { get; set; } = string.Empty;

    /// <summary>
    /// Número de núcleos de processadores lógicos disponíveis.
    /// </summary>
    public int ProcessorCount { get; set; }
}

/// <summary>
/// Resultado detalhado de um item de verificação de saúde específico.
/// </summary>
public class HealthCheckItemDto
{
    /// <summary>
    /// Status do componente verificado.
    /// </summary>
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Descrição textual do resultado ou diagnóstico.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Tempo gasto na execução desta verificação específica.
    /// </summary>
    public string Duration { get; set; } = string.Empty;

    /// <summary>
    /// Dados complementares retornados pelo health check.
    /// </summary>
    public IReadOnlyDictionary<string, object>? Data { get; set; }
}
