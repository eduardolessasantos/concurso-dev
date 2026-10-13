# TeacherTech — Existing Functionality (Brownfield Reverse Documented)

Este documento cataloga com precisão o estado real de implementação de cada funcionalidade do TeacherTech, distinguindo o que está plenamente funcional, o que está parcialmente implementado e o que está mockado ou depreciado no código.

---

## 1. Funcionalidades 100% Operacionais (Produção / Backend + Frontend Integrados)

### 1.1. Autenticação, Registro e RBAC
- **Login e Registro JWT**: Criação de contas de Professor e Aluno com criptografia de senha via ASP.NET Core Identity.
- **Claims e Papéis de Usuário**: Emissão de token JWT contendo `NameIdentifier`, `Email` e `Role` (`PROFESSOR` ou `STUDENT`).
- **Guards no Frontend**: `authGuard` bloqueia rotas anônimas; `roleGuard` impede que alunos acessem o Studio ou painéis docentes e vice-versa.
- **Persistência de Sessão**: Tokens e perfil do usuário gerenciados por `AuthService` com Angular Signals e `sessionStorage`.

### 1.2. Professor Studio & Publicação Hierárquica Atômica
- **Criação de Estrutura Curricular**: O professor define Curso -> Módulo -> Disciplina -> Tópico -> Detalhes Teóricos.
- **Geração de Conteúdo com IA (Google Gemini 1.5 Flash)**:
  - Geração de Resumo teórico contextualizado à banca examinadora (Cebraspe, FGV, etc.).
  - Geração de lotes de flashcards pedagógicos (frente e verso com nível de dificuldade).
  - Geração de questões inéditas de múltipla escolha com gabarito e resolução comentada.
  - Suporte a chave de API própria informada pelo professor (criptografada no `localStorage`).
- **Publicação Atômica (`POST /api/courses/studio-publish`)**: Persiste a árvore completa em uma única transação no EF Core.

### 1.3. Sistema de Convites e Resgate de Vagas
- **Geração de Tokens de Convite (`POST /api/invites/generate`)**:
  - Geração de códigos alfanuméricos únicos de 8 caracteres (ex: `aB3x9Z1q`).
  - Configuração de prazo de validade (default 7 dias) e limite máximo de utilizações (default 10).
  - Geração de QR Code em Base64 no backend para exibição imediata em modal.
- **Validação e Resgate Público (`/convite/:token`)**:
  - Visitante sem cadastro consegue validar o convite, visualizar o resumo da turma e criar conta de aluno em fluxo de 1 clique, ativando sua matrícula (`EnrollmentStatus.Active`) de forma instantânea.
  - Alunos já logados podem resgatar inserindo o token no modal Mode B.

### 1.4. Gestão de Turmas pelo Professor (`/professor/alunos`)
- **Listagem de Matriculados**: Exibe nome, e-mail, canal de origem (`INVITE_LINK`, `WHATSAPP`, `PUBLIC_ACCESS`) e data de entrada.
- **Revogação de Acesso**: Endpoint `DELETE /api/enrollments/{id}` para desmatricular alunos.
- **Cópia Rápida de Link**: Botão de 1 clique que copia a URL pública formatada para a área de transferência.

### 1.5. Faturamento SaaS do Professor via Asaas (`BillingController.cs`)
- **Assinatura Recorrente**: Integração direta com API do Asaas para planos Basic (R$ 29,90) e Pro (R$ 59,90).
- **Tratamento de Webhooks**: Endpoint `POST /api/billing/webhook/asaas` com validação de token, registro em log de auditoria (`AsaasWebhookLog`) e ativação da assinatura com cota de créditos de IA.

### 1.6. Área de Estudo do Aluno Matriculado (`/estudo/:courseId`)
- **Consumo Dinâmico via API**: Carrega a árvore hierárquica completa do banco de dados (`GET /api/courses/{id}`).
- **Visualizador Teórico**: Renderização de Markdown, expansão de tópicos e alternância de abas didáticas.

---

## 2. Funcionalidades Parciais (Necessitam de Refinamento ou Conexão)

### 2.1. Vitrine Pública Geral (`/explorar`)
- **O que funciona**: Lista todos os cursos com `IsPublic = true` e `Status = 'PUBLISHED'`. Permite busca textual simples por título/descrição/professor.
- **O que falta / Gargalos**:
  - As categorias disponíveis são botões estáticos ("pills") fixados no HTML (`explore.component.html:L20` - 'Concursos Gerais', 'Engenharia de Software', 'Direito', 'TI & Dados'). Cursos cadastrados com outras categorias não possuem filtro.
  - Não há filtros combinados por banca examinadora, faixa de preço, nível ou formato.
  - Não há paginação no backend ou no frontend; a rota carrega o catálogo inteiro de uma vez.

### 2.2. Vitrine Pública do Professor (`/p/:slug`)
- **O que funciona**: Rota pública carrega dados básicos do docente (`FullName`, `Headline`, `Bio`, quantidade de cursos) e a lista de seus cursos publicados.
- **O que falta / Gargalos**:
  - **Falta personalização real**: O professor não consegue escolher foto de capa/banner, cor tema, foto de perfil personalizada (utiliza apenas avatar padrão com a primeira letra do nome), links para Instagram/LinkedIn/YouTube ou mensagem de boas-vindas customizada.
  - Não exibe depoimentos de alunos ou notas de avaliação.

### 2.3. Fluxo de Contato e Conversão do Visitante
- **O que funciona**: O modal de solicitação de acesso (`SolicitarAcessoModalComponent`) coleta nome, e-mail e mensagem, criando um registro de `AccessRequest` no backend.
- **O que falta / Gargalos**:
  - Se o visitante não está autenticado, o backend cria um usuário fantasma com senha aleatória descartável (`AccessRequestsController.cs:L75`).
  - O professor visualiza solicitações pendentes, mas não há disparo automático de notificação por e-mail ou WhatsApp avisando o professor que um novo aluno quer entrar.
  - O aluno que envia a solicitação fica sem resposta imediata ("aguardando contato manual do professor").

### 2.4. Painel Financeiro e Métricas do Professor (`/professor/financeiro`)
- **O que funciona**: Exibe contagem de alunos ativos, cursos publicados e dados do plano SaaS assinado.
- **O que falta / Gargalos**:
  - Os cards de "Faturamento Líquido", "Vendas Realizadas" e "Saldo Disponível" exibem `0` ou valores fictícios porque o backend bloqueou o checkout individual de cursos. A interface do painel reflete o modelo legado de marketplace de cursos e não o modelo SaaS atual.

---

## 3. Funcionalidades Mockadas, Legadas ou Mortas

### 3.1. Checkout Individual de Cursos (`/checkout/:courseId`)
- **Status**: **MORTO / INCOMPATÍVEL**.
- **Diagnóstico**: O frontend Angular ainda mantém a rota `/checkout/:courseId` e o componente `CheckoutComponent` com tela de QR Code Pix. No entanto, o backend em `PaymentApplicationService.cs:L1260` retorna explicitamente:
  > *"O checkout individual de cursos foi descontinuado no modelo SaaS B2B. Alunos acessam via convite do professor." (HTTP 400)*
- Alunos que tentarem comprar um curso por esta tela encontram erro imediato.

### 3.2. Banco Estático de Tópicos no Frontend (`topics.data.ts`)
- **Status**: **MOCK RESIDUAL DE ALTO IMPACTO**.
- **Diagnóstico**: O arquivo `angular-app/src/app/services/topics.data.ts` possui **328 KB de código TypeScript estático** contendo centenas de questões e tópicos do antigo concurso Dataprev embutidos no bundle compilado do Angular.
- **Impacto**: O lazy chunk `chunk-CxZMzngR.js (subject-detail-component)` possui 325.75 kB, penalizando a performance do primeiro carregamento.

### 3.3. Simulados Cronometrados e Disciplinas Isoladas (`/simulado`, `/disciplinas`)
- **Status**: **LEGADO BASEADO EXCLUSIVAMENTE EM LOCALSTORAGE**.
- **Diagnóstico**: As rotas `/simulado` e `/disciplinas` utilizam o `StoreService.ts`, que grava respostas e histórico de notas exclusivamente nas chaves `dataprev_answers` e `dataprev_simulated` do navegador. Não há sincronização com o endpoint `ProgressController.cs` do backend. Se o aluno limpar o cache ou trocar de navegador, perde todo o histórico.
