using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using TeacherTech.Infrastructure.Data;

namespace TeacherTech.Infrastructure.Services;

/// <summary>
/// Verificador de saúde do banco de dados relacional (MySQL / SQLite).
/// Testa a conectividade ativa e registra o tempo de resposta e provedor em uso.
/// </summary>
public class DatabaseHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _dbContext;

    public DatabaseHealthCheck(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var provider = _dbContext.Database.ProviderName ?? "Unknown";

        try
        {
            var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
            stopwatch.Stop();

            var data = new Dictionary<string, object>
            {
                { "provider", provider },
                { "canConnect", canConnect },
                { "responseTimeMs", stopwatch.Elapsed.TotalMilliseconds }
            };

            if (canConnect)
            {
                return HealthCheckResult.Healthy(
                    $"Banco de dados ({provider}) conectado e operacional ({stopwatch.ElapsedMilliseconds}ms).",
                    data);
            }

            return HealthCheckResult.Unhealthy(
                $"Não foi possível estabelecer conexão com o banco de dados ({provider}).",
                data: data);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            var data = new Dictionary<string, object>
            {
                { "provider", provider },
                { "canConnect", false },
                { "responseTimeMs", stopwatch.Elapsed.TotalMilliseconds },
                { "error", ex.Message }
            };

            return HealthCheckResult.Unhealthy(
                $"Falha crítica ao verificar integridade do banco de dados: {ex.Message}",
                exception: ex,
                data: data);
        }
    }
}
