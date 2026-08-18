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
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Server=localhost;Database=teachertech_db;User=root;Password=270523;";

    bool useMySql = false;
    try
    {
        var builderConn = new MySqlConnector.MySqlConnectionStringBuilder(connectionString);
        var targetDbName = string.IsNullOrEmpty(builderConn.Database) ? "teachertech_db" : builderConn.Database;
        builderConn.Database = ""; // Connect to MySQL server root

        using (var serverConn = new MySqlConnector.MySqlConnection(builderConn.ConnectionString))
        {
            serverConn.Open();
            using var cmd = serverConn.CreateCommand();
            cmd.CommandText = $"CREATE DATABASE IF NOT EXISTS `{targetDbName}`;";
            cmd.ExecuteNonQuery();
        }
        useMySql = true;
        Console.WriteLine($"[INFO] Conectado ao MySQL com sucesso! Base de dados `{targetDbName}` garantida.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[AVISO] Conexão MySQL indisponível ({ex.Message}). Usando SQLite para resiliência local.");
        useMySql = false;
    }

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        if (useMySql)
        {
            options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36)));
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

// 4. CORS Setup for Angular Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TeacherTech API v1");
    });
}

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed Default Roles & Initial Data from SeedData.json on Startup
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

        // Ensure missing columns in existing MySQL tables if they were created earlier
        try
        {
            if (dbContext.Database.IsMySql())
            {
                var conn = dbContext.Database.GetDbConnection();
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync();
                }

                var columnsToEnsure = new (string Table, string Column, string Definition)[]
                {
                    ("AspNetUsers", "UpdatedAt", "datetime(6) NULL"),
                    ("ProfessorProfiles", "UpdatedAt", "datetime(6) NULL"),
                    ("StudentProfiles", "UpdatedAt", "datetime(6) NULL"),
                    ("CourseStudyPlans", "UpdatedAt", "datetime(6) NULL"),
                    ("Subjects", "UpdatedAt", "datetime(6) NULL"),
                    ("Topics", "UpdatedAt", "datetime(6) NULL"),
                    ("Flashcards", "UpdatedAt", "datetime(6) NULL"),
                    ("Questions", "UpdatedAt", "datetime(6) NULL"),
                    ("StudySchedules", "UpdatedAt", "datetime(6) NULL"),
                    ("SimulatedTests", "UpdatedAt", "datetime(6) NULL"),
                    ("SimulatedQuestions", "UpdatedAt", "datetime(6) NULL"),
                    ("Enrollments", "UpdatedAt", "datetime(6) NULL"),
                    ("AccessRequests", "UpdatedAt", "datetime(6) NULL"),
                    ("Transactions", "UpdatedAt", "datetime(6) NULL"),
                    ("Transactions", "EnrollmentId", "char(36) NULL")
                };

                foreach (var (table, column, def) in columnsToEnsure)
                {
                    try
                    {
                        using var checkCmd = conn.CreateCommand();
                        checkCmd.CommandText = $"SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}';";
                        var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                        if (count == 0)
                        {
                            using var alterCmd = conn.CreateCommand();
                            alterCmd.CommandText = $"ALTER TABLE `{table}` ADD COLUMN `{column}` {def};";
                            await alterCmd.ExecuteNonQueryAsync();
                            Console.WriteLine($"[INFO] Coluna `{table}`.`{column}` sincronizada com sucesso no MySQL.");
                        }
                    }
                    catch (Exception colEx)
                    {
                        Console.WriteLine($"[AVISO] Verificação da coluna `{table}`.`{column}`: {colEx.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AVISO] Verificação de schema MySQL: {ex.Message}");
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

        // Search SeedData.json path
        string[] possiblePaths = [
            Path.Combine(AppContext.BaseDirectory, "SeedData.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "SeedData.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "TeacherTech.Infrastructure", "Data", "SeedData.json")
        ];

        string? seedJsonPath = possiblePaths.FirstOrDefault(File.Exists);

        if (seedJsonPath != null)
        {
            Console.WriteLine($"[INFO] Carregando SeedData.json a partir de: {seedJsonPath}");
            var jsonContent = await File.ReadAllTextAsync(seedJsonPath);
            using var jsonDoc = JsonDocument.Parse(jsonContent);
            var root = jsonDoc.RootElement;

            // Seed Professor
            if (root.TryGetProperty("professor", out var profElem))
            {
                var profEmail = profElem.GetProperty("email").GetString() ?? "eduardolessa2011@gmail.com";
                var user = await userManager.FindByEmailAsync(profEmail);

                if (user == null)
                {
                    user = new ApplicationUser
                    {
                        UserName = profEmail,
                        Email = profEmail,
                        FullName = profElem.GetProperty("fullName").GetString() ?? "Eduardo Lessa",
                        UserRole = UserRoles.Professor,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(user, "TeacherTech2026!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, UserRoles.Professor);

                        var profProfile = new ProfessorProfile
                        {
                            UserId = user.Id,
                            Headline = profElem.GetProperty("headline").GetString() ?? "Especialista em TI",
                            Bio = profElem.GetProperty("bio").GetString() ?? "Professor e mentor especializado.",
                            CustomSlug = profElem.GetProperty("customSlug").GetString() ?? "eduardo-lessa",
                            AiCreditsLimit = 1000,
                            AiCreditsUsed = 12,
                            PublicVisibility = true,
                            PixKey = profElem.GetProperty("pixKey").GetString() ?? profEmail
                        };
                        dbContext.ProfessorProfiles.Add(profProfile);
                        await dbContext.SaveChangesAsync();
                    }
                }

                if (user != null)
                {
                    // Seed Course
                    if (root.TryGetProperty("course", out var courseElem))
                    {
                        var courseId = Guid.Parse(courseElem.GetProperty("id").GetString() ?? "00000000-0000-0000-0000-000000000001");
                        var course = await dbContext.CourseStudyPlans.FirstOrDefaultAsync(c => c.Id == courseId);
                        if (course == null)
                        {
                            course = new CourseStudyPlan
                            {
                                Id = courseId,
                                ProfessorId = user.Id,
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
                    }
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

public partial class Program { }
