# TeacherTech / Concurso Dev - Monorepo

Este repositório contém a solução completa da plataforma **TeacherTech / Concurso Dev**, unificando o **Frontend (Angular)** e o **Backend (.NET 9 Web API)** em uma arquitetura monorepo com automação de CI/CD via **GitHub Actions** e deploy do frontend no **GitHub Pages**.

---

## Estrutura do Repositório

```
dataprev-estudos/
├── .github/
│   └── workflows/
│       └── deploy.yml       # Pipeline CI/CD (Testes .NET + Build/Deploy Angular Pages)
├── .gitignore               # Regras de ignore para Node, .NET, IDEs e backups
├── README.md                # Documentação geral do monorepo
├── angular-app/             # Aplicação Frontend (Angular 22)
│   ├── src/
│   ├── package.json
│   └── angular.json
└── backend/                 # Aplicação Backend (.NET 9 Web API)
    ├── src/
    │   ├── TeacherTech.Api/
    │   ├── TeacherTech.Application/
    │   ├── TeacherTech.Domain/
    │   └── TeacherTech.Infrastructure/
    ├── tests/
    │   └── TeacherTech.Tests/
    └── TeacherTech.sln
```

---

## Como Executar Localmente

### 1. Backend (.NET 9 Web API)
Requisitos: [.NET SDK 9.0+](https://dotnet.microsoft.com/download)

```bash
# Navegar até a pasta backend
cd backend

# Restaurar pacotes e rodar a suíte de testes
dotnet restore
dotnet test

# Executar a API
dotnet run --project src/TeacherTech.Api
```
A API estará disponível por padrão em `http://localhost:5000` (Swagger: `http://localhost:5000/swagger`).

---

### 2. Frontend (Angular 22)
Requisitos: [Node.js 22+](https://nodejs.org/) e npm

```bash
# Navegar até a pasta angular-app
cd angular-app

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```
O app estará acessível em `http://localhost:4200/`.

---

## Pipeline CI/CD (GitHub Actions & GitHub Pages)

O workflow `.github/workflows/deploy.yml` é executado a cada push na branch `main` e realiza:

1. **Validação do Backend (.NET 9):**
   - Restauração de dependências NuGet.
   - Execução de todos os testes unitários e de integração (`TeacherTech.Tests`).
2. **Build do Frontend (Angular):**
   - Configuração do Node.js 22.
   - Instalação limpa das dependências (`npm ci`).
   - Build de produção configurado com `--base-href /concurso-dev/`.
   - Criação automática de `404.html` para suporte a roteamento SPA (Client-side routing) no GitHub Pages.
3. **Deploy no GitHub Pages:**
   - Publicação automática do pacote estático em `https://eduardolessasantos.github.io/concurso-dev/`.
