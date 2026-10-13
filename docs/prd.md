# TeacherTech — Product Requirements Document (PRD)

**Documento:** PRD — Vitrine Virtual e Gestão Multi-Conteúdo  
**Versão:** 2.0 (Brownfield Target)  
**Status:** Approved / Ready for Architecture & Epics  
**Data:** 13 de Outubro de 2026  
**Autores:** Equipe de Produto (Product Owner / John) & Arquitetura (System Architect / Winston)  
**Público-Alvo:** Engenharia de Software, Design UX/UI, Operações e Stakeholders  

---

## 1. Visão Executiva e Proposta de Valor

### 1.1. Contexto Brownfield e Pivot de Negócio
O **TeacherTech** iniciou seu ciclo de vida sob o protótipo "Concurso Dev", concebido originalmente como um marketplace de cursos preparatórios para concursos públicos com cobrança avulsa via Pix. 

Durante a primeira fase de engenharia reversa e diagnóstico de gaps, foi constatado um conflito arquitetural crítico: o modelo de marketplace com split de pagamentos foi descontinuado, enquanto a plataforma começou a pivotar para um **SaaS Educacional B2B**. No entanto, a vitrine pública de professores permaneceu estática e travada, restrita a um catálogo fixo de cursos sem opções reais de customização e com botões de compra que falhavam na API.

### 1.2. A Nova Visão do Produto
O TeacherTech se consolida como **a plataforma definitiva para professores particulares, mentores e educadores autônomos construírem sua presença digital, distribuírem seus conteúdos e capturarem alunos sem pagar porcentagens abusivas de intermediação**.

Na nova vitrine virtual do TeacherTech:
1. **Identidade Profissional Própria**: Cada professor possui sua mini-página pública (`/professor/joao-matematica` ou `/p/:slug`) totalmente personalizável (avatar, banner, cor tema, bio, vídeo introdutório e redes sociais).
2. **Catálogo Multi-Conteúdo**: O docente cadastra e monetiza não apenas cursos online, mas todo o seu portfólio pedagógico: **aulas particulares**, **cursos estruturados**, **e-books** e **mentorias individuais ou em grupo**.
3. **Mecanismo de Busca Facetada**: Alunos e responsáveis encontram o professor ideal na página `/explorar` filtrando por **matéria/disciplina**, **faixa de preço**, **formato (online ou presencial)** e **cidade/UF**.
4. **Chamadas para Ação (CTAs) Claras e Flexíveis**: O professor decide como quer fechar negócio com o visitante — direcionamento para WhatsApp com mensagem personalizada, link de agendamento (Calendly/Cal.com), checkout externo (Kiwify, Hotmart, Eduzz) ou inscrição no curso nativo da plataforma.
5. **Painel de Controle Simplificado**: O professor gerencia suas ofertas em poucos cliques e monitora visualizações da vitrine, cliques nos CTAs e leads recebidos em tempo real.

---

## 2. Personas Detalhadas

### 2.1. Persona Primária: O Professor Autônomo / Mentor
- **Exemplo Real**: João Silva, 34 anos, professor particular de Matemática e Raciocínio Lógico há 8 anos no Rio de Janeiro (RJ).
- **Atividades**: Ministra aulas particulares presenciais na Barra da Tijuca, oferece turmas de mentoria online para vestibulares (ENEM/UERJ) pelo Google Meet e vende PDFs com resumos e listas de exercícios resolvidos.
- **Dores Atuais**:
  - Divulga seu trabalho em links soltos na bio do Instagram (Linktree desorganizado).
  - Gasta horas respondendo "quanto custa a hora/aula?" no direct e no WhatsApp.
  - Plataformas como Hotmart cobram taxas de 10% a 15% sobre seus produtos digitais, e plataformas de aulas particulares retêm até 30% da primeira aula.
  - Não possui uma página com estética profissional que transmita autoridade e credibilidade para pais e alunos.
- **Objetivos com o TeacherTech**:
  - Ter um link profissional único (`teachertech.com.br/professor/joao-matematica`) para divulgar em suas redes sociais e cartões de visita.
  - Apresentar em uma única página limpa todos os seus formatos de atendimento (aulas presenciais no RJ, mentoria online e e-books).
  - Receber contatos qualificados diretamente no WhatsApp já sabendo o serviço e o valor de interesse.
  - Acompanhar quantas pessoas visitaram sua página na semana para medir o retorno das suas divulgações.

### 2.2. Persona Secundária: O Aluno / Responsável / Mentorado
- **Exemplo Real**: Mariana Rocha, 22 anos, estudante universitária prestando concurso público, ou Carlos Mendes, pai de um estudante do Ensino Médio em Curitiba (PR).
- **Atividades**: Busca apoio acadêmico focado, mentoria de estudos ou aulas particulares para destravar em matérias específicas.
- **Dores Atuais**:
  - Dificuldade em encontrar professores particulares confiáveis que atendam presencialmente em seu bairro ou com boa didática online.
  - Falta de clareza sobre preços e formatos de aula antes de iniciar uma conversa cansativa de orçamento.
  - Medo de contratar serviços sem referências ou sem saber a metodologia do professor.
- **Objetivos com o TeacherTech**:
  - Filtrar rapidamente por matéria (ex: "Física"), cidade (ex: "Curitiba"), formato ("Presencial") e faixa de preço no `/explorar`.
  - Assistir ao vídeo de apresentação do professor e ler sua bio pedagógica na vitrine.
  - Clicar em um botão direto para agendar a primeira aula ou tirar dúvidas no WhatsApp em 1 clique.

---

## 3. Jornadas de Usuário (User Journeys)

### UJ-1: Professor João Monta e Personaliza sua Vitrine
1. João faz login no TeacherTech e acessa a aba "Minha Vitrine" (`/professor/vitrine`).
2. Ele define seu slug personalizado como `joao-matematica` (a plataforma valida a disponibilidade em tempo real).
3. Ele envia sua foto profissional de perfil, uma imagem de capa (banner) temática com fórmulas matemáticas, seleciona a cor índigo (#4F46E5) como destaque da sua marca e cola o link do seu vídeo curto do YouTube onde explica sua metodologia de ensino.
4. Ele adiciona sua biografia, suas credenciais acadêmicas (Mestre pela UFRJ) e sua localização base: Rio de Janeiro - RJ.
5. Com a visualização prévia em tempo real (Live Preview), ele confere como a página ficará no celular e clica em "Publicar Vitrine".
6. O sistema atualiza a rota pública `/professor/joao-matematica` instantaneamente.

### UJ-2: Professor João Cadastra seus Múltiplos Conteúdos
1. No menu "Meus Conteúdos" (`/professor/ofertas`), João clica em "Novo Conteúdo".
2. **Item 1 (Aula Particular)**: Seleciona tipo "Aula Particular", título "Reforço de Cálculo I e Matemática do Ensino Médio", formato "Presencial ou Online", cidade "Rio de Janeiro - RJ", matéria "Matemática", preço "R$ 120,00 / hora", e define o CTA como "Chamar no WhatsApp" com a mensagem pré-configurada: *"Olá Prof. João! Vi sua vitrine no TeacherTech e quero agendar uma aula particular de Matemática."*
3. **Item 2 (Mentoria)**: Cria "Mentoria VIP de Raciocínio Lógico para Concursos", formato "Online", preço "R$ 490,00", CTA "Agendamento" apontando para seu link do Calendly.
4. **Item 3 (E-book)**: Cadastra o e-book "500 Questões Comentadas de Raciocínio Lógico", formato "Online", preço "R$ 47,00", CTA "Comprar Agora" apontando para o checkout externo na Kiwify.
5. Ele salva e reorganiza a ordem de exibição dos cards por drag-and-drop.

### UJ-3: Visitante Mariana Encontra João e Entra em Contato
1. Mariana entra em `teachertech.com.br/explorar`.
2. Ela seleciona o filtro de Matéria: "Matemática & Raciocínio Lógico", Formato: "Online", e faixa de preço de R$ 0 até R$ 150.
3. A listagem filtra instantaneamente, exibindo o card de destaque do Prof. João Silva com crachá de verificado, sua foto, headline e preço médio.
4. Mariana clica no card e é direcionada para `/professor/joao-matematica`.
5. Na vitrine, ela assiste ao vídeo de 1 minuto de apresentação, lê a bio e vê a oferta de "Reforço de Cálculo I".
6. Ela clica no botão "Falar no WhatsApp". O TeacherTech registra um evento de telemetria de conversão de lead e abre o WhatsApp Web com o texto pré-preenchido.

### UJ-4: Professor Acompanha Desempenho no Painel
1. No final da semana, João abre o "Dashboard" (`/professor/dashboard`).
2. Ele visualiza os números-chave dos últimos 30 dias:
   - **428 Visualizações** da vitrine.
   - **34 Cliques em CTAs** (22 no botão de WhatsApp, 8 no agendamento do Calendly e 4 no e-book externo).
   - **5 Formulários de Lead** preenchidos diretamente na vitrine.
3. Ele consulta a lista de contatos capturados com nome, telefone e interesse para fazer follow-up.
4. Ele visualiza o status da sua assinatura TeacherTech Pro (Asaas) e seus créditos de IA ativos.

---

## 4. Requisitos Funcionais (FRs)

### Grupo 1: Vitrine Personalizável do Professor (`/professor/:slug` e `/p/:slug`)
- **FR-01 (Slug Customizado Único)**: O sistema deve permitir que o professor defina um slug alfanumérico amigável (ex: `joao-matematica`) para sua vitrine, garantindo unicidade no banco de dados e suportando acesso tanto por `/professor/:slug` quanto pelo alias compatível `/p/:slug`.
- **FR-02 (Identidade Visual & Mídia)**: O perfil da vitrine deve armazenar e renderizar:
  - Foto de perfil (AvatarUrl).
  - Imagem de capa / banner de destaque (BannerImageUrl).
  - Cor primária personalizada (ThemeColor - código Hexadecimal válido).
  - Vídeo de apresentação embutido (YouTube ou Vimeo URL).
- **FR-03 (Informações Profissionais & Localização)**: A vitrine deve exibir Nome Completo, Headline profissional, Biografia formatada, Cidade e Estado (UF) de atuação presencial.
- **FR-04 (Canais e Redes Sociais)**: Suporte a múltiplos canais digitais do professor (Instagram, LinkedIn, YouTube, Telegram, TikTok e Site Pessoal).
- **FR-05 (Contato Direto WhatsApp)**: O professor deve poder cadastrar seu número com DDD e mensagem de saudação padrão. A vitrine deve renderizar botão flutuante e CTA integrado de WhatsApp.
- **FR-06 (Live Preview no Painel)**: A interface de edição da vitrine no painel do professor deve exibir uma pré-visualização responsiva (desktop e mobile) em tempo real conforme os campos são alterados antes de salvar.

### Grupo 2: Gestão de Conteúdos e Ofertas do Professor
- **FR-07 (Tipos de Conteúdo)**: O professor deve poder cadastrar múltiplos tipos de ofertas em sua vitrine:
  - `AULA_PARTICULAR` (Aulas individuais ou reforço presencial/online).
  - `CURSO` (Cursos em vídeo, turmas fechadas ou cursos da própria plataforma TeacherTech).
  - `EBOOK` (Livros digitais, apostilas, materiais em PDF).
  - `MENTORIA` (Acompanhamento individual, mentoria em grupo ou consultoria).
- **FR-08 (Atributos da Oferta)**: Cada item cadastrado deve conter:
  - Título, Descrição detalhada e Imagem ilustrativa/capa.
  - Matéria/Disciplina (ex: Matemática, Física, Programação, Direito Constitucional).
  - Preço formatado (valor decimal em BRL ou indicação de "Sob Consulta" / "Gratuito").
  - Formato: `ONLINE`, `PRESENCIAL` ou `HIBRIDO`.
  - Localização (Cidade e UF) obrigatória se o formato for `PRESENCIAL` ou `HIBRIDO`.
- **FR-09 (Configuração do CTA por Oferta)**: Cada item de conteúdo deve possuir seu próprio botão de ação customizado:
  - Tipo `WHATSAPP`: Abre conversa com texto direcionado àquela oferta específica.
  - Tipo `AGENDAMENTO`: Redireciona para URL de agenda externa (Calendly, Cal.com, Google Calendar).
  - Tipo `CHECKOUT_EXTERNO`: Redireciona para página externa de pagamento (Hotmart, Kiwify, Eduzz, etc.).
  - Tipo `PLATAFORMA`: Vincula a um curso nativo existente no TeacherTech via solicitação/convite.
- **FR-10 (Ordenação e Destaque)**: O professor deve poder reordenar as ofertas na vitrine e marcar ofertas específicas como "Destaque" (badge especial).

### Grupo 3: Sistema de Busca Facetada e Catálogo Geral (`/explorar`)
- **FR-11 (Filtro por Matéria/Disciplina Dinâmica)**: O catálogo deve listar matérias reais baseadas nas ofertas publicadas ativas no banco de dados, abandonando categorias estáticas hardcoded no HTML.
- **FR-12 (Filtro por Formato)**: O visitante deve poder filtrar ofertas por `Online`, `Presencial` ou `Todos`.
- **FR-13 (Filtro por Localização)**: Quando o filtro de formato presencial/híbrido estiver ativo, o visitante deve poder selecionar Cidade e Estado.
- **FR-14 (Filtro por Faixa de Preço)**: Suporte a filtro por preço mínimo e máximo (ou tags: Até R$ 50, R$ 50 a R$ 150, R$ 150 a R$ 300, Acima de R$ 300).
- **FR-15 (Busca Textual Multi-campo)**: Campo de busca rápida pesquisando concorrentemente por nome do professor, título da oferta, matéria ou palavras-chave na biografia.
- **FR-16 (Paginação e Performance)**: Endpoint de catálogo com suporte a paginação no servidor (`pageIndex`, `pageSize`), retornando total de registros e total de páginas.

### Grupo 4: Captura Limpa de Leads & Telemetria de Conversão
- **FR-17 (Formulário Limpo de Lead na Vitrine)**: O visitante pode preencher um modal rápido "Entrar em Contato / Solicitar Informações" informando Nome, E-mail, WhatsApp e Mensagem, **sem criação forçada de conta fantasma no AspNetUsers com senha aleatória**.
- **FR-18 (Telemetria de Cliques em CTAs)**: Cada clique em botão de WhatsApp, agendamento ou checkout externo na vitrine deve disparar um evento assíncrono leve para contabilizar a métrica de interesse sem travar a navegação do usuário.
- **FR-19 (Armazenamento Seguro de Leads com Consentimento LGPD)**: Os leads devem ser armazenados vinculados ao professor e à oferta de interesse, contendo timestamp e consentimento explícito dos termos de contato.

### Grupo 5: Painel Simplificado do Docente
- **FR-20 (Métricas da Vitrine)**: Dashboard exibindo visualizações totais da vitrine, cliques em CTAs por tipo (WhatsApp, Agendamento, Checkout) e leads recebidos nos últimos 7, 30 ou 90 dias.
- **FR-21 (Gestão de Leads Recebidos)**: Tabela de contatos recebidos com filtros por status (`Novo`, `Contatado`, `Fechado`, `Arquivado`) e botão de 1 clique para iniciar conversa no WhatsApp Web com o lead.
- **FR-22 (Gerenciador de Ofertas)**: Tela amigável para Criar, Editar, Pausar e Excluir conteúdos da vitrine.
- **FR-23 (Status do Plano SaaS e Créditos de IA)**: Exibição clara do plano ativo (Basic/Pro Asaas), data de renovação e saldo de créditos para geração de conteúdos com IA no Studio.

### Grupo 6: Higienização de Rotas e Depreciação do Modelo Legado
- **FR-24 (Extirpação do Checkout Zumbi)**: Remover do Angular a rota `/checkout/:courseId` e seu componente associado, que atualmente dispara requisições HTTP retornando código 400. Redirecionar acessos legados para a vitrine do professor ou catálogo `/explorar`.
- **FR-25 (Adequação do Painel Financeiro)**: O antigo menu `/professor/financeiro` deve ser substituído pelo `/professor/dashboard`, eliminando os cards de faturamento de marketplace zerados que induziam o usuário a erro.

---

## 5. Requisitos Não Funcionais (NFRs)

- **NFR-01 (Performance & Carregamento)**:
  - Páginas públicas de vitrine (`/professor/:slug`) e catálogo (`/explorar`) devem atingir *Largest Contentful Paint (LCP)* inferior a 2.0 segundos em conexões 4G móveis.
  - O bundle do frontend deve ser otimizado através da remoção do mock estático `topics.data.ts` (328 KB) do caminho de carregamento principal.
- **NFR-02 (SEO & Indexabilidade)**:
  - A rota da vitrine do professor deve gerar meta-tags OpenGraph e Twitter Cards dinâmicas (título com nome do professor, descrição com a headline e imagem com a foto ou banner) para compartilhamento rico no WhatsApp e redes sociais.
- **NFR-03 (Segurança & Sanitização)**:
  - Todos os campos de texto rico e biografia devem ser sanitizados contra ataques de Cross-Site Scripting (XSS) tanto no backend (.NET 9) quanto no frontend (Angular DOMPurify / Security Context).
  - Slugs devem obedecer à regex estrita `^[a-z0-9]+(?:-[a-z0-9]+)*$` para evitar ataques de injeção e path traversal.
- **NFR-04 (Privacidade & LGPD)**:
  - O formulário de captura de leads deve apresentar caixa de seleção de consentimento transparente, informando que os dados serão compartilhados exclusivamente com o professor destinatário.
- **NFR-05 (Escalabilidade de Banco de Dados)**:
  - Criação de índices no Entity Framework Core para as colunas de busca frequente: `ProfessorProfile.CustomSlug` (Unique Index), `ContentOffering.Subject`, `ContentOffering.Format`, `ContentOffering.City`, `ContentOffering.IsActive`.
- **NFR-06 (Compatibilidade e Responsividade)**:
  - 100% dos componentes de vitrine e catálogo devem ser desenvolvidos com abordagem *Mobile-First*, garantindo usabilidade impecável em telas de 360px a 1920px.

---

## 6. Métricas de Sucesso & Counter-Metrics

| Métrica de Sucesso | Definição | Meta Inicial (MVP) |
| :--- | :--- | :--- |
| **Adoção da Vitrine** | % de professores ativos que customizam slug, bio e foto | > 70% em 30 dias |
| **Catálogo Ativo** | Média de ofertas (aulas, cursos, e-books, mentorias) cadastradas por professor | $\ge 3$ ofertas ativas por professor |
| **Taxa de Conversão da Vitrine** | Proporção de visitantes únicos que clicam em CTAs de contato/compra | > 8% de taxa de clique |
| **Tempo de Carregamento da Vitrine** | LCP médio das páginas `/professor/:slug` | < 1.8 segundos |

### Counter-Metrics (O que NÃO pode piorar)
- **Taxa de Rejeição (Bounce Rate) no Mobile**: Não deve ultrapassar 45% nas vitrines públicas (garantido por design limpo sem popups invasivos).
- **Taxa de Suporte por Erros de Rota**: Queda a 0% de tickets relacionados ao erro de checkout individual descontinuado.
- **Tempo de Resposta da API de Busca**: As consultas no `/api/publicshowcase/explore` não devem ultrapassar 120ms mesmo com filtros combinados.

---

## 7. Premissas e Limitações do MVP

1. **Gateways de Pagamento de Conteúdos**: O TeacherTech no MVP não atuará como intermediador financeiro nem processador das vendas das aulas particulares ou e-books; o professor utiliza seus próprios links (WhatsApp para Pix próprio, Hotmart, Kiwify ou Eduzz). Isso elimina a necessidade de compliance financeiro complexo (split BACEN / KYC bancário de marketplace).
2. **Hospedagem de Vídeos**: Vídeos de apresentação serão hospedados via links públicos do YouTube ou Vimeo embutidos com player responsivo, dispensando custos de streaming direto no S3/Blob storage nesta fase.
3. **Upload de Imagens**: O MVP suportará URLs diretas de imagens (ex: Imgur, Cloudinary, AWS S3 pré-assinado) com fallback para URLs públicas seguras.
