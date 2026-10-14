# TeacherTech — Matriz Completa de Casos de Teste (Plano de Testes QA)

**Versão:** 1.0  
**Data:** 14 de Outubro de 2026  
**Responsável:** QA Engineer & Test Strategist  
**Escopo:** Cobertura Funcional, Integração, Segurança Multitenant, Casos de Borda e E2E para todos os Épicos (1 a 5) e Core da Plataforma.

---

## 1. Visão Geral da Estratégia de Testes

A arquitetura do **TeacherTech** combina um backend robusto em **.NET 9 Web API** com banco relacional (EF Core 9 / SQLite em testes e TiDB/MySQL em prod) e um frontend moderno em **Angular 22** (Standalone Components, Signals e Tailwind CSS).

A pirâmide de testes do projeto está estruturada em:
1. **Testes Unitários e de Integração Backend (.NET 9 / xUnit / FluentAssertions)**: Validação de regras de negócio, persistência de banco, segurança de claims e contratos HTTP. Atualmente com **57/57 testes passando (100% verde)**.
2. **Testes de Regressão de Build & Tipagem Estrita (Angular 22 / TypeScript)**: Compilação `ng build` sem erros de template ou tipos.
3. **Casos de Teste Funcionais & Manuais / E2E (Mapeados neste documento)**: Validação da jornada do usuário em cenários felizes, negativos, de segurança e de borda.

---

## 2. Matriz de Casos de Testes por Módulo e Épico

### 🏷️ ÉPICO 1: Vitrine Personalizável do Professor (`/p/:slug`) & Busca Facetada (`/explorar`)

| ID | Cenário / Descrição | Tipo | Pré-condição | Passos / Ação | Resultado Esperado | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **TC-01.1** | Acessar vitrine pública por slug válido | Positivo | Professor com perfil público e slug `roberto-silva` cadastrado. | Acessar URL `/p/roberto-silva`. | Retorna HTTP 200, exibe nome, foto/avatar, bio, tema de cor personalizado, redes sociais e lista de ofertas ativas. | **P0** |
| **TC-01.2** | Acessar vitrine com slug inexistente | Negativo | Não existe professor com o slug informado. | Acessar `/p/slug-inexistente-xyz`. | Exibe página amigável de erro ("Perfil não encontrado") com botão para voltar ao `/explorar` (HTTP 404). | **P1** |
| **TC-01.3** | Acessar vitrine de professor com visibilidade privada | Negativo | Professor existe mas tem `PublicVisibility = false`. | Acessar `/p/professor-privado`. | Retorna HTTP 404/Página de perfil não encontrado, garantindo a privacidade do docente. | **P1** |
| **TC-01.4** | Renderização de vídeo de apresentação (YouTube normal, curto e Vimeo) | Funcional | Professor cadastrou links de vídeo nos formatos `youtube.com/watch?v=...`, `youtu.be/...` ou `vimeo.com/...`. | Abrir a vitrine do professor. | O player de vídeo embutido sanitiza o iframe e reproduz o vídeo sem erros de CSP ou CORS. | **P2** |
| **TC-01.5** | Filtro de ofertas por tipo na vitrine | Funcional | Professor possui ofertas de Aula Particular, Curso, E-book e Mentoria. | Clicar nos chips "Aulas", "Cursos", "E-books" e "Mentorias". | A lista reage instantaneamente via Signal `filteredOfferings`, exibindo apenas os itens da categoria clicada. | **P1** |
| **TC-01.6** | Busca por palavra-chave no `/explorar` | Positivo | Existem ofertas cadastradas com "Direito Constitucional" e "Python". | Digitar "direito" na barra de busca e pesquisar. | Apenas ofertas ou cursos cujo título, descrição ou matéria contenham "direito" (sem diferenciar maiúsculas/acentos) são listadas. | **P0** |
| **TC-01.7** | Filtro facetado por Matéria, Formato e Faixa de Preço | Integração | Diversas ofertas no catálogo. | Selecionar Matéria: "Matemática", Formato: "Online", Preço Máx: R$ 100,00. | API executa a query combinada com sucesso e a tela reflete apenas os itens correspondentes a todos os filtros. | **P1** |
| **TC-01.8** | Paginação no `/explorar` | Funcional | Mais de 12 ofertas ativas no sistema. | Navegar para a página 2 de resultados. | Carrega os próximos 12 itens, atualiza o índice da página e os botões "Anterior/Próximo" respeitam os limites. | **P2** |
| **TC-01.9** | Busca sem resultados | Borda | Nenhuma oferta atende aos critérios inseridos. | Filtrar por critérios muito restritivos (ex: Preço Máx: R$ 1,00). | Exibe estado vazio elegante ("Nenhuma oferta encontrada") com botão "Limpar Filtros". | **P2** |

---

### 🏷️ ÉPICO 2: CTAs de Conversão & Captura de Leads (Sem Usuários Fantasmas)

| ID | Cenário / Descrição | Tipo | Pré-condição | Passos / Ação | Resultado Esperado | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **TC-02.1** | Clique no botão CTA WhatsApp | Positivo | Oferta com `CtaType = WhatsApp` e professor com telefone `(11) 98888-7777`. | Clicar em "Falar no WhatsApp". | Abre nova aba para `wa.me/5511988887777` com mensagem pré-formatada contendo o título da oferta, e registra telemetria de clique. | **P0** |
| **TC-02.2** | Envio de formulário de Lead com consentimento LGPD | Positivo | Aluno visitante anônimo na vitrine. | Preencher Nome: "Carla Souza", E-mail: "carla@email.com", WhatsApp: "(21) 97777-6666", marcar checkbox LGPD e enviar. | Retorna HTTP 200, salva o lead na tabela `ShowcaseLeads`, incrementa `ShowcaseMetrics.LeadsCount` e exibe mensagem de sucesso. | **P0** |
| **TC-02.3** | Garantia de Higiene: Lead NÃO cria usuário em `AspNetUsers` | Segurança / Auditoria | Aluno anônimo envia formulário de lead. | Submeter o lead e verificar a tabela de banco `AspNetUsers`. | Nenhum registro de usuário é criado em `AspNetUsers` (evita poluição da base de autenticação e contas zumbis). | **P0** |
| **TC-02.4** | Tentativa de envio de Lead sem aceitar termos LGPD | Negativo | Formulário de contato aberto. | Preencher campos obrigatórios, desmarcar checkbox de consentimento e clicar em enviar. | O formulário bloqueia o envio com mensagem instrutiva exigindo o aceite dos termos. | **P1** |
| **TC-02.5** | Validação de formatos de E-mail e Telefone no Lead | Negativo | Formulário de lead aberto. | Inserir e-mail inválido (`carla@@email`) ou telefone incompleto. | Exibe aviso de campo inválido e previne requisições malformadas para a API. | **P2** |
| **TC-02.6** | Verificação de bloqueio do Checkout Legado Zumbi | Regressão / Segurança | Tentativa de chamada manual a `POST /api/payments/checkout`. | Enviar payload para o endpoint antigo de compra. | Retorna HTTP 400 com mensagem explicativa informando que o checkout avulso legado foi descontinuado. | **P1** |

---

### 🏷️ ÉPICO 3: Painel de Controle e Gestão do Docente (`/professor/vitrine`, `/professor/ofertas`, `/professor/dashboard`)

| ID | Cenário / Descrição | Tipo | Pré-condição | Passos / Ação | Resultado Esperado | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **TC-03.1** | Edição de vitrine com Live Preview reativo | Funcional | Professor autenticado em `/professor/vitrine`. | Alterar Headline, Bio e Cor do Tema nos campos de input. | O preview em tela dividida reflete as alterações em tempo real antes de clicar em salvar. | **P1** |
| **TC-03.2** | Validação de unicidade de Slug com Debounce | Negativo / Validação | Professor A tenta salvar um slug que já pertence ao Professor B. | Digitar o slug de outro professor e salvar. | API retorna HTTP 409 Conflict avisando que o link já está em uso; a interface alerta o professor. | **P1** |
| **TC-03.3** | Manutenção do próprio slug | Positivo | Professor edita outros campos da vitrine mantendo seu slug atual. | Salvar perfil com o mesmo slug já atribuído a ele. | Permite a atualização sem disparar falso conflito de unicidade. | **P1** |
| **TC-03.4** | CRUD completo de Ofertas de Conteúdo | Funcional | Professor em `/professor/ofertas`. | Criar nova oferta de Mentoria com valor R$ 250,00, editar descrição e alternar status (ativo/inativo). | A oferta é salva, refletida na lista e o toggle de ativação funciona instantaneamente. | **P0** |
| **TC-03.5** | Reordenação de ofertas na vitrine | Funcional | Professor possui 3 ofertas cadastradas. | Usar botões de subir/descer para alterar a prioridade da oferta. | A nova ordem é salva no backend (`DisplayOrder`) e refletida na visualização pública. | **P2** |
| **TC-03.6** | CRM de Leads no Dashboard: Atualização de status | Funcional | Professor possui leads com status "Novo" no `/professor/dashboard`. | Mudar status para "Contatado" e "Convertido" no seletor. | O status é atualizado na API e o card/linha muda de cor conforme a tag visual. | **P1** |
| **TC-03.7** | Proteção de Rotas do Professor para usuários Aluno | Segurança / RBAC | Usuário logado com role `Student`. | Tentar navegar para `/professor/vitrine` ou `/professor/dashboard`. | O `RoleGuard` do Angular redireciona para `/meus-estudos` ou `/` com acesso negado. | **P0** |

---

### 🏷️ ÉPICO 4: Nova Landing Page Institucional (`/`)

| ID | Cenário / Descrição | Tipo | Pré-condição | Passos / Ação | Resultado Esperado | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **TC-04.1** | Renderização da Home e Proposta Dual | Visual / Funcional | Usuário acessa a raiz `/`. | Observar a página inicial. | Exibe Hero com cards direcionados: "Para Professores" e "Para Alunos", barra de pesquisa e destaques. | **P1** |
| **TC-04.2** | Busca rápida direta a partir da Home | Funcional | Usuário na Landing Page. | Digitar "Cálculo" na barra de busca da Home e pressionar Enter. | Redireciona para `/explorar?search=Cálculo`, executando a busca imediatamente no catálogo. | **P1** |
| **TC-04.3** | CTAs de conversão da Landing Page | Funcional | Usuário na Landing Page. | Clicar em "Criar Minha Vitrine Grátis" e "Explorar Aulas e Cursos". | Direciona respectivamente para `/auth` (cadastro de professor) e `/explorar`. | **P1** |
| **TC-04.4** | Responsividade Mobile da Landing Page | Usabilidade / UI | Visualização em tela de smartphone (360px a 414px). | Redimensionar viewport e navegar pela Home. | Elementos se reorganizam verticalmente sem overflow horizontal, textos legíveis e botões com área de toque mínima de 44px. | **P1** |

---

### 🏷️ ÉPICO 5: Checkout Pix P2P Direto ao Professor & Liberação em 1-Clique

| ID | Cenário / Descrição | Tipo | Pré-condição | Passos / Ação | Resultado Esperado | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **TC-05.1** | Geração de BR Code Pix Padrão BACEN com CRC16 | Teste Unitário / Algoritmo | Chave Pix, Nome do Professor e Valor informados. | Chamar `PixBrCodeGenerator.GeneratePayload(...)`. | Payload gerado começa com `000201`, contém GUI `br.gov.bcb.pix`, Moeda `986`, valor exato e termina com 4 caracteres hex de CRC16 válido. | **P0** |
| **TC-05.2** | Normalização ASCII de caracteres especiais no BR Code | Borda / Validação | Nome do professor "José da Conceição", cidade "São Paulo". | Gerar payload Pix. | Nomes e cidades são convertidos para ASCII maiúsculo sem acento (`JOSE DA CONCEICAO`, `SAO PAULO`), cumprindo a norma do BACEN. | **P1** |
| **TC-05.3** | Checkout Pix por Aluno Autenticado | Positivo | Aluno logado na plataforma visualiza curso pago. | Clicar em "⚡ Liberar com Pix". | Abre modal com dados do aluno pré-preenchidos, exibe QR Code, valor correto e botão para copiar código. | **P0** |
| **TC-05.4** | Checkout Pix por Aluno Anônimo (Primeiro Acesso) | Positivo | Visitante não logado clica em curso pago na vitrine. | Informar Nome, E-mail e WhatsApp, e clicar em "Gerar Código Pix". | Cria conta de aluno transparente pelo e-mail, gera solicitação `PENDING_PIX` e abre tela com QR Code e Copia-e-Cola. | **P0** |
| **TC-05.5** | Copiar Código Pix com feedback na área de transferência | Usabilidade | Modal Pix aberto no passo do pagamento. | Clicar no botão "Copiar". | String do BR Code é copiada para o clipboard e botão exibe "✅ Copiado!" por 3 segundos. | **P1** |
| **TC-05.6** | Botão "Já fiz o Pix! Enviar Comprovante no WhatsApp" | Positivo | Modal Pix com dados prontos. | Clicar no botão verde de comprovante no WhatsApp. | Abre `wa.me` com o número do professor e texto preenchido com nome do aluno, curso, valor e ref `#XXXX`. | **P0** |
| **TC-05.7** | Tentativa de Checkout para Professor sem Chave Pix cadastrada | Negativo / Validação | Professor ainda não preencheu `PixKey` no seu perfil. | Aluno tenta comprar curso deste professor. | API retorna HTTP 400 avisando que o professor ainda não cadastrou a Chave Pix e orientando contato via WhatsApp. | **P0** |
| **TC-05.8** | Tentativa de compra de curso que o aluno já possui acesso | Negativo / Regra de Negócio | Aluno já possui matrícula com status `ACTIVE` no curso. | Tentar gerar novo Pix para o mesmo curso. | Retorna HTTP 400 avisando que o aluno já tem acesso ativo ao conteúdo. | **P1** |
| **TC-05.9** | Polling automático e celebração na tela do aluno | Reatividade | Aluno aguardando com modal aberto no status `PENDING_PIX`. | Professor aprova o pagamento no dashboard. | Em até 3.5 segundos o polling detecta `isApproved = true`, exibe animação de sucesso e o botão "Começar a Estudar Agora". | **P0** |
| **TC-05.10** | Redirecionamento após aprovação | Funcional | Tela de celebração de pagamento confirmado exibida. | Clicar em "Começar a Estudar Agora". | Modal fecha e roteia o aluno diretamente para a sala de aula `/estudo/:courseId`. | **P1** |
| **TC-05.11** | Listagem de pendências no Dashboard do Professor | Funcional | 2 alunos geraram Pix pendente. | Professor acessa `/professor/dashboard`. | A seção "🔔 Solicitações de Matrícula & Pagamentos Pix Pendentes" lista os 2 alunos com valor em R$ e badge "⚡ Pix Pendente". | **P0** |
| **TC-05.12** | Aprovação de Pagamento em 1-Clique pelo Professor | Positivo | Solicitação pendente listada na tabela. | Professor clica em "✅ Confirmar & Liberar". | Item é removido da lista de pendências, status muda para `APPROVED` e matrícula em `Enrollment` é criada com `GrantedVia: "PIX_P2P"`. | **P0** |
| **TC-05.13** | Segurança Multitenant: Tentativa de aprovação por outro professor | Segurança / IDOR | Professor B tenta aprovar a solicitação de um curso do Professor A. | Enviar requisição `POST /api/accessrequests/{id}/approve` com token do Professor B. | Retorna HTTP 403 Forbidden. Professor B não pode interferir nos alunos do Professor A. | **P0** |
| **TC-05.14** | Recusa de solicitação pelo Professor | Funcional | Professor identifica comprovante inválido ou engano. | Clicar em "Recusar" e confirmar o prompt. | Status da solicitação passa para `REJECTED` e nenhuma matrícula é concedida. | **P2** |
| **TC-05.15** | Alerta visual de Chave Pix ausente no Dashboard | Usabilidade | Professor recém-cadastrado entra no dashboard sem chave Pix. | Carregar `/professor/dashboard`. | Exibe banner amarelo alertando a ausência da chave Pix com link direto para configurá-la. | **P1** |

---

### 🏷️ MÓDULO CORE: Sala de Estudos, Questões, Flashcards & Estúdio IA

| ID | Cenário / Descrição | Tipo | Pré-condição | Passos / Ação | Resultado Esperado | Prioridade |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **TC-06.1** | Acesso ao conteúdo do curso por aluno matriculado | Positivo | Aluno possui matrícula ativa no curso. | Acessar `/estudo/:courseId`. | Permite visualização dos módulos, matérias, tópicos, resumos em Markdown e flashcards. | **P0** |
| **TC-06.2** | Bloqueio de acesso para aluno não matriculado | Segurança | Aluno sem matrícula tenta acessar `/estudo/:courseId`. | Tentar carregar a URL direta. | Redireciona para `/meus-estudos` ou vitrine com aviso de que é necessário adquirir ou solicitar acesso. | **P0** |
| **TC-06.3** | Resolução interativa de Questões com Feedback imediato | Funcional | Aluno no tópico de estudo com questões cadastradas. | Selecionar uma alternativa e submeter. | Revela imediatamente se acertou ou errou, destaca a alternativa correta em verde e exibe o comentário pedagógico. | **P0** |
| **TC-06.4** | Estudo com Flashcards (Virar card e marcar dificuldade) | Funcional | Tópico com flashcards cadastrados. | Clicar no card para virar (frente/verso) e clicar em "Fácil", "Médio" ou "Difícil". | Animação suave de flip 3D e registro do progresso de repetição espaçada. | **P1** |
| **TC-06.5** | Consumo de Créditos de IA no Estúdio do Professor | Regra de Negócio | Professor com plano Pro (limite 500 créditos, 10 utilizados). | Gerar resumo e questões automáticas via IA para um tópico. | Conteúdo é gerado com sucesso e o contador de créditos passa para 11/500 no dashboard. | **P1** |
| **TC-06.6** | Bloqueio de geração por IA ao esgotar créditos | Borda | Professor atingiu 500/500 créditos de IA do mês. | Tentar gerar novo material com IA. | Exibe aviso amigável de cota mensal atingida com convite para upgrade de plano. | **P1** |

---

## 3. Matriz de Casos de Teste de Segurança e Borda

| ID | Vetor de Teste | Ação / Payload | Comportamento Esperado |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **Injeção de Script / XSS** | Inserir `<script>alert('xss')</script>` no nome do aluno ou mensagem do Pix/Lead. | O Angular e o .NET sanitizam o texto; tags HTML são escapadas e nenhum código é executado. |
| **SEC-02** | **Enumeração de IDOR** | Tentar consultar status de um `accessRequestId` de formato inválido (ex: `not-a-guid`). | O ASP.NET Core valida a restrição de rota `{id:guid}` e retorna HTTP 404/400 sem vazar stack trace. |
| **SEC-03** | **Poluição de Telefone no WhatsApp** | Informar telefone com letras, traços e parênteses: `+55 (11) 9.9999-8888`. | O gerador limpa para `5511999998888` garantindo que o link do WhatsApp funcione em qualquer dispositivo. |
| **SEC-04** | **Queda de Conexão durante o Polling** | Aluno no modal Pix desliga temporariamente o Wi-Fi durante o polling. | O polling falha silenciosamente sem quebrar o modal; ao reconectar, retoma a verificação do status. |
| **SEC-05** | **Valor com Casas Decimais e Moeda Invariante** | Oferta com valor `R$ 89,90` gerando Pix em ambiente com cultura local. | O gerador formata o BR Code obrigatoriamente com ponto decimal (`89.90`), evitando rejeição pelo Banco Central. |

---

## 4. Recomendações de Automação para a Equipe de Engenharia

Para elevar ainda mais a maturidade do pipeline de CI/CD:

1. **Testes E2E com Playwright / Cypress**:
   - Automatizar o fluxo: `Visitante ➔ /p/:slug ➔ Clicar 'Comprar com Pix' ➔ Preencher modal ➔ Obter BR Code ➔ Professor loga no dashboard ➔ Clica 'Confirmar & Liberar' ➔ Aluno é redirecionado para /estudo/:courseId`.
2. **Teste de Carga / Concorrência**:
   - Simular 50 alunos solicitando Pix simultaneamente para a mesma oferta com validação de tempo de resposta (< 200ms por checkout).
3. **Validador de BR Code contra SDK Oficial do BACEN**:
   - Rodar testes automatizados comparando o output de `PixBrCodeGenerator` com decodificadores oficiais de EMV QR Code.
