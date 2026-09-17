using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccessRequestsController : ControllerBase
{
    private readonly IAccessRequestApplicationService _accessRequestService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICourseRepository _courseRepo;
    private readonly IAccessRequestRepository _accessRequestRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AccessRequestsController(
        IAccessRequestApplicationService accessRequestService,
        UserManager<ApplicationUser> userManager,
        ICourseRepository courseRepo,
        IAccessRequestRepository accessRequestRepo,
        IUnitOfWork unitOfWork)
    {
        _accessRequestService = accessRequestService;
        _userManager = userManager;
        _courseRepo = courseRepo;
        _accessRequestRepo = accessRequestRepo;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Envia uma solicitação de acesso para um plano de estudos.
    /// Funciona com ou sem autenticação prévia.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateAccessRequest([FromBody] CreateAccessRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var course = await _courseRepo.GetByIdAsync(dto.CourseId);
        if (course == null)
            return NotFound(new { message = "Plano de estudo não encontrado." });

        string? studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Se não autenticado, busca ou cria aluno temporário pelo email informado
        if (string.IsNullOrEmpty(studentId))
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new { message = "E-mail é obrigatório para envio da solicitação." });
            }

            var cleanEmail = dto.Email.Trim().ToLowerInvariant();
            var existingUser = await _userManager.FindByEmailAsync(cleanEmail);
            if (existingUser == null)
            {
                existingUser = new ApplicationUser
                {
                    UserName = cleanEmail,
                    Email = cleanEmail,
                    FullName = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name.Trim() : "Aluno Interessado",
                    UserRole = UserRoles.Student,
                    EmailConfirmed = false,
                    CreatedAt = DateTime.UtcNow
                };

                var res = await _userManager.CreateAsync(existingUser, "AlunoTech" + Guid.NewGuid().ToString("N")[..8] + "!");
                if (res.Succeeded)
                {
                    await _userManager.AddToRoleAsync(existingUser, UserRoles.Student);
                }
            }

            studentId = existingUser.Id;
        }

        var result = await _accessRequestService.RequestAccessAsync(studentId, dto);
        if (!result.Success)
        {
            // Se já solicitou ou já tem acesso, retorna mensagem amigável
            return Ok(new { message = result.ErrorMessage ?? "Solicitação já enviada! Professor vai te enviar o convite no WhatsApp." });
        }

        return Ok(new { message = "Solicitação enviada! Professor vai te enviar o convite no WhatsApp." });
    }

    /// <summary>
    /// Lista solicitações de acesso pendentes para o professor autenticado.
    /// </summary>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _accessRequestService.GetPendingRequestsAsync(professorId);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(result.Data);
    }

    /// <summary>
    /// Aprova uma solicitação de acesso e matricula o aluno.
    /// </summary>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _accessRequestService.ApproveRequestAsync(professorId, id);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }

    /// <summary>
    /// Rejeita uma solicitação de acesso.
    /// </summary>
    [Authorize(Roles = UserRoles.Professor)]
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> RejectRequest(Guid id)
    {
        var professorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(professorId)) return Unauthorized();

        var result = await _accessRequestService.RejectRequestAsync(professorId, id);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });

        return Ok(new { message = result.Data });
    }
}
