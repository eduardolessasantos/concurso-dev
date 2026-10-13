# TeacherTech — Índice de Épicos e Histórias de Usuário

**Documento:** Backlog de Épicos e Histórias (Execution Ready)  
**Versão:** 2.0  
**Data:** 13 de Outubro de 2026  
**Status:** Approved / Pronto para `/dev-story`  
**Autor:** John (Product Owner) & Winston (System Architect)  
**Alinhamento:** `docs/prd.md` e `docs/architecture.md`  

---

## 1. Visão Geral do Backlog

Este backlog decompõe todos os requisitos da Fase 2 do **TeacherTech** em épicos centrados no valor do usuário e do negócio, estruturados para execução autônoma pelo agente desenvolvedor via `/dev-story` (Amelia / Senior Software Engineer).

### Princípios de Execução das Histórias
1. **Valor de Negócio Independente**: Cada história entrega uma fatia vertical executável e testável.
2. **Sem Dependência de Histórias Futuras**: Histórias anteriores nunca dependem de histórias que estão à frente.
3. **Criação Incremental de Entidades**: Migrações e entidades são criadas somente quando a história correspondente exige.
4. **Alinhamento com a Stack**: .NET 9 Web API com EF Core no backend; Angular 22 com Standalone Components e Signals no frontend.

---

## 2. Mapa dos Épicos

| Épico | Título | Foco Principal | Status | Prioridade | Arquivo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Epic 1** | **Vitrine Personalizável & Busca Facetada** | Destravar a mini-página do professor (`/professor/:slug`) com múltiplos conteúdos e busca inteligente no `/explorar`. | ✅ Concluído (Verificado) | **P0 (Crítica / Imediata)** | [`epic-1-showcase-and-search.md`](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md) |
| **Epic 2** | **CTAs de Conversão & Captura de Leads** | Botão direto de WhatsApp, links de agendamento, checkout externo e formulário limpo de leads (sem usuário fantasma). Extirpação do checkout legado. | ✅ Concluído (Verificado) | **P1 (Alta)** | [`epic-2-lead-capture-and-ctas.md`](file:///c:/projetos/TeacherTech/docs/epics/epic-2-lead-capture-and-ctas.md) |
| **Epic 3** | **Painel de Controle e Gestão do Docente** | Editor de vitrine com Live Preview, gerenciador de ofertas (aulas, cursos, e-books, mentorias) e métricas de acessos/leads. | ✅ Concluído (Verificado) | **P1 (Alta)** | [`epic-3-professor-dashboard-and-management.md`](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md) |

---

## 3. Matriz de Rastreabilidade (PRD FR/NFR → Stories)

| Requisito PRD | Descrição Resumida | História Correspondente | Épico |
| :--- | :--- | :--- | :--- |
| **FR-01, FR-02, FR-03, FR-04** | Slug amigável, identidade visual, bio, redes e mídias na vitrine | [Story 1.1](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-11), [Story 1.2](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-12), [Story 1.3](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-13) | Epic 1 |
| **FR-07, FR-08, FR-10** | Múltiplos conteúdos (aulas, cursos, e-books, mentorias) e formatos | [Story 1.1](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-11), [Story 1.2](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-12), [Story 1.3](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-13) | Epic 1 |
| **FR-11, FR-12, FR-13, FR-14, FR-15, FR-16** | Busca facetada no `/explorar` (matéria, formato, cidade, preço) | [Story 1.4](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-14), [Story 1.5](file:///c:/projetos/TeacherTech/docs/epics/epic-1-showcase-and-search.md#story-15) | Epic 1 |
| **FR-05, FR-09, FR-18** | CTAs claros (WhatsApp, agendamento, checkout externo) e telemetria | [Story 2.1](file:///c:/projetos/TeacherTech/docs/epics/epic-2-lead-capture-and-ctas.md#story-21), [Story 2.2](file:///c:/projetos/TeacherTech/docs/epics/epic-2-lead-capture-and-ctas.md#story-22) | Epic 2 |
| **FR-17, FR-19** | Captura limpa de leads com consentimento LGPD | [Story 2.1](file:///c:/projetos/TeacherTech/docs/epics/epic-2-lead-capture-and-ctas.md#story-21), [Story 2.2](file:///c:/projetos/TeacherTech/docs/epics/epic-2-lead-capture-and-ctas.md#story-22) | Epic 2 |
| **FR-24, FR-25** | Remoção do checkout zumbi e higienização de rotas mortas | [Story 2.3](file:///c:/projetos/TeacherTech/docs/epics/epic-2-lead-capture-and-ctas.md#story-23) | Epic 2 |
| **FR-06** | Editor da vitrine com Live Preview em tempo real | [Story 3.1](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md#story-31), [Story 3.2](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md#story-32) | Epic 3 |
| **FR-22** | Gerenciador de ofertas (CRUD de aulas, cursos, e-books, mentorias) | [Story 3.1](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md#story-31), [Story 3.3](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md#story-33) | Epic 3 |
| **FR-20, FR-21, FR-23** | Dashboard com visualizações, cliques, leads e status SaaS Asaas | [Story 3.1](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md#story-31), [Story 3.4](file:///c:/projetos/TeacherTech/docs/epics/epic-3-professor-dashboard-and-management.md#story-34) | Epic 3 |
| **NFR-01 a NFR-06** | Performance (LCP < 2s), SEO OpenGraph, Segurança XSS e Mobile-First | Coberto transversalmente em todas as histórias | Todos |

---

## 4. Instruções de Execução com `/dev-story`

Para implementar qualquer uma das histórias deste backlog:
1. Abra uma nova instrução ou invoque o agente de desenvolvimento:
   ```text
   /dev-story docs/epics/epic-1-showcase-and-search.md#story-11
   ```
2. O agente carregará o contexto, executará a implementação orientada a testes (Red-Green-Refactor) e verificará o build do backend (`dotnet test`) e do frontend (`ng build`).
