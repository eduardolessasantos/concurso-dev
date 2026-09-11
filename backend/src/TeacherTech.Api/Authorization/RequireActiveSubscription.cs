using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TeacherTech.Domain.Entities;
using TeacherTech.Infrastructure.Data;

namespace TeacherTech.Api.Authorization;

public class RequireActiveSubscriptionRequirement : IAuthorizationRequirement
{
}

public class RequireActiveSubscriptionHandler : AuthorizationHandler<RequireActiveSubscriptionRequirement>
{
    private readonly ApplicationDbContext _dbContext;

    public RequireActiveSubscriptionHandler(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, 
        RequireActiveSubscriptionRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return;
        }

        // Permite bypass se for Administrador do sistema
        if (context.User.IsInRole(UserRoles.Admin))
        {
            context.Succeed(requirement);
            return;
        }

        // Verifica a assinatura do professor
        var subscription = await _dbContext.ProfessorSubscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProfessorId == userId);

        if (subscription != null && 
            subscription.Status == SubscriptionStatus.Active && 
            subscription.CurrentPeriodEnd >= DateTime.UtcNow)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail(new AuthorizationFailureReason(this, "SubscriptionInactive"));
        }
    }
}

public class SubscriptionAuthorizationResultHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _defaultHandler = new();

    public async Task HandleAsync(
        RequestDelegate next, 
        HttpContext context, 
        AuthorizationPolicy policy, 
        PolicyAuthorizationResult authorizeResult)
    {
        var hasSubscriptionRequirement = policy.Requirements.Any(r => r is RequireActiveSubscriptionRequirement);

        if (hasSubscriptionRequirement && !authorizeResult.Succeeded)
        {
            // Se não autenticado, devolve 401 normalmente
            if (context.User.Identity?.IsAuthenticated != true)
            {
                await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
                return;
            }

            // Se autenticado mas NÃO é Professor (ex: Aluno tentando rota de professor), retorna 403 Forbidden
            if (!context.User.IsInRole(UserRoles.Professor))
            {
                await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
                return;
            }

            // Se autenticado e é Professor mas sem assinatura ativa -> HTTP 402 Payment Required
            context.Response.StatusCode = StatusCodes.Status402PaymentRequired;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                statusCode = 402,
                error = "Payment Required",
                message = "Assinatura inativa ou pendente. É necessário ter um plano de assinatura ativo para publicar cursos ou gerar conteúdo com Inteligência Artificial."
            });
            return;
        }

        await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
    }
}
