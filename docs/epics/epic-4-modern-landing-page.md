# Epic 4: Redesenho da Landing Page Principal com Recursos Visuais Modernos

**Épico:** EPIC-04 — Nova Landing Page Institucional & Conversiva  
**Prioridade:** P1 (Alta)  
**Status:** Completed (Implementado e Validado)  
**Documentos Relacionados:** `docs/prd.md` (Seção 1.2, NFR-01, NFR-06), Consultoria de Design Sally UX  

---

## Visão do Épico
Atualmente, a rota raiz (`/`) redireciona diretamente para o catálogo de exploração de cursos (`/explorar`), deixando a plataforma sem uma página de apresentação institucional envolvente que dialogue com seus dois públicos-alvo fundamentais:
1. **Professores e Mentores Autônomos**: Necessitam entender rapidamente a proposta de valor do SaaS TeacherTech (vitrine profissional própria, estúdio com IA para gerar aulas e questões, 0% de comissão sobre aulas e materiais, controle total de leads).
2. **Alunos, Estudantes e Concurseiros**: Buscam facilidade para encontrar professores particulares qualificados e conteúdos de estudo com busca rápida por matéria e formato (online ou presencial).

Este épico entrega uma **nova Landing Page moderna, responsiva e de alta conversão** na rota principal (`/`), incorporando a identidade visual proposta por Sally (UX Designer), avatares estilizados lecionando e estudando, busca instantânea e seções dedicadas para ambos os públicos.

---

## Histórias de Usuário do Épico 4

---

### Story 4.1: Componente da Nova Landing Page e Hero Section Dual

**Como** visitante que chega ao TeacherTech pela primeira vez,  
**Quero** ser recebido por uma página inicial moderna, rápida e clara sobre o que a plataforma oferece,  
**Para que** eu possa escolher meu objetivo em segundos (encontrar um professor ou criar minha vitrine docente).

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/landing-page/landing-page.component.ts` (Standalone Component com Signals e Tailwind).
- **Rota**: `/` mapeada no `app.routes.ts`, mantendo `/explorar` para o catálogo detalhado.
- **Hero Section**:
  - Título de impacto: *"A plataforma definitiva para quem ensina e quem quer aprender"*.
  - Subtítulo com proposta de valor transparente.
  - Avatares ilustrativos modernos em alta definição representando educadores lecionando e alunos estudando em ambiente acolhedor e tecnológico.
  - Dois CTAs principais de conversão:
    - 🔍 *"Encontrar Professor ou Conteúdo"* (leva para `/explorar`).
    - 🚀 *"Criar Minha Vitrine de Professor"* (leva para `/cadastro`).
  - Barra de busca rápida integrada (pesquisa por matéria ou tema e redireciona para `/explorar?search=...`).

#### Critérios de Aceitação
- **AC-4.1.1 (Hero Dual-Audience)**: A dobra principal deve evidenciar as duas propostas de valor (alunos e professores) com botões de ação e avatares distintos.
- **AC-4.1.2 (Busca Rápida Instantânea)**: Digitar um termo na barra de busca da landing page e teclar Enter ou clicar na lupa deve navegar para `/explorar` com o filtro de busca aplicado.

---

### Story 4.2: Seções Especializadas para Professores, Alunos e Prova Social

**Como** usuário explorando a landing page,  
**Quero** seções explicativas com ilustrações, comparativos e professores reais em destaque,  
**Para que** eu sinta total confiança na credibilidade e benefícios da plataforma.

#### Contexto & Arquitetura
- **Seção para Alunos**:
  - *"Tudo o que você precisa para passar de ano, no vestibular ou concurso"*.
  - Chips de disciplinas mais buscadas (Matemática, Física, Redação, Concursos, Inglês, Programação).
  - Cards visuais com os formatos: Aulas Particulares VIP, Cursos Gravados, E-books e Mentorias.
- **Seção para Professores**:
  - *"Sua Presença Digital Completa em 5 Minutos"*.
  - Três pilares de destaque:
    1. 🎨 **Vitrine Própria no seu Link**: `/p/seunome` profissional para colocar na bio.
    2. 🤖 **Estúdio com Inteligência Artificial**: Crie planos de estudo, simulados e questões com 1 clique.
    3. 💰 **0% de Comissões e Vendas Diretas**: O dinheiro das suas aulas particulares vai direto para você.
- **Seção de Professores e Ofertas em Destaque**:
  - Grid dinâmico consumindo `PublicShowcaseService.explore()` para renderizar professores reais cadastrados com link direto para suas vitrines.
- **Seção Comparativa**:
  - Tabela comparativa "TeacherTech vs. Plataformas Tradicionais" destacando a ausência de taxas de 15% a 30% por aula/curso.

#### Critérios de Aceitação
- **AC-4.2.1 (Interatividade dos Chips de Disciplinas)**: Clicar em um chip (ex: "Matemática") navega diretamente para `/explorar?subject=Matemática`.
- **AC-4.2.2 (Consumo Dinâmico de Destaques)**: A landing page carrega as ofertas ativas mais recentes do backend sem quebrar caso não haja conexão.
- **AC-4.2.3 (Responsividade Mobile)**: Todos os grids e cards empilham com perfeição em telas a partir de 360px.

---

### Story 4.3: Atualização de Navegação e Roteamento Global

**Como** usuário navegando pelo site,  
**Quero** que o logo e a navegação principal me levem consistentemente para a nova home,  
**Para que** a arquitetura de informação do sistema seja intuitiva.

#### Contexto & Arquitetura
- **`app.routes.ts`**: Rota `''` aponta para `LandingPageComponent`. Rota `'explorar'` aponta para `ExploreComponent`.
- **`app.html`**: Menu lateral e barra superior com links claros para "Início" (`/`) e "Explorar Ofertas" (`/explorar`).

---

## Critérios de Pronto (Definition of Done do Epic 4)
- [x] Componente `LandingPageComponent` criado e estilizado com abordagem Mobile-First.
- [x] Avatares modernos e ilustrações educativas aplicadas na interface.
- [x] Rota `/` ativada e integrada com busca instantânea para `/explorar`.
- [x] Compilação de produção do Angular validada com 0 erros (`npm run build`).
- [x] Suíte de testes do backend mantida 100% verde (53/53 testes).
