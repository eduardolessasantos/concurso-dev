using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Application.Services;

public class AuthApplicationService : IAuthApplicationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IProfessorProfileRepository _professorProfileRepo;
    private readonly IStudentProfileRepository _studentProfileRepo;
    private readonly IProfessorSubscriptionRepository _professorSubscriptionRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthApplicationService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IProfessorProfileRepository professorProfileRepo,
        IStudentProfileRepository studentProfileRepo,
        IProfessorSubscriptionRepository professorSubscriptionRepo,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _professorProfileRepo = professorProfileRepo;
        _studentProfileRepo = studentProfileRepo;
        _professorSubscriptionRepo = professorSubscriptionRepo;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return ServiceResult<AuthResponseDto>.Fail("Este e-mail já está cadastrado.", 409);

        var role = dto.UserRole?.ToUpper() == UserRoles.Professor ? UserRoles.Professor : UserRoles.Student;

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            UserRole = role,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return ServiceResult<AuthResponseDto>.Fail(errors);
        }

        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new IdentityRole(role));

        await _userManager.AddToRoleAsync(user, role);

        if (role == UserRoles.Professor)
        {
            var slug = dto.FullName.ToLower().Replace(" ", "-");
            var profProfile = new ProfessorProfile
            {
                UserId = user.Id,
                Headline = dto.Headline ?? "Professor / Criador de Conteúdo",
                Bio = "Professor dedicado na criação de trilhas de estudo personalizadas.",
                CustomSlug = slug,
                AiCreditsLimit = 200,
                AiCreditsUsed = 0,
                PublicVisibility = true
            };
            await _professorProfileRepo.AddAsync(profProfile);
        }
        else
        {
            var studentProfile = new StudentProfile
            {
                UserId = user.Id,
                GoalExam = dto.GoalExam ?? "Concursos Públicos em Geral",
                Bio = "Estudante focado na aprovação."
            };
            await _studentProfileRepo.AddAsync(studentProfile);
        }

        await _unitOfWork.CommitAsync();

        var token = GenerateJwtToken(user, role);
        return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            UserRole = role,
            AvatarUrl = user.AvatarUrl
        });
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return ServiceResult<AuthResponseDto>.Fail("Credenciais inválidas. Verifique seu e-mail e senha.", 401);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? user.UserRole;

        var token = GenerateJwtToken(user, role);
        return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            UserRole = role,
            AvatarUrl = user.AvatarUrl
        });
    }

    public async Task<ServiceResult<AuthResponseDto>> GoogleLoginAsync(GoogleLoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.IdToken))
            return ServiceResult<AuthResponseDto>.Fail("Token do Google é obrigatório.", 400);

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings();
            var googleClientId = _configuration["Authentication:Google:ClientId"];
            if (!string.IsNullOrWhiteSpace(googleClientId))
            {
                validationSettings.Audience = new[] { googleClientId };
            }

            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, validationSettings);
        }
        catch (InvalidJwtException ex)
        {
            return ServiceResult<AuthResponseDto>.Fail($"Token do Google inválido: {ex.Message}", 401);
        }
        catch (Exception ex)
        {
            return ServiceResult<AuthResponseDto>.Fail($"Falha na validação com o Google: {ex.Message}", 400);
        }

        if (payload == null || string.IsNullOrWhiteSpace(payload.Email))
        {
            return ServiceResult<AuthResponseDto>.Fail("Não foi possível obter o e-mail verificado do Google.", 400);
        }

        var email = payload.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);
        string role;

        if (user == null)
        {
            role = dto.PreferredRole?.ToUpper() == UserRoles.Professor ? UserRoles.Professor : UserRoles.Student;
            var fullName = string.IsNullOrWhiteSpace(payload.Name) ? email.Split('@')[0] : payload.Name;

            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = fullName,
                UserRole = role,
                AvatarUrl = payload.Picture,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return ServiceResult<AuthResponseDto>.Fail(errors);
            }

            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));

            await _userManager.AddToRoleAsync(user, role);

            if (role == UserRoles.Professor)
            {
                var slug = fullName.ToLowerInvariant().Replace(" ", "-");
                var profProfile = new ProfessorProfile
                {
                    UserId = user.Id,
                    Headline = "Professor / Criador de Conteúdo",
                    Bio = "Professor cadastrado via Google na TeacherTech.",
                    CustomSlug = slug,
                    AiCreditsLimit = 200,
                    AiCreditsUsed = 0,
                    PublicVisibility = true
                };
                await _professorProfileRepo.AddAsync(profProfile);
            }
            else
            {
                var studentProfile = new StudentProfile
                {
                    UserId = user.Id,
                    GoalExam = "Concursos Públicos em Geral",
                    Bio = "Estudante cadastrado via Google na TeacherTech."
                };
                await _studentProfileRepo.AddAsync(studentProfile);
            }

            await _unitOfWork.CommitAsync();
        }
        else
        {
            var roles = await _userManager.GetRolesAsync(user);
            role = roles.FirstOrDefault() ?? user.UserRole;

            // Se o usuário ainda não tem foto ou veio atualizada do Google, salva
            if (!string.IsNullOrWhiteSpace(payload.Picture) && string.IsNullOrWhiteSpace(user.AvatarUrl))
            {
                user.AvatarUrl = payload.Picture;
                await _userManager.UpdateAsync(user);
            }
        }

        var token = GenerateJwtToken(user, role);
        return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            UserRole = role,
            AvatarUrl = user.AvatarUrl
        });
    }

    public async Task<ServiceResult<object>> GetCurrentUserAsync(string? userId)
    {
        if (string.IsNullOrEmpty(userId))
            return ServiceResult<object>.Fail("Não autorizado.", 401);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return ServiceResult<object>.Fail("Usuário não encontrado.", 404);

        var roles = await _userManager.GetRolesAsync(user);

        return ServiceResult<object>.Ok(new
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            UserRole = roles.FirstOrDefault() ?? user.UserRole,
            AvatarUrl = user.AvatarUrl
        });
    }

    public async Task<ServiceResult<object>> SeedTestUsersAsync()
    {
        // 1. Garantir que as roles existam
        foreach (var r in new[] { UserRoles.Student, UserRoles.Professor, UserRoles.Admin })
        {
            if (!await _roleManager.RoleExistsAsync(r))
                await _roleManager.CreateAsync(new IdentityRole(r));
        }

        // 2. Aluno de teste: student_teste@teste.com / Test@123 / Role STUDENT
        var studentEmail = "student_teste@teste.com";
        var studentUser = await _userManager.FindByEmailAsync(studentEmail);
        if (studentUser == null)
        {
            studentUser = new ApplicationUser
            {
                UserName = studentEmail,
                Email = studentEmail,
                FullName = "Aluno Teste TestSprite",
                UserRole = UserRoles.Student,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var res = await _userManager.CreateAsync(studentUser, "Test@123");
            if (!res.Succeeded)
            {
                return ServiceResult<object>.Fail($"Erro ao criar student_teste: {string.Join(", ", res.Errors.Select(e => e.Description))}");
            }
            await _userManager.AddToRoleAsync(studentUser, UserRoles.Student);

            var studentProfile = new StudentProfile
            {
                UserId = studentUser.Id,
                GoalExam = "Concursos Públicos em Geral",
                Bio = "Estudante de teste automatizado TestSprite."
            };
            await _studentProfileRepo.AddAsync(studentProfile);
        }
        else
        {
            if (!await _userManager.IsInRoleAsync(studentUser, UserRoles.Student))
            {
                await _userManager.AddToRoleAsync(studentUser, UserRoles.Student);
            }
            if (!await _userManager.CheckPasswordAsync(studentUser, "Test@123"))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(studentUser);
                await _userManager.ResetPasswordAsync(studentUser, token, "Test@123");
            }
        }

        // 3. Professor de teste: professor_teste@teste.com / Test@123 / Role PROFESSOR com subscription ACTIVE
        var profEmail = "professor_teste@teste.com";
        var profUser = await _userManager.FindByEmailAsync(profEmail);
        if (profUser == null)
        {
            profUser = new ApplicationUser
            {
                UserName = profEmail,
                Email = profEmail,
                FullName = "Professor Teste TestSprite",
                UserRole = UserRoles.Professor,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var res = await _userManager.CreateAsync(profUser, "Test@123");
            if (!res.Succeeded)
            {
                return ServiceResult<object>.Fail($"Erro ao criar professor_teste: {string.Join(", ", res.Errors.Select(e => e.Description))}");
            }
            await _userManager.AddToRoleAsync(profUser, UserRoles.Professor);

            var profProfile = new ProfessorProfile
            {
                UserId = profUser.Id,
                Headline = "Professor Especialista",
                Bio = "Professor de teste automatizado TestSprite.",
                CustomSlug = "professor-teste",
                AiCreditsLimit = 2000,
                AiCreditsUsed = 0,
                PublicVisibility = true,
                PixKey = profEmail
            };
            await _professorProfileRepo.AddAsync(profProfile);
        }
        else
        {
            if (!await _userManager.IsInRoleAsync(profUser, UserRoles.Professor))
            {
                await _userManager.AddToRoleAsync(profUser, UserRoles.Professor);
            }
            if (!await _userManager.CheckPasswordAsync(profUser, "Test@123"))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(profUser);
                await _userManager.ResetPasswordAsync(profUser, token, "Test@123");
            }
        }

        // 4. Garantir assinatura ACTIVE para professor_teste
        var existingSub = await _professorSubscriptionRepo.GetByProfessorIdAsync(profUser.Id);
        if (existingSub == null)
        {
            var sub = new ProfessorSubscription
            {
                ProfessorId = profUser.Id,
                PlanType = PlanType.Pro,
                Status = SubscriptionStatus.Active,
                AsaasCustomerId = "cus_mock_testsprite",
                AsaasSubscriptionId = "sub_mock_testsprite_pro",
                Price = 149.90m,
                CurrentPeriodEnd = DateTime.UtcNow.AddYears(1),
                MaxCoursesAllowed = 50,
                AiCreditsLimit = 5000,
                AiCreditsUsed = 0,
                CreatedAt = DateTime.UtcNow
            };
            await _professorSubscriptionRepo.AddAsync(sub);
        }
        else
        {
            existingSub.Status = SubscriptionStatus.Active;
            existingSub.PlanType = PlanType.Pro;
            existingSub.CurrentPeriodEnd = DateTime.UtcNow.AddYears(1);
            _professorSubscriptionRepo.Update(existingSub);
        }

        await _unitOfWork.CommitAsync();

        return ServiceResult<object>.Ok(new
        {
            message = "Usuários de teste semeados com sucesso para o TestSprite.",
            student = new { email = studentEmail, role = UserRoles.Student },
            professor = new { email = profEmail, role = UserRoles.Professor, subscription = "ACTIVE" }
        });
    }

    private string GenerateJwtToken(ApplicationUser user, string role)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "TeacherTechSecretKeySuperSecret2026MasterKey!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = jwtSettings["Issuer"] ?? "TeacherTechApi",
            Audience = jwtSettings["Audience"] ?? "TeacherTechApp",
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public class CourseApplicationService : ICourseApplicationService
{
    private readonly ICourseRepository _courseRepo;
    private readonly ICourseModuleRepository _moduleRepo;
    private readonly ISubjectRepository _subjectRepo;
    private readonly ITopicRepository _topicRepo;
    private readonly IProfessorProfileRepository _professorRepo;
    private readonly IUnitOfWork _unitOfWork;

    public CourseApplicationService(
        ICourseRepository courseRepo,
        ICourseModuleRepository moduleRepo,
        ISubjectRepository subjectRepo,
        ITopicRepository topicRepo,
        IProfessorProfileRepository professorRepo,
        IUnitOfWork unitOfWork)
    {
        _courseRepo = courseRepo;
        _moduleRepo = moduleRepo;
        _subjectRepo = subjectRepo;
        _topicRepo = topicRepo;
        _professorRepo = professorRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CourseResponseDto>> GetPublicCoursesAsync()
    {
        var courses = await _courseRepo.GetPublicPublishedAsync();
        return courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            ProfessorId = c.ProfessorId,
            ProfessorName = c.Professor?.FullName ?? string.Empty,
            Title = c.Title,
            Description = c.Description,
            Category = c.Category,
            Price = c.Price,
            IsPublic = c.IsPublic,
            Status = c.Status,
            CoverImageUrl = c.CoverImageUrl,
            CreatedAt = c.CreatedAt,
            SubjectsCount = c.Subjects.Count,
            EnrollmentsCount = c.Enrollments.Count
        }).ToList();
    }

    public async Task<List<CourseResponseDto>> GetMyCoursesAsync(string professorId)
    {
        var courses = await _courseRepo.GetByProfessorIdAsync(professorId);
        return courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            ProfessorId = c.ProfessorId,
            ProfessorName = c.Professor?.FullName ?? string.Empty,
            Title = c.Title,
            Description = c.Description,
            Category = c.Category,
            Price = c.Price,
            IsPublic = c.IsPublic,
            Status = c.Status,
            CoverImageUrl = c.CoverImageUrl,
            CreatedAt = c.CreatedAt,
            SubjectsCount = c.Subjects.Count,
            EnrollmentsCount = c.Enrollments.Count
        }).ToList();
    }

    public async Task<CourseStudyPlan?> GetCourseByIdAsync(Guid id)
    {
        return await _courseRepo.GetWithHierarchyAsync(id);
    }

    public async Task<ServiceResult<CourseStudyPlan>> CreateCourseAsync(string professorId, CreateCourseDto dto)
    {
        var course = new CourseStudyPlan
        {
            ProfessorId = professorId,
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Price = dto.Price,
            IsPublic = dto.IsPublic,
            CoverImageUrl = dto.CoverImageUrl,
            Status = "PUBLISHED",
            CreatedAt = DateTime.UtcNow
        };

        await _courseRepo.AddAsync(course);
        await _unitOfWork.CommitAsync();

        return ServiceResult<CourseStudyPlan>.Created(course);
    }

    public async Task<ServiceResult<CourseStudyPlan>> UpdateCourseBasicInfoAsync(Guid courseId, UpdateCourseDto dto)
    {
        var course = await _courseRepo.GetByIdAsync(courseId);
        if (course == null) return ServiceResult<CourseStudyPlan>.Fail("Curso não encontrado.", 404);

        if (!string.IsNullOrWhiteSpace(dto.Title)) course.Title = dto.Title;
        if (!string.IsNullOrWhiteSpace(dto.Category)) course.Category = dto.Category;
        if (!string.IsNullOrWhiteSpace(dto.Description)) course.Description = dto.Description;
        course.Price = dto.Price;
        course.IsPublic = dto.IsPublic;
        course.UpdatedAt = DateTime.UtcNow;

        _courseRepo.Update(course);
        await _unitOfWork.CommitAsync();

        return ServiceResult<CourseStudyPlan>.Ok(course);
    }

    public async Task<ServiceResult<CourseModule>> AddModuleAsync(Guid courseId, string name)
    {
        var course = await _courseRepo.GetByIdAsync(courseId);
        if (course == null) return ServiceResult<CourseModule>.Fail("Curso não encontrado.", 404);

        var existing = await _moduleRepo.FindByCourseAndNameAsync(courseId, name);
        if (existing != null) return ServiceResult<CourseModule>.Ok(existing);

        var count = await _moduleRepo.CountByCourseIdAsync(courseId);
        var module = new CourseModule
        {
            CourseId = courseId,
            Name = name,
            OrderIndex = count + 1,
            UpdatedAt = DateTime.UtcNow
        };

        await _moduleRepo.AddAsync(module);
        await _unitOfWork.CommitAsync();

        return ServiceResult<CourseModule>.Created(module);
    }

    public async Task<ServiceResult<CourseModule>> UpdateModuleAsync(Guid courseId, Guid moduleId, string name)
    {
        var module = await _moduleRepo.GetByIdAsync(moduleId);
        if (module == null || module.CourseId != courseId)
            return ServiceResult<CourseModule>.Fail("Módulo não encontrado.", 404);

        module.Name = name;
        module.UpdatedAt = DateTime.UtcNow;
        _moduleRepo.Update(module);
        await _unitOfWork.CommitAsync();

        return ServiceResult<CourseModule>.Ok(module);
    }

    public async Task<ServiceResult<bool>> DeleteModuleAsync(Guid courseId, Guid moduleId)
    {
        var module = await _moduleRepo.GetByIdAsync(moduleId);
        if (module == null || module.CourseId != courseId)
            return ServiceResult<bool>.Fail("Módulo não encontrado.", 404);

        var subjects = await _subjectRepo.GetByCourseIdWithTopicsAsync(courseId);
        foreach (var s in subjects.Where(s => s.ModuleId == moduleId))
        {
            s.ModuleId = null;
            _subjectRepo.Update(s);
        }

        _moduleRepo.Remove(module);
        await _unitOfWork.CommitAsync();

        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<SaveStudioResponseDto>> PublishStudioContentAsync(string? professorId, SaveStudioContentDto dto)
    {
        if (string.IsNullOrEmpty(professorId))
            return ServiceResult<SaveStudioResponseDto>.Fail("Professor não autenticado.", 401);

        // 1. Find or create Course
        CourseStudyPlan? course = null;
        if (dto.CourseId.HasValue && dto.CourseId.Value != Guid.Empty)
        {
            course = await _courseRepo.GetByIdAsync(dto.CourseId.Value);
        }

        if (course == null)
        {
            course = await _courseRepo.FindByProfessorAndTitleAsync(professorId, dto.CourseTitle);
        }

        if (course == null)
        {
            course = new CourseStudyPlan
            {
                ProfessorId = professorId,
                Title = string.IsNullOrWhiteSpace(dto.CourseTitle) ? "Plano Estratégico de Estudos TI" : dto.CourseTitle,
                Description = "Curso com matérias, tópicos, resumos e questões gerados e organizados via Studio de Mentor.",
                Category = "Tecnologia da Informação",
                IsPublic = dto.IsPublic,
                Status = "PUBLISHED",
                CreatedAt = DateTime.UtcNow
            };
            await _courseRepo.AddAsync(course);
            await _unitOfWork.CommitAsync();
        }

        // 1.1 Find or create CourseModule if SessionName is provided
        CourseModule? module = null;
        if (!string.IsNullOrWhiteSpace(dto.SessionName))
        {
            module = await _moduleRepo.FindByCourseAndNameAsync(course.Id, dto.SessionName);
            if (module == null)
            {
                var moduleCount = await _moduleRepo.CountByCourseIdAsync(course.Id);
                module = new CourseModule
                {
                    CourseId = course.Id,
                    Name = dto.SessionName,
                    OrderIndex = moduleCount + 1
                };
                await _moduleRepo.AddAsync(module);
                await _unitOfWork.CommitAsync();
            }
        }

        // 2. Find or create Subject
        var subject = await _subjectRepo.FindByCourseAndNameAsync(course.Id, dto.SubjectName);
        if (subject == null)
        {
            var subjectCount = await _subjectRepo.CountByCourseIdAsync(course.Id);
            subject = new Subject
            {
                CourseId = course.Id,
                ModuleId = module?.Id ?? dto.SessionId,
                Name = string.IsNullOrWhiteSpace(dto.SubjectName) ? "Disciplina Geral" : dto.SubjectName,
                Meta = dto.SubjectMeta,
                Description = string.IsNullOrWhiteSpace(dto.SubjectDescription) ? "Disciplina cadastrada pelo professor mentor." : dto.SubjectDescription,
                OrderIndex = subjectCount + 1
            };
            await _subjectRepo.AddAsync(subject);
            await _unitOfWork.CommitAsync();
        }
        else
        {
            if (module != null) subject.ModuleId = module.Id;
            if (!string.IsNullOrWhiteSpace(dto.SubjectMeta)) subject.Meta = dto.SubjectMeta;
            if (!string.IsNullOrWhiteSpace(dto.SubjectDescription)) subject.Description = dto.SubjectDescription;
            _subjectRepo.Update(subject);
            await _unitOfWork.CommitAsync();
        }

        // 3. Find or create Topic
        var topic = await _topicRepo.FindBySubjectAndTitleAsync(subject.Id, dto.TopicTitle);
        if (topic == null)
        {
            var topicCount = await _topicRepo.CountBySubjectIdAsync(subject.Id);
            topic = new Topic
            {
                SubjectId = subject.Id,
                Title = string.IsNullOrWhiteSpace(dto.TopicTitle) ? "Tópico de Estudo" : dto.TopicTitle,
                ContentMarkdown = dto.ContentMarkdown,
                ExamBoard = dto.ExamBoard,
                OrderIndex = topicCount + 1
            };
            await _topicRepo.AddAsync(topic);
        }
        else
        {
            topic.ContentMarkdown = dto.ContentMarkdown;
            topic.ExamBoard = dto.ExamBoard;
            _topicRepo.Update(topic);
        }
        await _unitOfWork.CommitAsync();

        // 3.1 Persist TopicContent if present
        if (dto.TopicDetail != null)
        {
            var examplesJson = dto.TopicDetail.Examples != null ? JsonSerializer.Serialize(dto.TopicDetail.Examples) : "[]";
            var keyPointsJson = dto.TopicDetail.KeyPoints != null ? JsonSerializer.Serialize(dto.TopicDetail.KeyPoints) : "[]";
            var tipsJson = dto.TopicDetail.Tips != null ? JsonSerializer.Serialize(dto.TopicDetail.Tips) : "[]";
            var linksJson = dto.TopicDetail.UsefulLinks != null ? JsonSerializer.Serialize(dto.TopicDetail.UsefulLinks) : "[]";

            var content = new TopicContent
            {
                TopicId = topic.Id,
                Title = string.IsNullOrWhiteSpace(dto.TopicDetail.Title) ? topic.Title : dto.TopicDetail.Title,
                Summary = dto.TopicDetail.Summary ?? string.Empty,
                Detail = dto.TopicDetail.Detail ?? string.Empty,
                Peso = dto.TopicDetail.Peso ?? string.Empty,
                ContentMarkdown = dto.ContentMarkdown,
                ExamplesJson = examplesJson,
                KeyPointsJson = keyPointsJson,
                TipsJson = tipsJson,
                UsefulLinksJson = linksJson,
                UpdatedAt = DateTime.UtcNow
            };
            await _topicRepo.AddOrUpdateTopicContentAsync(content);
            await _unitOfWork.CommitAsync();
        }

        // 4. Persist Flashcards
        int flashcardsSavedCount = 0;
        if (dto.Flashcards != null && dto.Flashcards.Any())
        {
            foreach (var fcDto in dto.Flashcards)
            {
                await _topicRepo.AddFlashcardAsync(new Flashcard
                {
                    TopicId = topic.Id,
                    FrontText = fcDto.FrontText,
                    BackText = fcDto.BackText,
                    Difficulty = string.IsNullOrWhiteSpace(fcDto.DifficultyLevel) ? "MEDIUM" : fcDto.DifficultyLevel
                });
                flashcardsSavedCount++;
            }
        }

        // 5. Persist Questions
        int questionsSavedCount = 0;
        if (dto.Questions != null && dto.Questions.Any())
        {
            foreach (var qDto in dto.Questions)
            {
                var optionsJson = qDto.Options != null && qDto.Options.Any()
                    ? JsonSerializer.Serialize(qDto.Options)
                    : qDto.OptionsJson;

                await _topicRepo.AddQuestionAsync(new Question
                {
                    TopicId = topic.Id,
                    Statement = qDto.Statement,
                    OptionsJson = optionsJson,
                    CorrectOptionIndex = qDto.CorrectOptionIndex,
                    Explanation = qDto.Explanation,
                    ExamBoard = string.IsNullOrWhiteSpace(qDto.ExamBoard) ? dto.ExamBoard : qDto.ExamBoard
                });
                questionsSavedCount++;
            }
        }

        // 6. Persist Schedule
        if (dto.Schedule != null)
        {
            await _courseRepo.AddStudyScheduleAsync(new StudySchedule
            {
                CourseId = course.Id,
                DayOfWeek = dto.Schedule.DayOfWeek,
                SubjectName = subject.Name,
                TopicTitle = topic.Title,
                GoalMinutes = dto.Schedule.GoalMinutes,
                Notes = dto.Schedule.Notes
            });
        }

        // 7. Persist Simulated Test
        Guid? simulatedTestId = null;
        if (dto.Simulated != null && !string.IsNullOrWhiteSpace(dto.Simulated.Title))
        {
            var simulated = new SimulatedTest
            {
                CourseId = course.Id,
                Title = dto.Simulated.Title,
                Description = $"Simulado gerado para o tópico: {topic.Title}",
                TimeLimitMinutes = dto.Simulated.TimeLimitMinutes,
                CreatedAt = DateTime.UtcNow
            };
            await _courseRepo.AddSimulatedTestAsync(simulated);
            await _unitOfWork.CommitAsync();
            simulatedTestId = simulated.Id;

            if (dto.Questions != null && dto.Questions.Any())
            {
                foreach (var qDto in dto.Questions)
                {
                    var optionsJson = qDto.Options != null && qDto.Options.Any()
                        ? JsonSerializer.Serialize(qDto.Options)
                        : qDto.OptionsJson;

                    await _courseRepo.AddSimulatedQuestionAsync(new SimulatedQuestion
                    {
                        SimulatedTestId = simulated.Id,
                        Statement = qDto.Statement,
                        OptionsJson = optionsJson,
                        CorrectOptionIndex = qDto.CorrectOptionIndex,
                        Explanation = qDto.Explanation,
                        ExamBoard = string.IsNullOrWhiteSpace(qDto.ExamBoard) ? dto.ExamBoard : qDto.ExamBoard
                    });
                }
            }
        }

        await _unitOfWork.CommitAsync();

        return ServiceResult<SaveStudioResponseDto>.Ok(new SaveStudioResponseDto
        {
            CourseId = course.Id,
            SubjectId = subject.Id,
            TopicId = topic.Id,
            SimulatedTestId = simulatedTestId,
            FlashcardsSavedCount = flashcardsSavedCount,
            QuestionsSavedCount = questionsSavedCount,
            Message = "🎉 Conteúdo do Studio (Curso, Disciplina, Tópico, Flashcards, Questões, Cronograma e Simulado) foi salvo com sucesso no banco MySQL!"
        });
    }
}

public class AiContentApplicationService : IAiContentApplicationService
{
    private readonly IAiService _aiService;
    private readonly IProfessorProfileRepository _professorProfileRepo;
    private readonly ITopicRepository _topicRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AiContentApplicationService(
        IAiService aiService,
        IProfessorProfileRepository professorProfileRepo,
        ITopicRepository topicRepo,
        IUnitOfWork unitOfWork)
    {
        _aiService = aiService;
        _professorProfileRepo = professorProfileRepo;
        _topicRepo = topicRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<string>> GenerateSummaryAsync(string professorId, GenerateAiContentDto dto)
    {
        if (!await DeductProfessorCreditAsync(professorId))
            return ServiceResult<string>.Fail("Limite de créditos de IA atingido para o seu plano atual. Faça um upgrade para continuar gerando conteúdos.", 402);

        var summaryMarkdown = await _aiService.GenerateSummaryAsync(dto.TopicTitle, dto.SubjectName, dto.ExamBoard);

        if (dto.TopicId.HasValue)
        {
            var topic = await _topicRepo.GetByIdAsync(dto.TopicId.Value);
            if (topic != null)
            {
                topic.ContentMarkdown = summaryMarkdown;
                await _unitOfWork.CommitAsync();
            }
        }

        return ServiceResult<string>.Ok(summaryMarkdown);
    }

    public async Task<ServiceResult<List<object>>> GenerateFlashcardsAsync(string professorId, GenerateAiContentDto dto)
    {
        if (!await DeductProfessorCreditAsync(professorId))
            return ServiceResult<List<object>>.Fail("Limite de créditos de IA atingido.", 402);

        var cards = await _aiService.GenerateFlashcardsAsync(dto.TopicTitle, 5);

        if (dto.TopicId.HasValue)
        {
            foreach (var card in cards)
            {
                await _topicRepo.AddFlashcardAsync(new Flashcard
                {
                    TopicId = dto.TopicId.Value,
                    FrontText = card.Front,
                    BackText = card.Back
                });
            }
            await _unitOfWork.CommitAsync();
        }

        var result = cards.Select(c => (object)new { front = c.Front, back = c.Back }).ToList();
        return ServiceResult<List<object>>.Ok(result);
    }

    public async Task<ServiceResult<List<object>>> GenerateQuestionsAsync(string professorId, GenerateAiContentDto dto)
    {
        if (!await DeductProfessorCreditAsync(professorId))
            return ServiceResult<List<object>>.Fail("Limite de créditos de IA atingido.", 402);

        var questionsData = await _aiService.GenerateQuestionsAsync(dto.TopicTitle, dto.ExamBoard, 3);

        if (dto.TopicId.HasValue)
        {
            foreach (var q in questionsData)
            {
                await _topicRepo.AddQuestionAsync(new Question
                {
                    TopicId = dto.TopicId.Value,
                    Statement = q.Statement,
                    OptionsJson = JsonSerializer.Serialize(q.Options),
                    CorrectOptionIndex = q.CorrectIndex,
                    Explanation = q.Explanation,
                    ExamBoard = dto.ExamBoard
                });
            }
            await _unitOfWork.CommitAsync();
        }

        var result = questionsData.Select(q => (object)new
        {
            statement = q.Statement,
            options = q.Options,
            correctOptionIndex = q.CorrectIndex,
            explanation = q.Explanation
        }).ToList();

        return ServiceResult<List<object>>.Ok(result);
    }

    private async Task<bool> DeductProfessorCreditAsync(string professorId)
    {
        if (string.IsNullOrEmpty(professorId)) return false;

        var profile = await _professorProfileRepo.GetByUserIdAsync(professorId);
        if (profile == null) return false;

        if (profile.AiCreditsUsed >= profile.AiCreditsLimit)
            return false;

        profile.AiCreditsUsed++;
        await _unitOfWork.CommitAsync();
        return true;
    }
}

public class EnrollmentApplicationService : IEnrollmentApplicationService
{
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IStudentProfileRepository _studentProfileRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;

    public EnrollmentApplicationService(
        IEnrollmentRepository enrollmentRepo,
        ICourseRepository courseRepo,
        IStudentProfileRepository studentProfileRepo,
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork)
    {
        _enrollmentRepo = enrollmentRepo;
        _courseRepo = courseRepo;
        _studentProfileRepo = studentProfileRepo;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<EnrollmentResponseDto>> InviteStudentByEmailAsync(string professorId, InviteStudentByEmailDto dto)
    {
        var course = await _courseRepo.GetByIdAsync(dto.CourseId);
        if (course == null) return ServiceResult<EnrollmentResponseDto>.Fail("Curso não encontrado.", 404);
        if (course.ProfessorId != professorId) return ServiceResult<EnrollmentResponseDto>.Fail("Acesso não autorizado.", 403);

        var studentUser = await _userManager.FindByEmailAsync(dto.StudentEmail);
        if (studentUser == null)
        {
            studentUser = new ApplicationUser
            {
                UserName = dto.StudentEmail,
                Email = dto.StudentEmail,
                FullName = dto.StudentEmail.Split('@')[0],
                UserRole = UserRoles.Student,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(studentUser, "AlunoTemp123!");
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return ServiceResult<EnrollmentResponseDto>.Fail(errors);
            }

            await _userManager.AddToRoleAsync(studentUser, UserRoles.Student);

            var studentProfile = new StudentProfile
            {
                UserId = studentUser.Id,
                GoalExam = "Estudos Geral",
                Bio = "Convidado por e-mail"
            };
            await _studentProfileRepo.AddAsync(studentProfile);
            await _unitOfWork.CommitAsync();
        }

        var existingEnrollment = await _enrollmentRepo.GetByStudentAndCourseAsync(studentUser.Id, dto.CourseId);
        if (existingEnrollment != null)
        {
            if (existingEnrollment.Status != "ACTIVE")
            {
                existingEnrollment.Status = "ACTIVE";
                _enrollmentRepo.Update(existingEnrollment);
                await _unitOfWork.CommitAsync();
                return ServiceResult<EnrollmentResponseDto>.Ok(new EnrollmentResponseDto
                {
                    Id = existingEnrollment.Id,
                    StudentId = studentUser.Id,
                    StudentEmail = studentUser.Email!,
                    StudentName = studentUser.FullName,
                    CourseId = course.Id,
                    CourseTitle = course.Title,
                    GrantedVia = existingEnrollment.GrantedVia,
                    Status = existingEnrollment.Status,
                    CreatedAt = existingEnrollment.CreatedAt
                });
            }
            return ServiceResult<EnrollmentResponseDto>.Fail($"O aluno {dto.StudentEmail} já possui acesso ativo a este curso.");
        }

        var enrollment = new Enrollment
        {
            StudentId = studentUser.Id,
            CourseId = dto.CourseId,
            GrantedBy = professorId,
            GrantedVia = "EMAIL_INVITE",
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow
        };

        await _enrollmentRepo.AddAsync(enrollment);
        await _unitOfWork.CommitAsync();

        return ServiceResult<EnrollmentResponseDto>.Ok(new EnrollmentResponseDto
        {
            Id = enrollment.Id,
            StudentId = studentUser.Id,
            StudentEmail = studentUser.Email!,
            StudentName = studentUser.FullName,
            CourseId = course.Id,
            CourseTitle = course.Title,
            GrantedVia = enrollment.GrantedVia,
            Status = enrollment.Status,
            CreatedAt = enrollment.CreatedAt
        });
    }

    public async Task<ServiceResult<List<EnrollmentResponseDto>>> GetCourseEnrollmentsAsync(string professorId, Guid courseId)
    {
        var course = await _courseRepo.GetByIdAsync(courseId);
        if (course == null) return ServiceResult<List<EnrollmentResponseDto>>.Fail("Curso não encontrado.", 404);
        if (course.ProfessorId != professorId) return ServiceResult<List<EnrollmentResponseDto>>.Fail("Acesso não autorizado.", 403);

        var enrollments = await _enrollmentRepo.GetByCourseIdWithStudentAsync(courseId);
        var result = enrollments.Select(e => new EnrollmentResponseDto
        {
            Id = e.Id,
            StudentId = e.StudentId,
            StudentEmail = e.Student.Email!,
            StudentName = e.Student.FullName,
            CourseId = e.CourseId,
            CourseTitle = e.Course.Title,
            GrantedVia = e.GrantedVia,
            Status = e.Status,
            CreatedAt = e.CreatedAt
        }).ToList();

        return ServiceResult<List<EnrollmentResponseDto>>.Ok(result);
    }

    public async Task<ServiceResult<List<object>>> GetMyStudiesAsync(string studentId)
    {
        if (string.IsNullOrEmpty(studentId))
            return ServiceResult<List<object>>.Fail("Não autorizado.", 401);

        var studies = await _enrollmentRepo.GetActiveStudiesByStudentIdAsync(studentId);
        var result = studies.Select(e => (object)new
        {
            EnrollmentId = e.Id,
            CourseId = e.CourseId,
            CourseTitle = e.Course.Title,
            CourseDescription = e.Course.Description,
            Category = e.Course.Category,
            CoverImageUrl = e.Course.CoverImageUrl,
            ProfessorName = e.Course.Professor?.FullName ?? string.Empty,
            GrantedVia = e.GrantedVia,
            GrantedAt = e.CreatedAt,
            SubjectsCount = e.Course.Subjects.Count
        }).ToList();

        return ServiceResult<List<object>>.Ok(result);
    }

    public async Task<ServiceResult<bool>> RevokeAccessAsync(string professorId, Guid enrollmentId)
    {
        var enrollment = await _enrollmentRepo.GetByIdWithCourseAsync(enrollmentId);
        if (enrollment == null) return ServiceResult<bool>.Fail("Matrícula não encontrada.", 404);
        if (enrollment.Course.ProfessorId != professorId) return ServiceResult<bool>.Fail("Acesso não autorizado.", 403);

        _enrollmentRepo.Remove(enrollment);
        await _unitOfWork.CommitAsync();

        return ServiceResult<bool>.Ok(true);
    }
}

public class AccessRequestApplicationService : IAccessRequestApplicationService
{
    private readonly IAccessRequestRepository _accessRequestRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AccessRequestApplicationService(
        IAccessRequestRepository accessRequestRepo,
        ICourseRepository courseRepo,
        IEnrollmentRepository enrollmentRepo,
        IUnitOfWork unitOfWork)
    {
        _accessRequestRepo = accessRequestRepo;
        _courseRepo = courseRepo;
        _enrollmentRepo = enrollmentRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<string>> RequestAccessAsync(string studentId, CreateAccessRequestDto dto)
    {
        if (string.IsNullOrEmpty(studentId)) return ServiceResult<string>.Fail("Não autorizado.", 401);

        var course = await _courseRepo.GetByIdAsync(dto.CourseId);
        if (course == null) return ServiceResult<string>.Fail("Curso não encontrado.", 404);

        var existingEnrollment = await _enrollmentRepo.GetByStudentAndCourseAsync(studentId, dto.CourseId);
        if (existingEnrollment != null && existingEnrollment.Status == "ACTIVE")
            return ServiceResult<string>.Fail("Você já possui acesso a este curso.");

        var existingRequest = await _accessRequestRepo.GetPendingByStudentAndCourseAsync(studentId, dto.CourseId);
        if (existingRequest != null)
            return ServiceResult<string>.Fail("Sua solicitação de acesso a este curso já está pendente de análise pelo professor.");

        var accessRequest = new AccessRequest
        {
            StudentId = studentId,
            CourseId = dto.CourseId,
            Message = dto.Message ?? "Gostaria de ter acesso aos estudos desta disciplina.",
            Status = "PENDING",
            RequestedAt = DateTime.UtcNow
        };

        await _accessRequestRepo.AddAsync(accessRequest);
        await _unitOfWork.CommitAsync();

        return ServiceResult<string>.Ok("Solicitação enviada com sucesso ao professor!");
    }

    public async Task<ServiceResult<List<AccessRequestResponseDto>>> GetPendingRequestsAsync(string professorId)
    {
        if (string.IsNullOrEmpty(professorId)) return ServiceResult<List<AccessRequestResponseDto>>.Fail("Não autorizado.", 401);

        var requests = await _accessRequestRepo.GetPendingByProfessorIdAsync(professorId);
        var result = requests.Select(a => new AccessRequestResponseDto
        {
            Id = a.Id,
            StudentId = a.StudentId,
            StudentEmail = a.Student.Email!,
            StudentName = a.Student.FullName,
            CourseId = a.CourseId,
            CourseTitle = a.Course.Title,
            Status = a.Status,
            Message = a.Message,
            RequestedAt = a.RequestedAt
        }).ToList();

        return ServiceResult<List<AccessRequestResponseDto>>.Ok(result);
    }

    public async Task<ServiceResult<string>> ApproveRequestAsync(string professorId, Guid requestId)
    {
        var request = await _accessRequestRepo.GetByIdWithCourseAsync(requestId);
        if (request == null) return ServiceResult<string>.Fail("Solicitação não encontrada.", 404);
        if (request.Course.ProfessorId != professorId) return ServiceResult<string>.Fail("Acesso não autorizado.", 403);

        request.Status = "APPROVED";
        _accessRequestRepo.Update(request);

        var existingEnrollment = await _enrollmentRepo.GetByStudentAndCourseAsync(request.StudentId, request.CourseId);
        if (existingEnrollment == null)
        {
            var enrollment = new Enrollment
            {
                StudentId = request.StudentId,
                CourseId = request.CourseId,
                GrantedBy = professorId,
                GrantedVia = "PUBLIC_ACCESS",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            };
            await _enrollmentRepo.AddAsync(enrollment);
        }
        else
        {
            existingEnrollment.Status = "ACTIVE";
            _enrollmentRepo.Update(existingEnrollment);
        }

        await _unitOfWork.CommitAsync();
        return ServiceResult<string>.Ok("Solicitação aprovada e acesso concedido ao aluno!");
    }

    public async Task<ServiceResult<string>> RejectRequestAsync(string professorId, Guid requestId)
    {
        var request = await _accessRequestRepo.GetByIdWithCourseAsync(requestId);
        if (request == null) return ServiceResult<string>.Fail("Solicitação não encontrada.", 404);
        if (request.Course.ProfessorId != professorId) return ServiceResult<string>.Fail("Acesso não autorizado.", 403);

        request.Status = "REJECTED";
        _accessRequestRepo.Update(request);
        await _unitOfWork.CommitAsync();

        return ServiceResult<string>.Ok("Solicitação rejeitada.");
    }
}

public class PaymentApplicationService : IPaymentApplicationService
{
    private readonly ICourseRepository _courseRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly IProfessorProfileRepository _professorProfileRepo;
    private readonly IUnitOfWork _unitOfWork;

    public PaymentApplicationService(
        ICourseRepository courseRepo,
        IEnrollmentRepository enrollmentRepo,
        IProfessorProfileRepository professorProfileRepo,
        IUnitOfWork unitOfWork)
    {
        _courseRepo = courseRepo;
        _enrollmentRepo = enrollmentRepo;
        _professorProfileRepo = professorProfileRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<CheckoutResponseDto>> CreateCheckoutAsync(string userId, CreateCheckoutDto dto)
    {
        return await Task.FromResult(ServiceResult<CheckoutResponseDto>.Fail("O checkout individual de cursos foi descontinuado no modelo SaaS B2B. Alunos acessam via convite do professor.", 400));
    }

    public async Task<ServiceResult<string>> ProcessWebhookAsync(PaymentWebhookDto dto)
    {
        return await Task.FromResult(ServiceResult<string>.Ok("Webhook Asaas registrado com sucesso."));
    }

    public async Task<ServiceResult<string>> ConfirmSimulatedPaymentAsync(Guid transactionId)
    {
        return await Task.FromResult(ServiceResult<string>.Ok("Simulação concluída."));
    }

    public async Task<ServiceResult<ProfessorBalanceDto>> GetProfessorBalanceAsync(string professorId)
    {
        if (string.IsNullOrEmpty(professorId)) return ServiceResult<ProfessorBalanceDto>.Fail("Não autorizado.", 401);

        var profProfile = await _professorProfileRepo.GetByUserIdAsync(professorId);

        var result = new ProfessorBalanceDto
        {
            TotalRevenue = 0m,
            AvailableBalance = 0m,
            PendingBalance = 0.00m,
            SalesCount = 0,
            PixKey = profProfile?.PixKey,
            Transactions = new List<TransactionHistoryDto>()
        };

        return ServiceResult<ProfessorBalanceDto>.Ok(result);
    }

    public async Task<ServiceResult<string>> UpdatePixKeyAsync(string professorId, string pixKey)
    {
        var profProfile = await _professorProfileRepo.GetByUserIdAsync(professorId);
        if (profProfile == null) return ServiceResult<string>.Fail("Perfil de professor não encontrado.", 404);

        profProfile.PixKey = pixKey;
        profProfile.UpdatedAt = DateTime.UtcNow;
        _professorProfileRepo.Update(profProfile);
        await _unitOfWork.CommitAsync();

        return ServiceResult<string>.Ok("Chave PIX de repasse atualizada com sucesso!");
    }
}

public class PublicShowcaseApplicationService : IPublicShowcaseApplicationService
{
    private readonly IProfessorProfileRepository _professorProfileRepo;
    private readonly ICourseRepository _courseRepo;

    public PublicShowcaseApplicationService(
        IProfessorProfileRepository professorProfileRepo,
        ICourseRepository courseRepo)
    {
        _professorProfileRepo = professorProfileRepo;
        _courseRepo = courseRepo;
    }

    public async Task<ServiceResult<PublicProfessorProfileDto>> GetProfessorBySlugAsync(string slug)
    {
        var profProfile = await _professorProfileRepo.GetBySlugAsync(slug);
        if (profProfile == null)
            return ServiceResult<PublicProfessorProfileDto>.Fail("Perfil de professor não encontrado ou privado.", 404);

        var allCourses = await _courseRepo.GetByProfessorIdAsync(profProfile.UserId);
        var publicCourses = allCourses
            .Where(c => c.IsPublic && c.Status == CourseStatus.Published)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                ProfessorId = c.ProfessorId,
                ProfessorName = profProfile.User.FullName,
                Title = c.Title,
                Description = c.Description,
                Category = c.Category,
                Price = c.Price,
                IsPublic = c.IsPublic,
                Status = c.Status,
                CoverImageUrl = c.CoverImageUrl,
                CreatedAt = c.CreatedAt,
                SubjectsCount = c.Subjects.Count,
                EnrollmentsCount = c.Enrollments.Count
            }).ToList();

        var result = new PublicProfessorProfileDto
        {
            UserId = profProfile.UserId,
            FullName = profProfile.User.FullName,
            AvatarUrl = profProfile.User.AvatarUrl,
            Headline = profProfile.Headline,
            Bio = profProfile.Bio,
            CustomSlug = profProfile.CustomSlug,
            PublicCoursesCount = publicCourses.Count,
            Courses = publicCourses
        };

        return ServiceResult<PublicProfessorProfileDto>.Ok(result);
    }

    public async Task<List<PublicCourseExploreDto>> ExploreCoursesAsync(string? search, string? category)
    {
        var courses = await _courseRepo.SearchPublicCoursesAsync(search, category);
        return courses.Select(c => new PublicCourseExploreDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Category = c.Category,
            Price = c.Price,
            CoverImageUrl = c.CoverImageUrl,
            ProfessorId = c.ProfessorId,
            ProfessorName = c.Professor.FullName,
            ProfessorSlug = c.Professor.ProfessorProfile != null ? c.Professor.ProfessorProfile.CustomSlug : string.Empty,
            ProfessorAvatar = c.Professor.AvatarUrl,
            SubjectsCount = c.Subjects.Count,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    public async Task<ServiceResult<object>> GetPublicCourseDetailsAsync(Guid id)
    {
        var course = await _courseRepo.GetPublicCourseDetailsAsync(id);
        if (course == null) return ServiceResult<object>.Fail("Curso público não encontrado.", 404);

        var result = new
        {
            course.Id,
            course.Title,
            course.Description,
            course.Category,
            course.Price,
            course.IsPublic,
            course.Status,
            course.CoverImageUrl,
            course.CreatedAt,
            Professor = new
            {
                course.Professor.Id,
                course.Professor.FullName,
                course.Professor.Email,
                Headline = course.Professor.ProfessorProfile?.Headline,
                Bio = course.Professor.ProfessorProfile?.Bio,
                CustomSlug = course.Professor.ProfessorProfile?.CustomSlug
            },
            Subjects = course.Subjects.Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.OrderIndex,
                Topics = s.Topics.Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.ExamBoard,
                    t.OrderIndex
                })
            })
        };

        return ServiceResult<object>.Ok(result);
    }
}

public class SubjectApplicationService : ISubjectApplicationService
{
    private readonly ISubjectRepository _subjectRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly ICourseModuleRepository? _moduleRepo;
    private readonly IUnitOfWork _unitOfWork;

    public SubjectApplicationService(
        ISubjectRepository subjectRepo,
        ICourseRepository courseRepo,
        IUnitOfWork unitOfWork)
        : this(subjectRepo, courseRepo, null, unitOfWork)
    {
    }

    public SubjectApplicationService(
        ISubjectRepository subjectRepo,
        ICourseRepository courseRepo,
        ICourseModuleRepository? moduleRepo,
        IUnitOfWork unitOfWork)
    {
        _subjectRepo = subjectRepo;
        _courseRepo = courseRepo;
        _moduleRepo = moduleRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<Subject>> GetSubjectsByCourseAsync(Guid courseId)
    {
        return await _subjectRepo.GetByCourseIdWithTopicsAsync(courseId);
    }

    public async Task<ServiceResult<Subject>> CreateSubjectAsync(CreateSubjectDto dto)
    {
        var course = await _courseRepo.GetByIdAsync(dto.CourseId);
        if (course == null) return ServiceResult<Subject>.Fail("Curso não encontrado.", 404);

        Guid? moduleId = (dto.SessionId.HasValue && dto.SessionId.Value != Guid.Empty) 
            ? dto.SessionId 
            : ((dto.ModuleId.HasValue && dto.ModuleId.Value != Guid.Empty) ? dto.ModuleId : null);

        if (!moduleId.HasValue && !string.IsNullOrWhiteSpace(dto.SessionName) && _moduleRepo != null)
        {
            var foundModule = await _moduleRepo.FindByCourseAndNameAsync(dto.CourseId, dto.SessionName);
            if (foundModule != null)
            {
                moduleId = foundModule.Id;
            }
        }

        var subjectCount = await _subjectRepo.CountByCourseIdAsync(dto.CourseId);
        var subject = new Subject
        {
            CourseId = dto.CourseId,
            ModuleId = moduleId,
            Name = dto.Name,
            Meta = dto.Meta,
            Description = dto.Description,
            OrderIndex = subjectCount + 1,
            UpdatedAt = DateTime.UtcNow
        };

        await _subjectRepo.AddAsync(subject);
        await _unitOfWork.CommitAsync();

        return ServiceResult<Subject>.Ok(subject);
    }

    public async Task<ServiceResult<Subject>> UpdateSubjectAsync(Guid id, CreateSubjectDto dto)
    {
        var subject = await _subjectRepo.GetByIdAsync(id);
        if (subject == null) return ServiceResult<Subject>.Fail("Disciplina não encontrada.", 404);

        if (!string.IsNullOrWhiteSpace(dto.Name)) subject.Name = dto.Name;
        subject.Meta = dto.Meta ?? subject.Meta;
        subject.Description = dto.Description ?? subject.Description;
        if (dto.SessionId.HasValue && dto.SessionId.Value != Guid.Empty)
        {
            subject.ModuleId = dto.SessionId.Value;
        }
        subject.UpdatedAt = DateTime.UtcNow;

        _subjectRepo.Update(subject);
        await _unitOfWork.CommitAsync();

        return ServiceResult<Subject>.Ok(subject);
    }

    public async Task<ServiceResult<bool>> DeleteSubjectAsync(Guid id)
    {
        var subject = await _subjectRepo.GetByIdAsync(id);
        if (subject == null) return ServiceResult<bool>.Fail("Disciplina não encontrada.", 404);

        _subjectRepo.Remove(subject);
        await _unitOfWork.CommitAsync();

        return ServiceResult<bool>.Ok(true);
    }
}

public class TopicApplicationService : ITopicApplicationService
{
    private readonly ITopicRepository _topicRepo;
    private readonly ISubjectRepository _subjectRepo;
    private readonly IUnitOfWork _unitOfWork;

    public TopicApplicationService(
        ITopicRepository topicRepo,
        ISubjectRepository subjectRepo,
        IUnitOfWork unitOfWork)
    {
        _topicRepo = topicRepo;
        _subjectRepo = subjectRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<Topic>> GetTopicsBySubjectAsync(Guid subjectId)
    {
        return await _topicRepo.GetBySubjectIdWithContentAsync(subjectId);
    }

    public async Task<Topic?> GetTopicByIdAsync(Guid id)
    {
        return await _topicRepo.GetWithContentAsync(id);
    }

    public async Task<ServiceResult<Topic>> CreateTopicAsync(CreateTopicDto dto)
    {
        var subject = await _subjectRepo.GetByIdAsync(dto.SubjectId);
        if (subject == null)
            return ServiceResult<Topic>.Fail("Disciplina não encontrada.", 404);

        var topicCount = await _topicRepo.CountBySubjectIdAsync(dto.SubjectId);
        var topic = new Topic
        {
            SubjectId = dto.SubjectId,
            Title = dto.Title,
            ExamBoard = dto.ExamBoard,
            ContentMarkdown = "### Conteúdo em edição pelo professor...",
            OrderIndex = topicCount + 1,
            UpdatedAt = DateTime.UtcNow
        };

        await _topicRepo.AddAsync(topic);
        await _unitOfWork.CommitAsync();

        return ServiceResult<Topic>.Ok(topic);
    }

    public async Task<ServiceResult<Topic>> UpdateTopicAsync(Guid id, UpdateTopicDto dto)
    {
        var topic = await _topicRepo.GetWithContentAsync(id);
        if (topic == null)
            return ServiceResult<Topic>.Fail("Tópico não encontrado.", 404);

        if (!string.IsNullOrWhiteSpace(dto.Title)) topic.Title = dto.Title;
        if (!string.IsNullOrWhiteSpace(dto.ExamBoard)) topic.ExamBoard = dto.ExamBoard;
        if (dto.ContentMarkdown != null) topic.ContentMarkdown = dto.ContentMarkdown;
        topic.UpdatedAt = DateTime.UtcNow;
        _topicRepo.Update(topic);

        if (dto.TopicContent != null || dto.TopicDetail != null)
        {
            var contentDto = dto.TopicContent ?? dto.TopicDetail!;
            var examplesJson = contentDto.Examples != null ? JsonSerializer.Serialize(contentDto.Examples) : "[]";
            var keyPointsJson = contentDto.KeyPoints != null ? JsonSerializer.Serialize(contentDto.KeyPoints) : "[]";
            var tipsJson = contentDto.Tips != null ? JsonSerializer.Serialize(contentDto.Tips) : "[]";
            var linksJson = contentDto.UsefulLinks != null ? JsonSerializer.Serialize(contentDto.UsefulLinks) : "[]";

            var content = new TopicContent
            {
                TopicId = topic.Id,
                Title = string.IsNullOrWhiteSpace(contentDto.Title) ? topic.Title : contentDto.Title,
                Summary = contentDto.Summary ?? string.Empty,
                Detail = contentDto.Detail ?? string.Empty,
                Peso = contentDto.Peso ?? string.Empty,
                ContentMarkdown = topic.ContentMarkdown,
                ExamplesJson = examplesJson,
                KeyPointsJson = keyPointsJson,
                TipsJson = tipsJson,
                UsefulLinksJson = linksJson,
                UpdatedAt = DateTime.UtcNow
            };
            await _topicRepo.AddOrUpdateTopicContentAsync(content);
        }

        if (dto.Flashcards != null && dto.Flashcards.Any())
        {
            foreach (var fcDto in dto.Flashcards)
            {
                await _topicRepo.AddFlashcardAsync(new Flashcard
                {
                    TopicId = topic.Id,
                    FrontText = fcDto.FrontText,
                    BackText = fcDto.BackText,
                    Difficulty = string.IsNullOrWhiteSpace(fcDto.DifficultyLevel) ? "MEDIUM" : fcDto.DifficultyLevel
                });
            }
        }

        if (dto.Questions != null && dto.Questions.Any())
        {
            foreach (var qDto in dto.Questions)
            {
                var optionsJson = qDto.Options != null && qDto.Options.Any()
                    ? JsonSerializer.Serialize(qDto.Options)
                    : qDto.OptionsJson;

                await _topicRepo.AddQuestionAsync(new Question
                {
                    TopicId = topic.Id,
                    Statement = qDto.Statement,
                    OptionsJson = optionsJson,
                    CorrectOptionIndex = qDto.CorrectOptionIndex,
                    Explanation = qDto.Explanation,
                    ExamBoard = string.IsNullOrWhiteSpace(qDto.ExamBoard) ? topic.ExamBoard : qDto.ExamBoard
                });
            }
        }

        await _unitOfWork.CommitAsync();
        return ServiceResult<Topic>.Ok(topic);
    }

    public async Task<ServiceResult<bool>> DeleteTopicAsync(Guid id)
    {
        var topic = await _topicRepo.GetByIdAsync(id);
        if (topic == null) return ServiceResult<bool>.Fail("Tópico não encontrado.", 404);

        _topicRepo.Remove(topic);
        await _unitOfWork.CommitAsync();

        return ServiceResult<bool>.Ok(true);
    }
}
