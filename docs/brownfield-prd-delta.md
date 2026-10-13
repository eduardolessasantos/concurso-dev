# TeacherTech — Brownfield PRD Delta (O que falta para o MVP da Vitrine Virtual)

## 1. Objetivo deste Documento
Definir o escopo exato do **Delta de Implementação** necessário para consolidar o **TeacherTech** como uma vitrine virtual de excelência para professores autônomos, eliminando as ambiguidades entre o modelo legado e o modelo SaaS atual, e garantindo que o produto atinja maturidade de lançamento (MVP Production-Ready).

---

## 2. Visão do Produto Final do MVP
> **TeacherTech é a plataforma onde professores autônomos criam seus cursos estruturados com IA em minutos, publicam uma vitrine virtual personalizada de alta conversão (`/p/:slug`) e distribuem vagas para seus alunos com controle total por convites e WhatsApp.**

---

## 3. Matriz Delta de Funcionalidades (O que já existe vs. O que falta)

| Área do Sistema | Estado Atual (Brownfield) | O que Falta para o MVP Completo (Delta) | Prioridade |
| :--- | :--- | :--- | :--- |
| **Vitrine do Professor (`/p/:slug`)** | Perfil estático básico com texto puro e lista crua de cursos. Avatar é inicial do nome. | **Sistema de Vitrine Personalizável**: Upload de foto e banner de capa, tema/cor de destaque, links sociais (Instagram, LinkedIn, YouTube), botão flutuante de WhatsApp direto, vídeo de apresentação e bio formatada. | **P0 (Crítico)** |
| **Busca & Filtros (`/explorar`)** | Busca simples com `.Contains()` e 4 categorias fixas hardcoded no template HTML. Sem paginação. | **Busca Facetada e Categorias Dinâmicas**: Endpoint de categorias ativas, filtros por banca (FGV, Cebraspe), termo de busca indexado e paginação no backend (`page`, `pageSize`). | **P0 (Crítico)** |
| **Contato & Conversão** | Modal com criação de usuário fantasma com senha aleatória e sem aviso ao professor. | **Funil de Conversão Limpo**: Captura de Lead com opt-in LGPD, notificação ao professor de nova solicitação e aprovação com envio automático de link de convite. | **P1 (Alta)** |
| **Painel do Docente (`/professor/dashboard`)** | Telas fragmentadas (`/financeiro`, `/alunos`, `/estudio`); métricas financeiras zeradas do modelo legado. | **Dashboard Unificado do Professor**: Visão consolidada de visitantes na vitrine, solicitações pendentes, alunos ativos, cota de créditos de IA e status do plano SaaS. | **P1 (Alta)** |
| **Remoção de Código Zumbi** | Rota `/checkout/:courseId` e `CheckoutComponent` ativos chamando API que retorna HTTP 400. | **Higienização de Rotas e Telas Mortas**: Desativação e remoção do checkout legado de cursos individuais, redirecionando o fluxo de aquisição para solicitação de acesso ou resgate de convite. | **P0 (Crítico)** |
| **Persistência do Aluno** | Respostas de simulados e questões gravadas exclusivamente em `localStorage` no browser. | **Sincronização de Progresso na Nuvem**: Integrar componentes de simulado e questões à API `ProgressController`, permitindo estudo contínuo multiplataforma. | **P2 (Média)** |

---

## 4. Requisitos Detalhados do MVP

### 4.1. Épico 1: Personalização da Vitrine Pública do Professor (`/p/:slug`)
- **REQ-01.1 (Modelo)**: Expandir `ProfessorProfile` para incluir:
  - `AvatarUrl` (URL da foto do professor).
  - `BannerImageUrl` (URL da imagem de capa/hero).
  - `ThemeColor` (cor de destaque primária da vitrine em formato hexadecimal).
  - `VideoIntroUrl` (link do vídeo de apresentação no YouTube/Vimeo).
  - `WhatsAppNumber` (número para contato com mensagem de abertura customizada).
  - `SocialLinksJson` (JSON serializado contendo links para Instagram, LinkedIn, YouTube, Telegram e Site pessoal).
- **REQ-01.2 (Painel do Professor)**: Nova aba ou tela "Minha Vitrine" dentro do menu do professor para editar esses dados com **visualização prévia em tempo real (Live Preview)**.
- **REQ-01.3 (Landing Page do Professor)**: Redesenhar `/p/:slug` com estética moderna, tipografia refinada, banner, crachá de verificado, botão de contato via WhatsApp e lista de cursos em destaque.

### 4.2. Épico 2: Motor Dinâmico de Busca, Filtros e Categorias (`/explorar`)
- **REQ-02.1 (Categorias Dinâmicas)**: Novo endpoint `GET /api/publicshowcase/categories` que consulta e agrupa as categorias reais cadastradas em cursos publicados.
- **REQ-02.2 (Filtros Facetados)**: A interface de exploração deve permitir filtrar por:
  - Categoria temática (dinâmica).
  - Banca examinadora (FGV, Cebraspe, FCC, Geral, etc.).
  - Termo de pesquisa (título, descrição, nome do professor).
  - Modalidade (Gratuito vs. Acesso por Convite/Mentoria).
- **REQ-02.3 (Paginação na API)**: Endpoint `/api/publicshowcase/explore` suportando parâmetros `pageIndex` e `pageSize`, retornando metadados de paginação (`totalItems`, `totalPages`).

### 4.3. Épico 3: Funil de Conversão e Gestão de Leads da Vitrine
- **REQ-03.1 (Formulário Limpo de Lead)**: O visitante que clica em "Solicitar Acesso" em um curso informa Nome, E-mail e WhatsApp sem criação forçada de conta com senha aleatória.
- **REQ-03.2 (Aviso ao Professor)**: O professor recebe indicador visual destacado no cabeçalho ("🔴 3 novas solicitações na sua vitrine").
- **REQ-03.3 (Aprovação com 1 Clique)**: Na aba de solicitações, o professor clica em "Aprovar e Enviar Convite", gerando um token de 8 caracteres que pode ser enviado diretamente pelo WhatsApp Web ou e-mail.

### 4.4. Épico 4: Limpeza Arquitetural, Higienização e Unificação do Painel
- **REQ-04.1 (Extirpação do Checkout Zumbi)**: Remover a rota e componente `/checkout/:courseId` e alinhar todas as menções do frontend ao modelo de acesso por convite/solicitação.
- **REQ-04.2 (Dashboard Integrado do Professor)**: Reformular o `/professor/financeiro` para `/professor/dashboard`, exibindo métricas úteis ao docente:
  - Quantidade de visitantes únicos na vitrine.
  - Solicitações recebidas vs. aprovadas.
  - Alunos ativos no mês.
  - Créditos de IA restantes no plano e data de renovação da assinatura Asaas.
- **REQ-04.3 (Refatoração de God Files)**: Decompor `ApplicationServices.cs` e `DomainEntities.cs` em arquivos dedicados por classe para facilitar evolução sem risco.
- **REQ-04.4 (Desacoplamento do `topics.data.ts`)**: Remover o arquivo de 328 KB do bundle frontend, mantendo apenas dados consumidos via API REST.
