# Epic 5: Checkout Pix P2P Direto ao Professor com Liberação em 1-Clique

**Épico:** EPIC-05 — Pagamento Pix P2P & Liberação Semiautomática  
**Prioridade:** P1 (Alta)  
**Status:** Completed  
**Documentos Relacionados:** `docs/prd.md` (FR-05, FR-09, FR-17), `docs/architecture.md` (Seção 2 e AD-03)  
**Decisão Arquitetural:** Modelo Peer-to-Peer (Aluno ➔ Professor) sem custódia financeira pela plataforma, com geração de BR Code padrão BACEN e aprovação imediata no Dashboard.

---

## 1. Visão do Épico

O TeacherTech atua como um SaaS facilitador para educadores autônomos, sem reter comissões de intermediação e sem operar como instituição financeira. 

Este épico entrega a experiência completa de compra e liberação de aulas/cursos:
1. **O Aluno**:
   - Clica em "Comprar via Pix" ou "Matricular-se" na vitrine do professor (`/p/:slug`) ou catálogo (`/explorar`).
   - Recebe um QR Code dinâmico e o código **Pix Copia-e-Cola oficial (Padrão BR Code BACEN)** com o valor exato da oferta e a chave Pix do professor.
   - Paga no app do seu banco e clica em *"Já paguei! Enviar Comprovante no WhatsApp"*.
   - A tela aguarda a conferência e, assim que o professor confirma, é liberada imediatamente para o estudo (`/estudo/:courseId`).
2. **O Professor**:
   - Cadastra sua Chave Pix (CPF, CNPJ, E-mail, Telefone ou Aleatória) no perfil.
   - Recebe o comprovante no seu WhatsApp pessoal e a notificação de pagamento pendente no `/professor/dashboard`.
   - Confere o extrato do seu banco e clica em **"✅ Confirmar Pix & Liberar Acesso"** em 1 clique.
   - O aluno é matriculado imediatamente (`Enrollment` ativo).

---

## 2. Histórias de Usuário do Épico 5

---

### Story 5.1: Gerador de BR Code Pix Padrão BACEN e Endpoints de Pagamento P2P

**Como** desenvolvedor do sistema,  
**Quero** um gerador leve de payload Pix EMV padrão do Banco Central e endpoints para orquestrar a intenção de compra P2P,  
**Para que** a plataforma gere códigos Pix Copia-e-Cola válidos sem depender de APIs bancárias pagas ou burocráticas.

#### Contexto & Arquitetura
- **Serviço**: `PixBrCodeGenerator.cs` (geração de padrão EMV QR Code com CRC16-CCITT).
- **Controller**: `PaymentsController.cs` e `AccessRequestsController.cs`.
- **Endpoints**:
  - `POST /api/payments/p2p-pix-checkout`:
    - Payload: `CourseId` (ou `OfferingId`), `StudentName`, `StudentEmail`, `StudentPhone`.
    - Busca o professor dono do curso e sua `PixKey`.
    - Se o professor não tiver chave Pix, retorna erro instrutivo `"O professor ainda não configurou sua chave Pix"`.
    - Cria `AccessRequest` com status `PENDING_PIX` e valor da oferta.
    - Gera payload Pix Copia-e-Cola e retorna dados para o modal do aluno.
  - `GET /api/accessrequests/{id}/status`:
    - Permite polling do aluno para saber se o acesso já foi aprovado.
  - `GET /api/accessrequests/pending`:
    - Lista solicitações pendentes do professor com nome do aluno, e-mail, telefone, curso e valor em R$.
  - `POST /api/accessrequests/{id}/approve`:
    - Aprova a solicitação, altera status para `APPROVED` e cria `Enrollment` ativo com `GrantedVia: "PIX_P2P"`.

#### Critérios de Aceitação
- **AC-5.1.1 (Payload Pix Válido)**: O código Pix gerado deve respeitar o padrão BR Code do BACEN, contendo Chave Pix, Nome do Professor e Valor formatado com 2 casas decimais.
- **AC-5.1.2 (Segurança Multitenant)**: O professor A não pode aprovar solicitações de cursos pertencentes ao professor B (HTTP 403 Forbidden).
- **AC-5.1.3 (Criação de Matrícula Ativa)**: Ao aprovar, o registro em `Enrollment` deve ser criado imediatamente com `Status: "ACTIVE"`.

---

### Story 5.2: Modal Frontend de Checkout Pix P2P com Envio de Comprovante no WhatsApp

**Como** aluno interessado em um curso ou aula,  
**Quero** um modal claro com o QR Code Pix, botão de copiar código e botão para enviar o comprovante no WhatsApp do professor,  
**Para que** eu pague com segurança e notifique o professor com facilidade.

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/shared/pix-p2p-checkout-modal/pix-p2p-checkout-modal.component.ts`.
- **Elementos da Interface**:
  - Valor da oferta em destaque (ex: `R$ 120,00`).
  - QR Code Pix renderizado visualmente.
  - Campo de código Pix Copia-e-Cola com botão de 1-clique "Copiar Código Pix" com feedback de sucesso.
  - Favorecido: Nome do professor e chave cadastrada.
  - Botão de ação: *"Já fiz o Pix! Enviar Comprovante no WhatsApp"* abrindo `wa.me` com texto pré-configurado.
  - Indicador de status em tempo real (polling suave de 3s no endpoint de status).
  - Tela de Sucesso automática: quando o professor aprova, o modal exibe celebração e botão *"Acessar Curso Agora"*.

#### Critérios de Aceitação
- **AC-5.2.1 (Copiar Código Pix)**: Clicar no botão copia o código para a área de transferência do dispositivo.
- **AC-5.2.2 (Mensagem do WhatsApp Pré-formatada)**: O link do WhatsApp deve conter nome do aluno, curso, valor e e-mail para identificação do pagamento.
- **AC-5.2.3 (Redirecionamento ao Aprovar)**: Assim que o polling detecta `isApproved === true`, o aluno é convidado a entrar em `/estudo/:courseId`.

---

### Story 5.3: Seção de Pagamentos Pendentes no Dashboard do Professor

**Como** professor autônomo,  
**Quero** ver no meu dashboard os pagamentos Pix pendentes de conferência com botão de 1 clique para liberar,  
**Para que** eu valide o recebimento no app do meu banco e libere o aluno em poucos segundos.

#### Contexto & Arquitetura
- **Componente**: `angular-app/src/app/components/professor-dashboard/professor-dashboard.component.ts`.
- **Nova Seção**: *"🔔 Solicitações de Matrícula & Pagamentos Pix Pendentes"*.
  - Aluno (Nome, E-mail, Telefone).
  - Curso/Oferta e Valor a receber em R$.
  - Botão verde: *"✅ Confirmar Recebimento & Liberar"* (executa aprovação imediata).
  - Botão de ação secundária: *"Recusar / Dúvida"*.
- **Configuração da Chave Pix**:
  - Card rápido alertando se o professor ainda não cadastrou sua Chave Pix, com atalho direto para cadastrar.

#### Critérios de Aceitação
- **AC-5.3.1 (Aprovação com 1 Clique)**: Clicar em "Confirmar Recebimento & Liberar" remove a pendência da lista e matricula o aluno instantaneamente.
- **AC-5.3.2 (Aviso de Chave Pix Ausente)**: Se o professor não tiver `PixKey` cadastrada, o dashboard exibe um alerta educativo orientando o cadastro.

---

## 3. Critérios de Pronto (Definition of Done do Epic 5)
- [x] Gerador `PixBrCodeGenerator` implementado e testado com padrão BACEN.
- [x] Endpoints de checkout P2P, consulta de status e aprovação validados por testes automatizados.
- [x] Componente `PixP2pCheckoutModalComponent` funcional na vitrine e catálogo.
- [x] Painel do professor atualizado com a lista de pendências e botão de liberação em 1 clique.
- [x] Suíte de testes do backend (.NET 9) mantida 100% verde (57/57 testes aprovados).
- [x] Build de produção do Angular validado com 0 erros.
