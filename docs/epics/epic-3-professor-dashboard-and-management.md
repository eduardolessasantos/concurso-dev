# Epic 3: Painel de Controle e Gestão do Docente

**Épico:** EPIC-03 — Gestão da Vitrine, Ofertas & Dashboard  
**Prioridade:** P1 (Alta)  
**Status:** Completed (Implementado e Validado)  
**Documentos Relacionados:** `docs/prd.md` (FR-06, FR-20 a FR-23, FR-25), `docs/architecture.md` (Seções 4.2 e 5.1)  

---

## Visão do Épico
Este épico entrega a experiência administrativa do professor para:
1. **Configurar sua vitrine em poucos cliques** com visualização em tempo real (Live Preview) antes de publicar.
2. **Cadastrar, editar e organizar suas ofertas** (aulas particulares presenciais/online, cursos, e-books e mentorias).
3. **Acompanhar o desempenho da sua vitrine em um dashboard unificado** (visualizações, cliques em WhatsApp, leads capturados, status da assinatura Asaas e saldo de créditos de IA).

---

## Histórias de Usuário do Épico 3

---

### Story 3.1: Endpoints de Gestão da Vitrine e Métricas do Docente

**Como** professor autenticado,  
**Quero** endpoints protegidos para atualizar os dados da minha vitrine, gerenciar minhas ofertas e consultar métricas de conversão,  
**Para que** eu tenha controle total da minha presença digital através de uma API segura.

#### Contexto & Arquitetura
- **Controllers**:
  - `backend/src/TeacherTech.Api/Controllers/ProfessorShowcaseController.cs` (novo controller protegido com `[Authorize(Roles = "PROFESSOR")]`).
  - `backend/src/TeacherTech.Api/Controllers/OfferingsController.cs` (CRUD de ofertas do professor logado).
- **Segurança**: Obter o `ProfessorId` a partir da claim `ClaimTypes.NameIdentifier` do token JWT para garantir que nenhum professor altere a vitrine de outro docente.

#### Critérios de Aceitação
- **AC-3.1.1 (Atualização Segura da Vitrine)**:
  - **Given** um professor autenticado com token válido,
  - **When** `PUT /api/professor/showcase` for executado com novo tema `#6366F1`, banner, cidade e links sociais,
  - **Then** os dados do `ProfessorProfile` devem ser atualizados e retornar HTTP 200 com os dados atualizados.
- **AC-3.1.2 (Validação de Slug Único)**:
  - **Given** uma tentativa de alterar o slug para um valor já utilizado por outro professor,
  - **When** a requisição for processada,
  - **Then** a API deve retornar HTTP 409 Conflict com mensagem explicativa `"O slug informado já está em uso por outro educador."`.
- **AC-3.1.3 (CRUD de Ofertas Isolado por Usuário)**:
  - **Given** o endpoint `GET /api/professor/offerings`,
  - **When** consultado pelo professor logado,
  - **Then** deve retornar apenas as ofertas criadas por aquele professor específico.
- **AC-3.1.4 (Consulta de Métricas Agregadas)**:
  - **Given** acessos e cliques registrados para o professor nos últimos 30 dias,
  - **When** `GET /api/professor/metrics?days=30` for requisitado,
  - **Then** deve retornar o consolidado de `totalViews`, `whatsappClicks`, `ctaClicks`, `totalLeads` e lista por dia para gráficos.

#### Tarefas Técnicas
1. Criar `ProfessorShowcaseController` e `OfferingsController`.
2. Implementar validação de regex e unicidade de slug.
3. Criar DTOs `UpdateShowcaseDto`, `OfferingDto`, `ProfessorMetricsDto`.
4. Implementar testes de integração com `WebApplicationFactory` e autenticação mockada.

---

### Story 3.2: Tela de Customização da Vitrine no Frontend com Live Preview (`/professor/vitrine`)

**Como** professor autônomo,  
**Quero** um editor visual da minha vitrine com pré-visualização em tempo real (desktop e mobile),  
**Para que** eu veja exatamente como meus alunos enxergarão minha página antes de salvar as alterações.

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/professor-showcase-editor/professor-showcase-editor.component.ts` e arquivos correlatos.
- **Rota**: `/professor/vitrine` protegida por `authGuard` e `roleGuard` (role: `PROFESSOR`).
- **Live Preview**: Layout dividido (Split View) com formulário à esquerda e mockup de smartphone/tela à direita, atualizado reativamente via Angular Signals.

#### Critérios de Aceitação
- **AC-3.2.1 (Atualização Reativa no Mockup)**:
  - **Given** o professor digitando sua bio ou alterando o seletor de cor tema,
  - **When** o valor do input muda,
  - **Then** o mockup de visualização ao lado deve refletir a nova cor e o novo texto instantaneamente sem recarregar a página.
- **AC-3.2.2 (Validação Imediata de Slug)**:
  - **Given** o campo de slug,
  - **When** o usuário digita caracteres inválidos (espaços ou maiúsculas),
  - **Then** o formulário deve sanitizar automaticamente para minúsculas com hífen e exibir se o link está livre para uso.
- **AC-3.2.3 (Persistência com Toast de Sucesso)**:
  - **Given** o professor clicando em "Salvar Alterações",
  - **When** a API responde com sucesso,
  - **Then** uma notificação de sucesso deve ser exibida e um botão "Ver Vitrine Pública" deve abrir `/professor/:slug` em nova aba.

#### Tarefas Técnicas
1. Gerar componente standalone `ProfessorShowcaseEditorComponent`.
2. Implementar formulário reativo com campos de identidade visual, mídia e redes sociais.
3. Construir o container de Live Preview com alternância de visão Desktop / Mobile.
4. Adicionar estilos SCSS com responsividade para telas menores (onde a pré-visualização vira uma aba alternável).

---

### Story 3.3: Gerenciador de Ofertas Multiconteúdo no Frontend (`/professor/ofertas`)

**Como** professor cadastrado,  
**Quero** cadastrar, editar, pausar e organizar a ordem das minhas ofertas (aulas particulares, cursos, e-books, mentorias),  
**Para que** minha vitrine sempre reflita os serviços que estou disponibilizando no momento.

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/offerings-manager/offerings-manager.component.ts` e `.html` / `.scss`.
- **Rota**: `/professor/ofertas` protegida por `authGuard` e `roleGuard`.
- **Modal de Oferta**: Modal intuitivo onde a escolha do tipo de oferta adapta os campos visíveis (ex: se escolher `Presencial`, exige Cidade e UF; se escolher `WhatsApp`, exibe campo de mensagem personalizada).

#### Critérios de Aceitação
- **AC-3.3.1 (Formulário Dinâmico por Tipo de Conteúdo)**:
  - **Given** o cadastro de uma nova oferta,
  - **When** o tipo "Aula Particular" é selecionado,
  - **Then** os campos de Formato (Presencial/Online), Matéria e Valor por Hora devem ser exibidos de forma contextualizada.
- **AC-3.3.2 (Ativação e Desativação Rápida com Switch)**:
  - **Given** uma oferta existente na lista,
  - **When** o professor clica no alternador de status (switch),
  - **Then** a oferta deve alternar entre ativa e pausada na vitrine pública imediatamente.
- **AC-3.3.3 (Reordenação de Cards)**:
  - **Given** múltiplas ofertas na lista,
  - **When** o professor move os itens para cima ou para baixo,
  - **Then** a ordem de exibição na vitrine pública deve ser atualizada.

#### Tarefas Técnicas
1. Criar componente `OfferingsManagerComponent` e modal de edição.
2. Criar serviço Angular `OfferingsService` integrado aos endpoints REST.
3. Implementar feedback visual de loading, sucesso e confirmação antes de excluir.

---

### Story 3.4: Dashboard Unificado com Painel de Leads e Métricas de Conversão (`/professor/dashboard`)

**Como** professor autônomo,  
**Quero** um dashboard claro que mostre quantas pessoas visitaram minha vitrine, quantos contatos foram gerados e o status do meu plano SaaS,  
**Para que** eu saiba se minhas divulgações estão funcionando e possa atender meus alunos rapidamente.

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/professor-dashboard/professor-dashboard.component.ts` (substituindo o antigo `/professor/financeiro` que exibia dados de vendas de marketplace zerados).
- **Rota**: `/professor/dashboard` com redirecionamento da rota antiga `/professor/financeiro`.
- **Seções Principais**:
  1. Cards de KPI: Visualizações da Vitrine, Cliques em WhatsApp, Contatos de Leads e Alunos Ativos.
  2. Tabela de Leads Recentes: Nome, E-mail, Telefone, Oferta de Interesse, Data e botão de 1 clique "Chamar no WhatsApp".
  3. Status da Assinatura: Plano Atual (Basic/Pro Asaas), Data de Renovação e Créditos de IA.

#### Critérios de Aceitação
- **AC-3.4.1 (Cards de Métricas Confiáveis)**:
  - **Given** o acesso ao `/professor/dashboard`,
  - **When** o componente carregar,
  - **Then** os cards devem exibir os números reais consolidados da vitrine em vez de faturamentos de marketplace zerados.
- **AC-3.4.2 (Gestão de Leads e Contato Rápido)**:
  - **Given** um lead na tabela com telefone cadastrado,
  - **When** o professor clica no botão "WhatsApp",
  - **Then** o sistema deve abrir o WhatsApp Web diretamente com o número do interessado e marcar o status do lead como `Contatado`.
- **AC-3.4.3 (Informações Transparentes do Plano SaaS)**:
  - **Given** um professor assinante do Plano Pro via Asaas,
  - **When** a seção de assinatura é visualizada,
  - **Then** deve exibir o status da assinatura, próxima data de cobrança e quantidade de créditos de IA restantes para uso no Studio.

#### Tarefas Técnicas
1. Criar componente `ProfessorDashboardComponent`.
2. Integrar com endpoints de métricas, leads e assinatura Asaas.
3. Substituir referências no menu lateral do professor de `/professor/financeiro` para `/professor/dashboard`.
4. Testar build completo da aplicação.

---

## Critérios de Pronto (Definition of Done do Epic 3)
- [x] Endpoints de gerenciamento da vitrine e métricas testados e documentados (`ProfessorManagementController`).
- [x] Editor com Live Preview funcional em `/professor/vitrine` (`ProfessorShowcaseEditorComponent`).
- [x] Gerenciador de ofertas permitindo cadastro de aulas, cursos, e-books e mentorias (`OfferingsManagerComponent`).
- [x] Dashboard consolidado substituindo a tela legada de financeiro (`ProfessorDashboardComponent`).
- [x] Suíte de testes automatizados do projeto aprovada (53/53 testes no backend, build Angular 100% verde).
