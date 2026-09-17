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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TeacherTech.Api.Authorization;
using TeacherTech.Application.DTOs;
using TeacherTech.Application.Interfaces;
using TeacherTech.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Centralized Database Configuration
if (builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseSqlite("Data Source=teachertech_test.db");
        options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    });
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=teachertech_dev.db";

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

        if (connectionString.Contains("Server=") || connectionString.Contains("Database="))
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
            options.UseSqlite(connectionString);
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

builder.Services.Configure<AsaasOptions>(builder.Configuration.GetSection(AsaasOptions.SectionName));
builder.Services.Configure<WhatsAppOptions>(builder.Configuration.GetSection(WhatsAppOptions.SectionName));

builder.Services.AddScoped<IAuthorizationHandler, RequireActiveSubscriptionHandler>();
builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, SubscriptionAuthorizationResultHandler>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireActiveSubscription", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.Requirements.Add(new RequireActiveSubscriptionRequirement());
    });
});

// Register Application & Infrastructure Services (DDD Modules)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddHttpClient<IBillingService, BillingService>();
builder.Services.AddHttpClient<IWhatsAppService, WhatsAppService>();

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
        options.JsonSerializerOptions.Converters.Add(new TeacherTech.Api.Converters.NullableGuidJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new TeacherTech.Api.Converters.GuidJsonConverter());
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
        await dbContext.Database.MigrateAsync();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await SeedData.SeedAsync(dbContext, userManager, roleManager, app.Environment.IsDevelopment());
        Console.WriteLine("[INFO] Inicialização do banco e dados de seed concluída com sucesso.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[AVISO] Inicialização do banco via SeedData: {ex.Message}");
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
