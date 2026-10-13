# Epic 2: CTAs de Conversão & Captura Limpa de Leads

**Épico:** EPIC-02 — Funil de Conversão & Higienização do Checkout  
**Prioridade:** P1 (Alta)  
**Status:** Completed (Verificado com Testes e Build)  
**Documentos Relacionados:** `docs/prd.md` (FR-05, FR-09, FR-17 a FR-19, FR-24), `docs/architecture.md` (AD-02, AD-03, AD-04)  

---

## Visão do Épico
Este épico implementa o coração do funil de conversão da vitrine virtual:
1. Permite que o visitante execute **ações claras de contato e compra** (abrir WhatsApp com mensagem personalizada, agendar no Calendly/Cal.com, comprar via Kiwify/Hotmart ou enviar uma mensagem rápida).
2. Substitui a criação insegura de usuários fantasmas com senhas aleatórias por um **registro limpo e transparente de Leads** (`ShowcaseLead`) em conformidade com a LGPD.
3. Remove em definitivo o checkout legado de cursos individuais que gerava erro HTTP 400 no backend.

---

## Histórias de Usuário do Épico 2

---

### Story 2.1: Modelo `ShowcaseLead`, Telemetria de Cliques em CTAs e Endpoint de Captura

**Como** professor autônomo,  
**Quero** que o sistema registre de forma limpa os contatos dos visitantes interessados e contabilize os cliques nos meus botões de ação,  
**Para que** eu possa acompanhar meus potenciais alunos sem que o banco de dados seja poluído com contas de login descartáveis.

#### Contexto & Arquitetura
- **Entidades**:
  - `ShowcaseLead`: `Id`, `ProfessorId`, `ContentOfferingId` (nullable), `Name`, `Email`, `Phone`, `Message`, `Status` (Enum: 1=New, 2=Contacted, 3=Converted, 4=Dismissed), `TermsAccepted` (bool), `CreatedAt`.
  - `ShowcaseMetric`: `Id`, `ProfessorId`, `MetricDate`, `PageViews`, `WhatsAppClicks`, `CtaClicks`, `LeadsCount`.
- **Endpoints no Backend**:
  - `POST /api/publicshowcase/leads`: Recebe `CreateShowcaseLeadDto` com validação de formato de e-mail e telefone. Salva no banco e incrementa `LeadsCount` nas métricas do professor do dia.
  - `POST /api/publicshowcase/track-click`: Recebe `{ professorId, offeringId?, ctaType }` e incrementa o contador correspondente sem travar a requisição.

#### Critérios de Aceitação
- **AC-2.1.1 (Criação de Lead sem Conta de Usuário)**:
  - **Given** um visitante anônimo enviando seus dados pelo formulário da vitrine,
  - **When** `POST /api/publicshowcase/leads` for executado com payload válido,
  - **Then** um registro deve ser criado na tabela `ShowcaseLeads` e **NENHUM** usuário deve ser criado na tabela `AspNetUsers`.
- **AC-2.1.2 (Validação de Consentimento LGPD)**:
  - **Given** um payload com `termsAccepted = false`,
  - **When** o endpoint for chamado,
  - **Then** a requisição deve ser rejeitada com HTTP 400 e mensagem indicando a necessidade de aceite dos termos de contato.
- **AC-2.1.3 (Telemetria de Clique Resiliente)**:
  - **Given** um visitante clicando no botão de WhatsApp de uma oferta,
  - **When** `POST /api/publicshowcase/track-click` for acionado com `ctaType = WhatsApp`,
  - **Then** a resposta deve retornar HTTP 200/204 rapidamente e o contador `WhatsAppClicks` da data atual deve ser incrementado atomicamente.

#### Tarefas Técnicas
1. Criar entidade `ShowcaseLead` e `ShowcaseMetric` com migração EF Core.
2. Criar DTOs `CreateShowcaseLeadDto` e `TrackClickDto`.
3. Adicionar métodos correspondentes em `PublicShowcaseController.cs`.
4. Implementar serviço de agregação atômica de métricas com tratamento de concorrência.
5. Criar testes unitários no xUnit.

---

### Story 2.2: Ações de Conversão na Vitrine: Botão de WhatsApp, Agendamento, Checkout Externo e Modal de Lead

**Como** visitante da vitrine do professor,  
**Quero** interagir facilmente com as ofertas através do canal preferido (WhatsApp, agendamento de horário, compra externa ou envio de mensagem),  
**Para que** eu consiga contratar o serviço ou tirar dúvidas imediatamente.

#### Contexto & Arquitetura
- **Componentes**:
  - `angular-app/src/app/components/professor-showcase/professor-showcase.component.ts` e `.html`
  - Novo modal: `angular-app/src/app/components/shared/contact-lead-modal/contact-lead-modal.component.ts` (substituindo a dependência do modal legado `SolicitarAcessoModalComponent`).
- **Serviço**: `angular-app/src/app/services/public-showcase.service.ts` com métodos `sendLead(data)` e `trackClick(event)`.

#### Critérios de Aceitação
- **AC-2.2.1 (Abertura do WhatsApp com Mensagem Formatada)**:
  - **Given** uma oferta de aula particular com mensagem cadastrada `"Olá Prof. João, quero agendar uma aula."`,
  - **When** o visitante clica no botão "Conversar no WhatsApp",
  - **Then** o sistema deve disparar a telemetria em segundo plano e abrir em nova aba a URL `https://wa.me/55DDDNUMERO?text=...` devidamente codificada com `encodeURIComponent`.
- **AC-2.2.2 (Agendamento Externo & Checkout Externo)**:
  - **Given** uma mentoria com link do Calendly ou e-book com link da Kiwify,
  - **When** o usuário clica no CTA,
  - **Then** o link externo deve ser aberto em nova aba com `target="_blank"` e `rel="noopener noreferrer"`.
- **AC-2.2.3 (Modal de Lead Limpo)**:
  - **Given** o visitante clicando em "Enviar Mensagem / Tirar Dúvidas",
  - **When** o modal abre,
  - **Then** ele deve conter campos de Nome, E-mail, WhatsApp (com máscara brasileira) e Mensagem, além da caixa de aceite de termos, exibindo feedback de sucesso em caso de envio.

#### Tarefas Técnicas
1. Criar `ContactLeadModalComponent` com Angular Reactive Forms / Signals.
2. Integrar chamadas de telemetria no clique de cada tipo de CTA.
3. Testar fluxo no navegador simulando resoluções móveis e desktop.

---

### Story 2.3: Extirpação do Checkout Pix Zumbi e Redirecionamento de Rotas Descontinuadas

**Como** arquiteto de software e mantenedor da plataforma,  
**Quero** remover a tela legada de checkout individual de cursos e redirecionar rotas descontinuadas,  
**Para que** nenhum usuário encontre telas de erro 400 ou funcionalidades zumbis no sistema.

#### Contexto & Arquitetura
- **Frontend**:
  - Depreciar e remover `angular-app/src/app/components/checkout/checkout.component.ts` e seus arquivos `.html`/`.scss`.
  - Atualizar `angular-app/src/app/app.routes.ts`: redirecionar `/checkout/:courseId` para `/explorar`.
  - Remover referências a `/checkout` em botões de cursos.
- **Backend**:
  - Marcar métodos de compra avulsa em `PaymentsController.cs` e `PaymentApplicationService.cs` com atributo `[Obsolete("Checkout avulso de cursos descontinuado no modelo SaaS B2B.", true)]`.

#### Critérios de Aceitação
- **AC-2.3.1 (Redirecionamento Seguro de Rota)**:
  - **Given** um usuário que digita ou clica em uma URL no padrão `/checkout/00000000-0000-0000-0000-000000000000`,
  - **When** a rota é processada pelo Angular Router,
  - **Then** o usuário deve ser redirecionado para `/explorar` sem quebrar a aplicação e sem mensagens de erro no console.
- **AC-2.3.2 (Ausência de Erros HTTP 400 de Pagamento)**:
  - **Given** a aplicação frontend em execução,
  - **When** o usuário navega pelo catálogo ou vitrines de professores,
  - **Then** nenhuma requisição para `POST /api/payments/checkout` deve ser disparada.
- **AC-2.3.3 (Compilação Limpa)**:
  - **Given** os arquivos mortos removidos,
  - **When** executados os comandos `npm run build` e `dotnet build`,
  - **Then** ambos os builds devem passar sem erros.

#### Tarefas Técnicas
1. Deletar pasta `angular-app/src/app/components/checkout/`.
2. Remover declaração de rota do `app.routes.ts` e adicionar redirecionamento seguro.
3. Ajustar controllers e services do backend eliminando caminhos de código mortos.
4. Rodar suíte de testes xUnit e build do Angular.

---

## Critérios de Pronto (Definition of Done do Epic 2)
- [x] Entidades `ShowcaseLead` e `ShowcaseMetric` ativas no banco de dados.
- [x] Endpoints de lead e telemetria funcionando com testes unitários.
- [x] Botões de ação da vitrine (WhatsApp, Agendamento, Checkout) operacionais.
- [x] Componente zumbi de checkout removido e rotas redirecionadas com sucesso.
- [x] Nenhuma criação de usuário fantasma com senha descartável na base.
