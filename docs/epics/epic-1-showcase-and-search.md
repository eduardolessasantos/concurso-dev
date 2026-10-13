# Epic 1: Vitrine Personalizável do Professor & Busca Facetada

**Épico:** EPIC-01 — Vitrine Pública & Motor de Descoberta  
**Prioridade:** P0 (Máxima / Destravamento Principal)  
**Status:** Completed (Verificado com Testes e Build)  
**Documentos Relacionados:** `docs/prd.md` (FR-01 a FR-04, FR-07 a FR-16), `docs/architecture.md` (AD-01, AD-05)  

---

## Visão do Épico
Este épico destrava o principal diferencial do TeacherTech para o professor autônomo e o estudante:
1. Permite que o professor tenha uma página web moderna e rápida em `/professor/:slug` (com alias `/p/:slug`), exibindo sua foto, banner, tema, bio, vídeo e portfólio completo de ofertas pedagógicas (**aulas particulares, cursos, e-books e mentorias**).
2. Fornece ao visitante uma experiência rica de busca no `/explorar`, permitindo filtrar por **matéria/disciplina real**, **faixa de preço**, **formato (online ou presencial)** e **cidade/UF**, eliminando categorias estáticas hardcoded no frontend.

---

## Histórias de Usuário do Épico 1

---

### Story 1.1: Expansão do Modelo `ProfessorProfile` e Entidade `ContentOffering` com EF Core Migration

**Como** desenvolvedor do sistema,  
**Quero** expandir o modelo de dados de perfil do professor e criar a entidade de ofertas de conteúdo (`ContentOffering`) com suporte a migração do EF Core,  
**Para que** o backend possa persistir a identidade visual do professor e seu catálogo de múltiplos tipos de serviços pedagógicos.

#### Contexto & Arquitetura
- **Entidades**:
  - `ProfessorProfile` em `backend/src/TeacherTech.Domain/Entities/DomainEntities.cs` (ou nova pasta `Entities/Showcase/`): Adicionar `BannerImageUrl`, `ThemeColor`, `WhatsAppNumber`, `VideoIntroUrl`, `City`, `State`, `SocialLinksJson`.
  - Nova entidade `ContentOffering`: campos `Id`, `ProfessorId`, `Title`, `Description`, `Subject`, `Price`, `OfferingType` (Enum: 1=PrivateClass, 2=Course, 3=Ebook, 4=Mentoring), `Format` (Enum: 1=Online, 2=InPerson, 3=Hybrid), `LocationCity`, `LocationState`, `CtaType` (Enum: 1=WhatsApp, 2=Scheduling, 3=ExternalCheckout, 4=PlatformCourse), `CtaUrl`, `CtaWhatsappMessage`, `CoverImageUrl`, `DisplayOrder`, `IsActive`, `IsFeatured`, `CourseStudyPlanId` (Guid nullable).
- **DbContext & Migration**:
  - Configurar mapeamentos Fluent API no `ApplicationDbContext.cs` com índices em `Subject`, `Format`, `LocationCity` e `IsActive`.
  - Gerar migração EF Core compatível com SQLite e MySQL: `Add_Showcase_And_ContentOfferings`.

#### Critérios de Aceitação
- **AC-1.1.1 (Campos do Perfil)**:
  - **Given** o banco de dados atualizado com a migração,
  - **When** um registro de `ProfessorProfile` é consultado ou salvo,
  - **Then** deve persistir corretamente `BannerImageUrl`, `ThemeColor` (padrão `#4F46E5`), `WhatsAppNumber`, `VideoIntroUrl`, `City`, `State` e `SocialLinksJson`.
- **AC-1.1.2 (Persistência de ContentOffering)**:
  - **Given** um professor cadastrado com id válido,
  - **When** uma oferta do tipo `PrivateClass` presencial no Rio de Janeiro é inserida via EF Core,
  - **Then** ela deve ser salva com sucesso vinculada ao professor e retornar GUID gerado.
- **AC-1.1.3 (Validação de Chaves)**:
  - **Given** um `ContentOffering` vinculado a um curso nativo,
  - **When** `CourseStudyPlanId` é informado,
  - **Then** a chave estrangeira opcional deve ser respeitada sem quebrar ofertas autônomas (onde `CourseStudyPlanId` é nulo).

#### Tarefas Técnicas
1. Adicionar enums `OfferingType`, `OfferingFormat` e `CtaType` no domínio.
2. Atualizar classe `ProfessorProfile` e criar classe `ContentOffering`.
3. Registrar `DbSet<ContentOffering> ContentOfferings` no `ApplicationDbContext`.
4. Adicionar mapeamentos Fluent API com índices de performance.
5. Executar `dotnet ef migrations add Add_Showcase_And_ContentOfferings --project src/TeacherTech.Infrastructure --startup-project src/TeacherTech.Api`.
6. Validar compilação do projeto backend.

---

### Story 1.2: Endpoints da Vitrine Pública do Professor (`GET /api/publicshowcase/professors/{slug}`) e Contrato de Ofertas

**Como** visitante da plataforma TeacherTech,  
**Quero** consultar a vitrine pública de um professor pelo seu slug amigável via API,  
**Para que** eu possa visualizar suas informações profissionais completas e seu catálogo de ofertas ativas.

#### Contexto & Arquitetura
- **Controller**: `backend/src/TeacherTech.Api/Controllers/PublicShowcaseController.cs`
- **DTOs**:
  - `PublicProfessorProfileDto`: Expandir para conter `bannerImageUrl`, `themeColor`, `whatsAppNumber`, `videoIntroUrl`, `city`, `state`, `socialLinks`, e a coleção `offerings: List<PublicOfferingDto>`.
  - `PublicOfferingDto`: `id`, `title`, `description`, `subject`, `price`, `priceFormatted`, `offeringType`, `format`, `locationCity`, `locationState`, `ctaType`, `ctaUrl`, `ctaWhatsappMessage`, `coverImageUrl`, `isFeatured`.
- **Service**: Atualizar `IPublicShowcaseApplicationService` e sua implementação para carregar apenas ofertas com `IsActive = true` ordenadas por `DisplayOrder`.

#### Critérios de Aceitação
- **AC-1.2.1 (Retorno com Sucesso 200 OK)**:
  - **Given** um professor com slug `joao-matematica` cadastrado com 3 ofertas ativas,
  - **When** for feita uma requisição `GET /api/publicshowcase/professors/joao-matematica`,
  - **Then** a resposta deve retornar HTTP 200 com payload contendo dados de identidade visual, cidade/UF e o array com as 3 ofertas ativas.
- **AC-1.2.2 (Ofertas Inativas Filtradas)**:
  - **Given** uma oferta do professor com `IsActive = false`,
  - **When** o visitante consulta a vitrine pública do professor,
  - **Then** a oferta inativa NÃO deve estar presente no array retornado.
- **AC-1.2.3 (Professor Inexistente 404)**:
  - **Given** um slug inexistente no banco de dados (ex: `slug-fantasma-999`),
  - **When** for feita a requisição `GET /api/publicshowcase/professors/slug-fantasma-999`,
  - **Then** a API deve retornar HTTP 404 com mensagem amigável `Professor não encontrado.`.

#### Tarefas Técnicas
1. Atualizar `PublicProfessorProfileDto` e criar `PublicOfferingDto`.
2. Modificar query no serviço para incluir `.Include(p => p.Offerings.Where(o => o.IsActive).OrderBy(o => o.DisplayOrder))`.
3. Ajustar testes unitários em `TeacherTech.Tests` cobrindo o novo payload.
4. Testar chamada no Swagger.

---

### Story 1.3: Redesenho Moderno da Vitrine Pública do Professor no Frontend (`/professor/:slug` e `/p/:slug`)

**Como** visitante ou aluno interessado,  
**Quero** acessar a página `/professor/:slug` com layout moderno, responsivo e de alta conversão,  
**Para que** eu conheça a autoridade do professor e explore seus serviços pedagógicos (aulas, cursos, e-books, mentorias).

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/professor-showcase/professor-showcase.component.ts` e `.html` / `.scss`.
- **Roteamento**: `angular-app/src/app/app.routes.ts` — registrar rota `/professor/:slug` e alias `/p/:slug` redirecionando para a rota principal.
- **Service**: Atualizar `PublicShowcaseService` para tipar a nova interface TypeScript `PublicProfessorProfile` com `offerings: PublicOffering[]`.

#### Critérios de Aceitação
- **AC-1.3.1 (Hero e Identidade Visual Dinâmica)**:
  - **Given** que o professor configurou a cor de destaque `#10B981` (esmeralda) e imagem de banner,
  - **When** a página `/professor/:slug` for carregada no navegador,
  - **Then** o banner de capa deve ser exibido no topo e a cor tema deve ser aplicada dinamicamente nos botões de ação e destaques via CSS Custom Properties.
- **AC-1.3.2 (Exibição Multi-Conteúdo por Abas ou Grid)**:
  - **Given** que o professor possui aulas particulares e e-books cadastrados,
  - **When** o visitante rola a página da vitrine,
  - **Then** cada item deve ser exibido em um card elegante informando o badge do tipo (`Aula Particular`, `E-book`, `Mentoria`), matéria, formato (`Presencial - Rio de Janeiro, RJ` ou `Online`), preço e botão CTA correspondente.
- **AC-1.3.3 (Vídeo Introdutório)**:
  - **Given** que o professor cadastrou uma URL de vídeo do YouTube,
  - **When** a página é renderizada,
  - **Then** um player embutido responsivo (iframe seguro) deve permitir assistir ao vídeo sem sair da vitrine.
- **AC-1.3.4 (Compatibilidade de Rota)**:
  - **Given** um usuário acessando a URL antiga `/p/joao-matematica`,
  - **When** a rota for processada pelo Angular Router,
  - **Then** ele deve ser direcionado suavemente para a vitrine sem erro 404.

#### Tarefas Técnicas
1. Atualizar interface `PublicProfessorProfile` em `public-showcase.service.ts`.
2. Reestruturar template `professor-showcase.component.html` com:
   - Seção Hero (Banner, Avatar circular com borda temática, Nome, Headline, Crachá de Verificado, Cidade/UF).
   - Seção de Bio e Vídeo Introdutório.
   - Grade de Ofertas com filtros rápidos por tipo (`Todos`, `Aulas Particulares`, `Cursos`, `E-books`, `Mentorias`).
   - Seção de Redes Sociais.
3. Criar estilos refinados em `professor-showcase.component.scss` (Dark/Light mode compliant, design mobile-first).
4. Ajustar `app.routes.ts` com a rota `/professor/:slug`.

---

### Story 1.4: Endpoint de Busca Facetada com Filtros Dinâmicos e Paginação

**Como** visitante da plataforma,  
**Quero** pesquisar ofertas e professores na API filtrando por matéria, faixa de preço, formato (online/presencial) e cidade com paginação,  
**Para que** eu encontre com precisão o educador ideal para a minha necessidade sem lentidão.

#### Contexto & Arquitetura
- **Controller**: `backend/src/TeacherTech.Api/Controllers/PublicShowcaseController.cs`
- **Novos Endpoints**:
  1. `GET /api/publicshowcase/explore`:
     - Query params: `subject` (string?), `format` (OfferingFormat?), `city` (string?), `priceMin` (decimal?), `priceMax` (decimal?), `search` (string?), `pageIndex` (int, default 0), `pageSize` (int, default 12).
     - Retorno: `PagedResult<ExploreItemDto>` com `items`, `totalCount`, `pageIndex`, `pageSize`, `totalPages`.
  2. `GET /api/publicshowcase/filters`:
     - Retorno: `ExploreFiltersDto` contendo lista distinta de `availableSubjects` (ordenada alfabeticamente), `availableCities` (com contagem) e `formats`.

#### Critérios de Aceitação
- **AC-1.4.1 (Filtro por Matéria)**:
  - **Given** ofertas cadastradas com matéria "Matemática" e "Direito Constitucional",
  - **When** a busca for executada com `GET /api/publicshowcase/explore?subject=Matemática`,
  - **Then** apenas ofertas cuja disciplina contenha "Matemática" devem ser retornadas.
- **AC-1.4.2 (Filtro por Formato e Cidade)**:
  - **Given** uma busca por aulas presenciais em "Curitiba",
  - **When** `format=InPerson&city=Curitiba` for requisitado,
  - **Then** apenas ofertas presenciais em Curitiba devem ser retornadas.
- **AC-1.4.3 (Metadados de Paginação)**:
  - **Given** um total de 25 ofertas que atendem ao filtro e `pageSize=10`,
  - **When** `pageIndex=0` for consultado,
  - **Then** o payload deve retornar exatamente 10 itens no array, com `totalCount=25` e `totalPages=3`.
- **AC-1.4.4 (Agregação de Filtros Ativos)**:
  - **Given** ofertas ativas no banco,
  - **When** `GET /api/publicshowcase/filters` for chamado,
  - **Then** a resposta deve retornar as matérias reais cadastradas sem duplicações.

#### Tarefas Técnicas
1. Criar DTOs `ExploreItemDto`, `ExploreFiltersDto` e classe genérica `PagedResult<T>`.
2. Implementar método `ExploreOfferingsAsync` com IQueryable dinâmico e `.AsNoTracking()`.
3. Implementar método `GetAvailableFiltersAsync` com `.Select(o => o.Subject).Distinct()`.
4. Adicionar testes unitários com dados simulados no xUnit.

---

### Story 1.5: Reformulação da Página `/explorar` com Filtros Facetados e Grade Responsiva

**Como** visitante buscando professores ou conteúdos,  
**Quero** uma tela de exploração (`/explorar`) moderna com barra de pesquisa, filtros interativos de matéria, formato, preço e cidade,  
**Para que** eu possa descobrir os melhores mentores de forma rápida e intuitiva.

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/explore/explore.component.ts` e `.html` / `.scss`.
- **Estado Reativo**: Utilizar Angular Signals (`computed()`, `signal()`) com debounce no input de busca textual.
- **Substituição de Código**: Remover as categorias estáticas hardcoded (`explore.component.html:L20-L24`) e carregar as matérias retornadas dinamicamente por `GET /api/publicshowcase/filters`.

#### Critérios de Aceitação
- **AC-1.5.1 (Carregamento de Filtros Dinâmicos)**:
  - **Given** que o usuário acessa `/explorar`,
  - **When** o componente inicializa,
  - **Then** as pílulas de filtro de matéria devem ser renderizadas a partir dos dados retornados pela API (ex: "Matemática", "Física", "TI & Programação").
- **AC-1.5.2 (Filtro Combinado de Formato e Local)**:
  - **Given** que o usuário clica na opção "Presencial",
  - **When** o filtro é ativado,
  - **Then** um seletor de cidade deve aparecer permitindo escolher a localidade desejada.
- **AC-1.5.3 (Paginação Visual / Infinite Scroll)**:
  - **Given** mais de 12 itens disponíveis na pesquisa,
  - **When** o usuário navega na listagem,
  - **Then** controles de paginação (ou botão "Carregar mais") devem permitir avançar sem recarregar a página inteira.
- **AC-1.5.4 (Card de Resultado Rico)**:
  - **Given** um item na listagem de resultados,
  - **When** renderizado na grade,
  - **Then** deve exibir foto e nome do professor com link para `/professor/:slug`, badge do formato (`Online` ou `Presencial - Cidade`), badge do tipo de oferta, preço e botão direto para visualizar.

#### Tarefas Técnicas
1. Atualizar `explore.component.ts` com Signals para filtros selecionados.
2. Atualizar template `explore.component.html` substituindo pílulas fixas por `*ngFor` ou `@for` dinâmico.
3. Adicionar layout responsivo em `explore.component.scss` (Grid 1 coluna no mobile, 3 colunas no desktop).
4. Validar build do frontend com `npm run build` ou `npx ng build`.

---

## Critérios de Pronto (Definition of Done do Epic 1)
- [x] Todas as 5 histórias implementadas e verificadas.
- [x] Migração EF Core executada com sucesso.
- [x] Rota `/professor/:slug` renderizando vitrine personalizada com ofertas reais.
- [x] Rota `/explorar` filtrando dinamicamente por matéria, formato, preço e cidade.
- [x] Pipeline de testes do backend executando verde (`dotnet test`).
- [x] Aplicação Angular compilando sem erros de tipagem.

