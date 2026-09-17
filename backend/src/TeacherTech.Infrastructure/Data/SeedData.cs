using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeacherTech.Domain.Entities;

namespace TeacherTech.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        bool isDevelopment = true)
    {
        // 1. Roles
        string[] roles = [UserRoles.Admin, UserRoles.Professor, UserRoles.Student];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Professor Eduardo Lessa
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
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var profRes = await userManager.CreateAsync(profUser, "TeacherTech2026!");
            if (profRes.Succeeded)
            {
                await userManager.AddToRoleAsync(profUser, UserRoles.Professor);
            }
        }

        // Professor Profile
        var profProfile = await dbContext.ProfessorProfiles.FirstOrDefaultAsync(p => p.UserId == profUser.Id);
        if (profProfile == null)
        {
            profProfile = new ProfessorProfile
            {
                UserId = profUser.Id,
                Headline = "Especialista em Preparação para Concursos de TI & Certames Públicos",
                Bio = "Professor e mentor especializado em Arquitetura de Software, Java, Engenharia de Dados e Governança de TI.",
                CustomSlug = "eduardo-lessa",
                AiCreditsLimit = 5000,
                AiCreditsUsed = 0,
                PublicVisibility = true,
                PixKey = profEmail
            };
            dbContext.ProfessorProfiles.Add(profProfile);
            await dbContext.SaveChangesAsync();
        }
        else
        {
            profProfile.CustomSlug = "eduardo-lessa";
            profProfile.PublicVisibility = true;
            dbContext.ProfessorProfiles.Update(profProfile);
            await dbContext.SaveChangesAsync();
        }

        // Professor Subscription (Pro, Active)
        var profSub = await dbContext.ProfessorSubscriptions.FirstOrDefaultAsync(s => s.ProfessorId == profUser.Id);
        if (profSub == null)
        {
            profSub = new ProfessorSubscription
            {
                ProfessorId = profUser.Id,
                PlanType = PlanType.Pro,
                Status = SubscriptionStatus.Active,
                AsaasCustomerId = "cus_mock_eduardo",
                AsaasSubscriptionId = "sub_mock_eduardo_pro",
                Price = 149.90m,
                CurrentPeriodEnd = DateTime.UtcNow.AddYears(1),
                MaxCoursesAllowed = 50,
                AiCreditsLimit = 5000,
                AiCreditsUsed = 0,
                CreatedAt = DateTime.UtcNow
            };
            dbContext.ProfessorSubscriptions.Add(profSub);
            await dbContext.SaveChangesAsync();
        }

        // 3. Default Student
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
                EmailConfirmed = true,
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
            }
        }

        // 4. Guarantee 3 Published & Public Courses for Professor Eduardo Lessa
        var courseDefinitions = new[]
        {
            new
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Title = "Plano Estratégico de Estudos - TI",
                Description = "Trilha didática completa com resumos em Markdown, flashcards de memorização, cronograma semanal de estudos e simulado inédito com questões comentadas.",
                Category = "TI & Dados",
                Price = 0.00m,
                ModuleName = "Conhecimentos Específicos",
                SubjectName = "Engenharia de Dados e Governança de TI",
                SubjectMeta = "25% da prova",
                TopicTitle = "Fundamentos de Big Data, DMBOK & Governança",
                TopicExamBoard = "Cebraspe / FGV",
                TopicContent = "### Fundamentos de Big Data & Governança de Dados\n\n- **DMBOK 2**: Framework de gestão de dados cobrindo arquitetura, qualidade, metadados e segurança.\n- **Big Data (5 Vs)**: Volume, Velocidade, Variedade, Veracidade e Valor.\n- **Data Lakes vs Data Warehouses**: Esquema na Leitura (Schema-on-Read) vs Esquema na Escrita (Schema-on-Write).",
                FlashcardFront = "Quais são as características fundamentais de um Data Lake segundo o DMBOK?",
                FlashcardBack = "Armazenamento de dados estruturados e não-estruturados em formato bruto, com Schema-on-Read.",
                QuestionStatement = "No contexto de governança e engenharia de dados, a arquitetura que aplica Schema-on-Read para acomodar volumes massivos heterogêneos denomina-se:",
                QuestionOptions = "[\"Data Warehouse Relacional Tradicional\", \"Data Lake\", \"Banco Transacional OLTP\", \"Data Mart Normalizado\"]",
                QuestionCorrectIndex = 1,
                QuestionExplanation = "Data Lakes preservam os dados no formato original e aplicam esquema no momento da leitura (Schema-on-Read)."
            },
            new
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Title = "Arquitetura de Software & Microsserviços",
                Description = "Padrões arquiteturais REST, gRPC, Event-Driven Architecture, CQRS, mensageria com RabbitMQ/Kafka e princípios SOLID para provas discursivas e objetivas.",
                Category = "Engenharia de Software",
                Price = 49.90m,
                ModuleName = "Padrões Arquiteturais Modernos",
                SubjectName = "Arquitetura de Microsserviços e Mensageria",
                SubjectMeta = "30% da prova",
                TopicTitle = "Arquitetura Monolítica vs Microsserviços",
                TopicExamBoard = "Cebraspe",
                TopicContent = "### Arquitetura Monolítica vs Microsserviços\n\n- **Monolito**: Facilidade inicial de desenvolvimento e testes unificados. Desvantagens: forte acoplamento e dificuldade de escala modular.\n- **Microsserviços**: Serviços autônomos, banco de dados independente e comunicação assíncrona orientada a eventos.",
                FlashcardFront = "Qual a principal vantagem da Arquitetura de Microsserviços sobre a Monolítica?",
                FlashcardBack = "Escalabilidade granular e desacoplamento independente do ciclo de vida dos módulos.",
                QuestionStatement = "Em uma arquitetura baseada em microsserviços, qual mecanismo é tipicamente adotado para garantir a consistência eventual em transações distribuídas?",
                QuestionOptions = "[\"Transações distribuídas em duas fases (2PC/XA)\", \"Padrão Saga com orquestração ou coreografia\", \"Bloqueio pessimista de tabela inteira\", \"Transações ACID sincronizadas por socket\"]",
                QuestionCorrectIndex = 1,
                QuestionExplanation = "O padrão Saga coordena uma série de transações locais através de eventos ou orquestradores para atingir consistência eventual."
            },
            new
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Title = "Java para Concursos - Completo",
                Description = "Do básico ao avançado: POO, Coleções, Streams API, Concorrência, Spring Boot, JPA/Hibernate e resolução intensiva de questões comentadas das bancas Cebraspe, FGV e FCC.",
                Category = "Desenvolvimento",
                Price = 89.90m,
                ModuleName = "Linguagem Java & Ecossistema Spring",
                SubjectName = "Java Core, Coleções & Programação Funcional",
                SubjectMeta = "20% da prova",
                TopicTitle = "Streams API, Coleções e Lambdas no Java 17+",
                TopicExamBoard = "FGV / FCC",
                TopicContent = "### Streams API e Coleções em Java\n\n- **Streams**: Operações intermediárias (`filter`, `map`, `sorted`) são 'lazy'. Operações terminais (`collect`, `forEach`, `reduce`) executam o pipeline.\n- **List vs Set vs Map**: List mantém ordem e admite duplicados; Set proíbe duplicados; Map mapeia chave-valor.",
                FlashcardFront = "As operações intermediárias em uma Java Stream são executadas imediatamente ou de forma 'lazy'?",
                FlashcardBack = "São executadas de forma lazy (preguiçosa), apenas quando uma operação terminal é acionada.",
                QuestionStatement = "Em Java, qual das seguintes operações em uma Stream é uma operação terminal?",
                QuestionOptions = "[\"filter()\", \"map()\", \"flatMap()\", \"collect()\"]",
                QuestionCorrectIndex = 3,
                QuestionExplanation = "collect() é uma operação terminal que processa os elementos do pipeline e encerra o fluxo gerando o resultado acumulado."
            }
        };

        foreach (var def in courseDefinitions)
        {
            var course = await dbContext.CourseStudyPlans
                .Include(c => c.Modules)
                .Include(c => c.Subjects)
                    .ThenInclude(s => s.Topics)
                .FirstOrDefaultAsync(c => c.Id == def.Id || (c.ProfessorId == profUser.Id && c.Title == def.Title));

            if (course == null)
            {
                course = new CourseStudyPlan
                {
                    Id = def.Id,
                    ProfessorId = profUser.Id,
                    Title = def.Title,
                    Description = def.Description,
                    Category = def.Category,
                    Price = def.Price,
                    IsPublic = true,
                    Status = CourseStatus.Published,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.CourseStudyPlans.Add(course);
                await dbContext.SaveChangesAsync();
            }
            else
            {
                course.Title = def.Title;
                course.Description = def.Description;
                course.Category = def.Category;
                course.Price = def.Price;
                course.IsPublic = true;
                course.Status = CourseStatus.Published;
                dbContext.CourseStudyPlans.Update(course);
                await dbContext.SaveChangesAsync();
            }

            // Guarantee Module
            var module = await dbContext.CourseModules.FirstOrDefaultAsync(m => m.CourseId == course.Id);
            if (module == null)
            {
                module = new CourseModule
                {
                    CourseId = course.Id,
                    Name = def.ModuleName,
                    OrderIndex = 1
                };
                dbContext.CourseModules.Add(module);
                await dbContext.SaveChangesAsync();
            }

            // Guarantee Subject
            var subject = await dbContext.Subjects.FirstOrDefaultAsync(s => s.CourseId == course.Id);
            if (subject == null)
            {
                subject = new Subject
                {
                    CourseId = course.Id,
                    ModuleId = module.Id,
                    Name = def.SubjectName,
                    Meta = def.SubjectMeta,
                    Description = "Conteúdo programático estruturado para o certame.",
                    OrderIndex = 1,
                    UpdatedAt = DateTime.UtcNow
                };
                dbContext.Subjects.Add(subject);
                await dbContext.SaveChangesAsync();
            }
            else if (subject.ModuleId == null)
            {
                subject.ModuleId = module.Id;
                dbContext.Subjects.Update(subject);
                await dbContext.SaveChangesAsync();
            }

            // Guarantee Topic
            var topic = await dbContext.Topics.FirstOrDefaultAsync(t => t.SubjectId == subject.Id);
            if (topic == null)
            {
                topic = new Topic
                {
                    SubjectId = subject.Id,
                    Title = def.TopicTitle,
                    ExamBoard = def.TopicExamBoard,
                    OrderIndex = 1,
                    ContentMarkdown = def.TopicContent
                };
                dbContext.Topics.Add(topic);
                await dbContext.SaveChangesAsync();

                // Flashcard
                var card = new Flashcard
                {
                    TopicId = topic.Id,
                    FrontText = def.FlashcardFront,
                    BackText = def.FlashcardBack,
                    Difficulty = FlashcardDifficulty.Medium
                };
                dbContext.Flashcards.Add(card);

                // Question
                var question = new Question
                {
                    TopicId = topic.Id,
                    Statement = def.QuestionStatement,
                    OptionsJson = def.QuestionOptions,
                    CorrectOptionIndex = def.QuestionCorrectIndex,
                    Explanation = def.QuestionExplanation,
                    ExamBoard = def.TopicExamBoard
                };
                dbContext.Questions.Add(question);
                await dbContext.SaveChangesAsync();
            }
        }

        // 5. Enroll default student into the first course
        var firstCourseId = courseDefinitions[0].Id;
        var existingEnrollment = await dbContext.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentUser.Id && e.CourseId == firstCourseId);
        if (existingEnrollment == null)
        {
            var enrollment = new Enrollment
            {
                StudentId = studentUser.Id,
                CourseId = firstCourseId,
                GrantedBy = profUser.Id,
                GrantedVia = "SYSTEM_SEED",
                Status = EnrollmentStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            dbContext.Enrollments.Add(enrollment);
            await dbContext.SaveChangesAsync();
        }
    }
}
