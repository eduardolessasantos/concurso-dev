using System.IO;
using System.Text;
using System.Text.Json;
using TeacherTech.Application;
using TeacherTech.Domain.Entities;
using TeacherTech.Domain.Interfaces;
using TeacherTech.Infrastructure;
using TeacherTech.Infrastructure.Data;
using TeacherTech.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Resilient Database Configuration (MySQL with automatic SQLite Fallback)
if (builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseSqlite("Data Source=teachertech_test.db");
    });
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString) || connectionString.Trim() == "EMPTY VALUE")
    {
        connectionString = "Server=localhost;Database=teachertech_db;User=root;Password=270523;";
    }

    bool useMySql = false;
    try
    {
        using (var serverConn = new MySqlConnector.MySqlConnection(connectionString))
        {
            serverConn.Open();
        }
        useMySql = true;
        Console.WriteLine("[INFO] Conectado ao MySQL/TiDB Cloud com sucesso!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[AVISO] Conexão MySQL indisponível ({ex.Message}). Usando SQLite para resiliência local/nuvem.");
        useMySql = false;
    }

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        if (useMySql)
        {
            options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36)), mySqlOptions =>
            {
                mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);
            });
        }
        else
        {
            options.UseSqlite("Data Source=teachertech_dev.db");
        }
    });
}

// 2. Identity Configuration
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 3. JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "TeacherTechSecretKeySuperSecret2026MasterKey!";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "TeacherTechApi",
        ValidAudience = jwtSettings["Audience"] ?? "TeacherTechApp",
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

// Register Application & Infrastructure Services (DDD Modules)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 4. CORS Setup for Angular Frontend & GitHub Pages
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:4200",
                  "http://127.0.0.1:4200",
                  "https://eduardolessasantos.github.io"
              )
              .SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 5. Health Checks Service Configuration
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready", "db"])
    .AddCheck("self", () => HealthCheckResult.Healthy("API process is running."), tags: ["live"]);

// 5. Swagger Configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TeacherTech API (DDD Architecture)", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT neste formato: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Enable Swagger in Development & Production for API exploration
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TeacherTech API v1");
    c.RoutePrefix = "swagger";
});

// Redirect root URL directly to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

// Native ASP.NET Core Health Check Endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = WriteHealthCheckJsonResponse
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = WriteHealthCheckJsonResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteHealthCheckJsonResponse
});

app.MapControllers();

// Seed Default Roles & Initial Data on Startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        try
        {
            await dbContext.Database.EnsureCreatedAsync();
        }
        catch
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlite("Data Source=teachertech_fallback.db");
            using var fallbackContext = new ApplicationDbContext(optionsBuilder.Options);
            await fallbackContext.Database.EnsureCreatedAsync();
        }

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles = [UserRoles.Admin, UserRoles.Professor, UserRoles.Student];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Always guarantee Default Professor user exists
        var profEmail = "eduardolessa2011@gmail.com";
        var profUser = await userManager.FindByEmailAsync(profEmail);
        if (profUser == null)
        {
            profUser = new ApplicationUser
            {
                UserName = profEmail,
                Email = profEmail,
                FullName = "Eduardo Lessa",
                UserRole = UserRoles.Professor,
                CreatedAt = DateTime.UtcNow
            };

            var profRes = await userManager.CreateAsync(profUser, "TeacherTech2026!");
            if (profRes.Succeeded)
            {
                await userManager.AddToRoleAsync(profUser, UserRoles.Professor);

                var profProfile = new ProfessorProfile
                {
                    UserId = profUser.Id,
                    Headline = "Especialista em TI & Concursos",
                    Bio = "Professor e mentor especializado em tecnologia e concursos públicos.",
                    CustomSlug = "eduardo-lessa",
                    AiCreditsLimit = 1000,
                    AiCreditsUsed = 0,
                    PublicVisibility = true,
                    PixKey = profEmail
                };
                dbContext.ProfessorProfiles.Add(profProfile);
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"[INFO] Usuário Professor padrão criado: {profEmail}");
            }
        }

        // Always guarantee Default Student user exists
        var studentEmail = "aluno@teachertech.com";
        var studentUser = await userManager.FindByEmailAsync(studentEmail);
        if (studentUser == null)
        {
            studentUser = new ApplicationUser
            {
                UserName = studentEmail,
                Email = studentEmail,
                FullName = "Aluno Concurseiro",
                UserRole = UserRoles.Student,
                CreatedAt = DateTime.UtcNow
            };

            var studRes = await userManager.CreateAsync(studentUser, "TeacherTech2026!");
            if (studRes.Succeeded)
            {
                await userManager.AddToRoleAsync(studentUser, UserRoles.Student);

                var studProfile = new StudentProfile
                {
                    UserId = studentUser.Id,
                    GoalExam = "Dataprev 2026",
                    Bio = "Estudante focado em concursos de TI.",
                    UpdatedAt = DateTime.UtcNow
                };
                dbContext.StudentProfiles.Add(studProfile);
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"[INFO] Usuário Aluno padrão criado: {studentEmail}");
            }
        }

        // Search and load SeedData.json if available
        string[] possiblePaths = [
            Path.Combine(AppContext.BaseDirectory, "SeedData.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "SeedData.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "TeacherTech.Infrastructure", "Data", "SeedData.json"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "src", "TeacherTech.Infrastructure", "Data", "SeedData.json")
        ];

        string? seedJsonPath = possiblePaths.FirstOrDefault(File.Exists);

        if (seedJsonPath != null)
        {
            Console.WriteLine($"[INFO] Carregando SeedData.json a partir de: {seedJsonPath}");
            var jsonContent = await File.ReadAllTextAsync(seedJsonPath);
            using var jsonDoc = JsonDocument.Parse(jsonContent);
            var root = jsonDoc.RootElement;

            if (profUser != null && root.TryGetProperty("course", out var courseElem))
            {
                var courseId = Guid.Parse(courseElem.GetProperty("id").GetString() ?? "00000000-0000-0000-0000-000000000001");
                var course = await dbContext.CourseStudyPlans.FirstOrDefaultAsync(c => c.Id == courseId);
                if (course == null)
                {
                    course = new CourseStudyPlan
                    {
                        Id = courseId,
                        ProfessorId = profUser.Id,
                        Title = courseElem.GetProperty("title").GetString() ?? "Plano Estratégico de Estudos",
                        Description = courseElem.GetProperty("description").GetString() ?? "",
                        Category = courseElem.GetProperty("category").GetString() ?? "TI & Dados",
                        Price = courseElem.GetProperty("price").GetDecimal(),
                        IsPublic = courseElem.GetProperty("isPublic").GetBoolean(),
                        Status = courseElem.GetProperty("status").GetString() ?? "PUBLISHED",
                        CreatedAt = DateTime.UtcNow
                    };
                    dbContext.CourseStudyPlans.Add(course);
                    await dbContext.SaveChangesAsync();
                }

                // Seed Subjects & Topics
                if (root.TryGetProperty("subjects", out var subjectsElem) && subjectsElem.ValueKind == JsonValueKind.Array)
                {
                    foreach (var subjElem in subjectsElem.EnumerateArray())
                    {
                        var subjId = Guid.Parse(subjElem.GetProperty("id").GetString() ?? Guid.NewGuid().ToString());
                        var existingSubj = await dbContext.Subjects.FirstOrDefaultAsync(s => s.Id == subjId);
                        if (existingSubj == null)
                        {
                            existingSubj = new Subject
                            {
                                Id = subjId,
                                CourseId = courseId,
                                Name = subjElem.GetProperty("name").GetString() ?? "",
                                Description = subjElem.GetProperty("description").GetString() ?? "",
                                OrderIndex = subjElem.GetProperty("orderIndex").GetInt32()
                            };
                            dbContext.Subjects.Add(existingSubj);
                            await dbContext.SaveChangesAsync();
                        }

                        if (subjElem.TryGetProperty("topics", out var topicsElem) && topicsElem.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var topElem in topicsElem.EnumerateArray())
                            {
                                var topId = Guid.Parse(topElem.GetProperty("id").GetString() ?? Guid.NewGuid().ToString());
                                var existingTopic = await dbContext.Topics.FirstOrDefaultAsync(t => t.Id == topId);
                                if (existingTopic == null)
                                {
                                    existingTopic = new Topic
                                    {
                                        Id = topId,
                                        SubjectId = subjId,
                                        Title = topElem.GetProperty("title").GetString() ?? "",
                                        ExamBoard = topElem.GetProperty("examBoard").GetString() ?? "FGV",
                                        OrderIndex = topElem.GetProperty("orderIndex").GetInt32(),
                                        ContentMarkdown = topElem.GetProperty("contentMarkdown").GetString() ?? ""
                                    };
                                    dbContext.Topics.Add(existingTopic);
                                    await dbContext.SaveChangesAsync();

                                    if (topElem.TryGetProperty("flashcards", out var fcArray) && fcArray.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var fc in fcArray.EnumerateArray())
                                        {
                                            dbContext.Flashcards.Add(new Flashcard
                                            {
                                                TopicId = topId,
                                                FrontText = fc.GetProperty("frontText").GetString() ?? "",
                                                BackText = fc.GetProperty("backText").GetString() ?? "",
                                                Difficulty = fc.GetProperty("difficulty").GetString() ?? "MEDIUM"
                                            });
                                        }
                                    }

                                    if (topElem.TryGetProperty("questions", out var qArray) && qArray.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var q in qArray.EnumerateArray())
                                        {
                                            dbContext.Questions.Add(new Question
                                             {
                                                TopicId = topId,
                                                Statement = q.GetProperty("statement").GetString() ?? "",
                                                OptionsJson = q.GetProperty("optionsJson").GetString() ?? "[]",
                                                CorrectOptionIndex = q.GetProperty("correctOptionIndex").GetInt32(),
                                                Explanation = q.GetProperty("explanation").GetString() ?? "",
                                                ExamBoard = q.GetProperty("examBoard").GetString() ?? "FGV"
                                            });
                                        }
                                    }
                                    await dbContext.SaveChangesAsync();
                                }
                            }
                        }
                    }
                }

                // Seed Study Schedules
                if (root.TryGetProperty("studySchedule", out var scheduleElem) && scheduleElem.ValueKind == JsonValueKind.Array)
                {
                    if (!await dbContext.StudySchedules.AnyAsync(s => s.CourseId == courseId))
                    {
                        foreach (var item in scheduleElem.EnumerateArray())
                        {
                            dbContext.StudySchedules.Add(new StudySchedule
                            {
                                CourseId = courseId,
                                WeekNumber = item.TryGetProperty("weekNumber", out var wn) ? wn.GetInt32() : 1,
                                DayOfWeek = item.GetProperty("dayOfWeek").GetString() ?? "Segunda-feira",
                                SubjectName = item.GetProperty("subjectName").GetString() ?? "",
                                TopicTitle = item.GetProperty("topicTitle").GetString() ?? "",
                                GoalMinutes = item.TryGetProperty("goalMinutes", out var gm) ? gm.GetInt32() : 60,
                                Notes = item.GetProperty("notes").GetString() ?? ""
                            });
                        }
                        await dbContext.SaveChangesAsync();
                        Console.WriteLine($"[INFO] Cronograma de estudos semeado para o curso {courseId}");
                    }
                }

                // Seed Simulated Test
                if (root.TryGetProperty("simulatedTest", out var simElem) && simElem.ValueKind == JsonValueKind.Object)
                {
                    if (!await dbContext.SimulatedTests.AnyAsync(st => st.CourseId == courseId))
                    {
                        var simulated = new SimulatedTest
                        {
                            CourseId = courseId,
                            Title = simElem.GetProperty("title").GetString() ?? "Simulado Inédito",
                            Description = simElem.TryGetProperty("description", out var desc) ? desc.GetString() ?? "" : "",
                            TimeLimitMinutes = simElem.TryGetProperty("timeLimitMinutes", out var tlm) ? tlm.GetInt32() : 60,
                            CreatedAt = DateTime.UtcNow
                        };
                        dbContext.SimulatedTests.Add(simulated);
                        await dbContext.SaveChangesAsync();

                        if (simElem.TryGetProperty("questions", out var simQArray) && simQArray.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var sq in simQArray.EnumerateArray())
                            {
                                dbContext.SimulatedQuestions.Add(new SimulatedQuestion
                                {
                                    SimulatedTestId = simulated.Id,
                                    Statement = sq.GetProperty("statement").GetString() ?? "",
                                    OptionsJson = sq.GetProperty("optionsJson").GetString() ?? "[]",
                                    CorrectOptionIndex = sq.GetProperty("correctOptionIndex").GetInt32(),
                                    Explanation = sq.GetProperty("explanation").GetString() ?? "",
                                    ExamBoard = sq.GetProperty("examBoard").GetString() ?? "Inédita"
                                });
                            }
                            await dbContext.SaveChangesAsync();
                        }
                        Console.WriteLine($"[INFO] Simulado inédito semeado para o curso {courseId}");
                    }
                }

                // Seed Student Enrollment for demo student
                if (studentUser != null && !await dbContext.Enrollments.AnyAsync(e => e.StudentId == studentUser.Id && e.CourseId == courseId))
                {
                    var enrollment = new Enrollment
                    {
                        StudentId = studentUser.Id,
                        CourseId = courseId,
                        GrantedBy = profUser?.Id ?? "system",
                        GrantedVia = "EMAIL_INVITE",
                        Status = EnrollmentStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    };
                    dbContext.Enrollments.Add(enrollment);
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine($"[INFO] Matrícula de demonstração criada para {studentUser.Email} no curso {courseId}");
                }

                // Seed Initial Test Transaction for Professor Financial Balance
                if (studentUser != null && profUser != null && !await dbContext.Transactions.AnyAsync(t => t.UserId == studentUser.Id && t.CourseId == courseId))
                {
                    var initialTx = new Transaction
                    {
                        UserId = studentUser.Id,
                        CourseId = courseId,
                        Amount = 49.90m,
                        PlatformFee = 4.99m,
                        ProfessorRevenue = 44.91m,
                        PaymentGateway = "ASAAS",
                        GatewayTransactionId = $"demo-tx-{Guid.NewGuid():N}",
                        Status = TransactionStatus.Paid,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    };
                    dbContext.Transactions.Add(initialTx);
                    await dbContext.SaveChangesAsync();
                    Console.WriteLine($"[INFO] Transação de demonstração criada para o saldo do professor.");
                }
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[AVISO] Inicialização do banco via SeedData.json: {ex.Message}");
    }
}

app.Run();

static Task WriteHealthCheckJsonResponse(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";
    var response = new
    {
        status = report.Status.ToString(),
        totalDuration = report.TotalDuration.ToString(@"hh\:mm\:ss\.fff"),
        timestamp = DateTime.UtcNow,
        entries = report.Entries.ToDictionary(
            e => e.Key,
            e => new
            {
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.ToString(@"hh\:mm\:ss\.fff"),
                data = e.Value.Data
            })
    };

    var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    });

    return context.Response.WriteAsync(json);
}

public partial class Program { }
