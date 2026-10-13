# TeacherTech — Project Brief (Brownfield Reverse Documented)

## 1. Visão Geral do Produto
O **TeacherTech** é uma plataforma concebida para funcionar como a **vitrine virtual e ambiente de gestão de conteúdos de professores autônomos e mentores**. 

Originalmente iniciado sob a identidade de "Concurso Dev" (focado em preparação para concursos públicos como Dataprev), o sistema está em transição brownfield para um modelo de **SaaS educacional B2B/B2C**:
1. **Para o Professor**: Uma ferramenta completa ("Studio") onde o docente estrutura seus cursos, gera resumos, flashcards e questões com o suporte de Inteligência Artificial (Google Gemini), publica uma vitrine pública personalizada (`/p/:slug`) e gerencia seus alunos por convites (links, WhatsApp, QR Codes).
2. **Para o Estudante**: Um portal unificado onde ele explora vitrines públicas de mentores (`/explorar`), visualiza perfis pedagógicos, solicita acesso ou resgata códigos de convite (`/convite/:token`), e estuda por meio de trilhas estruturadas, simulados cronometrados e flashcards.

---

## 2. Proposta de Valor da Vitrine Virtual
A vitrine virtual do TeacherTech resolve a principal dor do professor independente: **a pulverização de materiais em PDFs soltos, grupos de WhatsApp desorganizados e plataformas caras que cobram altas taxas de intermediação**.

- **Identidade e Autoridade do Docente**: Cada professor possui sua página pública dedicada (`/p/:slug`), exibindo sua biografia, foto, headline, conquistas e catálogo de trilhas.
- **Distribuição Ágil e Controle de Acesso**: Em vez de depender obrigatoriamente de gateways de e-commerce complexos para cada venda, o professor pode distribuir acessos via links com limite de uso, convites direcionados por WhatsApp e moderação de solicitações da vitrine.
- **Ecossistema Integrado de Estudos**: O aluno que acessa pela vitrine entra diretamente em uma experiência de estudo rica (teoria com markdown, resolução de questões com gabarito comentado, flashcards de repetição espaçada e simulados completos).

---

## 3. Personas

### 3.1. Persona Primária: O Professor Autônomo / Mentor
- **Perfil**: Professor particular, tutor de concursos, especialista de TI ou criador de conteúdo educacional que vende mentorias, turmas fechadas ou cursos preparatórios.
- **Dores Principais**:
  - Dificuldade técnica para criar uma página web moderna com seus cursos.
  - Perda de tempo criando questões, flashcards e resumos teóricos do zero.
  - Insegurança na gestão de acessos (alunos compartilhando PDFs ou links sem controle).
  - Custo alto de plataformas LMS tradicionais (Hotmart, Eduzz, Kiwify) ou ferramentas que exigem pagamento de porcentagens elevadas por transação.
- **Objetivos no TeacherTech**:
  - Ter um link profissional próprio (`teachertech.com.br/p/prof-nome`) para colocar na bio do Instagram e grupos de WhatsApp.
  - Usar IA para acelerar a montagem de trilhas e banco de questões com base em bancas examinadoras.
  - Controlar quem acessa seus cursos através de tokens e convites com expiração.
  - Assinar um plano mensal acessível (modelo SaaS) para manter sua infraestrutura no ar.

### 3.2. Persona Secundária: O Aluno / Concurseiro / Estudante
- **Perfil**: Candidato a concursos públicos ou estudante de tecnologia buscando materiais direcionados, objetivos e com curadoria de um professor de confiança.
- **Dores Principais**:
  - Excesso de conteúdo genérico e desatualizado na internet.
  - Dificuldade em acompanhar o próprio rendimento (o que já estudou, o que errou em simulados).
  - Atrito no cadastro em plataformas complicadas apenas para acessar o material de uma aula.
- **Objetivos no TeacherTech**:
  - Encontrar de forma limpa as trilhas ofertadas pelo seu professor de preferência.
  - Solicitar vaga na turma ou inserir o código de 8 dígitos recebido pelo professor em 1 clique.
  - Praticar com questões comentadas e cartões de memorização na mesma interface onde lê os resumos.

---

## 4. Posicionamento de Modelo de Negócio (Pivot Detectado no Código)
A codebase revela uma mudança arquitetural recente não totalmente consolidada:
- **Modelo Legado (V1 - Marketplace B2C)**: A plataforma cobrava dos alunos por curso via PIX com split 90% professor / 10% plataforma (`PaymentsController.cs`).
- **Modelo Atual (V2 - SaaS B2B para Professores)**: O professor paga uma assinatura mensal recorrente via Asaas (`BillingController.cs` - Planos Basic R$ 29,90 e Pro R$ 59,90) para ter direito a publicar cursos, usar cotas de IA e emitir convites. O checkout direto de cursos para alunos foi bloqueado no backend com mensagem explícita, migrando para fluxo de solicitação de acesso e resgate de token.
