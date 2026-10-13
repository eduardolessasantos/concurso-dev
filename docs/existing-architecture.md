# TeacherTech — Existing Architecture (Brownfield Reverse Documented)

## 1. Stack Tecnológica Real Encontrada

A análise em código confirma a seguinte composição tecnológica:

### Backend
- **Runtime & Framework**: .NET 9.0 (C# 13), ASP.NET Core Web API.
- **ORM & Banco de Dados**: Entity Framework Core 9.0 (`Microsoft.EntityFrameworkCore.Sqlite` e `Pomelo.EntityFrameworkCore.MySql`).
- **Autenticação & Autorização**: ASP.NET Core Identity integrado ao EF Core, com autenticação stateless via **JWT Bearer Tokens** e Role-Based Access Control (`ADMIN`, `PROFESSOR`, `STUDENT`).
- **Testes Automatizados**: xUnit + Moq + FluentAssertions + `Microsoft.AspNetCore.Mvc.Testing` (40 testes aprovados executando sobre banco SQLite em memória/arquivo temporário).
- **Documentação de API**: Swagger / OpenAPI (Swashbuckle) ativado em ambiente de desenvolvimento.

### Frontend
- **Framework**: Angular 22.0.0 (aplicação Standalone Components, sem NgModules clássicos).
- **Gerenciamento de Estado**: Reatividade moderna baseada em **Angular Signals** (`signal()`, `computed()`) combinada com `rxjs` e persistência parcial em `localStorage` / `sessionStorage`.
- **Roteamento**: Angular Router com Lazy Loading por componente (`loadComponent: () => import(...)`) e rotas protegidas por Guards funcionais (`authGuard`, `roleGuard`).
- **Estilização**: SCSS Vanilla modular por componente com folha global em `styles.scss` (não utiliza TailwindCSS no estágio atual).
- **Build & Empacotamento**: `@angular/build:application` (Vite/Esbuild pipeline integrado ao Angular CLI 22).

### Integrações Externas
- **IA Generativa**: Google Gemini API (`gemini-1.5-flash`), com suporte a chave global de sistema ou chave pessoal informada pelo próprio professor e persistida em seu navegador via `localStorage`.
- **Billing & Assinaturas Recorrentes**: Gateway de pagamento **Asaas** (criação de clientes, planos mensais Basic e Pro via Webhook HMAC com header `asaas-access-token`).
- **Comunicação & Mensageria**: WhatsApp Business API (WABA Meta Cloud API) para envio de mensagens com link de convite.
- **CI/CD & Deploy**: GitHub Actions (`.github/workflows/deploy.yml`) executando testes de backend e build do Angular com publicação estática no GitHub Pages.

---

## 2. Estrutura de Diretórios do Repositório

O projeto adota uma estrutura monorepo com junção/symlink:

```
TeacherTech/
├── .github/workflows/deploy.yml     # Pipeline CI/CD (Testes .NET + Build Angular)
├── angular-app/                     # Aplicação Frontend Angular 22
│   ├── public/                      # Assets estáticos (favicon, ícones)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # 24 componentes de tela e modais
│   │   │   │   ├── auth/            # Login e tela mista
│   │   │   │   ├── checkout/        # Checkout legado de cursos
│   │   │   │   ├── explore/         # Vitrine pública de cursos e busca
│   │   │   │   ├── financial-dashboard/ # Painel financeiro do professor
│   │   │   │   ├── invite-redeem/   # Resgate de convite por token (8 caracteres)
│   │   │   │   ├── my-studies/      # Painel do estudante com matrículas ativas
│   │   │   │   ├── professor-plans/ # Planos de assinatura do professor (Asaas)
│   │   │   │   ├── professor-showcase/ # Vitrine personalizada do professor (/p/:slug)
│   │   │   │   ├── professor-studio/   # Studio de criação e geração com IA
│   │   │   │   ├── student-management/ # Gestão de alunos e emissão de convites
│   │   │   │   ├── study-wrapper/   # Ambiente de leitura, flashcards e matérias
│   │   │   │   └── ...              # Componentes institucionais e simulados
│   │   │   ├── core/                # Re-exports de interceptors, guards e services
│   │   │   ├── features/            # Re-exports parciais e componente de onboarding
│   │   │   ├── guards/              # auth.guard.ts, role.guard.ts
│   │   │   ├── interceptors/        # auth.interceptor.ts
│   │   │   ├── models/              # Interfaces TypeScript de dados
│   │   │   └── services/            # Serviços HTTP, signals stores e mock de tópicos
│   │   ├── environments/            # environment.ts e environment.prod.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss              # Estilização global e tokens visuais
│   ├── angular.json
│   └── package.json
├── backend/                         # Solução .NET 9 Web API (DDD / Camadas)
│   ├── src/
│   │   ├── TeacherTech.Api/         # Apresentação HTTP (Controllers, Program.cs)
│   │   ├── TeacherTech.Application/ # Casos de uso (Services, DTOs, Interfaces)
│   │   ├── TeacherTech.Domain/      # Entidades, Enums e Interfaces de Repositório
│   │   └── TeacherTech.Infrastructure/ # EF Core DbContext, Repositórios, Migrações, IA
│   ├── tests/
│   │   └── TeacherTech.Tests/       # Suíte xUnit de testes unitários e de integração
│   └── TeacherTech.sln
├── frontend                         # Junction/Symlink apontando para angular-app/
└── docs/                            # Documentação do projeto (BMad Brownfield)
```

---

## 3. Modelos de Dados Reais Existentes

Todas as entidades de banco estão consolidadas em `backend/src/TeacherTech.Domain/Entities/DomainEntities.cs` e mapeadas no `ApplicationDbContext.cs`:

### 3.1. Núcleo de Usuários e Perfis
- **`ApplicationUser`**: Herda de `IdentityUser`. Armazena `FullName`, `UserRole` (`ADMIN`, `PROFESSOR`, `STUDENT`), `AvatarUrl`, timestamps e coleções de navegação.
- **`ProfessorProfile`**: Chave primária/estrangeira 1:1 com `ApplicationUser.Id`. Contém `Headline`, `Bio`, `PixKey`, `CustomSlug` (índice único para vitrine), `PublicVisibility`, `AsaasCustomerId`, `AiCreditsLimit` e `AiCreditsUsed`.
- **`StudentProfile`**: Chave primária/estrangeira 1:1 com `ApplicationUser.Id`. Contém `GoalExam` e `Bio`.
- **`ProfessorSubscription`**: Controla o plano SaaS B2B assinado pelo professor (`PlanType`: Free, Basic, Pro; `Status`: Active, Pending, PastDue, Canceled; `AsaasSubscriptionId`, `MaxCoursesAllowed`, `AiCreditsLimit`).

### 3.2. Estrutura Hierárquica Pedagógica do Conteúdo
- **`CourseStudyPlan`**: Curso ou plano de estudo raiz. `Id` (GUID), `ProfessorId` (FK), `Title`, `Description`, `Category`, `Price`, `IsPublic`, `Status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `CoverImageUrl`.
- **`CourseModule`**: Módulo/sessão organizadora (`CourseId`, `Name`, `OrderIndex`).
- **`Subject`**: Disciplina vinculada ao curso e opcionalmente a um módulo (`Name`, `Meta`, `Description`, `OrderIndex`).
- **`Topic`**: Tópico específico do edital/ementa (`SubjectId`, `Title`, `ContentMarkdown`, `ExamBoard`, `OrderIndex`).
- **`TopicContent`**: Detalhamento estendido 1:1 com `Topic` (`Summary`, `Detail`, `Peso`, `ContentMarkdown`, `ExamplesJson`, `KeyPointsJson`, `TipsJson`, `UsefulLinksJson`).
- **`Flashcard`**: Cartão de memorização (`TopicId`, `FrontText`, `BackText`, `Difficulty`).
- **`Question`**: Questão de treino (`TopicId`, `Statement`, `OptionsJson`, `CorrectOptionIndex`, `Explanation`, `ExamBoard`).
- **`StudySchedule`**: Cronograma semanal (`CourseId`, `WeekNumber`, `DayOfWeek`, `GoalMinutes`, `Notes`).
- **`SimulatedTest` & `SimulatedQuestion`**: Provas cronometradas (`TimeLimitMinutes`, enunciado, alternativas e gabarito).

### 3.3. Distribuição de Acessos, Convites e Matrículas
- **`InviteToken`**: Token alfanumérico gerado pelo professor para um curso específico (`Token` único de 8 caracteres, `ExpiresAt`, `MaxUses`, `UsedCount`, `Channel`: Link, WhatsApp, QrCode, Email, `TargetPhone`).
- **`WhatsAppLog`**: Auditoria de disparos de convite via API do WhatsApp (`InviteTokenId`, `WabaMessageId`, `ToPhone`, `Status`).
- **`Enrollment`**: Matrícula do estudante no curso (`StudentId`, `CourseId`, `InviteTokenId`, `GrantedBy`, `GrantedVia`, `Status`: Active, Suspended, Expired).
- **`AccessRequest`**: Solicitação aberta por visitante na vitrine (`StudentId`, `CourseId`, `Message`, `Status`: Pending, Approved, Rejected).
- **`StudentProgress`**: Registro de progresso de estudo e acerto em questões (`StudentId`, `TopicId`, `QuestionId`, `IsCorrect`, `TimeSpentSeconds`).
- **`AsaasWebhookLog`**: Histórico bruto de webhooks recebidos do gateway de faturamento (`Event`, `PaymentId`, `CustomerId`, `SubscriptionId`, `PayloadJson`, `ProcessedSuccessfully`).

---

## 4. Mapeamento de Rotas e Endpoints

### 4.1. Rotas do Frontend (Angular Router)
| Caminho Frontend | Componente Carregado | Proteção | Finalidade |
| :--- | :--- | :--- | :--- |
| `/` e `/explorar` | `ExploreComponent` | Aberta | Catálogo geral de cursos e vitrines de professores |
| `/p/:slug` | `ProfessorShowcaseComponent` | Aberta | Vitrine pública personalizada do professor |
| `/convite/:token` | `InviteRedeemComponent` | Aberta | Validação e resgate de convite exclusivo |
| `/login` | `AuthComponent` | Aberta | Login com credenciais |
| `/cadastro`, `/registro` | `RegisterComponent` | Aberta | Cadastro de novo usuário |
| `/checkout/:courseId` | `CheckoutComponent` | Aberta | Checkout legado (inativo no backend) |
| `/estudo/:courseId` | `StudyWrapperComponent` | `authGuard` | Ambiente de estudo do aluno matriculado |
| `/meus-estudos` | `MyStudiesComponent` | `roleGuard` (Student/Prof) | Listagem dos cursos onde o aluno estuda |
| `/professor/estudio` | `ProfessorStudioComponent` | `roleGuard` (Prof) | Painel de criação e geração com IA |
| `/professor/estudio/:courseId/modulos` | `CourseModulesComponent` | `roleGuard` (Prof) | Gestão de módulos do curso |
| `/professor/alunos` | `StudentManagementComponent` | `roleGuard` (Prof) | Emissão de convites e lista de matriculados |
| `/professor/financeiro` | `FinancialDashboardComponent`| `roleGuard` (Prof) | Métricas de alunos e plano assinado |
| `/professor/planos` | `ProfessorPlansComponent` | `roleGuard` (Prof) | Assinatura de planos SaaS do TeacherTech |
| `/disciplinas`, `/simulado` | `SubjectsComponent`, `SimulatedComponent` | `authGuard` | Telas legadas de estudo baseadas em LocalStorage |

### 4.2. Controladores REST do Backend (.NET 9)
| Controller | Rota Base | Métodos Chave |
| :--- | :--- | :--- |
| `AuthController` | `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `POST /seed-test-users` |
| `PublicShowcaseController` | `/api/publicshowcase` | `GET /professors/{slug}`, `GET /explore`, `GET /courses/{id}` |
| `CoursesController` | `/api/courses` | `GET /public`, `GET /explore`, `GET /public/{slug}`, `GET /my-courses`, `GET /{id}`, `POST /`, `POST /studio-publish` |
| `InvitesController` | `/api/invites` | `POST /generate`, `GET /validate/{token}`, `POST /redeem/{token}`, `POST /send-whatsapp` |
| `AccessRequestsController` | `/api/accessrequests`| `POST /` (público), `GET /pending`, `POST /{id}/approve`, `POST /{id}/reject` |
| `EnrollmentsController` | `/api/enrollments` | `GET /my-studies`, `GET /course/{courseId}`, `DELETE /{id}`, `POST /invite-by-email` |
| `BillingController` | `/api/billing` | `POST /checkout`, `POST /webhook/asaas` |
| `AiController` | `/api/ai` | `POST /generate-summary`, `POST /generate-flashcards`, `POST /generate-questions` |
| `ProgressController` | `/api/progress` | `POST /record`, `GET /stats` |
| `PaymentsController` | `/api/payments` | `POST /checkout` *(Retorna 400 por depreciação)*, `GET /professor-balance` |
| `HealthController` | `/api/health` | `GET /`, `GET /ready`, `GET /live` |
