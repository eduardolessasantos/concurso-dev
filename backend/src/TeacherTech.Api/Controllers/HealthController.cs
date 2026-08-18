using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using TeacherTech.Application.DTOs;

namespace TeacherTech.Api.Controllers;

/// <summary>
/// Controlador de diagnóstico e verificação de integridade operacional (Health Checks) da API e seus serviços dependentes.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private static readonly DateTime AppStartTimeUtc = DateTime.UtcNow;
    private readonly HealthCheckService _healthCheckService;
    private readonly IWebHostEnvironment _environment;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="HealthController"/>.
    /// </summary>
    public HealthController(
        HealthCheckService healthCheckService,
        IWebHostEnvironment environment)
    {
        _healthCheckService = healthCheckService;
        _environment = environment;
    }

    /// <summary>
    /// Retorna o relatório consolidado de saúde da API, status do banco de dados, telemetria de sistema e tempo de atividade (Uptime).
    /// </summary>
    /// <remarks>
    /// Executa todas as sondas de integridade registradas (banco de dados, liveness, consumo de memória) e retorna métricas detalhadas.
    /// </remarks>
    /// <returns>Relatório estruturado de integridade operacional.</returns>
    /// <response code="200">Todos os serviços e dependências críticas estão saudáveis e operacionais.</response>
    /// <response code="503">Um ou mais serviços essenciais (ex: banco de dados) estão indisponíveis ou degradados.</response>
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(HealthResponseDto), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        var report = await _healthCheckService.CheckHealthAsync(cancellationToken);
        var uptime = DateTime.UtcNow - AppStartTimeUtc;
        var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";
        var allocatedMemory = GC.GetTotalMemory(forceFullCollection: false) / (1024.0 * 1024.0);

        var response = new HealthResponseDto
        {
            Status = report.Status.ToString(),
            Timestamp = DateTime.UtcNow,
            Uptime = $"{uptime.Days}d {uptime.Hours:00}h {uptime.Minutes:00}m {uptime.Seconds:00}s",
            Environment = _environment.EnvironmentName,
            Version = version,
            TotalDuration = report.TotalDuration.ToString(@"hh\:mm\:ss\.fff"),
            System = new HealthCheckSystemInfoDto
            {
                AllocatedMemoryMb = Math.Round(allocatedMemory, 2),
                DotNetVersion = RuntimeInformation.FrameworkDescription,
                OsPlatform = RuntimeInformation.OSDescription,
                ProcessorCount = Environment.ProcessorCount
            }
        };

        // Extract database info if available in report entries
        if (report.Entries.TryGetValue("database", out var dbEntry))
        {
            response.Database = new HealthCheckDatabaseInfoDto
            {
                Status = dbEntry.Status.ToString(),
                Provider = dbEntry.Data.TryGetValue("provider", out var prov) ? prov?.ToString() ?? "" : "",
                CanConnect = dbEntry.Data.TryGetValue("canConnect", out var canConn) && canConn is bool b && b,
                ResponseTimeMs = dbEntry.Data.TryGetValue("responseTimeMs", out var rt) && rt is double d ? Math.Round(d, 2) : 0,
                ErrorMessage = dbEntry.Exception?.Message ?? dbEntry.Description
            };
        }

        foreach (var (key, entry) in report.Entries)
        {
            response.Entries[key] = new HealthCheckItemDto
            {
                Status = entry.Status.ToString(),
                Description = entry.Description,
                Duration = entry.Duration.ToString(@"hh\:mm\:ss\.fff"),
                Data = entry.Data
            };
        }

        if (report.Status == HealthStatus.Unhealthy)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, response);
        }

        return Ok(response);
    }

    /// <summary>
    /// Sonda de Liveness (Liveness Probe) para verificar se o processo da API está ativo e respondendo a requisições HTTP.
    /// </summary>
    /// <remarks>
    /// Ideal para balanceadores de carga, Kubernetes Liveness Probes e Docker healthcheck para identificar travamentos no processo.
    /// </remarks>
    /// <returns>Status de atividade do processo.</returns>
    /// <response code="200">O servidor está ativo e aceitando requisições.</response>
    [HttpGet("live")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetLiveness()
    {
        var uptime = DateTime.UtcNow - AppStartTimeUtc;
        return Ok(new
        {
            status = "Healthy",
            service = "TeacherTech API",
            timestamp = DateTime.UtcNow,
            uptime = $"{uptime.Days}d {uptime.Hours:00}h {uptime.Minutes:00}m {uptime.Seconds:00}s"
        });
    }

    /// <summary>
    /// Sonda de Prontidão (Readiness Probe) para verificar se a API e o banco de dados estão prontos para receber tráfego de produção.
    /// </summary>
    /// <remarks>
    /// Utilizado por Kubernetes Readiness Probes e deploy pipelines para direcionar tráfego somente após a inicialização e conexão com o banco.
    /// </remarks>
    /// <returns>Status de prontidão para tráfego.</returns>
    /// <response code="200">A API e suas dependências estão prontas para atender requisições.</response>
    /// <response code="503">A API ou o banco de dados não estão prontos para receber tráfego.</response>
    [HttpGet("ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetReadiness(CancellationToken cancellationToken)
    {
        // Executes only the checks tagged with 'ready' (e.g. database)
        var report = await _healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"), cancellationToken);

        if (report.Status == HealthStatus.Unhealthy)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "Unhealthy",
                message = "Dependências críticas (banco de dados) indisponíveis.",
                totalDuration = report.TotalDuration.ToString(@"hh\:mm\:ss\.fff"),
                timestamp = DateTime.UtcNow
            });
        }

        return Ok(new
        {
            status = "Healthy",
            message = "API pronta para receber tráfego.",
            totalDuration = report.TotalDuration.ToString(@"hh\:mm\:ss\.fff"),
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Endpoint ultraleve de ping para validação imediata de latência de rede.
    /// </summary>
    /// <returns>Resposta pong com timestamp UTC.</returns>
    /// <response code="200">Ping respondido com sucesso.</response>
    [HttpGet("ping")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Ping()
    {
        return Ok(new
        {
            ping = "pong",
            timestamp = DateTime.UtcNow
        });
    }
}
