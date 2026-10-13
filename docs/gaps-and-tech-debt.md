# TeacherTech — Gaps & Débitos Técnicos (Brownfield Reverse Documented)

Este relatório expõe de maneira crítica e transparente os gargalos arquiteturais, débitos técnicos e inconsistências de produto decorrentes do crescimento do código sem planejamento prévio de requisitos (sem PRD, sem épicos e sem histórias de usuário).

---

## 1. Dissonância no Modelo de Negócio (Pivot Não Finalizado)

### 🔴 O Conflito: Marketplace B2C vs. SaaS B2B de Mentoria
- **Causa Raiz**: O projeto iniciou concebido como um marketplace aberto de cursos, onde alunos comprariam diretamente por Pix e a plataforma reteria 10% de split (`PaymentDomainService`, `PaymentsController.cs`). No meio do desenvolvimento, o modelo foi pivotado para **SaaS B2B**, onde o professor assina uma mensalidade fixa no Asaas (`BillingController.cs`) e concede acesso direto aos alunos via convite/token.
- **Sintomas Críticos no Código**:
  1. A rota `/checkout/:courseId` e o `CheckoutComponent` continuam ativos no Angular, mas a chamada HTTP à API falha com HTTP 400 (`PaymentApplicationService.cs:L1260` bloqueia explicitamente a compra avulsa).
  2. O `FinancialDashboardComponent` do professor ainda tenta consultar `GET /api/payments/professor-balance`, recebendo dados estáticos com faturamento zerado (`0.00m`), gerando confusão total para o docente.
  3. A entidade `ProfessorProfile` ainda possui campos legados como `PixKey` (para repasses que não mais ocorrem) e carece de campos vitais para o modelo atual.

---

## 2. Débitos Estruturais de Código (God Files & Anti-Patterns)

### 🔴 Arquivos Gigantescos Monolíticos no Backend (.NET 9)
1. **`ApplicationServices.cs` (1.660 linhas / 65 KB)**:
   - Concentra **8 classes de serviços distintas** em um único arquivo de código: `AuthApplicationService`, `CourseApplicationService`, `SubjectApplicationService`, `TopicApplicationService`, `AiApplicationService`, `AccessRequestApplicationService`, `PaymentApplicationService` e `PublicShowcaseApplicationService`.
   - **Impacto**: Violação explícita do Princípio da Responsabilidade Única (SRP), alto risco de conflitos de merge (git lock), dificuldade extrema de manutenção e testes unitários acoplados.
2. **`DomainEntities.cs` (513 linhas / 16 KB)**:
   - Concentra **17 entidades e múltiplos enums** no mesmo arquivo.
   - Dificulta a localização de atributos, relacionamentos e regras de validação.
3. **`DomainRepositories.cs` (436 linhas)**:
   - Repositórios agregados de múltiplos agregados do DDD definidos em bloco contínuo.

### 🔴 Estrutura Desorganizada e Híbrida no Frontend (Angular 22)
1. **Duplicação de Estruturas de Diretórios**:
   - O projeto possui `src/app/components/` (com 24 componentes) e paralelamente iniciou `src/app/features/` e `src/app/core/`.
   - Em vez de realizar uma migração limpa, foram criados arquivos de re-export com apenas 2 linhas de código (ex: `features/explorar/explorar.component.ts`, `features/public-profile/public-profile.component.ts`, `core/services/auth.service.ts`).
2. **Falta de Automação de Testes Frontend**:
   - `vitest` falha ao inicializar devido a módulo ausente no node_modules local (`startVitestModuleRunner.DB-7oCpn.js`).
   - `npm test` falha por configuração incompatível de flags no `angular.json` (`Error: Unknown argument: run`).
   - O frontend atualmente opera com **0% de cobertura de testes automatizados**, gerando alto risco de regressão a cada alteração de tela.
3. **Bundle Poluído com Dados Estáticos (`topics.data.ts` - 328 KB)**:
   - Arquivo legado com massa de dados estática do concurso Dataprev embutido na aplicação, sobrecarregando o bundle final compilado (`chunk-CxZMzngR.js` com mais de 325 kB).

---

## 3. Gargalos Críticos na Vitrine Virtual e Conversão

### 🟠 Ausência de Customização Real da Vitrine do Professor (`/p/:slug`)
- O modelo de dados `ProfessorProfile` armazena apenas `Headline` e `Bio`.
- **Faltam campos essenciais para conversão de vendas**:
  - Imagem de capa / banner customizado do professor.
  - Foto de perfil / avatar real (atualmente usa a primeira letra do nome como emoji).
  - Cor primária da marca / tema do professor.
  - Links de redes sociais (Instagram, LinkedIn, YouTube, Canal do Telegram).
  - Número de WhatsApp direto para tirar dúvidas com o mentor.
  - Vídeo de apresentação embutido (YouTube/Vimeo).
  - Seção de depoimentos e avaliações de alunos.

### 🟠 Gargalos no Mecanismo de Busca e Categorização (`/explorar`)
- **Categorias Hardcoded**: As categorias de filtro na vitrine estão cravadas estaticamente no template HTML (`explore.component.html:L20-L24`). Se o professor cadastrar um curso de "Medicina", "Inglês" ou "Matemática Financeira", o curso não possui botão de filtro na busca.
- **Busca Incompleta**: O backend faz um simples `.Contains()` em `Title`, `Description` e `FullName`. Não suporta busca por banca examinadora, tags, nível de dificuldade ou busca fonética/semântica.
- **Ausência de Paginação**: A consulta executa `ToListAsync()` retornando todo o banco de cursos públicos de uma única vez. Quando a plataforma ultrapassar dezenas de cursos, causará lentidão e alto consumo de memória.

### 🟠 Criação de Usuários Fantasmas no Envio de Solicitação Anônima
- Em `AccessRequestsController.cs:L65-80`, quando um visitante anônimo envia uma solicitação de acesso pela vitrine, o backend provisiona um usuário no `AspNetUsers` com senha aleatória descartável (`"AlunoTech" + Guid.NewGuid() + "!"`) e e-mail não confirmado.
- **Risco**: Poluição do banco de dados com contas fantasmas órfãs, potenciais colisões de e-mail e falha de segurança ao não solicitar validação de e-mail ou fluxo formal de cadastro com consentimento de termos de privacidade (LGPD).

---

## 4. Persistência Fragmentada do Aluno

### 🟠 O "Abismo" entre LocalStorage e Banco de Dados
- Enquanto o backend possui a entidade `StudentProgress` e o `ProgressController.cs`, os componentes de estudo de disciplinas e simulados (`SubjectDetailComponent`, `SimulatedComponent`, `StoreService.ts`) persistem o progresso, as respostas e os simulados realizados apenas no `localStorage` do navegador do aluno (`dataprev_answers`, `dataprev_simulated`, `dataprev_history`).
- **Consequência**: Se o aluno acessa o TeacherTech do celular e depois do notebook, seu histórico de estudos e taxa de acertos não se comunicam, destruindo a experiência de aprendizagem continuada.
