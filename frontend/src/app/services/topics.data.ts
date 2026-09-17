import { TopicDetail } from '../models/topic-detail.model';

export const TOPICS_DATA: Record<string, TopicDetail[]> = {
  "arquiteturasoftware": [
    {
      "title": "Arquitetura de software e princípios arquiteturais",
      "summary": "Organização geral do sistema, definindo componentes, responsabilidades, comunicação e padrões de funcionamento.",
      "detail": "Arquitetura de software representa a organização geral de um sistema: componentes, responsabilidades, formas de comunicação, tecnologias principais e padrões de funcionamento. Princípios essenciais: Modularidade (dividir em unidades lógicas), Coesão (elementos de um módulo relacionados ao mesmo objetivo), Acoplamento (grau de dependência entre partes — quanto menor, melhor), Escalabilidade (suportar crescimento), Manutenibilidade (facilitar correções e evolução). Uma arquitetura bem planejada reduz riscos, facilita integrações e melhora manutenção.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre modularidade, coesão, acoplamento e camadas.",
      "examples": [
        {
          "question": "O que é coesão e acoplamento?",
          "answer": "Coesão: elementos de um módulo relacionados ao mesmo objetivo (alta coesão é bom). Acoplamento: grau de dependência entre módulos (baixo acoplamento é bom).",
          "application": "Um módulo que só faz cálculos fiscais tem alta coesão. Se ele depende de 10 outros módulos, tem alto acoplamento."
        }
      ],
      "keyPoints": [
        "Modularidade: dividir em unidades lógicas",
        "Coesão alta: elementos do mesmo módulo com objetivo comum",
        "Acoplamento baixo: menor dependência entre módulos",
        "Escalabilidade: suportar crescimento",
        "Manutenibilidade: facilitar correções e evolução",
        "Arquitetura em camadas: apresentação, aplicação, negócio, persistência, integração"
      ],
      "tips": [
        "Alta coesão + baixo acoplamento = arquitetura saudável",
        "Camadas bem definidas permitem trocar tecnologia sem quebrar regras de negócio",
        "Arquitetura é decisão estratégica, não apenas técnica"
      ],
      "usefulLinks": [
        { "label": "Martin Fowler — Patterns of Enterprise Architecture", "url": "https://martinfowler.com/architecture/", "type": "documentacao" },
        { "label": "Arquitetura de Software — o que é? — Código Fonte TV", "url": "https://www.youtube.com/watch?v=kYx6GIU2Kbk", "type": "video" },
        { "label": "Princípios SOLID na prática — DevSuperior", "url": "https://www.youtube.com/watch?v=mkx0CdWiPRA", "type": "video" }
      ]
    },
    {
      "title": "Orientação a objetos e arquitetura web",
      "summary": "Fundamentos de objetos, classes, encapsulamento, herança e a forma como a arquitetura web organiza frontend, API e dados.",
      "detail": "Orientação a objetos organiza o código em classes e objetos com estado e comportamento. Conceitos centrais: encapsulamento (esconder detalhes internos), herança (reuso de características), polimorfismo (comportamento variado por interface comum) e composição (montagem de objetos por colaboração). Em arquitetura web, esses princípios são usados para modelar serviços, controladores, entidades, regras de negócio e componentes visuais. O frontend conversa com APIs por HTTP e JSON; a API orquestra regras, validações e integração com dados persistidos.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre OO, encapsulamento, herança, polimorfismo e modelo cliente-servidor na web.",
      "examples": [
        {
          "question": "Qual a relação entre orientação a objetos e arquitetura web?",
          "answer": "A orientação a objetos modela as entidades e regras internas da aplicação, enquanto a arquitetura web organiza como essas entidades são expostas e consumidas entre cliente, API e banco.",
          "application": "Uma classe Cliente modela o domínio; a API expõe operações como cadastrar, listar e atualizar; o frontend consome essas operações via HTTP.",
          "code": "class Cliente {\n  private String nome;\n\n  public Cliente(String nome) {\n    this.nome = nome;\n  }\n\n  public String getNome() {\n    return nome;\n  }\n}\n\n// Frontend -> API -> Cliente (domínio) -> Banco",
          "language": "java"
        }
      ],
      "keyPoints": [
        "Classe: template para objetos",
        "Objeto: instância com estado e comportamento",
        "Encapsulamento: ocultação de detalhes internos",
        "Herança: reutilização de características",
        "Polimorfismo: mesma interface, comportamentos diferentes",
        "Arquitetura web: frontend, API, persistência e comunicação HTTP"
      ],
      "tips": [
        "OO ajuda a modelar o domínio; a arquitetura web ajuda a distribuir esse domínio em camadas",
        "Herança não é sempre melhor que composição; cada caso deve ser avaliado",
        "Em web, o cliente não acessa diretamente o banco — ele acessa a API"
      ],
      "usefulLinks": [
        { "label": "MDN — Conceitos de POO", "url": "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object-oriented_programming", "type": "documentacao" },
        { "label": "Orientação a Objetos — Curso em Vídeo (Gustavo Guanabara)", "url": "https://www.youtube.com/watch?v=KlIL63MeyMY", "type": "video" }
      ]
    },
    {
      "title": "Servidor web e servidor de aplicações",
      "summary": "Diferenças entre componentes que servem requisições HTTP e executam lógica de negócio em aplicações web.",
      "detail": "Servidor web recebe requisições HTTP, entrega conteúdos estáticos (HTML, CSS, JS, imagens) e encaminha solicitações para outros componentes. Servidor de aplicações executa lógica de negócio, gerencia componentes, controla transações, segurança, conexões e recursos corporativos. Em Java, servidores de aplicações executam aplicações empresariais com suporte a especificações da plataforma. Em ambientes modernos, essas funções podem estar combinadas, mas conceitualmente continuam distintas.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferenças entre servidor web e de aplicações.",
      "examples": [
        {
          "question": "Qual a diferença entre servidor web e servidor de aplicações?",
          "answer": "Servidor web: entrega conteúdo estático e encaminha requisições (ex.: Apache, Nginx). Servidor de aplicações: executa lógica de negócio, transações, segurança (ex.: WildFly, Tomcat em modo full).",
          "application": "Nginx serve arquivos estáticos; WildFly executa EJBs e transações.",
          "code": "server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri $uri/ =404;\n  }\n}\n\n# WildFly/Payara executa a lógica de negócio",
          "language": "nginx"
        }
      ],
      "keyPoints": [
        "Servidor web: HTTP, conteúdo estático, encaminhamento",
        "Servidor de aplicações: lógica de negócio, transações, segurança",
        "Ambientes modernos podem combinar ambos",
        "Conceitualmente distintos, mesmo quando combinados",
        "Exemplos: Apache/Nginx (web); WildFly/Tomcat (aplicações)"
      ],
      "tips": [
        "Servidor web é \"entregador\"; servidor de aplicações é \"processador\"",
        "Tomcat pode atuar como ambos dependendo da configuração"
      ],
      "usefulLinks": [
        { "label": "MDN — Visão geral de servidores web", "url": "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_web_server", "type": "documentacao" },
        { "label": "Documentação Nginx", "url": "https://nginx.org/en/docs/", "type": "documentacao" },
        { "label": "Servidor Web vs Servidor de Aplicações — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=t9tXWBq7FV0", "type": "video" }
      ]
    },
    {
      "title": "Interoperabilidade, SOA e Web Services (SOAP/REST)",
      "slug": "interoperabilidade-soa-e-web-services-soap-rest",
      "aliases": [
        "Interoperabilidade, SOA e Web Services",
        "SOAP/REST",
        "Web Services"
      ],
      "summary": "Capacidade de sistemas trocarem informações, com arquitetura orientada a serviços e mecanismos como SOAP e REST.",
      "detail": "Interoperabilidade é capacidade de diferentes sistemas, plataformas e bancos de dados trocarem informações de forma organizada. Arquitetura orientada a serviços (SOA) organiza funcionalidades em serviços reutilizáveis, acessíveis por outros sistemas. Cada serviço tem contrato claro (entradas, saídas, regras, formatos) e baixo acoplamento. Elementos: Serviço (funcionalidade), Contrato (especificação), Consumidor (quem usa), Provedor (quem executa). Web services permitem comunicação entre sistemas via rede: SOAP (formal, contratos rígidos via WSDL) e REST (simples, aderente ao HTTP, muito usado em APIs modernas). Swagger/OpenAPI documenta APIs e facilita padronização, versionamento e integração entre sistemas heterogêneos.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferença entre SOAP e REST, elementos de SOA e papel do Swagger/OpenAPI.",
      "examples": [
        {
          "question": "Qual a diferença entre SOAP e REST?",
          "answer": "SOAP: protocolo formal, baseado em XML, contratos rígidos (WSDL), mais verboso. REST: estilo arquitetural, usa HTTP, formatos leves (JSON), mais simples e flexível.",
          "application": "APIs modernas de empresas como Google e Facebook usam REST; sistemas legados bancários frequentemente usam SOAP.",
          "code": "GET /api/clientes/42 HTTP/1.1\nHost: api.dataprev.gov.br\nAccept: application/json\n\n# SOAP usa contrato WSDL e envelope XML mais verboso",
          "language": "http"
        }
      ],
      "keyPoints": [
        "Interoperabilidade: troca de informações entre sistemas heterogêneos",
        "SOA: serviços reutilizáveis com contrato claro e baixo acoplamento",
        "Elementos: serviço, contrato, consumidor, provedor",
        "SOAP: formal, XML, WSDL, contratos rígidos",
        "REST: simples, HTTP, JSON, flexível",
        "Swagger/OpenAPI: documentação de APIs REST"
      ],
      "tips": [
        "REST não é protocolo, é estilo arquitetural",
        "SOAP é protocolo; REST é estilo — não confundir",
        "Swagger gera documentação interativa de APIs"
      ],
      "usefulLinks": [
        { "label": "W3C — Web Services Architecture", "url": "https://www.w3.org/TR/ws-arch/", "type": "documentacao" },
        { "label": "Swagger/OpenAPI Specification", "url": "https://swagger.io/specification/", "type": "documentacao" },
        { "label": "SOA e Web Services explicado — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=rNGNfkOhZ5E", "type": "video" },
        { "label": "SOAP vs REST — Código Fonte TV", "url": "https://www.youtube.com/watch?v=yXLBvUBMp8A", "type": "video" }
      ]
    },
    {
      "title": "APIs, Swagger e documentação",
      "summary": "Interfaces pelas quais sistemas expõem funcionalidades, com documentação padronizada via OpenAPI/Swagger.",
      "detail": "API (Application Programming Interface) é a interface pela qual um sistema expõe funcionalidades para outros sistemas. Uma API bem projetada define recursos, operações, formatos de dados, códigos de resposta, autenticação e regras de uso. REST é o estilo mais usado, com verbos HTTP (GET, POST, PUT, DELETE) e recursos identificados por URLs. Swagger, associado à especificação OpenAPI, auxilia na documentação de APIs, tornando clara a forma de consumo. Boas práticas: versionamento, autenticação (OAuth, JWT), rate limiting, logs e tratamento padronizado de erros.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram verbos HTTP, status codes, documentação e boas práticas.",
      "examples": [
        {
          "question": "Qual a função do Swagger?",
          "answer": "Documentar APIs REST de forma padronizada via especificação OpenAPI, permitindo que desenvolvedores compreendam e consumam os serviços.",
          "application": "Swagger UI gera página interativa onde é possível testar endpoints diretamente."
        }
      ],
      "keyPoints": [
        "API: interface de exposição de funcionalidades",
        "REST: verbos HTTP (GET, POST, PUT, DELETE) + recursos via URL",
        "Swagger/OpenAPI: documentação padronizada",
        "Boas práticas: versionamento, autenticação, rate limiting, logs",
        "Status codes: 2xx sucesso, 4xx erro do cliente, 5xx erro do servidor",
        "JSON é formato padrão para troca de dados em APIs REST"
      ],
      "tips": [
        "GET é idempotente; POST não é",
        "PUT substitui recurso; PATCH atualiza parcialmente",
        "Status code correto é parte do contrato da API"
      ],
      "usefulLinks": [
        { "label": "OpenAPI Initiative", "url": "https://www.openapis.org/", "type": "documentacao" },
        { "label": "Swagger Documentation", "url": "https://swagger.io/docs/", "type": "documentacao" },
        { "label": "API RESTful com Swagger — Michelli Brito", "url": "https://www.youtube.com/watch?v=az-g2L1E5-s", "type": "video" }
      ]
    },
    {
      "title": "Mensageria e integração assíncrona",
      "summary": "Troca de informações entre sistemas via mensagens intermediadas por broker, com filas e tópicos.",
      "detail": "Mensageria é forma de integração em que sistemas trocam informações por meio de mensagens, geralmente intermediadas por broker. Diferente da comunicação síncrona (solicitante aguarda resposta), na assíncrona a solicitação é registrada e processada posteriormente, reduzindo dependências diretas e melhorando resiliência. Componentes: Produtor (envia mensagem), Fila (armazena até processamento), Tópico (distribui para múltiplos interessados), Consumidor (recebe e processa), Broker (intermediário). Exemplos: RabbitMQ, Apache Kafka, ActiveMQ. Vantagens: escalabilidade, desacoplamento, continuidade operacional.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre comunicação síncrona vs. assíncrona e componentes de mensageria.",
      "examples": [
        {
          "question": "Qual a diferença entre fila e tópico?",
          "answer": "Fila: mensagem é processada por um único consumidor (point-to-point). Tópico: mensagem é distribuída para múltiplos consumidores interessados (publish/subscribe).",
          "application": "Fila para processar pedidos; tópico para notificar vários sistemas sobre novo cadastro."
        }
      ],
      "keyPoints": [
        "Mensageria: troca assíncrona via mensagens",
        "Componentes: produtor, fila, tópico, consumidor, broker",
        "Síncrona: aguarda resposta; assíncrona: processa depois",
        "Fila: point-to-point; tópico: publish/subscribe",
        "Vantagens: escalabilidade, desacoplamento, resiliência",
        "Exemplos: RabbitMQ, Kafka, ActiveMQ"
      ],
      "tips": [
        "Mensageria não elimina necessidade de tratamento de falhas",
        "Dead letter queue captura mensagens problemáticas",
        "Kafka é mais que mensageria: é streaming de eventos"
      ],
      "usefulLinks": [
        { "label": "Apache Kafka Documentation", "url": "https://kafka.apache.org/documentation/", "type": "documentacao" },
        { "label": "RabbitMQ Documentation", "url": "https://www.rabbitmq.com/documentation.html", "type": "documentacao" },
        { "label": "Kafka do zero ao essencial — Full Cycle", "url": "https://www.youtube.com/watch?v=o5yviW6QSn8", "type": "video" },
        { "label": "Mensageria com RabbitMQ — DevSuperior", "url": "https://www.youtube.com/watch?v=h3MoSnctMdE", "type": "video" }
      ]
    },
    {
      "title": "Arquitetura hexagonal e microsserviços",
      "summary": "Padrões arquiteturais modernos: hexagonal (ports and adapters) para isolamento de domínio; microsserviços para sistemas distribuídos.",
      "detail": "Arquitetura hexagonal (ports and adapters, de Alistair Cockburn) isola o domínio da aplicação de tecnologias externas. O núcleo (domínio) comunica-se com o mundo externo via portas (interfaces) e adaptadores (implementações). Facilita testes e troca de tecnologias. Microsserviços separam funcionalidades em serviços independentes, cada um com sua base de dados, deploy e equipe. Vantagens: escalabilidade, autonomia de times, deploy independente. Desafios: complexidade operacional, comunicação entre serviços, consistência de dados distribuídos, monitoramento. API Gateway é ponto único de entrada para clientes externos, lidando com roteamento, autenticação e rate limiting.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram conceitos de hexagonal, vantagens/desafios de microsserviços e papel do API Gateway.",
      "examples": [
        {
          "question": "O que é API Gateway?",
          "answer": "Ponto único de entrada para clientes externos de uma arquitetura de microsserviços, responsável por roteamento, autenticação, rate limiting e composição de respostas.",
          "application": "Cliente mobile chama API Gateway, que distribui requisições para vários microsserviços internos."
        }
      ],
      "keyPoints": [
        "Hexagonal: domínio isolado, portas e adaptadores",
        "Microsserviços: serviços independentes, cada um com sua base",
        "Vantagens: escalabilidade, autonomia, deploy independente",
        "Desafios: complexidade, comunicação, consistência distribuída",
        "API Gateway: ponto único de entrada, roteamento, autenticação",
        "Orquestração vs. coreografia: formas de coordenação entre serviços"
      ],
      "tips": [
        "Hexagonal facilita testes do domínio sem dependências externas",
        "Microsserviços não são bala de prata — avalie maturidade do time",
        "API Gateway centraliza preocupações transversais (auth, logging)"
      ],
      "usefulLinks": [
        { "label": "Martin Fowler — Microservices", "url": "https://martinfowler.com/articles/microservices.html", "type": "documentacao" },
        { "label": "Alistair Cockburn — Hexagonal Architecture", "url": "https://alistair.cockburn.us/hexagonal-architecture/", "type": "documentacao" },
        { "label": "Microsserviços na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=BYR81LAQlQ4", "type": "video" },
        { "label": "Arquitetura Hexagonal — DevSuperior", "url": "https://www.youtube.com/watch?v=MuRMCk5sqIg", "type": "video" }
      ]
    },
    {
      "title": "Containers e orquestração",
      "summary": "Empacotamento de aplicações com todas as dependências (containers) e gerenciamento em escala (Kubernetes).",
      "detail": "Containers são unidades leves de software que empacotam código e todas as dependências, garantindo execução consistente em qualquer ambiente. Docker é a plataforma mais conhecida. Vantagens: portabilidade, isolamento, eficiência (comparado a VMs), escalabilidade. Orquestração gerencia containers em escala: Kubernetes (K8s) é o padrão do mercado, lidando com deploy, scaling, networking, disponibilidade e auto-recuperação. Conceitos: Pod (menor unidade), Deployment (estado desejado), Service (exposição), Namespace (isolamento lógico).",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferença entre container e VM, Docker e Kubernetes.",
      "examples": [
        {
          "question": "Qual a diferença entre container e VM?",
          "answer": "Container: compartilha kernel do host, mais leve, inicia em segundos. VM: inclui sistema operacional completo, mais pesada, inicia em minutos.",
          "application": "Docker roda dezenas de containers no mesmo host; VMs exigiriam muito mais recursos.",
          "code": "FROM eclipse-temurin:21-jdk\nWORKDIR /app\nCOPY . .\nRUN ./mvnw package\nCMD [\"java\", \"-jar\", \"target/app.jar\"]",
          "language": "dockerfile"
        }
      ],
      "keyPoints": [
        "Container: empacota código + dependências, leve e portátil",
        "Docker: plataforma de containerização mais popular",
        "Kubernetes: orquestração de containers em escala",
        "Vantagens: portabilidade, isolamento, eficiência, escalabilidade",
        "Pod, Deployment, Service, Namespace: conceitos K8s",
        "Dockerfile define imagem; docker-compose orquestra localmente"
      ],
      "tips": [
        "Container ≠ VM: compartilham kernel vs. SO completo",
        "Kubernetes é complexo — só justifica em escala",
        "Imagem é template; container é instância em execução"
      ],
      "usefulLinks": [
        { "label": "Docker Documentation", "url": "https://docs.docker.com/", "type": "documentacao" },
        { "label": "Kubernetes Documentation", "url": "https://kubernetes.io/pt-br/docs/home/", "type": "documentacao" },
        { "label": "Docker para iniciantes — LinuxTips", "url": "https://www.youtube.com/watch?v=Wm99C_f7Kxw", "type": "video" },
        { "label": "Kubernetes do zero — Full Cycle", "url": "https://www.youtube.com/watch?v=Za8WFjO_8WQ", "type": "video" }
      ]
    },
    {
      "title": "Ambientes: Internet, Intranet, Extranet e Portais",
      "summary": "Ambientes digitais com finalidades e públicos distintos, usando tecnologias web similares.",
      "detail": "Internet: rede pública global, acessível por qualquer usuário. Intranet: ambiente privado interno, restrito a colaboradores. Extranet: amplia parte do ambiente interno para públicos externos autorizados (fornecedores, parceiros). Portal: ponto central que reúne, organiza e integra informações, sistemas e serviços em interface única. Pode existir em Internet, intranet ou extranet. Características físicas: equipamentos, servidores, enlaces. Características lógicas: endereçamento, autenticação, permissões, protocolos. Tipos de portais: institucional, corporativo, de serviços, de transparência, de atendimento.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferenças entre ambientes e tipos de portais.",
      "examples": [
        {
          "question": "Diferencie intranet e extranet.",
          "answer": "Intranet: ambiente interno, restrito a colaboradores. Extranet: ambiente que permite acesso controlado de usuários externos autorizados (fornecedores, parceiros).",
          "application": "Intranet com comunicados internos; extranet para fornecedores consultarem pedidos."
        }
      ],
      "keyPoints": [
        "Internet: pública, global",
        "Intranet: privada, interna",
        "Extranet: acesso controlado para externos autorizados",
        "Portal: ponto central que integra informações e serviços",
        "Tipos de portal: institucional, corporativo, serviços, transparência, atendimento",
        "Características físicas (infra) vs. lógicas (autenticação, permissões)"
      ],
      "tips": [
        "Tecnologias são similares; diferença está no público e controle de acesso",
        "Portal ≠ site simples: portal integra sistemas e serviços"
      ],
      "usefulLinks": [
        { "label": "W3C — Web Standards", "url": "https://www.w3.org/standards/", "type": "documentacao" },
        { "label": "Internet, Intranet e Extranet — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=5hEW8kC3qxI", "type": "video" }
      ]
    },
    {
      "title": "Padrões: XML, XSLT, UDDI, REST e JSON",
      "summary": "Convenções técnicas para representação, transformação e integração de dados entre sistemas.",
      "detail": "XML (eXtensible Markup Language): formato de dados estruturado, legível, com tags personalizáveis. XSLT (eXtensible Stylesheet Language Transformations): linguagem para transformar documentos XML em outros formatos. UDDI (Universal Description, Discovery and Integration): padrão antigo de registro e descoberta de web services (hoje pouco usado). REST: estilo arquitetural para APIs web, baseado em HTTP e recursos. JSON (JavaScript Object Notation): formato leve de troca de dados, baseado em pares chave-valor, amplamente usado em APIs REST por ser mais conciso que XML.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferenças entre XML e JSON, e finalidade de XSLT.",
      "examples": [
        {
          "question": "Qual a diferença entre XML e JSON?",
          "answer": "XML: verboso, usa tags, suporta atributos e namespaces. JSON: mais conciso, baseado em pares chave-valor, nativo em JavaScript, mais rápido de processar.",
          "application": "APIs modernas preferem JSON; SOAP usa XML."
        }
      ],
      "keyPoints": [
        "XML: formato estruturado com tags, verboso",
        "XSLT: transforma documentos XML",
        "UDDI: registro de web services (legado)",
        "REST: estilo arquitetural para APIs",
        "JSON: formato leve, pares chave-valor, padrão em APIs REST",
        "XML suporta schemas (XSD); JSON usa JSON Schema"
      ],
      "tips": [
        "JSON não substitui XML — são formatos para contextos diferentes",
        "UDDI é praticamente obsoleto — não cai muito",
        "REST + JSON = combinação dominante em APIs modernas"
      ],
      "usefulLinks": [
        { "label": "MDN — XML", "url": "https://developer.mozilla.org/pt-BR/docs/Web/XML", "type": "documentacao" },
        { "label": "MDN — JSON", "url": "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/JSON", "type": "documentacao" },
        { "label": "XML e JSON — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=TPi5cQIeRts", "type": "video" }
      ]
    },
    {
      "title": "Frontend: HTML, CSS, UX, VueJS, Angular, React",
      "summary": "Tecnologias e práticas de construção de interfaces web modernas, com foco em experiência do usuário.",
      "detail": "HTML estrutura conteúdo; CSS define apresentação; JavaScript adiciona interatividade. UX (User Experience) envolve usabilidade, acessibilidade e satisfação do usuário. Frameworks modernos: VueJS (progressivo, fácil aprendizado), Angular (completo, baseado em TypeScript, do Google), React (biblioteca do Facebook, baseada em componentes e Virtual DOM). Padrões de frontend: SPA (Single Page Application, atualiza página sem reload) e PWA (Progressive Web App, funcionalidades de app nativo em web). Conceitos: responsividade, acessibilidade (WCAG), performance, SEO.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferenças entre frameworks, SPA vs. PWA e conceitos de UX.",
      "examples": [
        {
          "question": "Qual a diferença entre SPA e PWA?",
          "answer": "SPA: aplicação web que atualiza página sem reload, usando JavaScript. PWA: aplicação web com funcionalidades de app nativo (offline, push notifications, instalação).",
          "application": "Todo PWA pode ser SPA, mas nem todo SPA é PWA.",
          "code": "<button onclick=\"history.pushState({}, '', '/dashboard')\">Dashboard</button>\n<script>\n  window.addEventListener('popstate', () => renderPage(location.pathname));\n</script>",
          "language": "html"
        }
      ],
      "keyPoints": [
        "HTML: estrutura; CSS: apresentação; JS: interatividade",
        "UX: usabilidade, acessibilidade, satisfação",
        "VueJS: progressivo, fácil aprendizado",
        "Angular: completo, TypeScript, do Google",
        "React: biblioteca, componentes, Virtual DOM, do Facebook",
        "SPA: sem reload; PWA: funcionalidades nativas em web",
        "Acessibilidade: WCAG, ARIA, navegação por teclado"
      ],
      "tips": [
        "React é biblioteca; Angular é framework",
        "PWA requer service worker e manifest.json",
        "Acessibilidade não é opcional — é requisito legal em muitos casos"
      ],
      "usefulLinks": [
        { "label": "MDN Web Docs", "url": "https://developer.mozilla.org/pt-BR/", "type": "documentacao" },
        { "label": "Angular Documentation", "url": "https://angular.dev/", "type": "documentacao" },
        { "label": "React Documentation", "url": "https://react.dev/", "type": "documentacao" },
        { "label": "HTML e CSS para iniciantes — Curso em Vídeo", "url": "https://www.youtube.com/watch?v=Ejkb_YpuHWs", "type": "video" },
        { "label": "React do zero — Filipe Deschamps", "url": "https://www.youtube.com/watch?v=aJR7f45dBNs", "type": "video" }
      ]
    },
    {
      "title": "SPA, PWA e acessibilidade",
      "slug": "spa-pwa-e-acessibilidade",
      "aliases": [
        "Single Page Applications",
        "Progressive Web Apps",
        "Acessibilidade web"
      ],
      "summary": "Aplicações web modernas que entregam experiência de usuário fluida, com navegação dinâmica, instalação como app e acessibilidade inclusiva.",
      "detail": "SPA (Single Page Application) é uma aplicação web que carrega uma única página e atualiza conteúdo dinamicamente, sem recarregar a tela inteira. Isso melhora a percepção de fluidez e reduz transtornos de navegação. PWA (Progressive Web App) vai além: é uma aplicação web que pode oferecer recursos de app nativo, como instalação no dispositivo, funcionamento offline, cache de recursos e notificações. A acessibilidade garante que pessoas com diferentes limitações consigam usar a aplicação. Princípios importantes: semântica HTML correta, navegação por teclado, contraste adequado, textos alternativos, uso de ARIA com cuidado e compatibilidade com leitores de tela. Em arquitetura web, esses conceitos impactam UX, usabilidade, performance e inclusão.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferenças entre SPA e PWA, conceitos de acessibilidade e boas práticas de interface.",
      "examples": [
        {
          "question": "Qual a diferença entre SPA e PWA?",
          "answer": "SPA é uma abordagem de arquitetura frontend que evita reload completo da página. PWA é uma extensão dessa abordagem para oferecer características de aplicativos nativos, como offline e instalação.",
          "application": "Um portal corporativo pode ser SPA e, se tiver service worker e manifest, também ser PWA.",
          "code": "if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/sw.js');\n}",
          "language": "javascript"
        },
        {
          "question": "Quais boas práticas de acessibilidade são essenciais em uma SPA?",
          "answer": "Usar HTML semântico, garantir foco visível e gerenciado, permitir navegação por teclado, fornecer rótulos em campos e manter conteúdo acessível a leitores de tela.",
          "application": "Em um formulário de cadastro, cada campo deve ter rótulo associado e a navegação deve respeitar ordem lógica." 
        }
      ],
      "keyPoints": [
        "SPA: navegação dinâmica sem recarregar a página inteira",
        "PWA: web app com características de app nativo",
        "Service worker: cache e funcionamento offline",
        "Manifest: instalação e aparência do app",
        "Acessibilidade: WCAG, teclado, semântica, contraste e leitores de tela",
        "UX e usabilidade melhoram com navegação simples e previsível"
      ],
      "tips": [
        "SPA não é sinônimo de PWA",
        "PWA depende de service worker e manifest",
        "Acessibilidade é requisito de inclusão e também de qualidade de software",
        "Em prova, relacione SPA/PWA com frontend, UX e experiência do usuário"
      ],
      "errosComuns": [
        "Confundir SPA com PWA",
        "Pensar que acessibilidade é só cor e contraste",
        "Ignorar o papel da navegação por teclado e foco"
      ],
      "usefulLinks": [
        { "label": "MDN — Progressive web apps", "url": "https://developer.mozilla.org/pt-BR/docs/Web/Progressive_web_apps", "type": "documentacao" },
        { "label": "WCAG 2.1 (W3C)", "url": "https://www.w3.org/TR/WCAG21/", "type": "documentacao" },
        { "label": "PWA do zero — Filipe Deschamps", "url": "https://www.youtube.com/watch?v=B4hWcswz4oo", "type": "video" },
        { "label": "Acessibilidade Web na prática — Código Fonte TV", "url": "https://www.youtube.com/watch?v=ixoNjTkzAug", "type": "video" }
      ]
    },
    {
      "title": "Protocolos HTTPS, SSL/TLS",
      "summary": "Protocolos de comunicação segura na web, com criptografia e autenticação.",
      "detail": "HTTP é protocolo de comunicação web não seguro. HTTPS é HTTP sobre SSL/TLS, adicionando criptografia e autenticação. SSL (Secure Sockets Layer) foi substituído por TLS (Transport Layer Security), mais seguro. Funcionamento: handshake TLS estabelece chave simétrica via criptografia assimétrica; depois, comunicação é criptografada simetricamente. Certificados digitais (emitidos por CAs) autenticam o servidor. TLS 1.2 e 1.3 são versões atuais; SSL 3.0 e TLS 1.0/1.1 são obsoletos e inseguros.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferença entre HTTP e HTTPS, handshake TLS e certificados.",
      "examples": [
        {
          "question": "Qual a diferença entre SSL e TLS?",
          "answer": "SSL foi o protocolo original; TLS é sua evolução, mais segura. SSL está obsoleto; TLS 1.2 e 1.3 são as versões atuais recomendadas.",
          "application": "Navegadores modernos rejeitam TLS 1.0/1.1 por inseguros."
        }
      ],
      "keyPoints": [
        "HTTP: não seguro; HTTPS: HTTP + SSL/TLS",
        "SSL foi substituído por TLS",
        "Handshake: criptografia assimétrica para trocar chave simétrica",
        "Certificados digitais autenticam servidor (emitidos por CAs)",
        "TLS 1.2 e 1.3 são seguros; versões anteriores obsoletas",
        "HSTS força uso de HTTPS"
      ],
      "tips": [
        "HTTPS não é só \"cadeado\" — envolve certificado, handshake e criptografia",
        "TLS 1.3 é mais rápido e seguro que 1.2",
        "Certificado autofirmado não é adequado para produção"
      ],
      "usefulLinks": [
        { "label": "MDN — HTTPS", "url": "https://developer.mozilla.org/pt-BR/docs/Glossary/HTTPS", "type": "documentacao" },
        { "label": "RFC 8446 — TLS 1.3", "url": "https://www.rfc-editor.org/rfc/rfc8446", "type": "documentacao" },
        { "label": "HTTPS e TLS explicados — Código Fonte TV", "url": "https://www.youtube.com/watch?v=cuR05y_2Gxc", "type": "video" }
      ]
    },
    {
      "title": "Blockchain",
      "summary": "Tecnologia de registro distribuído, imutável e descentralizado, com aplicações além das criptomoedas.",
      "detail": "Blockchain é livro-razão distribuído (DLT) que registra transações em blocos encadeados e criptografados. Características: descentralização (sem autoridade central), imutabilidade (dados não podem ser alterados), transparência (participantes validam), consenso (mecanismos como PoW, PoS). Aplicações: criptomoedas (Bitcoin, Ethereum), contratos inteligentes (smart contracts), rastreabilidade de cadeias, identidade digital, registros públicos. Limitações: escalabilidade, consumo energético (PoW), complexidade regulatória.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões conceituais sobre características e aplicações.",
      "examples": [
        {
          "question": "O que é um smart contract?",
          "answer": "Contrato autoexecutável cujo código é armazenado na blockchain, executando automaticamente quando condições pré-definidas são atendidas.",
          "application": "Ethereum é plataforma famosa para smart contracts."
        }
      ],
      "keyPoints": [
        "Blockchain: registro distribuído, imutável, descentralizado",
        "Conceitos: blocos, hash, consenso (PoW, PoS)",
        "Aplicações: criptomoedas, smart contracts, rastreabilidade",
        "Limitações: escalabilidade, energia (PoW), regulação",
        "DLT (Distributed Ledger Technology) é conceito mais amplo",
        "Blockchain pública vs. privada: permissão de acesso"
      ],
      "tips": [
        "Blockchain não é só Bitcoin — tem aplicações corporativas",
        "Smart contracts não são \"contratos legais\" — são código",
        "Imutabilidade é vantagem e limitação (erros permanecem)"
      ],
      "usefulLinks": [
        { "label": "Ethereum.org — O que é blockchain?", "url": "https://ethereum.org/pt-br/what-is-ethereum/", "type": "documentacao" },
        { "label": "Blockchain explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=HBFwOmGQAao", "type": "video" }
      ]
    },
    {
      "title": "UX, acessibilidade e usabilidade",
      "summary": "Princípios de design centrado no usuário, com foco em experiências inclusivas e eficientes.",
      "detail": "UX (User Experience) abrange todas as interações do usuário com produto/serviço, buscando satisfação e eficiência. Usabilidade é parte da UX: facilidade de uso, aprendizado, eficiência, memorização, prevenção de erros. Acessibilidade garante que pessoas com deficiências possam usar o produto (WCAG: Perceptível, Operável, Compreensível, Robusto — POUR). Arquitetura de informação organiza conteúdo de forma lógica. Design de interação planeja como usuários interagem com interfaces. Portais corporativos exigem atenção especial a esses conceitos.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre WCAG, princípios de usabilidade e arquitetura de informação.",
      "examples": [
        {
          "question": "Quais os princípios WCAG (POUR)?",
          "answer": "Perceptível (informações apresentáveis de formas múltiplas), Operável (interface navegável por teclado), Compreensível (conteúdo legível e previsível), Robusto (compatível com tecnologias assistivas).",
          "application": "Um site acessível tem alternativas em texto para imagens e navegação por teclado."
        }
      ],
      "keyPoints": [
        "UX: experiência completa do usuário",
        "Usabilidade: facilidade, eficiência, prevenção de erros",
        "Acessibilidade: WCAG com princípios POUR",
        "Arquitetura de informação: organização lógica de conteúdo",
        "Design de interação: planeja como usuários interagem",
        "Workflow: fluxo de trabalho em sistemas corporativos"
      ],
      "tips": [
        "Acessibilidade é requisito legal (LBI no Brasil)",
        "Testes de usabilidade com usuários reais são essenciais",
        "POUR é mnemônico útil para WCAG"
      ],
      "usefulLinks": [
        { "label": "MDN — Progressive web apps", "url": "https://developer.mozilla.org/pt-BR/docs/Web/Progressive_web_apps", "type": "documentacao" },
        { "label": "WCAG 2.1 (W3C)", "url": "https://www.w3.org/TR/WCAG21/", "type": "documentacao" },
        { "label": "PWA do zero — Filipe Deschamps", "url": "https://www.youtube.com/watch?v=B4hWcswz4oo", "type": "video" },
        { "label": "Acessibilidade Web na prática — Código Fonte TV", "url": "https://www.youtube.com/watch?v=ixoNjTkzAug", "type": "video" }
      ]
    }
  ],
  "banco-dados": [
    {
      "title": "Modelagem de dados: conceitual, lógica e física",
      "summary": "Três níveis de abstração para projetar bancos de dados, do negócio à implementação.",
      "detail": "Modelagem de dados cria estrutura eletrônica para armazenar informações. Três níveis: Conceitual (visão do negócio, independente de SGBD, usa MER/DER com entidades, relacionamentos e atributos); Lógico (traduz MER para modelo relacional, define tabelas, chaves PK/FK, normalização, ainda independente de SGBD); Físico (implementação específica no SGBD, com tipos de dados, índices, armazenamento, desempenho). Cada nível atende a diferentes stakeholders: conceitual para negócio, lógico para analistas, físico para DBAs.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferenças entre os três níveis e elementos do MER.",
      "examples": [
        {
          "question": "Qual a diferença entre modelo conceitual e lógico?",
          "answer": "Conceitual: visão de negócio, usa MER/DER, independente de SGBD. Lógico: traduz para tabelas, chaves e normalização, ainda independente de SGBD específico.",
          "application": "Conceitual mostra \"Cliente compra Produto\"; lógico define tabelas CLIENTE, PRODUTO, COMPRA com PKs e FKs."
        }
      ],
      "keyPoints": [
        "Conceitual: MER/DER, entidades, relacionamentos, atributos",
        "Lógico: tabelas, PKs, FKs, normalização",
        "Físico: SGBD específico, tipos, índices, desempenho",
        "MER: Modelo Entidade-Relacionamento",
        "DER: Diagrama Entidade-Relacionamento (representação visual)",
        "Cada nível atende a stakeholders diferentes"
      ],
      "tips": [
        "Conceitual é para negócio; lógico para analistas; físico para DBAs",
        "Não pule etapas — cada nível depende do anterior",
        "MER usa retângulos (entidades), losangos (relacionamentos), balões (atributos)"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Conceitos de BD", "url": "https://www.postgresql.org/docs/current/tutorial-concepts.html", "type": "documentacao" },
        { "label": "Modelagem de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Zp0i5n4YJvg", "type": "video" }
      ]
    },
    {
      "title": "MER, DER, entidades, relacionamentos e cardinalidade",
      "summary": "Elementos do Modelo Entidade-Relacionamento para representar o negócio graficamente.",
      "detail": "MER é modelo conceitual de alto nível com elementos: Instância (ocorrência de entidade), Entidade (coisa identificável — retângulo), Atributo (característica — balão), Relacionamento (associação entre entidades — losango), Cardinalidade (quantas vezes uma entidade se relaciona com outra). Cardinalidade mínima (0 ou 1) e máxima (1 ou N). Relacionamentos: 1:1, 1:N (mais comum), N:N (transforma-se em tabela associativa no modelo lógico). Condicionalidade indica se existência de instância depende de outra.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram leitura de DER, cardinalidades e transformação de N:N.",
      "examples": [
        {
          "question": "Como se lê cardinalidade (0,N) em relação a TITULAR?",
          "answer": "Uma ocorrência de TITULAR pode não ter nenhum DEPENDENTE ou ter vários. Já DEPENDENTE (1,1) tem obrigatoriamente um TITULAR responsável.",
          "application": "Um pai pode não ter filhos cadastrados, mas todo filho tem um pai."
        },
        {
          "question": "O que acontece com relacionamento N:N no modelo lógico?",
          "answer": "Transforma-se em tabela associativa, contendo as chaves primárias das entidades envolvidas.",
          "application": "Aluno N:N Disciplina vira tabela MATRÍCULA com FK de Aluno e FK de Disciplina."
        }
      ],
      "keyPoints": [
        "Entidade: retângulo, coisa identificável",
        "Relacionamento: losango, associação entre entidades",
        "Atributo: balão, característica",
        "Cardinalidade mínima: 0 (opcional) ou 1 (obrigatório)",
        "Cardinalidade máxima: 1 (um) ou N (muitos)",
        "1:1, 1:N, N:N (vira tabela associativa)",
        "Leitura: cardinalidade do lado oposto à entidade"
      ],
      "tips": [
        "Leia cardinalidade do lado oposto à entidade em análise",
        "N:N sempre vira tabela no modelo lógico",
        "Entidade fraca depende de outra para existir"
      ],
      "usefulLinks": [
        { "label": "Bóson Treinamentos — MER e DER", "url": "https://www.bosontreinamentos.com.br/bancos-de-dados/curso-de-modelagem-de-dados/", "type": "documentacao" },
        { "label": "MER e DER na prática — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Q_KTYFgvu1s", "type": "video" }
      ]
    },
    {
      "title": "Modelo relacional: chaves, integridade e ACID",
      "summary": "Estrutura de tabelas com chaves primárias/estrangeiras e propriedades de transações confiáveis.",
      "detail": "Modelo relacional organiza dados em tabelas (relações) com linhas (tuplas) e colunas (atributos). Chaves: Primária (PK, identifica registro unicamente, mínima), Estrangeira (FK, referencia PK de outra tabela, garante integridade referencial), Alternativa/Candidata (garante unicidade sem ser PK). Integridade referencial: FK garante que referências existem. Propriedades ACID de transações: Atomicidade (tudo ou nada), Consistência (estado válido para válido), Isolamento (transações concorrentes não interferem), Durabilidade (efeitos permanentes após commit).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram tipos de chaves, integridade referencial e propriedades ACID.",
      "examples": [
        {
          "question": "O que é integridade referencial?",
          "answer": "Garantia de que uma FK sempre referencia uma PK existente, impedindo referências a registros inexistentes.",
          "application": "Não é possível inserir pedido com ID_CLIENTE inexistente na tabela CLIENTE."
        },
        {
          "question": "Explique as propriedades ACID.",
          "answer": "Atomicidade: transação executa por completo ou não executa. Consistência: leva BD de estado válido para válido. Isolamento: transações concorrentes não interferem. Durabilidade: após commit, efeitos são permanentes.",
          "application": "Transferência bancária: se falhar no meio, todo o processo é desfeito (atomicidade)."
        }
      ],
      "keyPoints": [
        "PK: identifica registro unicamente, deve ser mínima",
        "FK: referencia PK de outra tabela, garante integridade referencial",
        "Chave alternativa: garante unicidade sem ser PK (ex.: CPF)",
        "ACID: Atomicidade, Consistência, Isolamento, Durabilidade",
        "Tupla = linha = registro; Coluna = campo = atributo",
        "Restrições (constraints): NOT NULL, UNIQUE, CHECK, DEFAULT"
      ],
      "tips": [
        "PK composta = várias colunas; ainda é uma única regra de PK",
        "Chave mínima = colunas necessárias para unicidade",
        "ACID é para transações; não confundir com propriedades de tabelas"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — ACID e transações", "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html", "type": "documentacao" },
        { "label": "ACID explicado — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=pomxJOFVcQs", "type": "video" }
      ]
    },
    {
      "title": "Normalização: 1FN, 2FN e 3FN",
      "summary": "Processo de organização de dados para reduzir redundâncias e inconsistências.",
      "detail": "Normalização organiza dados em banco relacional para reduzir redundâncias e evitar anomalias. Formas normais: 1FN (sem grupos repetitivos, cada campo com valor atômico, com PK); 2FN (está em 1FN + todos atributos não-chave dependem totalmente da PK — sem dependência parcial, relevante em PKs compostas); 3FN (está em 2FN + sem dependência transitiva — atributo não-chave não depende de outro atributo não-chave). Normalização melhora integridade e manutenção, mas pode exigir mais JOINs.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram identificação de violações e aplicação das formas normais.",
      "examples": [
        {
          "question": "Como identificar violação de 3FN?",
          "answer": "Quando um atributo não-chave depende de outro atributo não-chave (dependência transitiva), em vez de depender apenas da PK.",
          "application": "Tabela PEDIDO(CodPedido, CodCliente, CidadeCliente): CidadeCliente depende de CodCliente, não diretamente de CodPedido."
        }
      ],
      "keyPoints": [
        "1FN: sem grupos repetitivos, valores atômicos, com PK",
        "2FN: 1FN + sem dependência parcial da PK (relevante em PK composta)",
        "3FN: 2FN + sem dependência transitiva",
        "Normalização reduz redundância e anomalias",
        "Pode exigir mais JOINs em consultas",
        "Desnormalização controlada é válida em ambientes analíticos"
      ],
      "tips": [
        "1FN: um valor por célula",
        "2FN: depende TODA a PK, não só parte dela",
        "3FN: depende da PK, de toda PK, e de mais nada (além da PK)"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Modelagem relacional", "url": "https://www.postgresql.org/docs/current/tutorial-sql.html", "type": "documentacao" },
        { "label": "Normalização de banco de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=1HqLxhGBmLE", "type": "video" }
      ]
    },
    {
      "title": "SQL: DDL, DML, DQL, DCL e DTL",
      "summary": "Subconjuntos da linguagem SQL para definição, manipulação, consulta, controle e transação de dados.",
      "detail": "SQL (Structured Query Language) é linguagem declarativa padrão para bancos relacionais, dividida em subconjuntos: DQL (Data Query Language — SELECT, consulta); DML (Data Manipulation Language — INSERT, UPDATE, DELETE, manipulação); DDL (Data Definition Language — CREATE, ALTER, DROP, definição de estruturas); DCL (Data Control Language — GRANT, REVOKE, controle de acesso); DTL/TCL (Data/Transaction Control Language — BEGIN, COMMIT, ROLLBACK, controle de transações). SQL é declarativa: especifica o resultado, não o caminho.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferenciação entre subconjuntos e comandos.",
      "examples": [
        {
          "question": "Em qual subconjunto se encaixa o ALTER TABLE?",
          "answer": "DDL (Data Definition Language), pois altera a estrutura da tabela, não os dados.",
          "application": "CREATE, ALTER, DROP são DDL; INSERT, UPDATE, DELETE são DML.",
          "code": "ALTER TABLE cliente\n  ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';\n\nSELECT * FROM cliente WHERE status = 'ativo';",
          "language": "sql"
        }
      ],
      "keyPoints": [
        "DQL: SELECT (consulta)",
        "DML: INSERT, UPDATE, DELETE (manipulação)",
        "DDL: CREATE, ALTER, DROP (definição)",
        "DCL: GRANT, REVOKE (controle de acesso)",
        "DTL/TCL: BEGIN, COMMIT, ROLLBACK (transações)",
        "SQL é declarativa: especifica resultado, não caminho"
      ],
      "tips": [
        "TRUNCATE é DDL, não DML (reinicia tabela)",
        "COMMIT confirma; ROLLBACK desfaz transação",
        "SELECT não modifica dados — por isso é DQL, não DML"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL Documentation — SQL", "url": "https://www.postgresql.org/docs/current/sql.html", "type": "documentacao" },
        { "label": "W3Schools SQL Tutorial", "url": "https://www.w3schools.com/sql/", "type": "documentacao" },
        { "label": "SQL completo — Curso em Vídeo", "url": "https://www.youtube.com/watch?v=Ofktsne-utM", "type": "video" }
      ]
    },
    {
      "title": "SGBD, metadados e backup",
      "summary": "Sistemas gerenciadores de banco de dados, informações sobre dados e estratégias de cópia de segurança.",
      "detail": "SGBD (Sistema Gerenciador de Banco de Dados) é coleção de programas que permite definir, construir e manipular bancos de dados. Exemplos: Oracle, SQL Server, PostgreSQL, MySQL, MongoDB. Metadados são dados sobre dados: nome de tabelas, colunas, tipos, chaves, restrições, origem. Importantes para documentação, organização e integração. Backup cria cópia de segurança; restauração recupera dados. Tipos: Completo (full, copia tudo); Incremental (só alterados desde último backup de qualquer tipo); Diferencial (alterados desde último completo). Boas práticas: backups regulares, testar restauração, proteger arquivos com criptografia.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre tipos de backup e conceito de metadados.",
      "examples": [
        {
          "question": "Qual a diferença entre backup incremental e diferencial?",
          "answer": "Incremental: salva alterados desde o último backup (qualquer tipo). Diferencial: salva alterados desde o último backup COMPLETO.",
          "application": "Incremental é mais rápido mas restauração mais lenta; diferencial é o inverso."
        }
      ],
      "keyPoints": [
        "SGBD: software que gerencia BDs (Oracle, PostgreSQL, MySQL, etc.)",
        "Metadados: dados sobre dados (estrutura, origem, significado)",
        "Backup completo: copia tudo",
        "Backup incremental: desde último backup (qualquer tipo)",
        "Backup diferencial: desde último completo",
        "Boas práticas: regularidade, testes de restauração, criptografia"
      ],
      "tips": [
        "Incremental: backup rápido, restauração lenta",
        "Diferencial: backup mais lento, restauração rápida",
        "Backup sem teste de restauração = não confiável"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Backup e Restore", "url": "https://www.postgresql.org/docs/current/backup.html", "type": "documentacao" },
        { "label": "Tipos de backup de banco de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=A_pQimn0Lx8", "type": "video" }
      ]
    },
    {
      "title": "Abordagem multidimensional e modelagem dimensional",
      "summary": "Organização de dados para análise gerencial, com fatos, dimensões e esquemas estrela/floco de neve.",
      "detail": "Abordagem multidimensional organiza dados para consultas gerenciais, analisando medidas por diferentes perspectivas (dimensões). Modelagem dimensional é técnica voltada para análise, priorizando facilidade de consulta e desempenho. Estrutura: tabela fato (eventos mensuráveis com medidas numéricas) + tabelas dimensão (contexto: tempo, produto, local). Esquema estrela: fato no centro, dimensões ao redor (simples, performático). Esquema floco de neve: dimensões normalizadas em tabelas adicionais (menos redundância, mais complexo). Granularidade é nível de detalhe da tabela fato. Hierarquias dimensionais permitem navegar entre níveis (ano → trimestre → mês → dia).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferença entre relacional e dimensional, esquemas e granularidade.",
      "examples": [
        {
          "question": "Qual a diferença entre esquema estrela e floco de neve?",
          "answer": "Estrela: fato no centro, dimensões não normalizadas ao redor (simples, performático). Floco de neve: dimensões normalizadas em tabelas adicionais (menos redundância, mais JOINs).",
          "application": "Estrela é preferido quando simplicidade e desempenho são prioridades."
        }
      ],
      "keyPoints": [
        "Modelagem dimensional: para análise, não transacional",
        "Tabela fato: eventos mensuráveis, medidas numéricas",
        "Dimensões: contexto (tempo, produto, local)",
        "Esquema estrela: simples, performático",
        "Esquema floco de neve: normalizado, mais complexo",
        "Granularidade: nível de detalhe da tabela fato",
        "Hierarquias: navegação entre níveis (ano → trimestre → mês → dia)"
      ],
      "tips": [
        "Dimensional aceita redundância; relacional normaliza",
        "Granularidade mal definida limita análises possíveis",
        "Dimensão tempo é quase sempre essencial"
      ],
      "usefulLinks": [
        { "label": "Kimball Group — Data Warehouse", "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/", "type": "documentacao" },
        { "label": "Modelagem dimensional — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=h1fQRRWvFYY", "type": "video" }
      ]
    },
    {
      "title": "NoSQL: documentos, chave-valor, colunas e grafos",
      "summary": "Bancos não-relacionais para cenários com grande volume, alta velocidade ou estruturas flexíveis.",
      "detail": "NoSQL (\"Not Only SQL\") são bancos para necessidades não bem resolvidas pelo modelo relacional: grande volume, alta velocidade, estruturas variáveis, distribuição. Características: flexibilidade de esquema, escalabilidade horizontal, consistência eventual (em alguns). Modelos: Documentos (JSON-like, documentos semiestruturados — MongoDB); Chave-valor (pares simples, muito rápido — Redis); Colunas (famílias de colunas, grandes volumes — Cassandra); Grafos (nós e relacionamentos, redes sociais — Neo4j). Escolha depende do padrão de dados e acesso.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre tipos de NoSQL e quando usar cada modelo.",
      "examples": [
        {
          "question": "Quando usar banco de grafos?",
          "answer": "Quando as relações entre dados são tão importantes quanto os próprios dados: redes sociais, recomendações, detecção de fraudes, mapas de relacionamento.",
          "application": "Neo4j é usado para analisar conexões entre pessoas em investigações."
        }
      ],
      "keyPoints": [
        "NoSQL: \"Not Only SQL\", alternativa ao relacional",
        "Documentos: MongoDB, JSON-like, estrutura flexível",
        "Chave-valor: Redis, muito rápido, cache e sessões",
        "Colunas: Cassandra, grandes volumes, big data",
        "Grafos: Neo4j, redes e relacionamentos complexos",
        "Características: flexibilidade de esquema, escalabilidade horizontal",
        "Consistência eventual em alguns modelos"
      ],
      "tips": [
        "NoSQL não substitui relacional — são complementares",
        "Escolha o modelo pelo padrão de acesso, não pela moda",
        "Consistência eventual não é defeito — é trade-off"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL Documentation — SQL", "url": "https://www.postgresql.org/docs/current/sql.html", "type": "documentacao" },
        { "label": "W3Schools SQL Tutorial", "url": "https://www.w3schools.com/sql/", "type": "documentacao" },
        { "label": "SQL completo — Curso em Vídeo", "url": "https://www.youtube.com/watch?v=Ofktsne-utM", "type": "video" }
      ]
    },
    {
      "title": "Data Lakes e soluções para Big Data",
      "slug": "data-lakes-e-solucoes-para-big-data",
      "aliases": [
        "Data Lakes",
        "Big Data",
        "Data Lake"
      ],
      "summary": "Repositórios para grandes volumes de dados brutos e soluções para processamento em escala.",
      "detail": "Data Lake é repositório que armazena grandes volumes de dados em seu formato nativo (estruturados, semiestruturados, não estruturados). Diferente de Data Warehouse (estruturado e otimizado para análise), Data Lake aceita dados brutos, sendo processados quando necessário. Conceitos de Big Data: 5Vs (Volume, Velocidade, Variedade, Veracidade, Valor). Tecnologias: Hadoop (HDFS, MapReduce), Spark (processamento em memória), soluções em nuvem (AWS S3, Azure Data Lake, Google BigQuery). Data Lake é base para Data Science, Machine Learning, análise de logs e integração de múltiplas fontes de dados.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferença entre Data Lake e Data Warehouse, e conceitos de Big Data.",
      "examples": [
        {
          "question": "Qual a diferença entre Data Lake e Data Warehouse?",
          "answer": "Data Lake: armazena dados brutos em formato nativo, processamento sob demanda. Data Warehouse: dados estruturados, otimizados para análise, processados antes do armazenamento.",
          "application": "Data Lake guarda logs, imagens e textos; DW guarda dados de vendas já tratados."
        }
      ],
      "keyPoints": [
        "Data Lake: dados brutos em formato nativo",
        "Data Warehouse: dados estruturados e otimizados",
        "Big Data: 5Vs (Volume, Velocidade, Variedade, Veracidade, Valor)",
        "Tecnologias: Hadoop, Spark, soluções em nuvem",
        "Data Lake é base para Data Science e ML",
        "Schema-on-read (Lake) vs. schema-on-write (DW)"
      ],
      "tips": [
        "Data Lake não é \"bagunça\" — precisa de governança",
        "Data Swamp = Data Lake sem governança (evitar!)",
        "Spark é mais rápido que Hadoop por processar em memória"
      ],
      "usefulLinks": [
        { "label": "Apache Spark Documentation", "url": "https://spark.apache.org/docs/latest/", "type": "documentacao" },
        { "label": "Databricks — Data Lake vs DW", "url": "https://www.databricks.com/br/glossary/data-lakehouse", "type": "documentacao" },
        { "label": "Big Data e Data Lake — Código Fonte TV", "url": "https://www.youtube.com/watch?v=W2-g7TjbByw", "type": "video" }
      ]
    },
    {
      "title": "Bancos de dados em memória",
      "slug": "bancos-de-dados-em-memoria",
      "aliases": [
        "In-memory databases",
        "Memória principal"
      ],
      "summary": "Sistemas que mantêm grande parte dos dados em memória principal para reduzir latência e aumentar desempenho.",
      "detail": "Bancos de dados em memória armazenam parte ou a totalidade dos dados na memória principal (RAM), em vez de depender prioritariamente de discos. Isso reduz latência e melhora muito o desempenho para workloads de alta velocidade, como caching, processamento de eventos e análise em tempo real. Exemplos clássicos: Redis, Memcached, Apache Ignite, TimesTen. São muito usados em aplicações que exigem resposta imediata, sessões temporárias, filas de eventos e processamento de transações rápidas. O trade-off é que a memória é mais cara e volátil do que disco, então estratégias de persistência e recuperação são fundamentais.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre desempenho, latência e uso de bancos em memória para cenários de alta velocidade.",
      "examples": [
        {
          "question": "Por que bancos em memória oferecem melhor desempenho?",
          "answer": "Porque acessam dados diretamente da RAM, que é muito mais rápida do que discos ou SSDs, reduzindo latência nas operações.",
          "application": "Sistemas de cache e sessões de usuários frequentemente usam Redis para responder em milissegundos."
        }
      ],
      "keyPoints": [
        "RAM é mais rápida que disco",
        "Reduz latência e melhora throughput",
        "Muito usados para cache e processamento em tempo real",
        "Exemplos: Redis, Memcached, Apache Ignite",
        "Requer estratégia de persistência e recuperação"
      ],
      "tips": [
        "Memória não substitui persistência — é uma camada de performance",
        "Bancos em memória são ideais para dados voláteis e de alta frequência",
        "Em provas, relacione com velocidade, cache e baixa latência"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "Tabelas fato, dimensões e esquemas (estrela/floco de neve)",
      "slug": "tabelas-fato-dimensoes-e-esquemas-estrela-floco-de-neve",
      "aliases": [
        "Tabelas fato",
        "Esquema estrela",
        "Esquema floco de neve"
      ],
      "summary": "Estruturas da modelagem dimensional usadas para organização de dados analíticos e consultas agregadas.",
      "detail": "Na modelagem dimensional, a tabela fato registra eventos mensuráveis, como vendas, ocorrências, transações e indicadores. As tabelas dimensão descrevem o contexto desses eventos: tempo, produto, cliente, local, canal. Esse modelo facilita consultas analíticas, agregações e drill-down. O esquema estrela organiza a tabela fato no centro e as dimensões ao redor; é mais simples e geralmente mais rápido para consulta. O esquema floco de neve normaliza algumas dimensões em tabelas adicionais, reduzindo redundância, mas aumentando a complexidade de joins. Em provas, é importante saber que esse modelo é voltado para OLAP e análise, não para processamento transacional do dia a dia.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre modelagem dimensional, tabela fato, dimensões e diferença entre esquema estrela e floco de neve.",
      "examples": [
        {
          "question": "Qual a diferença entre tabela fato e tabela dimensão?",
          "answer": "Tabela fato armazena medidas e eventos; tabela dimensão descreve atributos contextuais do evento.",
          "application": "Uma venda é um fato, enquanto produto, cliente e data são dimensões."
        }
      ],
      "keyPoints": [
        "Tabela fato: eventos e medidas numéricas",
        "Tabela dimensão: contexto e atributos descritivos",
        "Esquema estrela: simples, performático",
        "Esquema floco de neve: normalizado, mais JOINs",
        "Modelo voltado para análise e relatórios gerenciais"
      ],
      "tips": [
        "Fato responde 'quanto?'; dimensão responde 'quem/onde/quando/como?'",
        "Star schema costuma ser preferido para performance analítica",
        "Snowflake é melhor quando se busca menor redundância"
      ],
      "usefulLinks": [
        { "label": "Kimball Group — Data Warehouse", "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/", "type": "documentacao" },
        { "label": "Modelagem dimensional — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=h1fQRRWvFYY", "type": "video" }
      ]
    },
    {
      "title": "ETL/ELT e técnicas de ingestão",
      "summary": "Processos de extração, transformação e carregamento de dados entre sistemas.",
      "detail": "ETL (Extract, Transform, Load): extrai dados de fontes, transforma (limpeza, padronização, cálculos) e carrega no destino (geralmente DW). ELT (Extract, Load, Transform): extrai, carrega direto no destino e transforma lá (aproveita poder de processamento de Data Lakes/cloud). Técnicas de ingestão: extração de sistemas (consultas, exportações), importação de arquivos (CSV, JSON, XML), coleta por formulários, integração entre bases. Periodicidade: batch (lotes programados) ou streaming (tempo real/quase real). Validação é essencial em qualquer abordagem.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferença entre ETL e ELT e técnicas de ingestão.",
      "examples": [
        {
          "question": "Qual a diferença entre ETL e ELT?",
          "answer": "ETL: transforma antes de carregar (tradicional, para DW). ELT: carrega antes de transformar (moderno, para Data Lakes/cloud, aproveita poder do destino).",
          "application": "ELT é mais usado em nuvem, onde o destino tem alto poder de processamento."
        }
      ],
      "keyPoints": [
        "ETL: extrai → transforma → carrega",
        "ELT: extrai → carrega → transforma",
        "Técnicas: extração de sistemas, arquivos, formulários, integração",
        "Batch (lotes) vs. streaming (tempo real)",
        "Validação é essencial em qualquer abordagem",
        "Staging area: área temporária de preparação"
      ],
      "tips": [
        "ELT não substitui ETL — depende do contexto",
        "Staging area protege sistemas operacionais de carga excessiva",
        "Incremental vs. full: escolha conforme volume e necessidade"
      ],
      "usefulLinks": [
        { "label": "AWS — O que é ETL", "url": "https://aws.amazon.com/pt/what-is/etl/", "type": "documentacao" },
        { "label": "ETL vs ELT — Código Fonte TV", "url": "https://www.youtube.com/watch?v=lLXF9pKXQ1g", "type": "video" }
      ]
    },
    {
      "title": "Dados estruturados, semiestruturados e não estruturados",
      "summary": "Classificação de dados conforme rigidez de estrutura, com impactos em armazenamento e processamento.",
      "detail": "Dados estruturados: organização rígida e previamente planejada (ex.: tabelas de BD relacional com campos e tipos definidos). Semiestruturados: possuem estrutura, mas flexível (ex.: JSON, XML — têm tags/chaves, mas podem variar). Não estruturados: sem estrutura rígida (ex.: textos, imagens, vídeos, áudios, posts de redes sociais). Mais de 80% do conteúdo digital é não estruturado. Cada tipo exige tecnologias diferentes: estruturados → BD relacionais; semiestruturados → NoSQL documentais; não estruturados → Data Lakes, object storage.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre classificação e exemplos de cada tipo.",
      "examples": [
        {
          "question": "JSON é dado estruturado ou semiestruturado?",
          "answer": "Semiestruturado: possui estrutura (pares chave-valor), mas é flexível — documentos podem ter campos diferentes.",
          "application": "Dois registros JSON de usuários podem ter campos distintos, ao contrário de tabelas SQL."
        }
      ],
      "keyPoints": [
        "Estruturados: rigidez, esquema definido (tabelas SQL)",
        "Semiestruturados: estrutura flexível (JSON, XML)",
        "Não estruturados: sem esquema (textos, imagens, vídeos)",
        "80%+ do conteúdo digital é não estruturado",
        "Cada tipo exige tecnologias diferentes",
        "Metadados descrevem outros dados"
      ],
      "tips": [
        "Estruturado = schema-on-write; Semiestruturado = schema-on-read",
        "Não estruturado não significa \"sem organização\" — apenas sem esquema rígido",
        "Metadados são essenciais para dar sentido a dados não estruturados"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    }
  ],
  "businessintelligence": [
    {
      "title": "Conceitos de BI, DSS e Gestão de Conteúdo",
      "summary": "Fundamentos de Inteligência de Negócios, Sistemas de Suporte à Decisão e gestão de documentos corporativos.",
      "detail": "BI (Business Intelligence) é conjunto de processos, tecnologias e ferramentas que transformam dados brutos em informações significativas para decisões estratégicas. Objetivos: análise de processos, aumento de eficiência, previsão de tendências, apoio à decisão, monitoramento de KPIs, identificação de oportunidades e riscos. DSS (Decision Support System) são softwares que auxiliam gestores a resolver problemas e identificar alternativas, combinando dados, modelos analíticos e interface interativa. Diferença: BI foca em coleta/análise/visualização; DSS foca em apoio direto à decisão via modelos e simulações. Gestão de Conteúdo: práticas para criar, organizar, armazenar e recuperar informações. Tipos: CMS (sites), ECM (conteúdos corporativos), GED (documentos eletrônicos).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferença entre BI e DSS, conceitos fundamentais e tipos de gestão de conteúdo.",
      "examples": [
        {
          "question": "Qual a diferença entre BI e DSS?",
          "answer": "BI concentra-se em coleta, organização, análise e visualização de dados históricos e atuais. DSS é mais voltado ao apoio direto à decisão, com modelos, simulações e comparação de cenários.",
          "application": "BI mostra que vendas caíram; DSS simula impactos de diferentes estratégias para reverter a queda."
        }
      ],
      "keyPoints": [
        "BI: transforma dados em informações para decisões",
        "DSS: apoia decisão com modelos e simulações",
        "Dados → Informação → Conhecimento (hierarquia)",
        "Componentes BI: ETL, Data Warehouse, ferramentas de análise, Data Mining",
        "CMS: sites; ECM: corporativo; GED: documentos eletrônicos",
        "KPIs e dashboards são saídas típicas de BI"
      ],
      "tips": [
        "BI não substitui gestor — fornece informações para decisão",
        "DSS não substitui DSS — apoia, não decide",
        "GED é parte da gestão de conteúdo, não de BI"
      ],
      "usefulLinks": [
        { "label": "Microsoft Learn — Power BI", "url": "https://learn.microsoft.com/pt-br/power-bi/", "type": "documentacao" },
        { "label": "Power BI para iniciantes — Hashtag Programação", "url": "https://www.youtube.com/watch?v=EhOTOuVGHXI", "type": "video" }
      ]
    },
    {
      "title": "Arquitetura de BI e componentes (ETL, DW, Data Mart)",
      "slug": "arquitetura-de-bi-e-componentes-etl-dw-data-mart",
      "aliases": [
        "Arquitetura de BI e componentes",
        "ETL, DW, Data Mart",
        "Componentes de BI"
      ],
      "summary": "Estrutura que organiza o fluxo de dados desde as fontes até a apresentação para usuários.",
      "detail": "Arquitetura de BI descreve como dados percorrem o sistema até virarem informação útil. Começa nas fontes (sistemas internos, planilhas, APIs, ERP, CRM), passa por staging area (preparação), Data Warehouse (armazenamento estruturado) e chega à camada de apresentação (relatórios, dashboards). Componentes centrais: ETL/ELT (integração e transformação), Data Warehouse (base central para análise), Data Mart (subconjunto específico para áreas como vendas, RH ou finanças), metadados (descrição do contexto dos dados) e governança. A arquitetura define não só onde os dados ficam, mas também como eles são confiáveis, acessíveis e usados na tomada de decisão.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram componentes e função de cada camada, além do papel de ETL, DW e Data Mart.",
      "examples": [
        {
          "question": "O que é Data Mart?",
          "answer": "Subconjunto do Data Warehouse voltado para área específica da empresa, como vendas, finanças ou marketing.",
          "application": "Data Mart de RH contém apenas dados relacionados a colaboradores, recrutamento e folha."
        }
      ],
      "keyPoints": [
        "Fontes de dados: sistemas, planilhas, APIs, ERP, CRM",
        "Staging Area: temporária, valida e prepara",
        "Data Warehouse: central, estruturado, otimizado",
        "Data Mart: subconjunto para área específica",
        "Metadados: descrevem origem, formato e significado",
        "Camada de apresentação: relatórios, dashboards",
        "Governança: políticas, qualidade, segurança"
      ],
      "tips": [
        "Staging protege fontes operacionais",
        "Data Mart não substitui DW — é complemento",
        "Metadados são essenciais para rastreabilidade"
      ],
      "usefulLinks": [
        { "label": "Microsoft Learn — Power BI", "url": "https://learn.microsoft.com/pt-br/power-bi/", "type": "documentacao" },
        { "label": "Power BI para iniciantes — Hashtag Programação", "url": "https://www.youtube.com/watch?v=EhOTOuVGHXI", "type": "video" }
      ]
    },
    {
      "title": "Data Warehouse: camadas, Star Schema e Snowflake",
      "summary": "Armazenamento estruturado de dados históricos para análise, com esquemas dimensionais.",
      "detail": "Data Warehouse (DW) é sistema que armazena dados históricos de forma otimizada para consulta e análise, diferente de BD operacional (focado em transações). Quatro camadas: Fonte de Dados (sistemas operacionais), Staging (preparação, ainda não limpo), Data Warehouse (estruturado, Star ou Snowflake Schema), Apresentação (acesso de usuários, cubos OLAP). Star Schema: tabela fato no centro, dimensões ao redor (simples, performático). Snowflake: dimensões normalizadas em tabelas adicionais (menos redundância, mais complexo). Esquemas dimensionais facilitam consultas analíticas.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram camadas, esquemas e diferença entre DW e BD operacional.",
      "examples": [
        {
          "question": "Qual a diferença entre Data Warehouse e banco operacional?",
          "answer": "DW: armazena dados históricos otimizados para consulta e análise. Operacional: focado em transações em tempo real, atualizações frequentes.",
          "application": "DW responde \"quanto vendemos no último ano?\"; operacional registra cada venda no momento em que acontece."
        }
      ],
      "keyPoints": [
        "DW: dados históricos, otimizado para análise",
        "4 camadas: fonte, staging, DW, apresentação",
        "Star Schema: fato no centro, dimensões ao redor",
        "Snowflake: dimensões normalizadas",
        "DW ≠ BD operacional (OLAP vs. OLTP)",
        "Suporta consultas complexas e agregações"
      ],
      "tips": [
        "OLAP (análise) vs. OLTP (transação): propósitos diferentes",
        "Star Schema é preferido quando desempenho é prioridade",
        "DW consolida dados de múltiplas fontes"
      ],
      "usefulLinks": [
        { "label": "Kimball Group — Data Warehouse", "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/", "type": "documentacao" },
        { "label": "Modelagem dimensional — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=h1fQRRWvFYY", "type": "video" }
      ]
    },
    {
      "title": "ETL: extração, transformação e carregamento",
      "summary": "Processo de integração de dados de fontes heterogêneas para análise no Data Warehouse.",
      "detail": "ETL garante integração de dados de fontes heterogêneas e preparação para análise. Três fases: Extração (Extract): coleta de dados de sistemas, arquivos CSV, logs — total (todos dados) ou incremental (só novos/alterados). Transformação (Transform): limpeza (remoção de duplicados, correção de erros), conversão de tipos, aplicação de regras de negócio, enriquecimento (combinação de fontes). Carregamento (Load): dados transformados são carregados no DW — incremental (só alterados) ou em batches periódicos. ETL é componente central de soluções de BI.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram as três fases e tipos de extração/carregamento.",
      "examples": [
        {
          "question": "O que é extração incremental?",
          "answer": "Extração apenas dos dados novos ou alterados desde a última extração, em vez de todos os dados.",
          "application": "Reduz tempo e recursos em bases muito grandes, onde extração full seria inviável diariamente."
        }
      ],
      "keyPoints": [
        "Extração: total ou incremental",
        "Transformação: limpeza, conversão, regras de negócio, enriquecimento",
        "Carregamento: incremental ou em batches",
        "ETL é componente central de BI",
        "Staging area é usada durante o processo",
        "Validação é essencial em todas as fases"
      ],
      "tips": [
        "Incremental exige controle de alterações (CDC — Change Data Capture)",
        "Transformação é a fase mais complexa e demorada",
        "ETL não é só técnico — envolve regras de negócio"
      ],
      "usefulLinks": [
        { "label": "AWS — O que é ETL", "url": "https://aws.amazon.com/pt/what-is/etl/", "type": "documentacao" },
        { "label": "ETL vs ELT — Código Fonte TV", "url": "https://www.youtube.com/watch?v=lLXF9pKXQ1g", "type": "video" }
      ]
    },
    {
      "title": "OLAP: cubos, operações (slice, dice, drill, pivot)",
      "summary": "Tecnologias de análise multidimensional interativa de grandes volumes de dados.",
      "detail": "OLAP (Online Analytical Processing) permite análise interativa e rápida de grandes volumes. Diferente de OLTP (transacional em tempo real), OLAP é para consultas analíticas complexas. Características: consultas multidimensionais (por tempo, geografia, produto), cubo OLAP (estrutura com medidas e dimensões). Operações: Slice (fatia — seleciona uma dimensão), Dice (subcubo — filtro específico), Drill-down/Drill-up (navega entre níveis de detalhe), Pivot (rotaciona perspectiva de visualização). Tipos: MOLAP (cubos multidimensionais), ROLAP (sobre BD relacional), HOLAP (híbrido).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram operações OLAP e tipos (MOLAP, ROLAP, HOLAP).",
      "examples": [
        {
          "question": "O que é drill-down em OLAP?",
          "answer": "Navegar para níveis mais detalhados de dados. Ex.: de vendas por ano para vendas por trimestre, depois por mês.",
          "application": "Usuário vê total anual e clica para detalhar por mês, identificando sazonalidade."
        }
      ],
      "keyPoints": [
        "OLAP: análise multidimensional interativa",
        "Cubo: medidas (valores) + dimensões (contexto)",
        "Slice: fatia de uma dimensão",
        "Dice: subcubo com filtro específico",
        "Drill-down/up: navega entre níveis de detalhe",
        "Pivot: rotaciona perspectiva",
        "MOLAP: cubos; ROLAP: relacional; HOLAP: híbrido"
      ],
      "tips": [
        "OLAP ≠ OLTP: análise vs. transação",
        "Drill-down aprofunda; drill-up agrega",
        "MOLAP é mais rápido; ROLAP é mais escalável"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Data Mining: classificação, associação, agrupamento",
      "summary": "Técnicas de descoberta de padrões ocultos em grandes volumes de dados.",
      "detail": "Data Mining (mineração de dados) explora e analisa grandes volumes para descobrir padrões, tendências, relações e comportamentos não facilmente percebidos em análises tradicionais. Usa técnicas estatísticas, matemáticas e computacionais. Principais técnicas: Classificação (separa dados por perfil — ex.: clientes por risco); Associação (identifica relações entre itens — ex.: produtos comprados juntos); Agrupamento/Clusterização (reúne dados semelhantes — ex.: segmentos de clientes); Regressão (prevê valores numéricos); Detecção de anomalias (identifica outliers). Aplicações: marketing, vendas, finanças, saúde, segurança, detecção de fraudes.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre técnicas e aplicações de Data Mining.",
      "examples": [
        {
          "question": "Qual a diferença entre classificação e agrupamento?",
          "answer": "Classificação: separa dados em categorias pré-definidas (aprendizado supervisionado). Agrupamento: reúne dados semelhantes sem categorias prévias (aprendizado não supervisionado).",
          "application": "Classificação: definir se cliente é inadimplente ou não. Agrupamento: descobrir segmentos naturais de clientes."
        }
      ],
      "keyPoints": [
        "Data Mining: descoberta de padrões ocultos",
        "Classificação: categorias pré-definidas (supervisionado)",
        "Associação: relações entre itens",
        "Agrupamento: dados semelhantes sem categorias prévias (não supervisionado)",
        "Regressão: prevê valores numéricos",
        "Detecção de anomalias: identifica outliers",
        "Complementa DW, ETL e OLAP"
      ],
      "tips": [
        "Classificação exige treinamento prévio; agrupamento não",
        "Associação é famosa por \"quem compra X também compra Y\"",
        "Data Mining não é mágica — depende de dados de qualidade"
      ],
      "usefulLinks": [
        { "label": "Auth0 — Guia de OAuth 2.0", "url": "https://auth0.com/intro-to-iam/what-is-oauth-2", "type": "documentacao" },
        { "label": "jwt.io — JSON Web Tokens", "url": "https://jwt.io/introduction", "type": "documentacao" },
        { "label": "OAuth 2.0 e JWT — Código Fonte TV", "url": "https://www.youtube.com/watch?v=68azMcqPpyo", "type": "video" }
      ]
    },
    {
      "title": "Visualização de dados e painéis (dashboards)",
      "summary": "Representação visual de informações para facilitar compreensão e apoio à decisão.",
      "detail": "Visualização de dados é representação por elementos visuais (gráficos, tabelas, mapas, painéis) para facilitar identificação de padrões, tendências e pontos de atenção. Função: transformar dados em informação interpretável. Tipos: colunas/barras (comparar categorias), linhas (evolução temporal), setores (participação proporcional), tabelas (detalhe numérico), painéis (visão integrada). Cuidados: escalas distorcidas, ausência de legenda, falta de unidade de medida podem induzir a erros. Dashboards reúnem visualizações consolidadas, com gráficos de linha/barras, mapas de calor e tabelas dinâmicas. Benefícios: centralização, análise em tempo real, facilidade de uso. Ferramentas: Power BI, Tableau, Qlik Sense, Google Data Studio.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram tipos de visualização, cuidados e ferramentas.",
      "examples": [
        {
          "question": "Quando usar gráfico de linhas vs. colunas?",
          "answer": "Linhas: evolução ao longo do tempo. Colunas: comparação entre categorias.",
          "application": "Linhas para mostrar vendas mensais do ano; colunas para comparar vendas por região."
        }
      ],
      "keyPoints": [
        "Visualização transforma dados em informação interpretável",
        "Colunas/barras: comparar categorias",
        "Linhas: evolução temporal",
        "Setores: participação proporcional (poucas categorias)",
        "Cuidados: escalas, legendas, unidade de medida",
        "Dashboards: visão consolidada e interativa",
        "Ferramentas: Power BI, Tableau, Qlik Sense, Google Data Studio"
      ],
      "tips": [
        "Menos é mais: evite poluição visual",
        "Escolha o gráfico pela pergunta de análise, não pela estética",
        "Power BI integra bem com Microsoft; Tableau com visualizações complexas"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Ferramentas: Power BI, Tableau, Qlik Sense, Google Data Studio",
      "slug": "ferramentas-power-bi-tableau-qlik-sense-google-data-studio",
      "aliases": [
        "Ferramentas de BI",
        "Power BI",
        "Tableau",
        "Qlik Sense",
        "Google Data Studio"
      ],
      "summary": "Principais plataformas do mercado para criação de painéis e análises de dados.",
      "detail": "Power BI (Microsoft): integração com Office, variedade de visualizações, IA e machine learning, interface amigável. Ideal para empresas Microsoft. Tableau: visualizações avançadas, análise exploratória, integração com diversos bancos, dashboards dinâmicos. Ideal para análises visuais complexas. Qlik Sense: motor associativo, análises exploratórias, automação de insights. Ideal para integrar fontes diversas. Google Data Studio (Looker Studio): gratuita, integração com Google Analytics/Sheets. Ideal para pequenas empresas e marketing digital. Critérios de escolha: usabilidade, custo, integração, escalabilidade, governança e segurança.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre características e diferenciais de cada ferramenta e quando escolher cada uma.",
      "examples": [
        {
          "question": "Qual o diferencial do Qlik Sense?",
          "answer": "Motor associativo que permite análises exploratórias e criação de painéis interativos, com automação de insights.",
          "application": "Usuário clica em um valor e o Qlik mostra automaticamente relações com outros dados."
        }
      ],
      "keyPoints": [
        "Power BI: Microsoft, integração Office, IA/ML",
        "Tableau: visualizações avançadas, análise exploratória",
        "Qlik Sense: motor associativo, automação de insights",
        "Google Data Studio: gratuita, ecossistema Google",
        "Critérios: usabilidade, custo, integração, escalabilidade",
        "Escolha depende do contexto e necessidades da empresa"
      ],
      "tips": [
        "Power BI domina mercado corporativo Microsoft",
        "Tableau é referência em visualizações complexas",
        "Google Data Studio é boa opção gratuita"
      ],
      "usefulLinks": [
        { "label": "Microsoft Learn — Power BI", "url": "https://learn.microsoft.com/pt-br/power-bi/", "type": "documentacao" },
        { "label": "Power BI para iniciantes — Hashtag Programação", "url": "https://www.youtube.com/watch?v=EhOTOuVGHXI", "type": "video" }
      ]
    },
    {
      "title": "Mapeamento de fontes e técnicas de coleta",
      "summary": "Identificação de origens de dados e métodos para extração e preparação para análise.",
      "detail": "Mapeamento de fontes identifica onde dados estão, responsáveis, formatos, frequência de atualização e formas de coleta. Essencial antes de criar visualizações. Elementos a levantar: origem, formato, periodicidade, responsável, campos disponíveis, regras de preenchimento, restrições, forma de acesso. Técnicas de coleta: extração de sistemas (consultas, exportações, integrações); importação de arquivos (CSV, XML, JSON, planilhas); coleta por formulários e registros operacionais; integração entre bases. Periodicidade: diária, semanal, mensal, sob demanda, tempo quase real. Toda coleta deve incluir validação mínima. Preparação: padronização, tratamento de inconsistências, seleção de indicadores.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre importância do mapeamento e técnicas de coleta.",
      "examples": [
        {
          "question": "Por que o mapeamento de fontes é fundamental?",
          "answer": "Evita uso de dados incompletos, incorretos ou incompatíveis, garantindo que visualizações e relatórios sejam confiáveis.",
          "application": "Sem mapeamento, um painel pode mostrar dados desatualizados de uma fonte quando outra mais atualizada existe."
        }
      ],
      "keyPoints": [
        "Mapeamento: origem, formato, periodicidade, responsável, campos",
        "Técnicas: extração de sistemas, arquivos, formulários, integração",
        "Periodicidade: batch ou tempo real",
        "Validação é essencial em toda coleta",
        "Preparação: padronização, tratamento, seleção de indicadores",
        "Qualidade da análise depende da qualidade das fontes"
      ],
      "tips": [
        "Mapeamento não é burocracia — é garantia de confiabilidade",
        "Documente fontes e responsáveis",
        "Validação evita \"lixo entra, lixo sai\""
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Cubos: medidas, dimensões e hierarquias",
      "summary": "Estrutura de organização de dados para análise multidimensional por diferentes perspectivas.",
      "detail": "Cubo de dados organiza informações para análise multidimensional, permitindo observar medidas por diferentes dimensões. Medidas: valores numéricos analisáveis (quantidade, valor, custo, tempo). Dimensões: contexto da análise (tempo, produto, local, cliente). Exemplo: valor vendido (medida) analisado por produto, vendedor, região e período (dimensões). Hierarquias dimensionais organizam atributos em níveis de detalhe (ano → trimestre → mês → dia; país → estado → município). Vantagem: análise flexível, navegando entre visões gerais e detalhadas. Uso em relatórios gerenciais, dashboards e ferramentas analíticas.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferença entre medidas e dimensões e exemplos de hierarquias.",
      "examples": [
        {
          "question": "Em análise de vendas, o que é medida e o que é dimensão?",
          "answer": "Medida: valor vendido (numérico, analisável). Dimensões: produto, vendedor, região, período (contexto da análise).",
          "application": "Usuário pergunta \"quanto vendemos?\" (medida) \"por região?\" (dimensão)."
        }
      ],
      "keyPoints": [
        "Medidas: valores numéricos (quantidade, valor, custo)",
        "Dimensões: contexto (tempo, produto, local, cliente)",
        "Hierarquias: níveis de detalhe (ano → trimestre → mês → dia)",
        "Cubo permite análise flexível por diferentes perspectivas",
        "Uso em relatórios gerenciais e dashboards",
        "Facilita consultas, agregações e cruzamentos"
      ],
      "tips": [
        "Medida responde \"quanto?\"; dimensão responde \"por quê/onde/quando?\"",
        "Hierarquias permitem drill-down e drill-up",
        "Cubo não substitui DW — é forma de organização para análise"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    }
  ],
  "engenharia-software": [
    {
      "title": "Ciclo de vida de software e boas práticas",
      "summary": "Organização das fases de desenvolvimento — da identificação da necessidade à manutenção — com foco em qualidade, previsibilidade e sustentabilidade.",
      "detail": "O ciclo de vida de software organiza as etapas pelas quais um sistema passa: levantamento de requisitos, análise, projeto, implementação, testes, implantação e manutenção. Mesmo em métodos ágeis, essas etapas existem de forma incremental e repetitiva. Um erro em requisitos compromete todo o desenvolvimento; falhas em testes geram problemas em produção; manutenção mal conduzida degrada a qualidade ao longo do tempo. Boas práticas incluem: clareza no código, segurança desde o início, testes sistemáticos, documentação objetiva e alinhamento com processos organizacionais.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões conceituais sobre fases do ciclo, importância de cada etapa e boas práticas institucionais.",
      "examples": [
        {
          "question": "Qual a diferença entre projeto e operação contínua?",
          "answer": "Projeto é esforço temporário para criar algo único (ex.: desenvolver nova versão de sistema). Operação é repetitiva e permanente (ex.: manter sistema funcionando, atender chamados).",
          "application": "Implantar nova central de atendimento é projeto; operar a central existente é operação."
        }
      ],
      "keyPoints": [
        "Fases: requisitos → análise → projeto → implementação → testes → implantação → manutenção",
        "Projeto ≠ operação: temporário e único vs. repetitivo e permanente",
        "Boas práticas: clareza, segurança, testes, documentação, alinhamento institucional",
        "Arquitetura em camadas: apresentação, aplicação, negócio, persistência, integração"
      ],
      "tips": [
        "Decore a sequência das fases e o impacto de erros em cada uma",
        "Relacione boas práticas com redução de débito técnico",
        "Entenda que métodos ágeis não eliminam fases, apenas as tornam incrementais"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Java, JavaEE, JakartaEE, JPA e Hibernate",
      "summary": "Ecossistema Java para aplicações corporativas, com foco em persistência, ORM e padronização de componentes.",
      "detail": "Java é linguagem-base amplamente usada em sistemas corporativos pela portabilidade, estabilidade e aderência à POO. A partir da versão 6, consolidou-se como plataforma madura. JavaEE (evoluído para JakartaEE) reúne especificações para aplicações corporativas: componentes web, acesso a dados, segurança, transações, serviços e integração. JPA (versão 2+) é especificação para persistência, mapeando classes Java para tabelas. Hibernate é implementação ORM de JPA, fazendo a ponte entre modelo orientado a objetos e relacional. JSF cria interfaces web baseadas em componentes; PrimeFaces complementa com componentes visuais prontos; JUnit é usado para testes automatizados.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Temas prioritários para DATAPREV. Questões cobram diferenciação entre JavaEE/JakartaEE, papel do JPA vs. Hibernate, e função de JSF/PrimeFaces/JUnit.",
      "examples": [
        {
          "question": "Qual a diferença entre JPA e Hibernate?",
          "answer": "JPA é especificação (padrão) para persistência de objetos em banco. Hibernate é uma das implementações mais conhecidas dessa especificação, funcionando como ferramenta ORM.",
          "application": "Assim como JDBC é especificação e MySQL Connector é implementação."
        },
        {
          "question": "Qual o papel do JakartaEE?",
          "answer": "Reunir especificações voltadas ao desenvolvimento de aplicações corporativas, padronizando componentes web, acesso a dados, segurança, transações e integração.",
          "application": "Em vez de cada aplicação implementar tudo manualmente, JakartaEE fornece padrões para sistemas robustos e escaláveis."
        }
      ],
      "keyPoints": [
        "Java: linguagem-base para construção da aplicação",
        "JavaEE/JakartaEE: plataforma de especificações corporativas",
        "JPA: padrão para persistência de objetos em banco de dados",
        "Hibernate: implementação ORM usada com JPA",
        "JSF: framework para interfaces web baseadas em componentes",
        "PrimeFaces: componentes visuais prontos para JSF",
        "JUnit: testes automatizados, reduzindo risco de regressão",
        "POO: encapsulamento, herança, polimorfismo e abstração"
      ],
      "tips": [
        "Decore a tabela de tecnologias e suas funções",
        "Diferencie especificação (JPA) de implementação (Hibernate)",
        "JakartaEE é a evolução do JavaEE — nomes diferentes, mesma essência",
        "JSF + PrimeFaces = interface corporativa tradicional Java"
      ],
      "usefulLinks": [
        { "label": "Oracle Java Documentation", "url": "https://docs.oracle.com/en/java/", "type": "documentacao" },
        { "label": "Java para iniciantes — Curso em Vídeo", "url": "https://www.youtube.com/watch?v=sTX0UEplF54", "type": "video" }
      ]
    },
    {
      "title": "Spring Framework, Spring Boot e Spring Cloud",
      "summary": "Ecossistema Spring para desenvolvimento Java moderno: organização de componentes, APIs simplificadas e microsserviços distribuídos.",
      "detail": "Spring Framework facilita criação de aplicações Java corporativas com inversão de controle via injeção de dependência, reduzindo acoplamento. Spring Boot simplifica a criação com configuração automática, estrutura inicial padronizada e servidor embutido — muito usado para APIs REST, serviços web e soluções escaláveis. Spring Cloud reúne recursos para sistemas distribuídos e microsserviços: diferentes serviços separados por responsabilidade (cadastro, autenticação, pagamento, etc.). Essa abordagem exige controle rigoroso: configuração centralizada, comunicação confiável, tratamento de falhas, monitoramento, versionamento de APIs e segurança padronizada.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência em provas DATAPREV. Questões cobram diferenciação entre Spring/Spring Boot/Spring Cloud, conceitos de IoC/DI e cuidados com microsserviços.",
      "examples": [
        {
          "question": "Qual a diferença entre Spring Framework e Spring Boot?",
          "answer": "Spring Framework é a base para organização de componentes Java (IoC, DI). Spring Boot simplifica a criação de aplicações Spring com configuração automática, estrutura padronizada e servidor embutido.",
          "application": "Spring Boot é ideal para iniciar rapidamente APIs e microsserviços sem configuração manual extensa.",
          "code": "@SpringBootApplication\npublic class ApiApplication {\n  public static void main(String[] args) {\n    SpringApplication.run(ApiApplication.class, args);\n  }\n}\n\n@RestController\nclass ClienteController {\n  @GetMapping(\"/clientes\")\n  List<String> listar() { return List.of(\"Ana\", \"Bruno\"); }\n}",
          "language": "java"
        },
        {
          "question": "Quais cuidados são indispensáveis em microsserviços com Spring Cloud?",
          "answer": "Definir responsabilidade clara de cada serviço, evitar dependências excessivas, monitorar logs/métricas/falhas, padronizar autenticação/autorização/versionamento e avaliar maturidade técnica da organização.",
          "application": "Antes de adotar microsserviços, verifique se a equipe tem capacidade de operar sistemas distribuídos.",
          "code": "spring:\n  cloud:\n    gateway:\n      routes:\n        - id: clientes\n          uri: lb://clientes-service\n          predicates:\n            - Path=/clientes/**",
          "language": "yaml"
        }
      ],
      "keyPoints": [
        "Spring Framework: IoC e injeção de dependência",
        "Spring Boot: configuração automática, servidor embutido, APIs rápidas",
        "Spring Cloud: sistemas distribuídos e microsserviços",
        "JavaScript: interatividade e comunicação front-end via APIs REST/JSON",
        "Microsserviços exigem: configuração centralizada, monitoramento, versionamento",
        "API REST + JSON = comunicação padrão entre front-end e back-end"
      ],
      "tips": [
        "Spring Boot ≠ substitui Spring, ele o simplifica",
        "Spring Cloud só faz sentido com maturidade técnica",
        "Injeção de dependência reduz acoplamento e facilita testes",
        "Nem todo problema exige microsserviços — avalie o contexto"
      ],
      "usefulLinks": [
        { "label": "Spring Boot Documentation", "url": "https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/", "type": "documentacao" },
        { "label": "Spring Boot completo — Michelli Brito", "url": "https://www.youtube.com/watch?v=LXRU-Z36GEU", "type": "video" }
      ]
    },
    {
      "title": "JavaScript e integração front-end/back-end",
      "slug": "javascript-e-integracao-front-end-back-end",
      "aliases": [
        "JavaScript",
        "Integração de front-end e back-end",
        "APIs REST e JSON",
        "Comunicação cliente-servidor"
      ],
      "summary": "Uso de JavaScript no frontend e integração com serviços backend por APIs, eventos, requisições assíncronas e troca de dados.",
      "detail": "JavaScript é a linguagem principal para tornar interfaces web dinâmicas e interativas. No frontend, ele manipula o DOM, gerencia estado, valida entradas, controla eventos e consome serviços. Na arquitetura web, a integração com o backend ocorre por meio de requisições HTTP, normalmente utilizando APIs REST com JSON. Conceitos centrais: assincronicidade (callbacks, promises e async/await), manipulação de eventos, tratamento de erros, segurança no cliente e comunicação com servidores. Em provas, essa temática costuma aparecer ligada a SPA, consumo de APIs, serialização de dados e fluxo de interação entre camadas.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre JavaScript no frontend, comunicação com APIs, promises/async-await, JSON e integração entre camadas.",
      "examples": [
        {
          "question": "Por que o JavaScript é importante na integração front-end/back-end?",
          "answer": "Porque ele permite que a interface capture eventos do usuário, faça requisições para serviços e atualize a tela com base nas respostas recebidas.",
          "application": "Um formulário de cadastro envia dados para uma API REST e, ao receber 201 Created, exibe mensagem de sucesso sem recarregar a página.",
          "code": "async function salvarCliente(cliente) {\n  try {\n    const response = await fetch('/api/clientes', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(cliente)\n    });\n\n    if (!response.ok) throw new Error('Erro ao salvar');\n    const dados = await response.json();\n    console.log('Cliente salvo', dados);\n  } catch (erro) {\n    console.error(erro);\n  }\n}",
          "language": "javascript"
        },
        {
          "question": "Qual a diferença entre código síncrono e assíncrono em JavaScript?",
          "answer": "Código síncrono executa em sequência e pode bloquear a execução até a operação concluir; já o assíncrono permite que a interface continue respondendo enquanto a operação externa é processada.",
          "application": "Uma chamada a uma API não deve travar a tela; por isso, o código é geralmente tratado com promises ou async/await."
        }
      ],
      "keyPoints": [
        "JavaScript manipula DOM, eventos e estado na interface",
        "Requisições HTTP conectam frontend a serviços backend",
        "APIs REST + JSON são o padrão dominante de integração",
        "Promises e async/await controlam operações assíncronas",
        "Tratamento de erro e validação são essenciais na camada cliente",
        "Segurança no cliente é limitada: dados sensíveis nunca devem depender apenas do frontend",
        "SPA e aplicações modernas dependem fortemente de comunicação assíncrona"
      ],
      "tips": [
        "Lembre-se: o frontend consome, mas não substitui o backend",
        "JSON é o formato mais comum para troca de dados entre camadas",
        "async/await é a forma mais intuitiva de explicar integração assíncrona",
        "Em prova, relacione JavaScript com APIs, eventos, DOM e comunicação entre camadas"
      ],
      "errosComuns": [
        "Confundir JavaScript com Java",
        "Pensar que o frontend resolve regras de negócio sem o backend",
        "Ignorar o papel de promises/async-await na comunicação assíncrona"
      ],
      "usefulLinks": [
        { "label": "Oracle Java Documentation", "url": "https://docs.oracle.com/en/java/", "type": "documentacao" },
        { "label": "Java para iniciantes — Curso em Vídeo", "url": "https://www.youtube.com/watch?v=sTX0UEplF54", "type": "video" }
      ]
    },
    {
      "title": "Análise estática: Clean Code e SonarQube",
      "summary": "Verificação de código sem execução, identificando problemas de qualidade, segurança e manutenibilidade. Clean Code como prática e SonarQube como ferramenta.",
      "detail": "Análise estática examina a estrutura interna do código, instruções, dependências e padrões sem executar o programa. Diferente de análise dinâmica (durante execução), ela identifica problemas antecipadamente: trechos duplicados, métodos extensos, nomes pouco claros, complexidade excessiva, falhas de segurança. Clean Code é o conjunto de princípios para tornar o código claro, simples, organizado e fácil de manter. Princípios: nomes significativos, funções pequenas e coesas, evitar duplicidade, reduzir acoplamento, comentários apenas quando agregam valor. SonarQube automatiza essa análise, classificando problemas em: Bug, Vulnerabilidade, Code smell, Duplicação, Cobertura de testes, Complexidade. O Quality Gate define critérios mínimos de aceitação, podendo bloquear aprovações.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferença entre análise estática/dinâmica, princípios de Clean Code e categorias de apontamentos do SonarQube.",
      "examples": [
        {
          "question": "Qual a diferença entre análise estática e dinâmica?",
          "answer": "Estática: antes da execução, identifica problemas estruturais e padrões inadequados. Dinâmica: durante execução, verifica comportamento, desempenho e falhas em uso real.",
          "application": "SonarQube faz análise estática; testes funcionais e homologação são análise dinâmica."
        },
        {
          "question": "O que é Quality Gate no SonarQube?",
          "answer": "Conjunto de critérios mínimos de qualidade que o código deve atender. Pode bloquear aprovação de alterações quando há excesso de problemas, baixa cobertura ou vulnerabilidades.",
          "application": "Um PR pode ser rejeitado automaticamente se o Quality Gate não for atendido."
        }
      ],
      "keyPoints": [
        "Análise estática: código em repouso; dinâmica: código em execução",
        "Clean Code: legibilidade, simplicidade, responsabilidade única",
        "SonarQube categorias: Bug, Vulnerabilidade, Code smell, Duplicação, Cobertura, Complexidade",
        "Quality Gate: critérios mínimos de aceitação",
        "Análise estática NÃO substitui testes funcionais ou revisão humana",
        "Débito técnico: problemas acumulados que exigem priorização racional"
      ],
      "tips": [
        "Code smell não causa erro imediato, mas dificulta manutenção futura",
        "Priorize vulnerabilidades e bugs antes de code smells",
        "Integre SonarQube ao pipeline CI/CD para análise contínua",
        "Clean Code é prática institucional, não preferência individual"
      ],
      "usefulLinks": [
        { "label": "Scrum Guide (2020)", "url": "https://scrumguides.org/scrum-guide.html", "type": "documentacao" },
        { "label": "Agile Manifesto", "url": "https://agilemanifesto.org/iso/ptbr/manifesto.html", "type": "documentacao" },
        { "label": "Scrum em 9 minutos — Código Fonte TV", "url": "https://www.youtube.com/watch?v=XfvQWnRgxG0", "type": "video" },
        { "label": "Kanban na prática — Attekita Dev", "url": "https://www.youtube.com/watch?v=LPqXhOGVe6E", "type": "video" }
      ]
    },
    {
      "title": "DevOps, Git e gestão de configuração",
      "summary": "Cultura de integração entre desenvolvimento e operações, com versionamento de código e entrega contínua.",
      "detail": "DevOps é cultura e conjunto de práticas que integram desenvolvimento (Dev) e operações (Ops), visando entrega rápida, confiável e contínua de software. Baseia-se em automação, colaboração, integração contínua (CI), entrega contínua (CD) e monitoramento. Git é sistema de controle de versão distribuído, essencial para gestão de configuração: permite rastrear alterações, trabalhar em branches, fazer merge e manter histórico. Conceitos-chave: commit, branch, merge, pull request, rebase, conflict resolution. Pipelines automatizados executam build, testes, análise estática e deploy a cada alteração, garantindo qualidade e velocidade.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre CI/CD, fluxo Git e princípios DevOps.",
      "examples": [
        {
          "question": "O que é CI/CD no contexto DevOps?",
          "answer": "CI (Integração Contínua): integração frequente de código com build e testes automáticos. CD (Entrega/Deploy Contínuo): liberação automatizada de versões para produção ou ambientes de teste.",
          "application": "A cada commit, o pipeline executa testes e, se aprovados, faz deploy automático."
        }
      ],
      "keyPoints": [
        "DevOps: integração Dev + Ops com automação e cultura colaborativa",
        "Git: versionamento distribuído, branches, merges, pull requests",
        "CI: integração contínua com build e testes automáticos",
        "CD: entrega ou deploy contínuo automatizado",
        "Pipeline: sequência automatizada de build, teste, análise e deploy",
        "Gestão de configuração: rastreabilidade, reprodutibilidade e controle de versões"
      ],
      "tips": [
        "DevOps não é ferramenta, é cultura + automação",
        "Git flow e trunk-based são estratégias de branching diferentes",
        "Pipeline bem estruturado inclui análise estática (SonarQube) e testes",
        "Rollback e feature flags são práticas importantes de CD"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Testes: unitários, integração, TDD e automatizados",
      "summary": "Práticas de verificação de qualidade de software em diferentes níveis, com foco em automação e desenvolvimento orientado a testes.",
      "detail": "Testes são essenciais para garantir qualidade e reduzir riscos. Níveis: unitários (métodos/classes isolados, com JUnit/Mockito), integração (interação entre componentes, APIs, banco), sistema (comportamento end-to-end), aceitação (validação com usuário). TDD (Test-Driven Development) é ciclo: escrever teste falho → implementar código mínimo → refatorar. Testes automatizados executam sem intervenção manual, sendo executados em pipelines CI. Conceitos importantes: cobertura de testes, mocks/stubs, asserções, fixtures, testes regressivos. Gestão do ciclo de vida de testes organiza planejamento, projeto, execução e encerramento das atividades de teste.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre níveis de teste, TDD, JUnit e automação.",
      "examples": [
        {
          "question": "Qual o ciclo do TDD?",
          "answer": "Red (escrever teste que falha) → Green (implementar código mínimo para passar) → Refactor (refatorar mantendo testes passando).",
          "application": "Antes de implementar uma função de cálculo, escreve-se o teste com os cenários esperados."
        }
      ],
      "keyPoints": [
        "Níveis: unitário → integração → sistema → aceitação",
        "TDD: Red-Green-Refactor",
        "JUnit: framework Java para testes unitários",
        "Mocks/Stubs: simulam dependências em testes",
        "Cobertura: percentual de código verificado por testes",
        "Testes automatizados executam em pipelines CI",
        "RPA: automação de processos repetitivos (relacionado)"
      ],
      "tips": [
        "TDD não é só escrever testes — é metodologia de design",
        "Teste unitário deve ser rápido e isolado",
        "Mock não é substituto de teste de integração",
        "Cobertura alta não garante qualidade, mas baixa cobertura é risco"
      ],
      "usefulLinks": [
        { "label": "ISTQB — Glossário de testes", "url": "https://glossary.istqb.org/en_US/search", "type": "documentacao" },
        { "label": "Testes de software para concursos — Estratégia Concursos", "url": "https://www.youtube.com/watch?v=aqIW9LJlmUQ", "type": "video" },
        { "label": "TDD na prática — DevSuperior", "url": "https://www.youtube.com/watch?v=bLdEypr2e-8", "type": "video" }
      ]
    },
    {
      "title": "Metodologias ágeis: Scrum, Kanban e XP",
      "summary": "Frameworks e métodos ágeis para desenvolvimento iterativo, com foco em entrega de valor e adaptação contínua.",
      "detail": "Scrum é framework ágil com sprints (ciclos curtos), papéis (Product Owner, Scrum Master, Developers), eventos (Sprint Planning, Daily, Review, Retrospective) e artefatos (Product Backlog, Sprint Backlog, Incremento). Baseia-se em transparência, inspeção e adaptação. Kanban é método de gestão visual do fluxo: quadro com colunas (a fazer, em andamento, concluído), limite de WIP (trabalho em progresso) para evitar sobrecarga e identificar gargalos. Ideal para fluxo contínuo, suporte e manutenção. XP (Extreme Programming) enfatiza práticas técnicas: programação em par, integração contínua, refatoração, testes, propriedade coletiva do código. Lean elimina desperdícios e maximiza valor.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram papéis do Scrum, eventos, artefatos, diferença entre Scrum e Kanban, e princípios Lean.",
      "examples": [
        {
          "question": "Quais os papéis do Scrum?",
          "answer": "Product Owner (maximiza valor, organiza Product Backlog), Scrum Master (facilitador, remove impedimentos) e Developers (constroem o incremento).",
          "application": "O PO não é gerente tradicional — é responsável pelo valor do produto."
        },
        {
          "question": "Qual a diferença entre Scrum e Kanban?",
          "answer": "Scrum trabalha com sprints fixas, papéis definidos e eventos. Kanban foca em fluxo contínuo, visualização e limite de WIP, sem iterações obrigatórias.",
          "application": "Kanban é mais adequado para suporte; Scrum para desenvolvimento de produto."
        }
      ],
      "keyPoints": [
        "Scrum: sprints, papéis (PO, SM, Devs), eventos, artefatos",
        "Kanban: fluxo contínuo, WIP limitado, visualização",
        "XP: programação em par, TDD, integração contínua, refatoração",
        "Lean: eliminação de desperdícios, maximização de valor",
        "Abordagem híbrida: combina tradicional + ágil conforme contexto",
        "Empirismo: conhecimento vem da experiência e observação"
      ],
      "tips": [
        "Scrum Guide é referência oficial — estude os papéis e eventos",
        "Kanban não tem sprints, mas tem WIP limit",
        "XP é mais técnico; Scrum é mais de gestão",
        "Retrospectiva é o coração da melhoria contínua no Scrum"
      ],
      "usefulLinks": [
        { "label": "Scrum Guide (2020)", "url": "https://scrumguides.org/scrum-guide.html", "type": "documentacao" },
        { "label": "Agile Manifesto", "url": "https://agilemanifesto.org/iso/ptbr/manifesto.html", "type": "documentacao" },
        { "label": "Scrum em 9 minutos — Código Fonte TV", "url": "https://www.youtube.com/watch?v=XfvQWnRgxG0", "type": "video" },
        { "label": "Kanban na prática — Attekita Dev", "url": "https://www.youtube.com/watch?v=LPqXhOGVe6E", "type": "video" }
      ]
    },
    {
      "title": "Engenharia de Requisitos e elicitação",
      "summary": "Processo de identificação, análise, documentação e validação de requisitos de software, com classificação e técnicas de elicitação.",
      "detail": "Engenharia de Requisitos é processo sistemático para compreender o que o sistema deve fazer. Classificação: funcionais (o que o sistema faz) e não-funcionais (como faz: desempenho, segurança, usabilidade). Processo: elicitação → análise → especificação → validação → gerenciamento. Técnicas de elicitação: entrevistas, questionários, observação, brainstorming, prototipação, análise de documentos, workshops, storyboards, etnografia. Requisitos devem ser claros, completos, consistentes, verificáveis e rastreáveis. Mudanças mal gerenciadas comprometem o projeto.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre classificação (funcional vs. não-funcional) e técnicas de elicitação.",
      "examples": [
        {
          "question": "Diferencie requisito funcional de não-funcional.",
          "answer": "Funcional: descreve o que o sistema deve fazer (ex.: \"o sistema deve permitir login com CPF\"). Não-funcional: descreve como o sistema deve se comportar (ex.: \"o login deve responder em até 2 segundos\").",
          "application": "Desempenho, segurança, usabilidade e disponibilidade são típicos não-funcionais."
        }
      ],
      "keyPoints": [
        "Funcionais: o que o sistema faz",
        "Não-funcionais: como o sistema se comporta (desempenho, segurança, etc.)",
        "Elicitação: entrevistas, brainstorming, prototipação, observação, workshops",
        "Processo: elicitação → análise → especificação → validação → gerenciamento",
        "Requisitos devem ser: claros, completos, consistentes, verificáveis, rastreáveis",
        "Mudanças mal gerenciadas = escopo estourado"
      ],
      "tips": [
        "Decore exemplos de requisitos funcionais e não-funcionais",
        "Elicitação ≠ elicitação (grafia correta é elicitação)",
        "Prototipação é técnica poderosa para reduzir ambiguidade",
        "Rastreabilidade liga requisito a código e teste"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Métricas: Ponto de Função e Story Points",
      "summary": "Técnicas de medição de software para estimar esforço, tamanho e produtividade.",
      "detail": "Ponto de Função (PF) é métrica padronizada (ISO/IEC 20926) que mede o tamanho funcional do software sob a ótica do usuário. Conta funções de dados (ALI/AIE) e funções transacionais (EE/CE/SE). Independe de tecnologia. Story Points é medida relativa usada em métodos ágeis para estimar esforço de histórias de usuário, considerando complexidade, incerteza e volume. Usa sequência de Fibonacci (1, 2, 3, 5, 8, 13, 21). Velocity é a soma de story points entregues por sprint, usada para planejamento.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões conceituais sobre diferença entre PF e Story Points.",
      "examples": [
        {
          "question": "Qual a diferença entre Ponto de Função e Story Points?",
          "answer": "PF mede tamanho funcional absoluto, independente de tecnologia (padrão ISO). Story Points medem esforço relativo em métodos ágeis, considerando complexidade e incerteza.",
          "application": "PF é usado em contratos; Story Points em planejamento de sprints."
        }
      ],
      "keyPoints": [
        "PF: métrica absoluta, padrão ISO/IEC 20926",
        "PF conta: ALI, AIE, EE, CE, SE",
        "Story Points: medida relativa, escala Fibonacci",
        "Velocity: soma de SP entregues por sprint",
        "PF independe de tecnologia; SP depende do time",
        "Ambos servem para estimar esforço, mas em contextos diferentes"
      ],
      "tips": [
        "PF tem regras rígidas; SP é subjetivo por natureza",
        "Não compare velocity entre times diferentes",
        "PF é usado em contratos de outsourcng; SP em planejamento ágil"
      ],
      "usefulLinks": [
        { "label": "OpenTelemetry Documentation", "url": "https://opentelemetry.io/docs/", "type": "documentacao" },
        { "label": "Observabilidade e monitoramento — Full Cycle", "url": "https://www.youtube.com/watch?v=4BmSz5KqFTk", "type": "video" }
      ]
    },
    {
      "title": "Desenvolvimento mobile (Android e iOS)",
      "summary": "Criação de aplicações para dispositivos móveis, considerando modelos nativo, híbrido e multiplataforma.",
      "detail": "Desenvolvimento mobile envolve criar aplicações para smartphones e tablets, considerando tela, mobilidade, conectividade, sensores, notificações e armazenamento local. Android: Java/Kotlin. iOS: Swift. Modelos: Nativo (alto desempenho, específico por plataforma), Híbrido (tecnologias web empacotadas, menor custo), Multiplataforma (base comum para Android e iOS, equilíbrio entre produtividade e UX). Apps geralmente dependem de APIs para autenticação, consulta de dados e integração com sistemas corporativos.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre modelos de desenvolvimento e diferenças entre nativo/híbrido/multiplataforma.",
      "examples": [
        {
          "question": "Qual a diferença entre app nativo e híbrido?",
          "answer": "Nativo: desenvolvido especificamente para Android (Java/Kotlin) ou iOS (Swift), alto desempenho. Híbrido: usa tecnologias web (HTML/CSS/JS) empacotadas como app, menor custo inicial.",
          "application": "App de banco com biometria costuma ser nativo; app corporativo simples pode ser híbrido."
        }
      ],
      "keyPoints": [
        "Android: Java/Kotlin; iOS: Swift",
        "Nativo: alto desempenho, específico por plataforma",
        "Híbrido: tecnologias web empacotadas, menor custo",
        "Multiplataforma: base comum, equilíbrio produtividade/UX",
        "Apps dependem de APIs para integração com back-end",
        "Segurança, UX e compatibilidade são preocupações centrais"
      ],
      "tips": [
        "Nativo ≠ melhor sempre — depende do contexto",
        "Híbrido tem limitações de desempenho e acesso a recursos",
        "Flutter e React Native são exemplos multiplataforma populares"
      ],
      "usefulLinks": [
        { "label": "Microsoft Learn — Power BI", "url": "https://learn.microsoft.com/pt-br/power-bi/", "type": "documentacao" },
        { "label": "Power BI para iniciantes — Hashtag Programação", "url": "https://www.youtube.com/watch?v=EhOTOuVGHXI", "type": "video" }
      ]
    },
    {
      "title": "Ferramentas low-code e no-code",
      "summary": "Plataformas que permitem criar aplicações com menor dependência de programação manual, usando interfaces visuais e componentes prontos.",
      "detail": "Low-code permite personalizações via código; no-code é predominantemente visual, com fluxos e configurações. Úteis para: automação de processos simples, prototipagem rápida, formulários e painéis administrativos, redução de fila de demandas simples. Exigem governança: aplicações sem controle geram duplicidade, falhas de segurança, dependência de fornecedor e dificuldade de integração. Não substituem desenvolvimento tradicional — ampliam possibilidades quando usadas com critérios técnicos.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre vantagens, limitações e necessidade de governança.",
      "examples": [
        {
          "question": "Low-code e no-code substituem desenvolvimento tradicional?",
          "answer": "Não substituem completamente. Ampliam possibilidades quando usados com critérios técnicos, regras institucionais e governança adequada.",
          "application": "Um formulário interno pode ser feito em low-code; um sistema bancário crítico exige desenvolvimento tradicional."
        }
      ],
      "keyPoints": [
        "Low-code: permite personalizações via código",
        "No-code: construção visual, sem código",
        "Cenários: automação simples, prototipagem, formulários, painéis",
        "Governança é essencial para evitar shadow IT",
        "Riscos: duplicidade, falhas de segurança, dependência de fornecedor",
        "Complementam, não substituem desenvolvimento tradicional"
      ],
      "tips": [
        "Governança é palavra-chave em low-code/no-code",
        "Shadow IT é risco real quando não há controle",
        "Integração com sistemas legados pode ser limitação"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    }
  ],
  "especificos": [
    {
      "title": "Java, Spring e testes",
      "summary": "Esse tópico reúne o núcleo da programação backend em Java, incluindo a estrutura do Spring, injeção de dependência e práticas de testes.",
      "detail": "O tópico aborda os conceitos fundamentais de programação em Java, com foco na estrutura do Spring, injeção de dependência e práticas de testes unitários e de integração.",
      "examples": [
        {
          "question": "Qual é a função do Spring?",
          "answer": "O Spring é um framework que facilita a criação de aplicações Java, com foco em injeção de dependência e programação orientada a aspectos.",
          "aplication": ""
        }
      ],
      "keyPoints": [
        "Entender conceitos básicos de Java e orientação a objetos.",
        "Reconhecer o papel do Spring e dos componentes principais.",
        "Conhecer testes unitários e integração."
      ],
      "tips": [
        "Estude os conceitos de forma aplicada, com exemplos de endpoint e serviço.",
        "Relacione os termos a um fluxo real de desenvolvimento."
      ],
      "usefulLinks": [
        { "label": "ISTQB — Glossário de testes", "url": "https://glossary.istqb.org/en_US/search", "type": "documentacao" },
        { "label": "Testes de software para concursos — Estratégia Concursos", "url": "https://www.youtube.com/watch?v=aqIW9LJlmUQ", "type": "video" },
        { "label": "TDD na prática — DevSuperior", "url": "https://www.youtube.com/watch?v=bLdEypr2e-8", "type": "video" }
      ]
    },
    {
      "title": "Banco de dados e APIs",
      "summary": "Banco de dados e APIs são centrais para a construção de sistemas modernos, envolvendo persistência, consultas e integração entre serviços.",
      "detail": "O tópico aborda os conceitos fundamentais de banco de dados e APIs, incluindo modelagem, consultas SQL e integração entre serviços.",
      "examples": [
        {
          "question": "Qual é a função de uma API?",
          "answer": "Uma API (Interface de Programação de Aplicações) permite que diferentes sistemas se comuniquem entre si, facilitando a integração e o compartilhamento de dados.",
          "aplication": ""
        }
      ],
      "keyPoints": [
        "Entender modelagem, SQL e relacionamento entre tabelas.",
        "Reconhecer conceitos de REST, endpoints e payloads.",
        "Diferenciar operações de leitura, escrita e atualização."
      ],
      "tips": [
        "Pratique com cenários de CRUD e consultas simples.",
        "Associe cada operação ao impacto no banco e nos contratos de API."
      ],
      "usefulLinks": [
        { "label": "OpenAPI Initiative", "url": "https://www.openapis.org/", "type": "documentacao" },
        { "label": "Swagger Documentation", "url": "https://swagger.io/docs/", "type": "documentacao" },
        { "label": "API RESTful com Swagger — Michelli Brito", "url": "https://www.youtube.com/watch?v=az-g2L1E5-s", "type": "video" }
      ]
    },
    {
      "title": "Docker, Git, DevOps e arquitetura",
      "summary": "Esse tema conecta ferramentas e práticas de delivery contínuo, versionamento e organização de sistemas em ambientes modernos.",
      "detail": "O tópico aborda os conceitos fundamentais de Docker, Git, DevOps e arquitetura de sistemas, incluindo containerização, versionamento e práticas de entrega contínua.",
      "examples": [
        {
          "question": "Qual é a função do Docker?",
          "answer": "O Docker é uma plataforma que facilita a criação, implantação e execução de aplicações em containers, permitindo isolamento e portabilidade.",
          "aplication": ""
        }
      ],
      "keyPoints": [
        "Entender o papel de containers e imagens.",
        "Conhecer o fluxo básico de Git e branches.",
        "Reconhecer princípios de arquitetura e deploy."
      ],
      "tips": [
        "Foque no raciocínio de fluxo de entrega e integração.",
        "Associe cada ferramenta ao problema que ela resolve."
      ],
      "usefulLinks": [
        { "label": "Docker Documentation", "url": "https://docs.docker.com/", "type": "documentacao" },
        { "label": "Kubernetes Documentation", "url": "https://kubernetes.io/pt-br/docs/home/", "type": "documentacao" },
        { "label": "Docker para iniciantes — LinuxTips", "url": "https://www.youtube.com/watch?v=Wm99C_f7Kxw", "type": "video" },
        { "label": "Kubernetes do zero — Full Cycle", "url": "https://www.youtube.com/watch?v=Za8WFjO_8WQ", "type": "video" }
      ]
    }
  ],
  "gestaogovernanca": [
    {
      "title": "Gerenciamento de projetos: conceitos, programas e portfólio",
      "summary": "Fundamentos de projetos, programas e portfólio, com alinhamento estratégico e priorização.",
      "detail": "Projeto: esforço temporário para criar produto, serviço ou resultado único, com início, fim, objetivo, recursos limitados. Diferente de operação contínua (repetitiva, permanente). Gerenciamento de projetos aplica conhecimentos, habilidades e ferramentas para conduzir projeto até resultados esperados. Restrições: escopo, prazo, custo, qualidade. Programa: conjunto de projetos relacionados gerenciados coordenadamente para obter benefícios maiores. Portfólio: conjunto de projetos, programas e iniciativas organizados para objetivos estratégicos, permitindo priorizar investimentos. Alinhamento estratégico evita desperdício. Critérios de priorização: valor, urgência, risco, custo, dependências, contribuição estratégica.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferença entre projeto/programa/portfólio e critérios de priorização.",
      "examples": [
        {
          "question": "Qual a diferença entre projeto, programa e portfólio?",
          "answer": "Projeto: entrega específica e única. Programa: conjunto de projetos relacionados com benefício maior. Portfólio: conjunto de projetos/programas alinhados a objetivos estratégicos.",
          "application": "Transformação digital é programa; implantação de ERP é projeto; portfólio é o conjunto de todos os projetos da empresa."
        }
      ],
      "keyPoints": [
        "Projeto: temporário, único, com início e fim",
        "Operação: repetitiva, permanente",
        "Programa: projetos relacionados coordenados",
        "Portfólio: conjunto alinhado a objetivos estratégicos",
        "Restrições: escopo, prazo, custo, qualidade",
        "Critérios de priorização: valor, urgência, risco, custo, dependências"
      ],
      "tips": [
        "Projeto ≠ operação: não confunda",
        "Portfólio responde \"quais projetos fazer?\"; projeto responde \"como fazer?\"",
        "Quando tudo é prioridade, nada é prioridade"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Processos, grupos e áreas de conhecimento (PMBOK)",
      "summary": "Estrutura do PMBOK com 5 grupos de processos e 10 áreas de conhecimento.",
      "detail": "Processo em gerenciamento de projetos é conjunto de atividades que transforma entradas em saídas. 5 grupos de processos: Iniciação (autoriza projeto), Planejamento (detalha escopo, prazo, custo, comunicação), Execução (realiza trabalho), Monitoramento e Controle (compara planejado vs. real, trata desvios), Encerramento (formaliza conclusão, lições aprendidas). 10 áreas de conhecimento: Integração, Escopo, Cronograma, Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas. Grupos indicam quando; áreas indicam sobre o quê. Integração entre processos e áreas exige visão sistêmica.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram grupos de processos e áreas de conhecimento.",
      "examples": [
        {
          "question": "Quais os 5 grupos de processos do PMBOK?",
          "answer": "Iniciação, Planejamento, Execução, Monitoramento e Controle, Encerramento.",
          "application": "Iniciação autoriza; Planejamento detalha; Execução realiza; Monitoramento compara; Encerramento finaliza."
        }
      ],
      "keyPoints": [
        "5 grupos: Iniciação, Planejamento, Execução, Monitoramento/Controle, Encerramento",
        "10 áreas: Integração, Escopo, Cronograma, Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas",
        "Grupos indicam quando; áreas indicam sobre o quê",
        "Monitoramento ocorre durante todo o projeto",
        "Visão sistêmica: mudanças em uma área impactam outras",
        "Intensidade proporcional ao tamanho e risco do projeto"
      ],
      "tips": [
        "Decore os 5 grupos e 10 áreas",
        "Monitoramento não é só no fim — é contínuo",
        "Nem todo projeto exige mesmo nível de formalidade"
      ],
      "usefulLinks": [
        { "label": "OMG — BPMN 2.0 Specification", "url": "https://www.omg.org/spec/BPMN/2.0/", "type": "documentacao" },
        { "label": "BPMN para iniciantes — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=ZFD-cjRPCVA", "type": "video" }
      ]
    },
    {
      "title": "Abordagens: tradicional, híbrida e ágil",
      "summary": "Diferentes formas de conduzir projetos conforme contexto, incerteza e necessidade de controle.",
      "detail": "Tradicional (preditiva): maior planejamento antecipado, adequada quando escopo claro e requisitos estáveis. Busca definir previamente o que, como, quanto e quando. Vantagem: previsibilidade. Limitação: ambiente com muitas mudanças. Ágil: contextos de maior incerteza, escopo evolui com aprendizado e feedback. Entrega incremental e iterativa, reduzindo risco de solução distante da necessidade. Planejamento adaptativo, colaboração intensa, foco em valor. Híbrida: combina tradicional e ágil. Parte com controle preditivo (orçamento, contratos, marcos) e parte com ciclos iterativos (Scrum/Kanban para funcionalidades). Escolha depende de: incerteza, necessidade de entregas frequentes, disponibilidade de usuários, grau de controle, complexidade técnica, cultura.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram diferenças entre abordagens e critérios de escolha.",
      "examples": [
        {
          "question": "Quando usar abordagem tradicional vs. ágil?",
          "answer": "Tradicional: requisitos claros, pouca mudança, exigências contratuais rígidas. Ágil: requisitos incertos, necessidade de feedback frequente, produto digital inovador.",
          "application": "Obra civil costuma ser tradicional; desenvolvimento de app costuma ser ágil."
        }
      ],
      "keyPoints": [
        "Tradicional: planejamento antecipado, previsibilidade",
        "Ágil: incremental, iterativa, adaptativa, foco em valor",
        "Híbrida: combina preditivo + iterativo",
        "Critérios: incerteza, entregas frequentes, feedback, controle, complexidade, cultura",
        "Ágil não significa falta de planejamento",
        "Escolha depende do contexto, não de preferência"
      ],
      "tips": [
        "Tradicional = cascata; Ágil = iterativo",
        "Híbrida é cada vez mais comum em grandes organizações",
        "Não existe \"melhor\" abordagem — existe mais adequada"
      ],
      "usefulLinks": [
        { "label": "Scrum Guide (2020)", "url": "https://scrumguides.org/scrum-guide.html", "type": "documentacao" },
        { "label": "Agile Manifesto", "url": "https://agilemanifesto.org/iso/ptbr/manifesto.html", "type": "documentacao" },
        { "label": "Scrum em 9 minutos — Código Fonte TV", "url": "https://www.youtube.com/watch?v=XfvQWnRgxG0", "type": "video" },
        { "label": "Kanban na prática — Attekita Dev", "url": "https://www.youtube.com/watch?v=LPqXhOGVe6E", "type": "video" }
      ]
    },
    {
      "title": "Scrum, Lean e Kanban (visão gestão)",
      "summary": "Frameworks ágeis sob perspectiva de gerenciamento, com foco em valor, fluxo e melhoria contínua.",
      "detail": "Scrum: framework ágil com sprints (ciclos curtos), incrementos utilizáveis, baseado em transparência, inspeção e adaptação. Papéis: PO (maximiza valor), SM (facilitador), Developers (constroem). Eventos: Sprint, Planning, Daily, Review, Retrospective. Artefatos: Product Backlog, Sprint Backlog, Incremento. Lean: eliminação de desperdícios, geração de valor, melhoria de fluxo, redução de retrabalho. Questiona etapas burocráticas e excesso de WIP. Kanban: gestão visual do fluxo com quadro, colunas e cartões. Limita WIP, identifica gargalos, melhora capacidade de concluir. Ideal para fluxo contínuo, suporte, manutenção. Scrum trabalha com sprints; Kanban com fluxo contínuo; Lean com princípios de eliminação de desperdícios.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram papéis, eventos, artefatos do Scrum e diferenças com Kanban.",
      "examples": [
        {
          "question": "Quais os eventos do Scrum?",
          "answer": "Sprint (ciclo principal), Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective.",
          "application": "Daily é rápida (15min) e diária; Retrospectiva busca melhoria do processo."
        }
      ],
      "keyPoints": [
        "Scrum: sprints, papéis (PO, SM, Devs), eventos, artefatos",
        "Lean: eliminação de desperdícios, geração de valor",
        "Kanban: fluxo contínuo, visualização, WIP limitado",
        "Scrum: ciclos fixos; Kanban: fluxo contínuo",
        "Podem ser combinados: Scrum + Kanban (Scrumban)",
        "Empirismo: conhecimento vem da experiência"
      ],
      "tips": [
        "Scrum Guide é referência oficial",
        "Kanban não tem papéis obrigatórios como Scrum",
        "Retrospectiva é coração da melhoria contínua"
      ],
      "usefulLinks": [
        { "label": "Scrum Guide (2020)", "url": "https://scrumguides.org/scrum-guide.html", "type": "documentacao" },
        { "label": "Agile Manifesto", "url": "https://agilemanifesto.org/iso/ptbr/manifesto.html", "type": "documentacao" },
        { "label": "Scrum em 9 minutos — Código Fonte TV", "url": "https://www.youtube.com/watch?v=XfvQWnRgxG0", "type": "video" },
        { "label": "Kanban na prática — Attekita Dev", "url": "https://www.youtube.com/watch?v=LPqXhOGVe6E", "type": "video" }
      ]
    },
    {
      "title": "Guia Scrum: papéis, eventos e artefatos",
      "summary": "Referência oficial do Scrum com definições de responsabilidades, ciclos e entregas.",
      "detail": "Scrum Guide é referência oficial, padronizando entendimento. Responsabilidades: Product Owner (maximiza valor, organiza Product Backlog, representa perspectiva de valor), Scrum Master (facilitador, remove impedimentos, promove uso adequado do Scrum), Developers (transformam itens selecionados em incremento pronto). Eventos: Sprint (ciclo fixo, geralmente 2-4 semanas), Sprint Planning (define o que será feito), Daily Scrum (acompanhamento diário, 15min), Sprint Review (apresenta incremento), Sprint Retrospective (busca melhoria do processo). Artefatos: Product Backlog (lista priorizada de tudo que pode ser necessário), Sprint Backlog (itens selecionados para sprint), Incremento (parte pronta e utilizável do produto). Compromissos: Product Goal, Sprint Goal, Definition of Done.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram papéis, eventos, artefatos e compromissos.",
      "examples": [
        {
          "question": "Qual a função do Product Owner?",
          "answer": "Maximizar valor do produto e organizar o Product Backlog, representando a perspectiva de valor e prioridades.",
          "application": "PO não é gerente tradicional — é responsável pelo valor, não por pessoas."
        }
      ],
      "keyPoints": [
        "PO: maximiza valor, organiza Product Backlog",
        "SM: facilitador, remove impedimentos",
        "Developers: constroem incremento",
        "Eventos: Sprint, Planning, Daily, Review, Retrospective",
        "Artefatos: Product Backlog, Sprint Backlog, Incremento",
        "Compromissos: Product Goal, Sprint Goal, Definition of Done",
        "Empirismo: transparência, inspeção, adaptação"
      ],
      "tips": [
        "PO não é gerente de projeto tradicional",
        "SM não é chefe — é facilitador e coach",
        "Definition of Done é critério de qualidade compartilhado"
      ],
      "usefulLinks": [
        { "label": "Scrum Guide (2020)", "url": "https://scrumguides.org/scrum-guide.html", "type": "documentacao" },
        { "label": "Agile Manifesto", "url": "https://agilemanifesto.org/iso/ptbr/manifesto.html", "type": "documentacao" },
        { "label": "Scrum em 9 minutos — Código Fonte TV", "url": "https://www.youtube.com/watch?v=XfvQWnRgxG0", "type": "video" },
        { "label": "Kanban na prática — Attekita Dev", "url": "https://www.youtube.com/watch?v=LPqXhOGVe6E", "type": "video" }
      ]
    },
    {
      "title": "Apetite e tolerância ao risco",
      "slug": "apetite-e-tolerancia-ao-risco",
      "aliases": [
        "Apetite ao risco",
        "Tolerância ao risco",
        "Risco organizacional"
      ],
      "summary": "Níveis de exposição ao risco que a organização aceita, com base em estratégia, capacidade operacional e contexto.",
      "detail": "Apetite ao risco é o grau de risco que a organização está disposta a aceitar para alcançar seus objetivos. Ele expressa uma postura estratégica e pode ser descrito em termos qualitativos (baixo, médio, alto) ou quantitativos. Já a tolerância ao risco é o limite operacional e financeiro que a organização consegue suportar sem comprometer continuidade, reputação, segurança ou desempenho. Enquanto o apetite define o que a gestão deseja aceitar, a tolerância define o que a organização consegue suportar. Esses conceitos aparecem em governança, segurança da informação, finanças, projetos e continuidade de negócios. A governança precisa traduzir esses limites em políticas, limites operacionais e indicadores de acompanhamento.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre diferença entre apetite e tolerância, limites de risco e relação com governança e decisão.",
      "examples": [
        {
          "question": "Qual a diferença entre apetite e tolerância ao risco?",
          "answer": "Apetite é o nível de risco que a organização está disposta a aceitar estrategicamente; tolerância é o limite máximo que ela consegue suportar sem quebrar sua operação.",
          "application": "Uma organização pode ter apetite alto para inovação, mas tolerância baixa para falhas críticas de segurança."
        }
      ],
      "keyPoints": [
        "Apetite: postura estratégica de aceitação de risco",
        "Tolerância: limite operacional e financeiro suportável",
        "Relaciona-se com governança, continuidade e tomada de decisão",
        "Precisa ser traduzido em políticas e limites claros",
        "Ajuda a priorizar controles, investimentos e respostas ao risco"
      ],
      "tips": [
        "Apetite é uma decisão da alta administração",
        "Tolerância costuma ser mais operacional e prática",
        "Em prova, compare apetite com tolerância e com risco real"
      ],
      "usefulLinks": [
        { "label": "ISO 31000 — Gestão de Riscos", "url": "https://www.iso.org/standard/65694.html", "type": "documentacao" },
        { "label": "Gestão de riscos em TI — Gran Cursos Online", "url": "https://www.youtube.com/watch?v=gXFTBfZWaG0", "type": "video" }
      ]
    },
    {
      "title": "Gestão de riscos: identificação, resposta e monitoramento",
      "summary": "Processo de antecipar, avaliar e tratar eventos que podem impactar objetivos organizacionais.",
      "detail": "Risco: possibilidade de eventos futuros impactarem objetivos (ISO 31000: \"efeito da incerteza nos objetivos\"). Tipos: Estratégico, Operacional, Financeiro, Legal/Regulatório, Reputacional, Ambiental/Segurança. Diferença: Risco (probabilidades conhecidas/estimáveis) vs. Incerteza (probabilidades desconhecidas). Identificação: SWOT, brainstorming, checklists/auditorias, Análise de Causa Raiz (RCA), histórico de incidentes. Causas: fatores humanos, tecnológicos, econômicos, ambientais, regulatórios. Respostas: Evitação (elimina ameaça), Mitigação (reduz probabilidade/impacto), Transferência (repassa a terceiros — seguros), Aceitação (assume o risco). Critérios de escolha: impacto, probabilidade, custo da resposta, apetite ao risco. Comunicação: transparência, rapidez, relevância, engajamento, múltiplos canais. Monitoramento: KPIs/KRIs, dashboards, auditorias, análises preditivas, testes de contingência.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram tipos de risco, estratégias de resposta e diferença risco/incerteza.",
      "examples": [
        {
          "question": "Qual a diferença entre risco e incerteza?",
          "answer": "Risco: probabilidade conhecida ou estimável (ex.: volatilidade de mercado). Incerteza: probabilidade desconhecida, impossível previsão precisa (ex.: crise inesperada).",
          "application": "Investir em bolsa tem risco calculável; pandemia é incerteza."
        },
        {
          "question": "Quais as estratégias de resposta ao risco?",
          "answer": "Evitação (elimina ameaça), Mitigação (reduz probabilidade/impacto), Transferência (repassa — seguros), Aceitação (assume).",
          "application": "Backup é mitigação; seguro contra incêndio é transferência."
        }
      ],
      "keyPoints": [
        "Risco: efeito da incerteza nos objetivos (ISO 31000)",
        "Tipos: estratégico, operacional, financeiro, legal, reputacional, ambiental",
        "Risco (probabilidade conhecida) vs. Incerteza (desconhecida)",
        "Identificação: SWOT, brainstorming, RCA, histórico",
        "Respostas: evitação, mitigação, transferência, aceitação",
        "Comunicação: transparência, rapidez, relevância",
        "Monitoramento: KPIs/KRIs, dashboards, auditorias",
        "Apetite ao risco: nível de incerteza aceitável",
        "Tolerância: máximo suportável sem comprometer operação"
      ],
      "tips": [
        "Risco ≠ incerteza: probabilidade conhecida vs. desconhecida",
        "Apetite é estratégico; tolerância é limite operacional",
        "Aceitação não é negligência — é decisão consciente"
      ],
      "usefulLinks": [
        { "label": "ISO 31000 — Gestão de Riscos", "url": "https://www.iso.org/standard/65694.html", "type": "documentacao" },
        { "label": "Gestão de riscos em TI — Gran Cursos Online", "url": "https://www.youtube.com/watch?v=gXFTBfZWaG0", "type": "video" }
      ]
    },
    {
      "title": "ITIL v4: SVS, Cadeia de Valor e Práticas",
      "summary": "Boas práticas para gerenciamento de serviços de TI com foco em cocriação de valor.",
      "detail": "ITIL v4 é conjunto de boas práticas para gerenciamento de serviços de TI, com foco em valor, integração com ágeis e flexibilidade. Conceitos centrais: Serviço (meio de possibilitar cocriação de valor) e Valor (percepção de benefícios, utilidade e importância). Utilidade (o que serviço faz) + Garantia (como é entregue: disponibilidade, capacidade, continuidade, segurança). Pensamento holístico considera conjunto de atividades, recursos, parceiros e fluxos. Sistema de Valor de Serviço (SVS): modelo central com 5 elementos — princípios orientadores (focar no valor, começar onde está, iterar com feedback, colaborar, holístico, simplicidade, otimizar/automatizar), governança, cadeia de valor do serviço, práticas, melhoria contínua. Cadeia de Valor do Serviço: 6 atividades — Planejar, Melhorar, Engajar, Desenhar/Transicionar, Obter/Construir, Entregar/Suportar. Práticas substituem processos: gerenciamento geral, de serviços e técnico.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram SVS, princípios, cadeia de valor e diferença entre utilidade/garantia.",
      "examples": [
        {
          "question": "Qual a diferença entre utilidade e garantia no ITIL?",
          "answer": "Utilidade: o que o serviço faz (atende necessidade). Garantia: como é entregue (disponibilidade, capacidade, continuidade, segurança).",
          "application": "Um serviço de e-mail tem utilidade (enviar/receber) e garantia (99,9% disponibilidade)."
        }
      ],
      "keyPoints": [
        "Serviço: meio de possibilitar cocriação de valor",
        "Valor: percepção de benefícios, utilidade e importância",
        "Utilidade (o que faz) + Garantia (como é entregue)",
        "SVS: princípios, governança, cadeia de valor, práticas, melhoria contínua",
        "7 princípios: valor, começar onde está, iterar, colaborar, holístico, simplicidade, otimizar",
        "6 atividades da cadeia: Planejar, Melhorar, Engajar, Desenhar/Transicionar, Obter/Construir, Entregar/Suportar",
        "Práticas substituem processos do ITIL v3"
      ],
      "tips": [
        "ITIL v4 é mais flexível que v3",
        "Cocriação de valor: TI + usuários juntos",
        "Melhoria contínua conecta todos os elementos do SVS"
      ],
      "usefulLinks": [
        { "label": "AXELOS — ITIL", "url": "https://www.axelos.com/certifications/itil-service-management", "type": "documentacao" },
        { "label": "ITIL para concursos — Estratégia Concursos", "url": "https://www.youtube.com/watch?v=vu2KcjuCj-0", "type": "video" }
      ]
    },
    {
      "title": "COBIT 2019: princípios, domínios e objetivos",
      "summary": "Framework de governança e gestão de TI para alinhamento estratégico e criação de valor.",
      "detail": "COBIT 2019 (ISACA) é framework de governança e gestão de TI, evolução do COBIT 5, com maior flexibilidade, personalização e integração com ITIL, ISO 27001, ISO 20000. Características: flexibilidade/escalabilidade, foco em governança e gestão, integração com frameworks, customização, foco em criação de valor. 6 princípios: atender partes interessadas, cobrir organização ponta a ponta, framework único integrado, abordagem holística, separar governança de gestão, governança baseada em metas. Componentes: 40 objetivos de governança e gestão, Cascata de Metas (conecta organizacionais a TI), Fatores de Design (personalização), Áreas de Foco (segurança, privacidade, transformação digital), Guia de Implementação. Domínios: Governança (EDM — Avaliar, Direcionar, Monitorar); Gestão (APO — Alinhar/Planejar/Organizar, BAI — Construir/Aquirir/Implementar, DSS — Entregar/Suportar, MEA — Monitorar/Avaliar/Melhorar).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram princípios, domínios e diferença governança/gestão.",
      "examples": [
        {
          "question": "Quais os domínios do COBIT 2019?",
          "answer": "Governança: EDM (Avaliar, Direcionar, Monitorar). Gestão: APO (Alinhar/Planejar/Organizar), BAI (Construir/Aquirir/Implementar), DSS (Entregar/Suportar), MEA (Monitorar/Avaliar/Melhorar).",
          "application": "EDM é da alta direção (governança); APO, BAI, DSS, MEA são da gestão."
        }
      ],
      "keyPoints": [
        "COBIT 2019: governança e gestão de TI (ISACA)",
        "6 princípios: partes interessadas, ponta a ponta, integrado, holístico, separar governança/gestão, baseado em metas",
        "40 objetivos de governança e gestão",
        "Cascata de Metas: conecta organizacionais a TI",
        "Fatores de Design: personalização",
        "Domínios: EDM (governança), APO, BAI, DSS, MEA (gestão)",
        "Governança (alta direção) ≠ Gestão (gerentes)",
        "Integra com ITIL, ISO 27001, ISO 20000"
      ],
      "tips": [
        "Governança = direção; Gestão = execução",
        "EDM é único domínio de governança",
        "COBIT 2019 é mais flexível que COBIT 5"
      ],
      "usefulLinks": [
        { "label": "ISACA — COBIT", "url": "https://www.isaca.org/resources/cobit", "type": "documentacao" },
        { "label": "COBIT para concursos — Gran Cursos Online", "url": "https://www.youtube.com/watch?v=IY9Y-wJ7gDk", "type": "video" }
      ]
    },
    {
      "title": "Macroprocessos, processos e subprocessos",
      "slug": "macroprocessos-processos-e-subprocessos",
      "aliases": [
        "Macroprocessos",
        "Subprocessos",
        "Modelagem de processos"
      ],
      "summary": "Estruturação da organização por processos em níveis diferentes de abstração, para melhor controle e gestão.",
      "detail": "Na gestão por processos, a organização é vista como um conjunto de atividades interligadas que geram valor. Macroprocessos são grandes conjuntos de atividades que atravessam diferentes áreas, como atendimento ao cliente, compras, gestão de pessoas ou prestação de serviços. Processos são fluxos mais específicos que transformam entradas em saídas úteis para um cliente interno ou externo. Subprocessos são partes menores, especializadas e reutilizáveis de um processo maior, muitas vezes vinculados a uma função específica. Essa hierarquia ajuda a entender a operação, padronizar atividades, facilitar a análise de falhas e melhorar o controle. Em BPMN, essa divisão permite representar visualmente o fluxo de forma clara, sem perder o contexto estratégico.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrado em questões sobre hierarquia de processos, BPMN e diferenciação entre macroprocesso, processo e subprocesso.",
      "examples": [
        {
          "question": "Qual a diferença entre macroprocesso, processo e subprocesso?",
          "answer": "Macroprocesso reúne várias funções e impacta a organização como um todo; processo é uma sequência de atividades com input e output claro; subprocesso é uma parte menor do processo maior.",
          "application": "O macroprocesso de gestão de recursos humanos pode envolver recrutamento, treinamento e folha; o processo de contratação é um componente desse macroprocesso."
        }
      ],
      "keyPoints": [
        "Macroprocesso: visão ampla e estratégica",
        "Processo: fluxo com início, meio e fim",
        "Subprocesso: parte especializada de um processo maior",
        "BPMN ajuda a mapear e visualizar processos",
        "Modelagem por processos melhora controle, padronização e melhoria contínua"
      ],
      "tips": [
        "A hierarquia de processos ajuda a evitar confusão entre níveis de detalhamento",
        "Modelar processos não é só desenhar fluxos — é entender valor",
        "Em prova, relacione com BPMN e gestão por processos"
      ],
      "usefulLinks": [
        { "label": "OMG — BPMN 2.0 Specification", "url": "https://www.omg.org/spec/BPMN/2.0/", "type": "documentacao" },
        { "label": "BPMN para iniciantes — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=ZFD-cjRPCVA", "type": "video" }
      ]
    },
    {
      "title": "BPMN e modelagem de processos de negócio",
      "summary": "Notação padrão para representação visual de processos, com macroprocessos, processos e subprocessos.",
      "detail": "Processo: conjunto de atividades realizadas por empresa para criar/adicionar valor a clientes (internos e externos), com início e fim definidos. Pode ser visto como fluxograma com sequência lógica. Empresa organiza processos por enfoque: atividades principais, negócios, departamentos ou áreas funcionais. BPMN (Business Process Model and Notation) é padrão para modelagem visual. Hierarquia: Macroprocessos (lidam com mais de uma função, impacto organizacional), Processos (atividades sequenciais que transformam input em output), Subprocessos (partes inter-relacionadas de processo maior, subdivisíveis). Quanto mais divide, maior visualização e controle, facilitando decisão. Recursos envolvidos: financeiros, equipamentos, materiais, capital humano/intelectual, sistemas informatizados. Diagrama de Ishikawa (causa-efeito) identifica pontos fortes/fracos.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Alta incidência. Questões cobram hierarquia (macroprocesso/processo/subprocesso) e conceitos de BPMN.",
      "examples": [
        {
          "question": "Qual a diferença entre macroprocesso, processo e subprocesso?",
          "answer": "Macroprocesso: envolve mais de uma função, impacto organizacional. Processo: atividades sequenciais que transformam input em output. Subprocesso: parte de processo maior, subdivisível.",
          "application": "\"Providenciar suprimentos\" é macroprocesso; \"Realizar planejamento de compras\" é subprocesso."
        }
      ],
      "keyPoints": [
        "Processo: conjunto de atividades para criar valor, com início e fim",
        "Cliente: externo (produto final) e interno (funcionários)",
        "BPMN: notação padrão para modelagem",
        "Macroprocesso: mais de uma função, impacto amplo",
        "Processo: atividades sequenciais, input → output",
        "Subprocesso: parte de processo maior, subdivisível",
        "Recursos: financeiros, equipamentos, materiais, humano, sistemas",
        "Ishikawa: causa-efeito, identifica pontos fortes/fracos"
      ],
      "tips": [
        "BPMN é notação; BPM é disciplina de gestão",
        "Quanto mais detalha, maior controle — mas cuidado com burocracia",
        "Gestão por processos ameniza impactos de crescimento desordenado"
      ],
      "usefulLinks": [
        { "label": "OMG — BPMN 2.0 Specification", "url": "https://www.omg.org/spec/BPMN/2.0/", "type": "documentacao" },
        { "label": "BPMN para iniciantes — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=ZFD-cjRPCVA", "type": "video" }
      ]
    }
  ],
  "ia": [
    {
      "title": "Geopolítica mundial e conflitos contemporâneos",
      "summary": "A geopolítica mundial aborda tensões entre potências (EUA, China, Rússia), conflitos regionais (Oriente Médio, Ucrânia), política migratória e o impacto das disputas internas de grandes potências no equilíbrio global.",
      "detail": "A geopolítica contemporânea é marcada por múltiplos focos de tensão simultâneos. No Oriente Médio, o conflito Israel-Irã atinge novo patamar com ataques a instalações nucleares e ameaças de fechamento do Estreito de Ormuz (por onde passa ~20% do petróleo mundial). A guerra na Ucrânia evolui com o uso de drones de longo alcance (mais de 1.000 km), redefinindo táticas de guerra assimétrica. A política migratória dos EUA (banimento de 12 países e restrições a mais 7) tensiona relações diplomáticas e alimenta a retórica antiamericana. Na Europa, a ascensão de líderes conservadores como Karol Nawrocki na Polônia sinaliza uma guinada nacionalista que tensiona a União Europeia. A Coreia do Norte busca alternativas econômicas (turismo) em meio a sanções. A China emerge como mediadora em crises (Oriente Médio), sinalizando sua crescente influência global. A FGV espera que o candidato compreenda as interconexões entre esses eventos e seus impactos econômicos, diplomáticos e sociais.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "As questões de Atualidades da FGV misturam geopolítica com impactos econômicos e sociais. Os temas mais quentes são Oriente Médio, guerra na Ucrânia, política migratória dos EUA e tensões China-EUA.",
      "examples": [
        {
          "question": "Qual a importância geopolítica do Estreito de Ormuz?",
          "answer": "O Estreito de Ormuz é um ponto de estrangulamento marítimo entre o Golfo Pérsico e o Oceano Índico por onde passa quase 20% do petróleo mundial. Qualquer ameaça de fechamento — como a feita pelo Irã durante a escalada com Israel — dispara os preços do barril e gera instabilidade nos mercados globais, afetando especialmente Europa e Ásia.",
          "aplication": "A FGV pode relacionar o Estreito de Ormuz com impactos na economia brasileira (alta do petróleo → inflação → política monetária do Banco Central)."
        },
        {
          "question": "Como o uso de drones está transformando a guerra moderna?",
          "answer": "Os drones permitem ataques assimétricos: nações com menos recursos militares convencionais podem causar danos significativos a adversários maiores. A Ucrânia usou drones kamikaze com alcance superior a 1.000 km para atingir bases aéreas russas em Voronej e Saratov, forçando a Rússia a realocar defesas. Isso redefine as táticas de guerra e levanta questões sobre a internacionalização do conflito.",
          "aplication": "A FGV pode perguntar sobre as implicações geopolíticas do avanço tecnológico em conflitos — a \"guerra de drones\" é um exemplo de como a tecnologia altera o equilíbrio de poder."
        }
      ],
      "keyPoints": [
        "Oriente Médio: conflito Israel-Irã, programa nuclear iraniano, Estreito de Ormuz, papel mediador da China",
        "Guerra na Ucrânia: drones de longo alcance, apoio ocidental, risco de internacionalização (OTAN vs Rússia)",
        "Política migratória dos EUA: banimento de 12 países, restrições parciais a 7 países, impacto na América Latina (Cuba, Venezuela)",
        "Europa: ascensão do nacionalismo conservador (Polônia, Karol Nawrocki), tensões com a União Europeia",
        "Coreia do Norte: resort Wonsan-Kalma, busca por receita em meio a sanções, aproximação com Rússia",
        "China como mediadora global: pressão por cessar-fogo no Oriente Médio, proteção de rotas comerciais",
        "Disputas internas nos EUA: Trump vs Musk, tensão Washington-Vale do Silício, impacto na economia global"
      ],
      "tips": [
        "Relacione sempre o evento geopolítico com seu impacto econômico — a FGV adora essa conexão",
        "Estreito de Ormuz, Canal de Suez e Estreito de Malaca são pontos de estrangulamento que SEMPRE caem",
        "Acompanhe o papel da China como mediadora — é um tema novo e com forte potencial de cobrança",
        "Guerra na Ucrânia: foque nos desdobramentos tecnológicos (drones) e no impacto energético na Europa",
        "Não decore datas — entenda as causas, os atores envolvidos e as consequências de cada evento"
      ],
      "errosComuns": [
        "Confundir os lados do conflito no Oriente Médio — Irã apoia Hezbollah e Hamas; Israel é apoiado pelos EUA",
        "Achar que o fechamento do Estreito de Ormuz afeta só o Oriente Médio — o impacto é global e imediato",
        "Não perceber a diferença entre nacionalismo (Polônia) e integração europeia — são forças opostas",
        "Decorar nomes sem entender o contexto — a FGV cobra relações de causa e consequência, não decoreba"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "Política, economia e sociedade na América Latina",
      "summary": "A América Latina enfrenta desafios de governança democrática, corrupção, polarização política e fluxos migratórios. Eventos na Argentina, Colômbia e Brasil reverberam nas relações regionais e globais.",
      "detail": "A política latino-americana é marcada por instabilidade crônica e polarização. Na Argentina, a condenação de Cristina Kirchner (8 anos de prisão, inabilitação para cargos públicos) por corrupção no caso \"Vialidad\" reconfigura o peronismo e impacta as eleições de 2025 — além de ecoar em todo o Mercosul. Na Colômbia, o atentado contra o senador Miguel Uribe Turbay (pré-candidato à presidência) por um adolescente de 14 anos expõe a persistência da violência política, o recrutamento de menores por grupos armados e a fragilidade da segurança mesmo em áreas urbanas centrais como Bogotá. No Brasil, a relação com Portugal é tensionada pela nova política migratória portuguesa (revisão de 34 mil pedidos de residência, expulsão potencial de 5 mil brasileiros), que inclui aumento do tempo para cidadania (de 5 para 7 anos para CPLP) e exigência de proficiência em português. A FGV cobra esses eventos sob a ótica dos impactos institucionais, sociais e nas relações bilaterais.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV tem tradição de cobrar atualidades latino-americanas, especialmente quando há impacto direto ou indireto no Brasil (Mercosul, relações bilaterais, fluxos migratórios).",
      "examples": [
        {
          "question": "Qual o impacto da condenação de Cristina Kirchner na política argentina e regional?",
          "answer": "A condenação por corrupção passiva e lavagem de dinheiro no caso \"Vialidad\" (contratos superfaturados de obras rodoviárias) a inabilitou para cargos públicos, reconfigurando o peronismo — dividido entre apoiadores e setores que buscam renovação. No plano regional, afeta o Mercosul e as relações com o Brasil, especialmente em um momento de instabilidade econômica global. O caso também alimenta o debate sobre transparência e combate à corrupção na América Latina.",
          "aplication": "A FGV pode perguntar sobre os reflexos da condenação nas relações Brasil-Argentina ou no equilíbrio político do Mercosul."
        },
        {
          "question": "Por que a nova política migratória de Portugal afeta os brasileiros?",
          "answer": "Portugal revisou 34 mil pedidos de residência pendentes, com potencial de expulsão de ~5 mil brasileiros. As mudanças incluem: aumento do tempo para cidadania (5→7 anos para CPLP), contagem a partir da emissão (não da solicitação), exigência de proficiência em português (nível A2), restrições à reunificação familiar e fim da \"manifestação de interesse\". O Brasil já sinalizou que aplicará reciprocidade nas regras migratórias, tensionando as relações bilaterais.",
          "aplication": "A FGV pode contextualizar isso dentro da tendência global de endurecimento migratório — EUA, Europa e agora Portugal."
        }
      ],
      "keyPoints": [
        "Argentina: condenação de Cristina Kirchner (corrupção, 8 anos, inabilitação), impacto no peronismo e eleições 2025",
        "Colômbia: atentado contra Miguel Uribe Turbay, violência política histórica (La Violencia, FARC), recrutamento de menores",
        "Portugal: endurecimento migratório (34 mil pedidos revisados, ~5 mil brasileiros afetados), novas exigências legais",
        "Brasil-Portugal: princípio da reciprocidade nas regras migratórias, possível tensionamento bilateral",
        "Mercosul: impacto da instabilidade argentina no bloco regional",
        "Tendência regional: polarização política, debate sobre corrupção e transparência, fragilidade institucional"
      ],
      "tips": [
        "Conecte eventos latino-americanos com impactos no Brasil — a FGV sempre busca essa ponte",
        "Caso Kirchner: entenda a diferença entre a acusação de \"perseguição política\" (discurso dos apoiadores) e a decisão judicial (fato consumado)",
        "Política migratória: Portugal não está sozinho — é uma tendência da União Europeia como um todo",
        "Colômbia: o atentado não é um caso isolado, mas parte de um histórico de violência política que remonta aos anos 1940"
      ],
      "errosComuns": [
        "Achar que a condenação de Kirchner é um fato isolado sem impacto regional — afeta Mercosul e relações bilaterais",
        "Confundir \"perseguição política\" (alegação da defesa) com a decisão judicial (confirmada pela Suprema Corte)",
        "Não perceber que as mudanças migratórias de Portugal seguem uma tendência mais ampla da União Europeia",
        "Tratar o atentado na Colômbia como evento criminal comum — é violência política com raízes históricas profundas"
      ],
      "usefulLinks": [
        { "label": "Bóson Treinamentos — MER e DER", "url": "https://www.bosontreinamentos.com.br/bancos-de-dados/curso-de-modelagem-de-dados/", "type": "documentacao" },
        { "label": "MER e DER na prática — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Q_KTYFgvu1s", "type": "video" }
      ]
    },
    {
      "title": "Economia global e desenvolvimento sustentável",
      "summary": "A economia global enfrenta risco de recessão com desaceleração de EUA e China, cadeias de suprimentos fragilizadas e alta do petróleo. O desenvolvimento sustentável envolve transição energética, mudanças climáticas e políticas ambientais.",
      "detail": "O Banco Mundial emitiu alerta de recessão global, com previsão de crescimento de apenas 1,8% em 2025. Os motores: desaceleração dos EUA (PIB caiu para 0,9% no 2º trimestre) e da China (queda nas exportações e consumo interno). Some-se a isso: cadeias de suprimentos fragilizadas (herança pós-pandemia), alta do petróleo (tensões no Oriente Médio), instabilidade geopolítica e fuga de capitais de países emergentes. No Brasil, o dólar subiu 4% após o relatório, e o Banco Central sinalizou possível revisão da política monetária. Em desenvolvimento sustentável, a transição energética é tema central: a disputa Trump-Musk sobre subsídios a veículos elétricos ilustra o tensionamento entre interesses econômicos tradicionais e inovação verde. O Acordo de Paris, as metas de emissão zero e a pressão por energias renováveis são temas recorrentes. A FGV cobra a interseção entre economia, sustentabilidade e geopolítica.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra indicadores econômicos (PIB, inflação, câmbio) contextualizados em eventos globais e a relação entre sustentabilidade e políticas públicas.",
      "examples": [
        {
          "question": "Por que a desaceleração da China afeta a economia global e o Brasil?",
          "answer": "A China é a segunda maior economia mundial e o maior parceiro comercial do Brasil. A queda nas exportações e no consumo interno chinês reduz a demanda por commodities (soja, minério de ferro, petróleo), afetando diretamente a balança comercial brasileira. Além disso, a desaceleração chinesa impacta cadeias de suprimentos globais, reduzindo o crescimento de países emergentes que dependem da demanda chinesa.",
          "aplication": "A FGV pode pedir a relação entre desaceleração chinesa → queda das commodities → impacto no PIB brasileiro → alta do dólar."
        },
        {
          "question": "Como as tensões geopolíticas afetam o preço do petróleo e a economia?",
          "answer": "Conflitos no Oriente Médio (Israel-Irã, ameaças ao Estreito de Ormuz) geram incerteza sobre o fornecimento de petróleo. Como ~20% do petróleo mundial passa por Ormuz, qualquer ameaça de interrupção dispara os preços. Petróleo mais caro eleva custos de produção e transporte, reduz o poder de compra dos consumidores e pressiona a inflação global — forçando bancos centrais a reverem políticas monetárias.",
          "aplication": "No Brasil: alta do petróleo → aumento dos combustíveis → pressão inflacionária → possível alta de juros pelo Banco Central."
        }
      ],
      "keyPoints": [
        "Alerta de recessão global: Banco Mundial prevê crescimento de apenas 1,8% em 2025",
        "Desaceleração dos EUA: PIB de 0,9% no 2º trimestre, enfraquecimento do motor econômico global",
        "Desaceleração da China: queda nas exportações e consumo interno, impacto nas commodities",
        "Cadeias de suprimentos: fragilizadas pós-pandemia, agravadas por tensões geopolíticas",
        "Petróleo: Estreito de Ormuz como ponto crítico, impacto da alta nos preços na inflação global",
        "Fuga de capitais: países emergentes sofrem com busca por mercados seguros em cenário de incerteza",
        "Transição energética: veículos elétricos, energias renováveis, subsídios verdes, Acordo de Paris",
        "Desenvolvimento sustentável: metas de emissão zero, pressão internacional, políticas ESG"
      ],
      "tips": [
        "Monte cadeias de causa e efeito: evento geopolítico → commodity → inflação → política monetária",
        "Brasil é muito sensível a: preço do petróleo, demanda chinesa por commodities e taxa de juros nos EUA",
        "Decore os pontos de estrangulamento: Ormuz (petróleo), Suez (comércio Ásia-Europa), Malaca (China)",
        "Sustentabilidade: conecte com economia (transição energética custa caro) e geopolítica (dependência de petróleo)",
        "A FGV adora perguntar \"qual o impacto no Brasil\" de um evento global — prepare-se para essa ponte"
      ],
      "errosComuns": [
        "Tratar economia global e sustentabilidade como temas separados — a FGV cobra a interseção entre eles",
        "Achar que recessão nos EUA não afeta o Brasil — afeta via commodities, câmbio e fluxo de capitais",
        "Ignorar a China como fator determinante para a economia brasileira — é nosso maior parceiro comercial",
        "Decorar números sem entender o mecanismo — mais importante que saber o PIB é entender o efeito cascata"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "Fundamentos de IA e Machine Learning",
      "summary": "Inteligência Artificial é a capacidade de sistemas computacionais realizarem tarefas que normalmente exigiriam inteligência humana. Machine Learning é o subcampo em que modelos aprendem padrões a partir de dados, sem programação explícita.",
      "detail": "A Inteligência Artificial (IA) abrange sistemas capazes de perceber, raciocinar, aprender e tomar decisões. O Machine Learning (ML) é o principal paradigma atual: em vez de programar regras explícitas, treina-se um modelo com dados para que ele aprenda padrões. Os tipos de aprendizado são: supervisionado (dados rotulados — ex: classificação de e-mails como spam/não spam), não supervisionado (dados não rotulados — ex: segmentação de clientes) e por reforço (aprendizado por tentativa e erro com recompensas — ex: jogos, robótica). Conceitos fundamentais incluem: conjunto de treino (dados usados para ajustar o modelo), validação (ajuste de hiperparâmetros) e teste (avaliação final). Overfitting ocorre quando o modelo memoriza os dados de treino e não generaliza para dados novos. Underfitting é quando o modelo é simples demais e não captura os padrões. Viés (bias) pode surgir dos dados de treinamento, perpetuando desigualdades.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra conceitos fundamentais de IA/ML no contexto de concursos de tecnologia (DATAPREV, SERPRO). Espera-se que o candidato domine a terminologia e saiba diferenciar os tipos de aprendizado.",
      "examples": [
        {
          "question": "Qual a diferença entre aprendizado supervisionado e não supervisionado?",
          "answer": "No supervisionado, os dados de treino possuem rótulos (labels) — o modelo aprende a mapear entradas para saídas conhecidas. Exemplo: classificar e-mails como spam (1) ou não spam (0). No não supervisionado, os dados não têm rótulos — o modelo encontra padrões, agrupamentos ou estruturas ocultas. Exemplo: segmentar clientes em grupos por comportamento de compra sem saber previamente quantos grupos existem.",
          "aplication": "A FGV pode apresentar um caso prático (ex: \"um sistema que prevê se um cliente vai cancelar o serviço\") e perguntar qual tipo de aprendizado é usado — resposta: supervisionado (há dados históricos rotulados)."
        },
        {
          "question": "O que é overfitting e como evitá-lo?",
          "answer": "Overfitting ocorre quando o modelo se ajusta excessivamente aos dados de treino, capturando ruídos e peculiaridades em vez de padrões gerais. O modelo tem desempenho excelente no treino mas péssimo em dados novos. Para evitar: use mais dados de treino, simplifique o modelo, use regularização (penaliza complexidade excessiva), validação cruzada e pare o treinamento antes de overfittar (early stopping).",
          "aplication": "A FGV pode descrever um cenário (\"modelo com 99% de acurácia no treino e 60% no teste\") e perguntar qual o problema — resposta: overfitting."
        }
      ],
      "keyPoints": [
        "IA: sistemas que simulam inteligência humana (percepção, raciocínio, aprendizado, decisão)",
        "ML: subcampo da IA — modelos aprendem com dados, sem programação explícita de regras",
        "Aprendizado supervisionado: dados rotulados, tarefas de classificação e regressão",
        "Aprendizado não supervisionado: dados não rotulados, clustering e redução de dimensionalidade",
        "Aprendizado por reforço: agente interage com ambiente, recebe recompensas/penalidades",
        "Treino/validação/teste: divisão dos dados para ajuste, calibração e avaliação do modelo",
        "Overfitting: modelo memoriza treino, não generaliza — alta acurácia no treino, baixa no teste",
        "Underfitting: modelo simples demais, não captura padrões — baixa acurácia em ambos",
        "Viés (bias): distorções nos dados de treino que levam a decisões injustas ou imprecisas"
      ],
      "tips": [
        "Decore a tríade: supervisionado = com rótulo, não supervisionado = sem rótulo, reforço = tentativa e erro",
        "Overfitting é o conceito mais cobrado em ML — saiba identificar pelos sintomas (treino bom, teste ruim)",
        "Associe cada tipo de aprendizado a exemplos práticos: classificação (supervisionado), segmentação (não supervisionado), jogos (reforço)",
        "Treino/validação/teste: treino ajusta pesos, validação ajusta hiperparâmetros, teste avalia resultado final",
        "Viés em IA é tema quente — a FGV pode cobrar a relação entre dados de treino enviesados e decisões discriminatórias"
      ],
      "errosComuns": [
        "Confundir IA com ML — ML é um subconjunto da IA, não são sinônimos",
        "Achar que não supervisionado significa \"sem intervenção humana\" — significa \"sem rótulos nos dados\"",
        "Inverter overfitting com underfitting — overfitting é complexo demais, underfitting é simples demais",
        "Achar que mais dados sempre resolve overfitting — pode ajudar, mas regularização e simplificação também são necessárias"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "IA Generativa e Modelos de Linguagem (LLMs)",
      "summary": "Modelos de IA generativa criam conteúdo novo (texto, imagem, áudio, código) a partir de padrões aprendidos. LLMs (Large Language Models) são modelos de linguagem treinados em corpora massivos, capazes de compreender e gerar texto em linguagem natural.",
      "detail": "A IA generativa representa um salto qualitativo em relação aos modelos tradicionais: em vez de apenas classificar ou prever, ela CRIA. Os Large Language Models (LLMs) como GPT, Claude e Gemini são treinados em bilhões de parâmetros sobre corpora textuais massivos, aprendendo padrões estatísticos da linguagem. O funcionamento básico envolve: tokenização (quebra do texto em unidades), embeddings (representação vetorial de tokens), arquitetura transformer (mecanismo de atenção que captura relações contextuais entre palavras) e geração autoregressiva (predição do próximo token). Aplicações: chatbots, assistentes de código, geração de conteúdo, tradução, sumarização. Limitações incluem: alucinações (geração de informações falsas com aparência de verdadeiras), janela de contexto finita, dependência da qualidade dos dados de treino e incapacidade de raciocínio verdadeiro (são modelos estatísticos, não sistemas lógicos).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Tema quentíssimo para a DATAPREV. A FGV cobrará conceitos (o que é um LLM, como funciona), aplicações práticas, limitações e diferenciação entre IA tradicional e generativa.",
      "examples": [
        {
          "question": "O que é um Large Language Model (LLM) e como ele funciona?",
          "answer": "Um LLM é um modelo de IA treinado em quantidades massivas de texto para compreender e gerar linguagem natural. Funciona em etapas: (1) tokenização — o texto é dividido em tokens (palavras ou subpalavras); (2) embeddings — tokens são convertidos em vetores numéricos que capturam significado; (3) transformer — arquitetura com mecanismo de atenção que pondera a relevância de cada token em relação aos demais; (4) geração — o modelo prevê o próximo token mais provável, gerando texto de forma autoregressiva. O treinamento é feito em GPUs/TPUs com bilhões de parâmetros ajustados por retropropagação.",
          "aplication": "A FGV pode perguntar \"qual arquitetura é a base dos LLMs modernos?\" — resposta: transformer (mecanismo de atenção). Ou \"o que significa dizer que a geração é autoregressiva?\" — resposta: cada token gerado depende dos tokens anteriores."
        },
        {
          "question": "O que são alucinações em LLMs e por que ocorrem?",
          "answer": "Alucinações são respostas geradas pelo modelo que parecem plausíveis mas são factualmente incorretas ou inventadas. Ocorrem porque LLMs são modelos estatísticos, não bancos de conhecimento: eles aprendem padrões de linguagem, não fatos. Quando o modelo encontra uma lacuna ou ambiguidade, ele \"completa\" com o token mais provável, o que pode produzir informações falsas. Alucinações são um dos principais desafios para adoção de LLMs em contextos críticos (saúde, direito, engenharia).",
          "aplication": "A FGV pode apresentar um caso em que um LLM gera uma informação incorreta e perguntar qual fenômeno explica isso — resposta: alucinação (hallucination)."
        }
      ],
      "keyPoints": [
        "IA generativa: cria conteúdo novo (texto, imagem, áudio, código, vídeo) — não apenas classifica",
        "LLM: modelo de linguagem de grande escala, treinado em corpora textuais massivos",
        "Arquitetura transformer: mecanismo de atenção, codificador-decodificador, base dos LLMs modernos",
        "Tokenização: quebra do texto em unidades processáveis (tokens)",
        "Embeddings: representação vetorial que captura relações semânticas entre palavras",
        "Geração autoregressiva: predição sequencial do próximo token",
        "Aplicações: chatbots, assistentes de código, tradução, sumarização, geração de conteúdo",
        "Limitações: alucinações, janela de contexto limitada, dependência dos dados de treino, ausência de raciocínio lógico",
        "Diferença IA tradicional vs generativa: tradicional classifica/prevê; generativa cria",
        "Fine-tuning: ajuste de um modelo pré-treinado para tarefas específicas com dados rotulados"
      ],
      "tips": [
        "Transformer é a palavra-chave — é a arquitetura que viabilizou os LLMs modernos",
        "Decore a diferença: IA discriminativa (classifica) vs IA generativa (cria)",
        "Alucinação é o calcanhar de Aquiles dos LLMs — a FGV vai cobrar, com certeza",
        "Associe LLMs com atenção (attention): o modelo \"presta atenção\" diferencial a diferentes partes do texto",
        "Fine-tuning ≠ treinamento do zero — é um ajuste fino sobre um modelo pré-treinado, mais rápido e barato"
      ],
      "errosComuns": [
        "Achar que LLMs \"entendem\" o que geram — são modelos estatísticos, não têm compreensão real",
        "Confundir transformer com transfer learning — transformer é a arquitetura (atenção), transfer learning é a técnica (aproveitar modelo pré-treinado)",
        "Achar que mais parâmetros sempre significa melhor modelo — qualidade dos dados e arquitetura também importam",
        "Subestimar o problema das alucinações — é o principal obstáculo para LLMs em aplicações críticas"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "Ética, governança e privacidade em IA",
      "summary": "A adoção de IA levanta desafios éticos (viés algorítmico, discriminação), de governança (transparência, explicabilidade, responsabilização) e de privacidade (proteção de dados, conformidade com LGPD e regulações setoriais).",
      "detail": "A ética em IA envolve garantir que sistemas automatizados não perpetuem ou amplifiquem desigualdades. O viés algorítmico pode surgir de dados de treino enviesados (ex: sistemas de recrutamento que discriminam por gênero), de escolhas de modelagem ou de feedback loops. A governança de IA busca estabelecer frameworks de transparência (o modelo é auditável?), explicabilidade (é possível entender por que o modelo tomou determinada decisão?) e responsabilização (quem responde por erros do modelo?). A privacidade em IA cruza diretamente com a LGPD: os dados de treino frequentemente incluem dados pessoais, e o titular tem direito a saber como seus dados são usados, inclusive em treinamento de modelos. A ISO 27001 (segurança da informação) e ISO 27701 (privacidade) são normas relevantes. Temas emergentes: deepfakes (risco de desinformação), consentimento para uso de dados em treino, direito à explicação de decisões automatizadas e regulação de IA (AI Act europeu, debates no Brasil).",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra ética e privacidade em IA de forma integrada com LGPD e segurança da informação. Espere questões sobre viés algorítmico, transparência e conformidade legal.",
      "examples": [
        {
          "question": "Como o viés algorítmico se manifesta em sistemas de IA?",
          "answer": "O viés algorítmico ocorre quando um modelo produz resultados sistematicamente injustos para determinados grupos. As fontes mais comuns são: (1) dados de treino enviesados — se o histórico de contratações favorece homens, o modelo aprenderá esse padrão; (2) viés de representação — grupos sub-representados nos dados têm desempenho pior; (3) feedback loops — o modelo reforça desigualdades existentes (ex: sistema de crédito que nega empréstimos a bairros periféricos, reduzindo ainda mais o acesso). A mitigação envolve auditoria de dados, métricas de equidade e diversidade nas equipes de desenvolvimento.",
          "aplication": "A FGV pode dar um exemplo real: \"um sistema de reconhecimento facial que erra mais em pessoas negras\" — a causa provável é viés nos dados de treino (sub-representação de rostos não-brancos)."
        },
        {
          "question": "Como a LGPD se aplica ao treinamento de modelos de IA?",
          "answer": "A LGPD estabelece que dados pessoais usados para treinar modelos de IA devem ter base legal (consentimento, legítimo interesse, etc.). O titular tem direito a: saber que seus dados estão sendo usados para treino, solicitar a exclusão (o que pode exigir retreinar o modelo — \"machine unlearning\"), e receber explicação sobre decisões automatizadas que o afetem. Além disso, o princípio da finalidade exige que o uso dos dados seja compatível com a finalidade original da coleta. Dados sensíveis (origem racial, orientação sexual, etc.) têm proteção reforçada.",
          "aplication": "A FGV pode cruzar LGPD com IA: \"Uma empresa quer usar dados de clientes para treinar um modelo de recomendação. O que a LGPD exige?\" — resposta: base legal, transparência, finalidade compatível e direito de oposição do titular."
        }
      ],
      "keyPoints": [
        "Viés algorítmico: discriminação sistemática causada por dados, modelagem ou feedback loops",
        "Fontes de viés: dados de treino enviesados, sub-representação, variáveis proxy, feedback loops",
        "Transparência: o modelo é auditável? Suas decisões podem ser explicadas?",
        "Explicabilidade (XAI): capacidade de entender por que o modelo tomou determinada decisão",
        "Responsabilização: quem responde por danos causados por IA? Desenvolvedor? Empresa? Usuário?",
        "LGPD e IA: base legal para tratamento, direito à explicação, machine unlearning, dados sensíveis",
        "ISO 27001: segurança da informação — proteção dos dados usados no treinamento",
        "ISO 27701: extensão da 27001 para privacidade — gestão de dados pessoais",
        "Deepfakes: risco de desinformação, necessidade de detecção e regulação",
        "AI Act (Europa): regulação baseada em risco (inaceitável, alto, limitado, mínimo)"
      ],
      "tips": [
        "Conecte ética com LGPD — a FGV trata esses temas de forma integrada, não isolada",
        "Decore as três dimensões da governança de IA: transparência, explicabilidade, responsabilização",
        "Viés não é só \"erro técnico\" — é um problema ético e social com consequências reais",
        "Machine unlearning é um conceito novo e importante: como \"desaprender\" dados de um modelo já treinado",
        "AI Act europeu é referência global — conheça a classificação por níveis de risco",
        "Para a DATAPREV, a interseção IA + LGPD + segurança da informação é o ponto mais provável de cobrança"
      ],
      "errosComuns": [
        "Achar que viés é sempre intencional — a maioria dos vieses é não intencional, decorrente dos dados",
        "Confundir explicabilidade com transparência — transparência é sobre o sistema; explicabilidade é sobre decisões específicas",
        "Achar que a LGPD não se aplica a IA porque \"os dados são anônimos\" — anonimização efetiva é difícil e muitas vezes os dados são pseudonimizados, não anônimos",
        "Ignorar que deepfakes são um problema de IA — a FGV pode cobrar no contexto de desinformação e segurança"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — ACID e transações", "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html", "type": "documentacao" },
        { "label": "ACID explicado — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=pomxJOFVcQs", "type": "video" }
      ]
    }
  ],
  "ingles": [
    {
      "title": "Compreensão geral e organização textual",
      "aliases": [
        "Reading comprehension"
      ],
      "summary": "A compreensão geral de um texto em inglês resulta da capacidade de integrar informações dispersas ao longo de parágrafos em uma representação mental coerente, articulando título, introdução, desenvolvimento e conclusão.",
      "detail": "A construção do sentido global na leitura em língua inglesa não depende do reconhecimento isolado de palavras, mas da articulação entre as partes do texto para identificar o propósito comunicativo predominante: informar, argumentar, narrar, descrever ou instruir. O reconhecimento do gênero textual é o ponto de partida: artigos de opinião tendem a apresentar tese nos parágrafos iniciais com argumentos de sustentação e refutação; relatórios técnicos adotam estrutura linear com dados, análise e implicações práticas. A leitura eficiente exige que o leitor ajuste velocidade e atenção conforme o objetivo: para captar a ideia central, a leitura rápida dos parágrafos de abertura e fechamento, associada à primeira frase de cada parágrafo intermediário (tópico frasal), permite construir o esboço do argumento principal sem processar cada palavra.",
      "peso": "Altíssima (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~60% das questões de Inglês. A banca cobra fortemente identificação de tema central, propósito do autor e ideia principal de cada parágrafo.",
      "examples": [
        {
          "question": "Como identificar o tema central de um texto em inglês de forma eficiente?",
          "answer": "Leia o título, o primeiro e o último parágrafo com atenção, e apenas a primeira frase (tópico frasal) de cada parágrafo intermediário. Textos expositivos e argumentativos em inglês costumam anunciar o assunto na primeira sentença de cada parágrafo.",
          "aplication": "A FGV frequentemente pergunta \"The main purpose of the text is...\" ou \"The text mainly discusses...\" — a resposta está na articulação entre tópicos frasais, não em detalhes isolados."
        },
        {
          "question": "Como a FGV cobra o reconhecimento de gênero textual?",
          "answer": "A banca apresenta textos de gêneros variados (artigos de opinião, notícias, relatórios técnicos, cartoons, nursery rhymes) e pergunta sobre o propósito comunicativo predominante ou a função de elementos específicos do gênero.",
          "aplication": "Exemplo real (FGV 2026): questão sobre texto \"Multiliteracy: the new basic skill\" perguntando sobre asserções baseadas no texto — exige identificar a diferença entre o que o texto afirma e o que as alternativas distorcem."
        }
      ],
      "keyPoints": [
        "Identificar o propósito comunicativo: informar, argumentar, narrar, descrever ou instruir",
        "Reconhecer o gênero textual como ponto de partida para expectativas de leitura",
        "Usar tópico frasal (topic sentence): primeira frase de cada parágrafo anuncia o assunto",
        "Ajustar velocidade de leitura conforme o objetivo (skimming para visão geral, scanning para dados pontuais)",
        "Articular título, introdução, desenvolvimento e conclusão para sentido global"
      ],
      "tips": [
        "Leia a primeira e a última frase de cada parágrafo antes de mergulhar no texto completo",
        "Pergunte-se: \"What is the author's main purpose?\" antes de olhar as alternativas",
        "Desconfie de alternativas que repetem palavras do texto mas distorcem o sentido global",
        "A FGV adora colocar uma alternativa correta \"no mundo real\" mas não sustentada pelo texto — fique atento"
      ],
      "errosComuns": [
        "Ler o texto inteiro palavra por palavra sem antes fazer skimming — perda de tempo na prova",
        "Confundir informação verdadeira no mundo real com informação sustentada pelo texto",
        "Fixar-se em um detalhe do meio do texto e ignorar a articulação com introdução e conclusão"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Coesão e coerência no discurso",
      "summary": "Coesão são os mecanismos linguísticos explícitos de conexão (conectores, pronomes, substituições). Coerência é a continuidade lógica e conceitual do sentido, mesmo sem marcadores visíveis.",
      "detail": "A organização semântica e discursiva de um texto em inglês manifesta-se por coesão (mecanismos explícitos de conexão) e coerência (continuidade lógica do sentido). Um texto pode ser coeso mas incoerente, ou coerente mesmo com poucos conectivos — desde que o leitor reconstrua as relações lógicas implícitas. Os principais mecanismos coesivos são: referência anafórica (pronome retoma termo anterior), referência catafórica (termo antecipa o que vem depois), substituição lexical (sinônimos para evitar repetição) e elipse (omissão de termo recuperável pelo contexto). A FGV cobra especialmente a identificação do referente de pronomes e a função de conectivos discursivos.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em questões de referência pronominal, substituição lexical e identificação da relação lógica entre parágrafos.",
      "examples": [
        {
          "question": "Quais são os conectivos discursivos mais cobrados pela FGV em inglês?",
          "answer": "Adição: moreover, furthermore, in addition. Contraste: however, nevertheless, on the other hand. Causa/consequência: therefore, as a result, consequently. Tempo: subsequently, meanwhile, eventually. Exemplificação: for instance, such as. A FGV não pergunta a tradução, mas a função do conector na relação lógica entre as ideias.",
          "aplication": "Exemplo real (FGV 2025): questão com \"Yet\" no início do segundo parágrafo — a banca testa se o candidato reconhece que \"yet\" é polissêmico e, naquele contexto, funciona como contraste (\"no entanto\"), não como tempo (\"ainda\")."
        },
        {
          "question": "Como identificar o referente de um pronome em texto da FGV?",
          "answer": "Localize o pronome e volte na leitura para encontrar o último substantivo compatível em número e gênero que faça sentido lógico. Cuidado: a FGV coloca múltiplos substantivos antes do pronome para confundir — o referente correto é o que mantém a coerência da frase.",
          "aplication": "Exemplo real (FGV 2025): \"and some of these are discussed below\" — o referente de \"these\" são os \"many important aspects of teaching the second culture\", não \"facets and manifestations\" que aparece antes."
        }
      ],
      "keyPoints": [
        "Referência anafórica: pronome/expressão retoma termo anterior (mais comum)",
        "Referência catafórica: termo antecipa o que será mencionado (mais rara)",
        "Substituição lexical: sinônimos e expressões equivalentes para evitar repetição",
        "Elipse: omissão de termo recuperável pelo contexto",
        "Conectivos de adição: moreover, furthermore, in addition, also",
        "Conectivos de contraste: however, nevertheless, on the other hand, although, yet",
        "Conectivos de causa/consequência: therefore, as a result, consequently, thus, hence",
        "Conectivos de exemplificação: for instance, such as, for example"
      ],
      "tips": [
        "Ao identificar referentes, substitua mentalmente o pronome pelo candidato a referente e veja se a frase mantém sentido",
        "A função do conector importa mais que sua tradução — \"however\" sempre indica contraste/oposição",
        "Cuidado com \"yet\": pode ser advérbio de tempo (\"ainda\") ou conjunção adversativa (\"no entanto\")",
        "A FGV frequentemente testa \"these/those/they/it\" — destaque-os durante a leitura"
      ],
      "errosComuns": [
        "Traduzir \"yet\" sempre como \"ainda\" — em posição de contraste, significa \"no entanto\"",
        "Confundir o referente de um pronome por proximidade (o mais próximo nem sempre é o correto)",
        "Não perceber elipse verbal e achar que a frase está incompleta"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Localização de informações, inferência e predição",
      "summary": "A localização de informações específicas (scanning) difere da compreensão global. A inferência permite deduzir o não explícito a partir de pistas textuais. A predição antecipa o desenvolvimento do texto.",
      "detail": "O reconhecimento de informações específicas exige leitura por varredura (scanning): o olhar percorre o texto em busca de marcadores visuais (datas, nomes, números, palavras-chave) sem processar cada sentença integralmente. Já a inferência é a capacidade de deduzir informações não explícitas a partir de pistas linguísticas e contextuais. A inferência lexical ocorre quando o leitor deduz o significado de uma palavra desconhecida pelo contexto (posição na oração, relação morfológica, aposições explicativas). A inferência proposicional envolve deduzir relações lógicas entre ideias sem conectores explícitos. A predição é a antecipação do conteúdo a partir de título, subtítulos e primeiras sentenças — o leitor formula hipóteses que serão confirmadas ou refutadas.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Muito cobrada em questões com \"It can be inferred from the text that...\" ou \"According to the text...\" e na localização de dados pontuais.",
      "examples": [
        {
          "question": "Qual a diferença entre scanning e skimming?",
          "answer": "Skimming é leitura rápida para captar a ideia geral (título, primeiro/último parágrafo, tópicos frasais). Scanning é leitura de varredura para localizar um dado específico (data, nome, número), percorrendo o texto em busca de marcadores visuais sem ler tudo.",
          "aplication": "A FGV alterna entre os dois tipos: questões de tema central exigem skimming; questões de \"According to the text, in which year...\" exigem scanning."
        },
        {
          "question": "Como funciona a inferência lexical na prova da FGV?",
          "answer": "Quando você encontra uma palavra desconhecida, use o contexto: a posição sintática (substantivo, verbo, adjetivo?), prefixos/sufixos conhecidos, e pistas na própria frase como aposições (explicações entre vírgulas) ou reformulações. A FGV espera que você deduza o sentido sem dicionário.",
          "aplication": "Exemplo real (FGV 2026): \"the comparatively well off\" — mesmo sem saber \"well off\", o contexto \"compassion of the very poor for the comparatively well off\" indica contraste com \"poor\", logo \"well off\" = \"wealthy\"."
        }
      ],
      "keyPoints": [
        "Scanning: busca de dados pontuais (datas, nomes, números) por varredura visual",
        "Skimming: leitura rápida para ideia geral (título, início, fim, tópicos frasais)",
        "Inferência lexical: deduzir significado de palavra pelo contexto, morfologia e pistas sintáticas",
        "Inferência proposicional: deduzir relações lógicas não marcadas por conectores explícitos",
        "Predição: antecipar conteúdo a partir de título, subtítulos e elementos iniciais do texto",
        "Diferenciar \"According to the text...\" (informação explícita) de \"It can be inferred...\" (informação implícita)"
      ],
      "tips": [
        "Em questões de inferência, elimine primeiro as alternativas que contradizem o texto ou não têm suporte textual",
        "Para scanning, transforme a pergunta em palavras-chave e \"escaneie\" o texto com os olhos",
        "A inferência correta sempre tem âncora no texto — não é \"achismo\" nem conhecimento de mundo",
        "Desconfie de alternativas com palavras idênticas às do texto mas sentido distorcido (pegadinha clássica)"
      ],
      "errosComuns": [
        "Tratar \"infer\" como sinônimo de \"find explicitly stated\" — inferência é dedução, não localização",
        "Fazer scanning para questões de ideia central — a resposta não está em um ponto isolado do texto",
        "Deduzir significado de palavra isolada sem verificar o contexto da frase inteira"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Análise, síntese e vocabulário",
      "aliases": [
        "Vocabulário de tecnologia"
      ],
      "summary": "A análise decompõe o texto em partes para identificar funções (tese, evidência, refutação). A síntese reorganiza as informações em representação condensada. O vocabulário abrange sinonímia e antonímia.",
      "detail": "A análise textual envolve decompor o texto em partes constitutivas e identificar a função de cada uma: quais parágrafos apresentam a tese, quais introduzem evidências, quais antecipam e refutam objeções. A síntese reorganiza as informações analisadas em representação condensada, preservando relações lógicas essenciais e descartando redundâncias. Exige discernimento sobre hierarquia de informações: ideias centrais vs. exemplos e digressões. O domínio do vocabulário de alta frequência (verbos auxiliares, preposições, conjunções, pronomes, substantivos e adjetivos de uso corrente) é a base da fluência leitora. A sinonímia em inglês raramente é total — palavras como \"big\" e \"enormous\" compartilham núcleo semântico mas diferem em intensidade. A antonímia pode ser gradual (hot/cold), complementar (true/false) ou relacional (buy/sell).",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em questões de vocabulário contextual e distinção entre ideia principal e informação acessória.",
      "examples": [
        {
          "question": "Quais os tipos de relação semântica que a FGV explora em sinonímia e antonímia?",
          "answer": "Sinonímia total (equivalentes em todos os contextos — rara), sinonímia parcial (próximos mas com variação de intensidade, formalidade ou conotação). Antonímia gradual (hot/cold — admite graus intermediários), antonímia complementar (true/false — exclusão mútua), antonímia relacional (buy/sell — papéis opostos na mesma relação).",
          "aplication": "A FGV pede substituição de palavras mantendo o sentido no contexto — a pegadinha é o sinônimo parcial que não preserva a nuance (intensidade, formalidade) do termo original."
        },
        {
          "question": "Como distinguir ideia principal de informação acessória?",
          "answer": "A ideia principal é a proposição que o texto defende ou explica — sem ela, o texto perde o sentido. Informações acessórias são exemplos, dados estatísticos, citações que reforçam a ideia principal mas não a substituem. Se um parágrafo inteiro é um exemplo, a ideia principal está no parágrafo anterior ou seguinte que ele ilustra.",
          "aplication": "Exemplo real (FGV 2025): texto sobre \"Social Dimensions of Climate Change\" — o parágrafo sobre trabalhadores da agricultura e pesca é exemplificação da ideia principal de que \"os mais pobres e vulneráveis sofrem mais com as mudanças climáticas\"."
        }
      ],
      "keyPoints": [
        "Análise: decompor o texto e identificar função de cada parágrafo (tese, evidência, refutação, exemplificação)",
        "Síntese: reorganizar informações essenciais descartando redundâncias e exemplos acessórios",
        "Hierarquização: distinguir ideias centrais de exemplos, digressões e comentários acessórios",
        "Sinonímia total: rara — significado equivalente em todos os contextos",
        "Sinonímia parcial: mais comum — variação de intensidade, formalidade ou conotação",
        "Antonímia gradual: admite graus intermediários (hot/warm/cool/cold)",
        "Antonímia complementar: exclusão mútua, sem meio-termo (alive/dead, true/false)",
        "Antonímia relacional: papéis opostos na mesma relação (buy/sell, give/receive)"
      ],
      "tips": [
        "Ao substituir uma palavra no contexto, verifique se o sinônimo preserva intensidade e formalidade",
        "Para síntese, pergunte-se: \"Se eu removesse este parágrafo, o argumento central se mantém?\"",
        "A FGV adora testar substituição de \"big\" por \"enormous\" ou vice-versa — a intensidade muda",
        "Vocabulário de alta frequência deve estar automatizado para liberar cognição para termos específicos"
      ],
      "errosComuns": [
        "Achar que todo sinônimo é intercambiável — a sinonímia é quase sempre contextual e parcial",
        "Confundir um exemplo extenso com a ideia principal do texto",
        "Tratar antonímia gradual como complementar (ou vice-versa) — \"hot\" e \"cold\" não são mutuamente excludentes"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Funções retóricas, metáfora e metonímia",
      "summary": "Funções retóricas são os propósitos comunicativos de cada trecho (definição, comparação, causa-efeito, refutação). Metáfora transpõe significado entre domínios; metonímia baseia-se em contiguidade lógica.",
      "detail": "As funções retóricas correspondem aos propósitos comunicativos específicos de cada trecho do texto, independentemente do conteúdo temático. Reconhecê-las permite identificar quando um parágrafo tem função de definição, comparação/contraste, classificação, causa e efeito ou refutação — mesmo sem conectivos explícitos. Textos acadêmicos e técnicos em inglês frequentemente seguem sequência previsível: apresentação do problema → tentativas anteriores de solução → lacunas → proposta do autor. A metáfora transpõe significado de um domínio conceitual para outro por semelhança (ex.: \"the economy is fragile\", \"time is running out\"). A metonímia baseia-se em contiguidade ou associação lógica (ex.: \"the White House announced\", \"Wall Street reacted\"). Essas figuras não se restringem a textos literários — são recorrentes em textos jornalísticos, econômicos e políticos.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Aparece em questões que pedem para identificar a função de um parágrafo ou interpretar linguagem figurada em textos técnicos e jornalísticos.",
      "examples": [
        {
          "question": "Como identificar a função retórica de um parágrafo?",
          "answer": "Observe o que o parágrafo \"faz\" no texto: apresenta um conceito novo? (definição). Compara dois elementos? (comparação/contraste). Mostra consequências? (causa-efeito). Responde a uma objeção? (refutação). Organiza elementos em categorias? (classificação). A função é independente do tema — dois parágrafos sobre assuntos diferentes podem ter a mesma função retórica.",
          "aplication": "A FGV pergunta \"In paragraph X, the author...\" — o verbo da alternativa correta revela a função: defines, compares, exemplifies, refutes, concludes."
        },
        {
          "question": "Metáfora e metonímia caem em prova da FGV?",
          "answer": "Sim, especialmente em textos jornalísticos e econômicos. A banca espera que você reconheça que \"the economy is fragile\" não é literal (economia não quebra como vidro) e que \"Wall Street reacted\" significa que o mercado financeiro reagiu, não a rua literalmente.",
          "aplication": "A interpretação correta dessas figuras evita o erro de tomar o sentido literal onde o autor usa sentido figurado — armadilha comum nas alternativas."
        }
      ],
      "keyPoints": [
        "Função retórica: propósito comunicativo do trecho (definir, comparar, classificar, refutar, exemplificar)",
        "Estrutura de comparação/contraste: avalia semelhanças e diferenças entre elementos",
        "Estrutura de causa/efeito: estabelece relações de determinação entre fenômenos",
        "Estrutura de classificação: organiza elementos em categorias segundo critérios explícitos",
        "Metáfora: transposição de sentido por semelhança — comum em textos econômicos e políticos",
        "Metonímia: substituição por contiguidade lógica — instituição pela decisão, lugar pelas pessoas",
        "Linguagem figurada é recorrente em textos não literários cobrados pela FGV"
      ],
      "tips": [
        "Pergunte: \"O que este parágrafo está FAZENDO?\" — não \"sobre o que ele está falando?\"",
        "Metáforas conceituais recorrentes: debate = guerra, economia = organismo, tempo = recurso",
        "Ao encontrar \"The White House said...\", lembre-se: é metonímia — foram os representantes, não o prédio",
        "Identificar o padrão retórico ajuda a prever o tipo de informação que virá na sequência"
      ],
      "errosComuns": [
        "Interpretar literalmente expressões metafóricas em textos jornalísticos",
        "Confundir a função retórica com o tema do parágrafo — um parágrafo sobre IA pode ter função de exemplificação",
        "Não reconhecer metonímia e achar que o texto fala literalmente do lugar físico"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "Itens gramaticais relevantes para compreensão",
      "aliases": [
        "Estruturas gramaticais"
      ],
      "summary": "Domínio de estruturas gramaticais essenciais para a interpretação: modal verbs, tempos verbais, voz passiva, orações condicionais, pronomes relativos e comparativos/superlativos.",
      "detail": "Itens gramaticais são cobrados pela FGV não de forma isolada (decoreba de regras), mas como ferramentas para a compreensão do texto. Modal verbs são centrais: \"should\" indica recomendação/sugestão, \"must\" indica obrigação, \"may/might\" indicam possibilidade, \"can\" indica capacidade ou permissão. A FGV pergunta: \"The modal verb indicates a(n): obligation / suggestion / permission / prediction\". Os tempos verbais situam a linha do tempo do texto. A voz passiva é frequente em textos técnicos e científicos. As orações condicionais (if-clauses) estabelecem relações de condição-consequência. Pronomes relativos (who, which, that, whose) introduzem orações adjetivas restritivas ou explicativas — a presença ou ausência de vírgula muda o sentido (restritiva sem vírgula, explicativa com vírgula).",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em questões específicas de gramática contextualizada e na interpretação de relações lógicas marcadas por estruturas gramaticais.",
      "examples": [
        {
          "question": "Como a FGV cobra modal verbs?",
          "answer": "A banca apresenta um trecho com modal verb e pergunta qual o sentido: \"should\" = recomendação/sugestão; \"must\" = obrigação/necessidade; \"may/might/could\" = possibilidade; \"can\" = capacidade ou permissão; \"will\" = predição ou futuro certo. A FGV não pede para conjugar, mas para interpretar a função.",
          "aplication": "Exemplo real (FGV 2025): \"They should be engaged as partners\" — \"should\" indica suggestion/recommendation, não obligation. A alternativa correta era \"suggestion\"."
        },
        {
          "question": "Qual a diferença entre oração relativa restritiva e explicativa em inglês?",
          "answer": "Restritiva (sem vírgula): delimita o antecedente. Ex.: \"The students who studied passed\" (só os que estudaram passaram). Explicativa (com vírgula): acrescenta informação adicional. Ex.: \"The students, who studied, passed\" (todos os alunos estudaram e passaram). A mesma lógica do português — a vírgula muda completamente o sentido.",
          "aplication": "A FGV pode perguntar se a remoção da oração relativa altera o sentido — se for explicativa, não altera; se for restritiva, altera."
        }
      ],
      "keyPoints": [
        "Modal verbs: should (sugestão), must (obrigação), may/might/could (possibilidade), can (capacidade/permissão)",
        "Tempos verbais: Simple Present (fatos/rotina), Simple Past (ações concluídas), Present Perfect (ação com efeito presente)",
        "Voz passiva: frequente em textos técnicos — foco na ação, não no agente",
        "Orações condicionais: First Conditional (provável), Second Conditional (hipotética), Third Conditional (impossível)",
        "Pronomes relativos: who (pessoas), which (coisas/animais), that (ambos), whose (posse)",
        "Comparativos: -er / more... than; Superlativos: -est / the most..."
      ],
      "tips": [
        "Modal verbs: memorize a tabela de função, não de tradução — a FGV pergunta a função",
        "\"Should\" NÃO é obrigação forte — é recomendação; obrigação forte é \"must\" ou \"have to\"",
        "Voz passiva: identifique pelo verbo \"to be\" + particípio passado — comum em abstracts e artigos científicos",
        "A FGV contextualiza a gramática — você não precisa saber a regra de cor, mas interpretar o efeito no texto"
      ],
      "errosComuns": [
        "Confundir \"should\" (recomendação) com \"must\" (obrigação) — erro clássico em questões de modal verbs",
        "Traduzir \"may\" sempre como \"pode\" (permissão) — frequentemente é possibilidade, não permissão",
        "Não perceber que \"would\" em texto técnico quase sempre indica hipótese/condicionalidade, não futuro do pretérito"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    }
  ],
  "legislacao": [
    {
      "title": "Lei de Acesso à Informação (LAI) — Lei 12.527/2011",
      "summary": "A LAI regulamenta o direito constitucional de acesso a informações públicas, estabelecendo que a publicidade é a regra e o sigilo é exceção. Abrange toda a administração pública e entidades privadas que recebam recursos públicos.",
      "detail": "A Lei 12.527/2011 (LAI) regulamenta o direito fundamental de acesso à informação previsto na Constituição Federal (art. 5º, XXXIII; art. 37, §3º, II; art. 216, §2º). Aplica-se à União, Estados, DF e Municípios, abrangendo administração direta (Executivo, Legislativo, Judiciário, MP), autarquias, fundações, empresas públicas e sociedades de economia mista (art. 1º). Alcança também entidades privadas sem fins lucrativos que recebam recursos públicos (art. 2º). As diretrizes fundamentais (art. 3º): publicidade como regra e sigilo como exceção; divulgação independente de solicitações (transparência ativa); uso de tecnologia da informação; cultura de transparência; controle social. A lei define: informação (dados, processados ou não, em qualquer suporte), documento (unidade de registro), informação sigilosa (restrição temporária por imprescindibilidade à segurança), informação pessoal (pessoa natural identificada ou identificável), tratamento da informação (conjunto de ações desde produção até eliminação), disponibilidade, autenticidade, integridade e primariedade (art. 4º). O acesso é franqueado mediante procedimentos objetivos e ágeis (art. 5º). Prazos: resposta em até 20 dias (prorrogável por mais 10, com justificativa) — art. 11. Recurso contra indeferimento: 10 dias para interpor, autoridade superior decide em 5 dias (art. 15). Na esfera federal, cabe recurso à CGU (5 dias) e depois à Comissão Mista de Reavaliação de Informações (art. 16).",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra LAI em concursos de TI, especialmente para órgãos públicos (DATAPREV, SERPRO). Questões focam em prazos, classificações de sigilo, direitos do requerente e transparência ativa vs passiva.",
      "examples": [
        {
          "question": "Quais são os graus de sigilo e seus respectivos prazos máximos na LAI?",
          "answer": "Art. 24: ultrassecreta — 25 anos; secreta — 15 anos; reservada — 5 anos. Os prazos vigoram a partir da data de produção da informação. Informações que coloquem em risco a segurança do Presidente, Vice-Presidente e familiares são classificadas como reservadas e ficam sob sigilo até o término do mandato (ou último mandato, em caso de reeleição). Transcorrido o prazo ou consumado o evento que define o termo final, a informação torna-se automaticamente de acesso público (§4º). Deve-se sempre usar o critério menos restritivo possível (§5º).",
          "aplication": "Questão típica: \"Uma informação classificada como secreta em 2020 estará disponível ao público em qual ano?\" → 2035 (15 anos). Ou: \"Qual o prazo máximo de restrição para informação ultrassecreta?\" → 25 anos."
        },
        {
          "question": "Quem tem competência para classificar informações em cada grau de sigilo?",
          "answer": "Art. 27: ultrassecreta — Presidente, Vice-Presidente, Ministros de Estado e equivalentes, Comandantes das Forças Armadas, Chefes de Missões Diplomáticas (delegação permitida, vedada subdelegação). Secreta — os anteriores + titulares de autarquias, fundações, empresas públicas e sociedades de economia mista. Reservada — todos os anteriores + ocupantes de funções de direção, comando ou chefia nível DAS 101.5 ou superior. A classificação como ultrassecreta pelos Comandantes e Chefes de Missões deve ser ratificada pelos respectivos Ministros.",
          "aplication": "A FGV pode perguntar se um \"chefe de setor\" pode classificar como secreta → não, apenas reservada (se tiver DAS 101.5 ou superior)."
        }
      ],
      "keyPoints": [
        "Diretrizes (art. 3º): publicidade como regra, sigilo como exceção; divulgação independente de solicitações",
        "Abrangência (art. 1º-2º): toda administração direta e indireta + entidades privadas que recebam verba pública",
        "Graus de sigilo (art. 24): ultrassecreta (25 anos), secreta (15 anos), reservada (5 anos)",
        "Competência para classificação (art. 27): ultrassecreta (Presidente, VP, Ministros, Comandantes, Chefes de Missão), secreta (+ dirigentes de autarquias/EP/SEM), reservada (+ DAS 101.5 ou superior)",
        "Prazos de resposta (art. 11): 20 dias + prorrogação de 10 dias com justificativa",
        "Recursos (art. 15-16): 10 dias para interpor, autoridade superior em 5 dias; CGU em 5 dias; Comissão Mista",
        "Informações pessoais (art. 31): acesso restrito por 100 anos (não depende de classificação de sigilo)",
        "Transparência ativa (art. 8º): divulgação obrigatória em sites oficiais, independente de pedido",
        "Pedido de acesso (art. 10): qualquer interessado, qualquer meio legítimo, vedada exigência de motivação",
        "Serviço gratuito (art. 12): busca e fornecimento gratuitos; cobrança apenas de custos de reprodução",
        "Condutas ilícitas (art. 32): recusar, retardar, fornecer incorretamente, destruir, ocultar informações",
        "Sanções (art. 33): advertência, multa, rescisão do vínculo, suspensão de licitar (≤ 2 anos), inidoneidade"
      ],
      "tips": [
        "Decore os prazos: 20+10 (resposta), 10 (recurso), 5 (decisão), 25/15/5 (sigilo), 100 (pessoais)",
        "Transparência ativa = sem pedido (proativa); transparência passiva = mediante solicitação (SIC)",
        "A LAI se aplica a entidades privadas SEM FINS LUCRATIVOS que recebam verba pública → não abrange empresas privadas comuns",
        "Informações pessoais: prazo de 100 anos NÃO depende de classificação — é automático",
        "Vedação de exigência de motivação (art. 10, §3º) é cláusula pétrea da LAI — sempre cai",
        "Critério menos restritivo possível (art. 24, §5º): se puder classificar como reservada, não classifique como secreta"
      ],
      "errosComuns": [
        "Confundir transparência ativa (proativa, sem pedido) com passiva (mediante solicitação via SIC)",
        "Achar que entidades privadas com fins lucrativos estão sujeitas à LAI — apenas as sem fins lucrativos que recebem verba pública",
        "Trocar os prazos de sigilo: ultrassecreta (25) ≠ secreta (15) ≠ reservada (5)",
        "Achar que classificação de ultrassecreta pode ser feita por qualquer autoridade — é restrita ao alto escalão",
        "Esquecer que o prazo de 100 anos para informações pessoais independe de classificação formal de sigilo",
        "Confundir recurso à CGU (acesso negado) com recurso por desclassificação (Ministro de Estado)"
      ],
      "usefulLinks": [
        { "label": "Auth0 — Guia de OAuth 2.0", "url": "https://auth0.com/intro-to-iam/what-is-oauth-2", "type": "documentacao" },
        { "label": "jwt.io — JSON Web Tokens", "url": "https://jwt.io/introduction", "type": "documentacao" },
        { "label": "OAuth 2.0 e JWT — Código Fonte TV", "url": "https://www.youtube.com/watch?v=68azMcqPpyo", "type": "video" }
      ]
    },
    {
      "title": "Marco Civil da Internet — Lei 12.965/2014",
      "summary": "O Marco Civil da Internet estabelece princípios, garantias, direitos e deveres para o uso da internet no Brasil. Seus pilares são: neutralidade de rede, privacidade, liberdade de expressão e responsabilidade civil dos provedores.",
      "detail": "A Lei 12.965/2014 (Marco Civil da Internet) é o marco regulatório da internet no Brasil. Funda-se em três pilares: (1) neutralidade de rede — os provedores de conexão devem tratar todos os pacotes de dados de forma isonômica, sem discriminação por conteúdo, origem, destino, serviço, terminal ou aplicação (art. 9º); (2) privacidade e proteção de dados — guarda de registros de conexão (1 ano) e de acesso a aplicações (6 meses) pelos provedores, com acesso mediante ordem judicial (arts. 10-17); (3) responsabilidade civil — o provedor de aplicações só pode ser responsabilizado civilmente por danos decorrentes de conteúdo de terceiros se, após ordem judicial específica, não remover o conteúdo (art. 19). A exceção é para conteúdo de nudez/violência sexual não consentida (art. 21): basta notificação extrajudicial. Os princípios (art. 3º) incluem: liberdade de expressão, privacidade, proteção de dados (LGPD), neutralidade de rede, preservação da natureza participativa da rede, responsabilização dos agentes conforme suas atividades, e liberdade dos modelos de negócios. A disciplina legal da internet no Brasil tem como fundamentos (art. 2º): a liberdade de expressão, os direitos humanos, a pluralidade, a livre iniciativa e a defesa do consumidor.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra principalmente neutralidade de rede, guarda de registros (prazos de 1 ano e 6 meses) e responsabilidade civil dos provedores (necessidade de ordem judicial, exceto revenge porn).",
      "examples": [
        {
          "question": "Qual a diferença entre o regime de responsabilidade civil do art. 19 e do art. 21 do Marco Civil?",
          "answer": "Art. 19 (regra geral): o provedor de aplicações só responde por conteúdo de terceiros se, após ordem judicial específica, não remover o conteúdo no prazo determinado. Ou seja, a responsabilidade é subsidiária e depende de decisão judicial prévia. Art. 21 (exceção): para conteúdo de nudez, atos sexuais ou violência sexual não consentida (\"revenge porn\"), basta notificação extrajudicial do ofendido para que o provedor seja obrigado a remover — a omissão gera responsabilidade, independentemente de ordem judicial.",
          "aplication": "A FGV apresenta um cenário: \"Um usuário posta conteúdo ofensivo em uma rede social. A vítima notifica extrajudicialmente o provedor. O provedor não remove.\" O art. 19 protege o provedor (precisa de ordem judicial), EXCETO se for revenge porn (art. 21)."
        },
        {
          "question": "Qual o prazo de guarda dos registros de conexão e de acesso a aplicações?",
          "answer": "Registros de conexão (provedor de conexão — ex: operadoras de internet): guarda obrigatória por 1 ANO (art. 13). Registros de acesso a aplicações (provedor de aplicações — ex: redes sociais, e-mail): guarda obrigatória por 6 MESES (art. 15). Ambos devem ser mantidos em ambiente controlado e seguro, e o acesso por terceiros (incluindo autoridades) depende de ordem judicial.",
          "aplication": "A FGV pode perguntar: \"Por quanto tempo um provedor de aplicações deve guardar os registros de acesso?\" → 6 meses. Ou \"Uma operadora de internet deve guardar registros de conexão por quanto tempo?\" → 1 ano."
        }
      ],
      "keyPoints": [
        "Neutralidade de rede (art. 9º): isonomia no tratamento dos pacotes, proibida discriminação por conteúdo/origem/destino",
        "Privacidade: guarda de registros de conexão (provedor de conexão) → 1 ano (art. 13)",
        "Guarda de registros de acesso a aplicações (provedor de aplicações) → 6 meses (art. 15)",
        "Acesso a registros: somente mediante ordem judicial (art. 10, §1º e art. 22)",
        "Responsabilidade civil (art. 19): provedor só responde após descumprir ordem judicial (regra geral)",
        "Exceção revenge porn (art. 21): basta notificação extrajudicial — remoção obrigatória imediata",
        "Princípios (art. 3º): liberdade de expressão, privacidade, proteção de dados, neutralidade, participação",
        "Fundamentos (art. 2º): liberdade de expressão, direitos humanos, pluralidade, livre iniciativa, defesa do consumidor",
        "Provedor de conexão ≠ provedor de aplicações: guardam registros diferentes e por prazos diferentes",
        "Decisões judiciais podem determinar a guarda por prazo superior ao legal em casos específicos"
      ],
      "tips": [
        "Decore: 1 ano (conexão) vs 6 meses (aplicações) — é a distinção mais cobrada",
        "Regra de ouro da responsabilidade: PRECISA de ordem judicial (art. 19), EXCETO revenge porn (art. 21)",
        "Neutralidade de rede = não pode discriminar tráfego; mas pode fazer gestão técnica para garantir qualidade",
        "Guarda de registros ≠ disponibilização — guardar é obrigatório; fornecer a terceiros depende de ordem judicial",
        "Provedor de conexão (ex: Vivo, Claro) ≠ provedor de aplicações (ex: Google, Facebook) — questões da FGV adoram misturar"
      ],
      "errosComuns": [
        "Inverter os prazos: conexão = 1 ano (maior), aplicações = 6 meses (menor)",
        "Achar que notificação extrajudicial sempre gera dever de remoção — só no caso do art. 21 (revenge porn)",
        "Confundir neutralidade de rede com ausência total de regulação — gestão técnica para qualidade é permitida",
        "Achar que o Marco Civil regula crimes cibernéticos — isso é a Lei 12.737/2012 (Carolina Dieckmann)",
        "Esquecer que o provedor de aplicações também tem dever de guarda (6 meses), não só o de conexão"
      ],
      "usefulLinks": [
        { "label": "W3C — Web Standards", "url": "https://www.w3.org/standards/", "type": "documentacao" },
        { "label": "Internet, Intranet e Extranet — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=5hEW8kC3qxI", "type": "video" }
      ]
    },
    {
      "title": "LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018)",
      "summary": "A LGPD regula o tratamento de dados pessoais no Brasil, estabelecendo fundamentos, princípios, direitos dos titulares, obrigações de controladores e operadores, e sanções administrativas. Aplica-se a qualquer operação de tratamento realizada no Brasil ou que oferte bens/serviços a titulares brasileiros.",
      "detail": "A Lei 13.709/2018 (LGPD) é a norma central de proteção de dados no Brasil. Seus fundamentos (art. 2º) incluem: respeito à privacidade, autodeterminação informativa, liberdade de expressão, inviolabilidade da intimidade, direitos humanos, livre iniciativa, defesa do consumidor e desenvolvimento econômico e tecnológico. Aplica-se (art. 3º) a qualquer operação de tratamento realizada no Brasil, que tenha por objetivo a oferta de bens/serviços a titulares no Brasil, ou que envolva dados coletados no Brasil. Define: dado pessoal (informação relacionada a pessoa natural identificada ou identificável), dado sensível (origem racial/étnica, convicção religiosa, opinião política, saúde, vida sexual, genética, biometria), titular (pessoa natural), controlador (quem decide sobre o tratamento), operador (quem realiza o tratamento em nome do controlador), encarregado/DPO (canal de comunicação), tratamento (toda operação com dados), anonimização (processo que impossibilita identificação), e consentimento (manifestação livre, informada e inequívoca). Princípios (art. 6º): finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação, responsabilização e prestação de contas. Direitos do titular (art. 18): confirmação, acesso, correção, portabilidade, eliminação, oposição, revisão de decisões automatizadas, informação sobre compartilhamento. Sanções (art. 52): advertência, multa de até 2% do faturamento (limitada a R$ 50 milhões por infração), multa diária, publicização, bloqueio/eliminação dos dados, suspensão parcial ou proibição do tratamento.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Tema prioritário para a DATAPREV. A FGV cobra: diferenciação entre dado pessoal e sensível, bases legais de tratamento, direitos do titular, papéis (controlador vs operador), princípios e sanções. Questões costumam exigir aplicação prática (cenários hipotéticos).",
      "examples": [
        {
          "question": "Qual a diferença entre controlador e operador na LGPD?",
          "answer": "Controlador (art. 5º, VI) é a pessoa natural ou jurídica a quem competem as decisões referentes ao tratamento de dados pessoais — é quem define finalidade, meios, quais dados coletar, por quanto tempo armazenar. Operador (art. 5º, VII) é quem realiza o tratamento em nome do controlador, seguindo suas instruções — não toma decisões estratégicas sobre os dados. Exemplo: uma empresa contrata um serviço de nuvem para armazenar dados de clientes — a empresa é controladora, o provedor de nuvem é operador.",
          "aplication": "A FGV apresenta: \"A DATAPREV processa folha de pagamento para um ministério.\" A DATAPREV segue as instruções do ministério sobre quais dados processar e como → a DATAPREV é operadora, o ministério é controlador."
        },
        {
          "question": "Quais são as bases legais para tratamento de dados pessoais?",
          "answer": "Art. 7º: o tratamento de dados pessoais só pode ocorrer mediante: I - consentimento do titular; II - cumprimento de obrigação legal; III - execução de políticas públicas; IV - realização de estudos por órgão de pesquisa; V - execução de contrato; VI - exercício regular de direitos (processo judicial/administrativo); VII - proteção da vida; VIII - tutela da saúde; IX - legítimo interesse do controlador; X - proteção do crédito. Dados sensíveis (art. 11): bases mais restritas — consentimento específico e destacado, obrigação legal, políticas públicas, estudos, exercício de direitos, proteção da vida, tutela da saúde, garantia da prevenção à fraude.",
          "aplication": "A FGV pode perguntar: \"Uma empresa quer usar dados de clientes para marketing. Qual base legal?\" → consentimento ou legítimo interesse (depende do contexto — se for legítimo interesse, precisa de análise de impacto e o titular pode se opor)."
        }
      ],
      "keyPoints": [
        "Fundamentos (art. 2º): privacidade, autodeterminação informativa, liberdade, direitos humanos, livre iniciativa",
        "Âmbito de aplicação (art. 3º): tratamento no Brasil, oferta de bens/serviços a titulares brasileiros, dados coletados no Brasil",
        "Dado pessoal: informação sobre pessoa natural identificada ou identificável",
        "Dado sensível (art. 5º, II): origem racial/étnica, convicção religiosa, opinião política, saúde, vida sexual, genética, biometria",
        "Controlador: toma decisões sobre o tratamento | Operador: executa o tratamento em nome do controlador",
        "Encarregado/DPO (art. 5º, VIII): canal entre controlador, titulares e ANPD",
        "Princípios (art. 6º): finalidade, adequação, necessidade, transparência, segurança, prevenção, responsabilização",
        "Bases legais (art. 7º): 10 hipóteses — consentimento, obrigação legal, contrato, legítimo interesse, etc.",
        "Dados sensíveis (art. 11): bases mais restritas — consentimento específico/destacado é a principal",
        "Direitos do titular (art. 18): acesso, correção, portabilidade, eliminação, revisão de decisões automatizadas, oposição",
        "Sanções (art. 52): multa de até 2% do faturamento (máx. R$ 50M), publicização, bloqueio/eliminação dos dados",
        "ANPD (art. 55-A): autarquia de natureza especial — fiscaliza, normatiza e aplica sanções",
        "Relatório de Impacto (art. 5º, XVII): documentação do controlador sobre riscos e medidas de mitigação"
      ],
      "tips": [
        "Decore a diferença controlador vs operador — é a distinção mais cobrada em questões de LGPD",
        "Dado sensível tem proteção reforçada: bases mais restritas e consentimento específico/destacado",
        "Os 10 princípios podem cair como \"marque a alternativa que NÃO é um princípio da LGPD\"",
        "Multa: 2% do faturamento, limitada a R$ 50 milhões POR INFRAÇÃO — não é por processo",
        "Consentimento deve ser: livre, informado, inequívoco, para finalidade determinada e com manifestação de vontade",
        "LGPD se aplica a dados de pessoas naturais (pessoas físicas), não a dados de pessoas jurídicas",
        "Anonimização ≠ pseudonimização: anonimizados não são mais dados pessoais; pseudonimizados ainda são"
      ],
      "errosComuns": [
        "Confundir controlador com operador — quem decide é controlador; quem executa seguindo instruções é operador",
        "Achar que consentimento é a única base legal — existem 10 bases, e para dados sensíveis o rol é diferente",
        "Achar que LGPD se aplica a dados de empresas (pessoas jurídicas) — aplica-se apenas a pessoas naturais",
        "Esquecer que a multa é de ATÉ 2% do faturamento, LIMITADA a R$ 50 milhões por infração",
        "Confundir anonimização (irreversível, sai do escopo da LGPD) com pseudonimização (reversível, ainda é dado pessoal)",
        "Achar que o legítimo interesse é uma \"carta branca\" — exige análise de proporcionalidade e o titular pode se opor"
      ],
      "usefulLinks": [
        { "label": "ANPD — Lei Geral de Proteção de Dados", "url": "https://www.gov.br/anpd/pt-br", "type": "documentacao" },
        { "label": "Lei nº 13.709/2018 (LGPD)", "url": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm", "type": "documentacao" },
        { "label": "LGPD para concursos — Gran Cursos Online", "url": "https://www.youtube.com/watch?v=RGv90bWJ9WQ", "type": "video" }
      ]
    },
    {
      "title": "Lei de Delitos Informáticos — Lei 12.737/2012 (Lei Carolina Dieckmann)",
      "summary": "A Lei 12.737/2012 tipifica crimes cibernéticos, especialmente a invasão de dispositivo informático alheio (art. 154-A do CP). É conhecida como Lei Carolina Dieckmann por ter sido motivada pelo vazamento de fotos íntimas da atriz.",
      "detail": "A Lei 12.737/2012 inseriu os arts. 154-A e 154-B no Código Penal, além de alterar o art. 266. O crime principal (art. 154-A): invadir dispositivo informático alheio (computador, celular, tablet, servidor etc.), conectado ou não à rede, mediante violação indevida de mecanismo de segurança, com o fim de obter, adulterar ou destruir dados ou informações, ou instalar vulnerabilidades. Pena: detenção de 3 meses a 1 ano + multa. Causas de aumento de pena (§1º a §5º): se houver prejuízo econômico (1/3 a 2/3); se resultar em obtenção de comunicações eletrônicas privadas, segredos comerciais/industriais ou informações sigilosas (1/3 a 2/3 — §1º, I a III); se houver divulgação, comercialização ou transmissão a terceiro dos dados obtidos (1/3 a 2/3 — §2º). A pena aumenta de 1/3 a 2/3 se o crime for cometido contra: Presidente da República, governadores, prefeitos, presidente do STF, presidente da Câmara/Senado, outros (art. 154-A, §3º). Aumenta-se da metade se houver divulgação, comercialização ou transmissão a terceiro (art. 154-A, §4º). O crime do art. 154-A é de AÇÃO PENAL PÚBLICA CONDICIONADA À REPRESENTAÇÃO, salvo se cometido contra a administração pública direta ou indireta de qualquer dos Poderes ou se resultar em prejuízo à administração pública (§5º). O art. 154-B estabelece que também incorre nas penas quem produz, oferece, distribui, vende ou difunde dispositivo ou programa de computador com o intuito de permitir a prática da conduta do art. 154-A.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrança mais pontual, geralmente focada no art. 154-A (invasão de dispositivo) e suas causas de aumento de pena. Pode aparecer combinada com conceitos de segurança da informação.",
      "examples": [
        {
          "question": "Invadir o celular de alguém sem autorização é crime? Qual a pena?",
          "answer": "Sim, é crime previsto no art. 154-A do CP (incluído pela Lei 12.737/2012). A conduta típica é: invadir dispositivo informático alheio, mediante violação de mecanismo de segurança, com o fim de obter, adulterar ou destruir dados. Pena base: detenção de 3 meses a 1 ano + multa. Se houver obtenção de comunicações privadas, segredos comerciais/industriais ou informações sigilosas, a pena aumenta de 1/3 a 2/3. Se houver divulgação dos dados, aumenta ainda mais. O crime é de ação penal pública condicionada à representação (depende da vontade da vítima), exceto se contra a administração pública.",
          "aplication": "Questão: \"Um hacker invade o servidor de um órgão público e obtém dados sigilosos.\" A ação penal é incondicionada (crime contra a administração pública) e tem aumento de pena (obtenção de informações sigilosas + contra administração pública)."
        }
      ],
      "keyPoints": [
        "Art. 154-A: invadir dispositivo informático mediante violação de mecanismo de segurança",
        "Finalidade: obter, adulterar ou destruir dados/informações ou instalar vulnerabilidades",
        "Pena base: detenção de 3 meses a 1 ano + multa",
        "Causas de aumento (1/3 a 2/3): prejuízo econômico; obtenção de comunicações privadas, segredos ou informações sigilosas",
        "Aumento adicional: se houver divulgação/comercialização dos dados obtidos",
        "Contra altas autoridades (Presidente, governadores, prefeitos, STF, Congresso): aumento de 1/3 a 2/3",
        "Ação penal: pública condicionada à representação (regra), salvo contra administração pública (incondicionada)",
        "Art. 154-B: também comete crime quem produz/oferece/vende programa para invadir dispositivos",
        "Art. 266 (alterado): interrupção ou perturbação de serviço telegráfico, telefônico, informático, telemático ou de internet",
        "A lei NÃO pune a mera invasão sem violação de mecanismo de segurança (ex: dispositivo sem senha deixado desbloqueado)"
      ],
      "tips": [
        "Ação penal: regra = condicionada à representação (vítima precisa manifestar vontade); exceção = incondicionada (contra administração pública)",
        "Causas de aumento são cumulativas: pode ter aumento por obter informações sigilosas + divulgar + ser contra autoridade",
        "O crime do art. 154-A exige violação de mecanismo de segurança — se não havia senha/bloqueio, não há crime",
        "Art. 154-B pune o \"mercado\" de ferramentas de hacking — não só quem invade, mas quem fornece os meios"
      ],
      "errosComuns": [
        "Achar que toda invasão de dispositivo é crime independentemente de mecanismo de segurança — a violação do mecanismo é elementar do tipo",
        "Confundir ação penal condicionada (regra) com incondicionada (exceção: administração pública)",
        "Achar que a Lei 12.737/2012 é a única lei sobre crimes digitais — existe também a Lei 12.735/2012 e outras",
        "Esquecer que o art. 154-B pune também quem produz/distribui ferramentas de invasão"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Segurança da Informação: conceitos e aplicação normativa",
      "summary": "Segurança da Informação é o conjunto de práticas, políticas e controles voltados à proteção de ativos de informação contra ameaças, garantindo confidencialidade, integridade, disponibilidade e outros atributos como autenticidade, irretratabilidade e conformidade.",
      "detail": "A Segurança da Informação se fundamenta no tripé clássico CID (Confidencialidade, Integridade, Disponibilidade), mas evoluiu para incluir autenticidade, irretratabilidade (não repúdio) e conformidade. A LAI (art. 4º) define: disponibilidade (informação acessível a indivíduos/sistemas autorizados), autenticidade (informação produzida/modificada por indivíduo/sistema determinado), integridade (informação não modificada quanto a origem, trânsito e destino), primariedade (informação coletada na fonte, com máximo detalhamento, sem modificações). A LGPD (art. 46) exige que os agentes de tratamento adotem medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais. O Marco Civil (art. 10-17) impõe guarda de registros em ambiente controlado e seguro. Pilares: confidencialidade (acesso apenas por autorizados), integridade (não alteração indevida), disponibilidade (acesso quando necessário), autenticidade (garantia de autoria), irretratabilidade/não repúdio (impossibilidade de negar autoria). Ameaças: malware, phishing, ransomware, engenharia social, DDoS, ataques de força bruta, SQL injection, zero-day. Controles: autenticação (algo que você sabe/tem/é), autorização (o que pode acessar), criptografia (proteção em trânsito e repouso), backup, firewalls, IDS/IPS, políticas de segurança, treinamento, gestão de incidentes. A ISO 27001 é o padrão internacional de sistema de gestão de segurança da informação (SGSI); a ISO 27701 é a extensão para privacidade.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra segurança da informação de forma integrada com as leis (LAI, Marco Civil, LGPD). Questões pedem associação entre os pilares (CID) e as exigências legais, além de cenários práticos de ameaças e controles.",
      "examples": [
        {
          "question": "Quais são os pilares da Segurança da Informação e como se relacionam com a LAI?",
          "answer": "O tripé clássico é CID: Confidencialidade (informação acessível apenas a pessoas autorizadas), Integridade (informação não alterada indevidamente) e Disponibilidade (informação acessível quando necessário). A LAI (art. 4º) define explicitamente disponibilidade (inciso VI), integridade (inciso VIII) e acrescenta autenticidade (inciso VII). A LAI também define primariedade (IX) como qualidade da informação coletada na fonte com máximo detalhamento e sem modificações — um atributo adicional de integridade da fonte.",
          "aplication": "Questão: \"Um ataque DDoS a um portal de transparência pública viola qual pilar da segurança da informação?\" → Disponibilidade (o site fica indisponível para os cidadãos). \"Um hacker altera dados publicados no Diário Oficial eletrônico, violando qual pilar?\" → Integridade."
        }
      ],
      "keyPoints": [
        "CID clássico: Confidencialidade (acesso restrito), Integridade (não alteração), Disponibilidade (acesso quando necessário)",
        "LAI define: disponibilidade (art. 4º, VI), autenticidade (VII), integridade (VIII), primariedade (IX)",
        "Autenticidade: garantia de que a informação foi produzida/modificada por quem diz ter sido",
        "Irretratabilidade/não repúdio: impossibilidade de negar a autoria de uma ação",
        "LGPD (art. 46): obrigação de medidas técnicas e administrativas de segurança",
        "Marco Civil: registros em ambiente controlado e seguro (art. 10-17)",
        "Ameaças: malware, phishing, ransomware, DDoS, engenharia social, SQL injection, força bruta",
        "Controles: autenticação (sabe/tem/é), autorização, criptografia, backup, firewall, IDS/IPS, políticas, treinamento",
        "ISO 27001: SGSI (Sistema de Gestão de Segurança da Informação)",
        "ISO 27701: extensão da 27001 para privacidade (gestão de dados pessoais)",
        "Política de segurança: documento que estabelece diretrizes, responsabilidades e sanções",
        "Incidente de segurança: evento que compromete ou pode comprometer a segurança da informação"
      ],
      "tips": [
        "Associe cada pilar a um cenário de violação: disponibilidade = site fora do ar; integridade = dados alterados; confidencialidade = vazamento",
        "A LAI define primariedade — é um conceito que a FGV adora: informação na fonte, sem modificações, máximo detalhamento",
        "Autenticação ≠ autorização: autenticação = \"quem é você?\"; autorização = \"o que você pode fazer?\"",
        "A LGPD não especifica QUAIS medidas de segurança — exige medidas \"técnicas e administrativas aptas\" (art. 46)",
        "Backup garante disponibilidade; criptografia garante confidencialidade; hash/checksum garante integridade"
      ],
      "errosComuns": [
        "Confundir autenticação (verificar identidade) com autorização (verificar permissões)",
        "Achar que criptografia resolve tudo — resolve confidencialidade, mas não resolve disponibilidade",
        "Esquecer a primariedade como atributo definido pela LAI — cai em questões que misturam LAI com segurança",
        "Confundir os pilares: vazamento de dados = perda de confidencialidade, não de disponibilidade",
        "Achar que backup garante integridade — backup garante disponibilidade (recuperação); para integridade usa-se hash"
      ],
      "usefulLinks": [
        { "label": "NIST Cybersecurity Framework", "url": "https://www.nist.gov/cyberframework", "type": "documentacao" },
        { "label": "ISO 27001 — Segurança da Informação", "url": "https://www.iso.org/standard/27001", "type": "documentacao" },
        { "label": "Segurança da informação para concursos — Estratégia Concursos", "url": "https://www.youtube.com/watch?v=p7R_pDHs3hk", "type": "video" }
      ]
    },
    {
      "title": "Integração normativa e responsabilidades",
      "summary": "A integração entre LAI, LGPD, Marco Civil e Lei de Delitos Informáticos forma o ecossistema normativo de proteção de dados e segurança da informação no Brasil. Cada lei tem seu escopo, mas há sobreposições e complementaridades.",
      "detail": "A integração normativa exige compreender a função de cada diploma: a LAI (Lei 12.527/2011) regula o acesso a informações públicas — sua lógica é a transparência (publicidade como regra). A LGPD (Lei 13.709/2018) regula o tratamento de dados pessoais pelo setor público e privado — sua lógica é a proteção da privacidade. O Marco Civil (Lei 12.965/2014) estabelece princípios para a internet — sua lógica é garantir direitos e deveres no ambiente digital. A Lei de Delitos Informáticos (Lei 12.737/2012) tipifica condutas criminosas no ambiente digital — sua lógica é a repressão penal. Intersecções importantes: LAI e LGPD — informações pessoais têm acesso restrito por 100 anos na LAI (art. 31), e a LGPD reforça a proteção desses dados; a LAI exige transparência ativa de remuneração de servidores, o que conflita parcialmente com a privacidade — o STF já decidiu pela divulgação nominal (RE 1.055.041, Tema 483). LGPD e Marco Civil — ambos protegem a privacidade online, mas a LGPD é mais abrangente (todo tratamento de dados) enquanto o Marco Civil foca na internet; a LGPD não revogou o Marco Civil, mas o complementa. Responsabilidades: a LAI prevê responsabilidade administrativa, civil e por improbidade (arts. 32-34); a LGPD prevê sanções administrativas (art. 52) e responsabilidade civil por danos (art. 42); o Marco Civil prevê responsabilidade civil de provedores (arts. 19 e 21); a Lei de Delitos Informáticos prevê responsabilidade penal (art. 154-A do CP). Para a DATAPREV, empresa pública federal, todas essas normas são aplicáveis.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "A FGV cobra a interseção entre as leis, especialmente LAI + LGPD e LGPD + Marco Civil. Questões contextualizadas pedem que o candidato identifique qual norma se aplica a determinado cenário.",
      "examples": [
        {
          "question": "Um cidadão solicita informações sobre a remuneração de um servidor público. A LAI e a LGPD entram em conflito?",
          "answer": "A LAI (art. 8º) e o Decreto 7.724 (art. 7º, §3º, VI) determinam a divulgação da remuneração de agentes públicos de forma individualizada (transparência ativa). A LGPD protege dados pessoais, inclusive de servidores. O STF (Tema 483 de Repercussão Geral — RE 1.055.041) decidiu que a divulgação nominal da remuneração de servidores é constitucional e prevalece sobre a privacidade, por se tratar de informação de interesse público. Portanto, NÃO há conflito: a transparência prevalece para remuneração de agentes públicos, mas dados pessoais sem relevância pública (ex: endereço residencial, CPF completo) devem ser protegidos.",
          "aplication": "A FGV pode apresentar um caso concreto: \"Um servidor pede a exclusão de sua remuneração do portal de transparência invocando a LGPD.\" → O pedido deve ser negado, pois a transparência da remuneração de agentes públicos prevalece (STF, Tema 483)."
        }
      ],
      "keyPoints": [
        "LAI: acesso a informações públicas, transparência, sigilo como exceção",
        "LGPD: proteção de dados pessoais, privacidade, direitos do titular",
        "Marco Civil: princípios da internet, neutralidade, responsabilidade de provedores",
        "Lei 12.737/2012: crimes informáticos, invasão de dispositivo (art. 154-A CP)",
        "Conflito aparente LAI x LGPD: remuneração de servidores → transparência prevalece (STF Tema 483)",
        "Informações pessoais na LAI (art. 31): restrição de 100 anos, alinhada com a LGPD",
        "Marco Civil e LGPD: complementares — MC foca na internet, LGPD em todo tratamento de dados",
        "Responsabilidade administrativa: LAI (arts. 32-33) e LGPD (art. 52)",
        "Responsabilidade civil: LAI (art. 34), LGPD (art. 42), Marco Civil (arts. 19 e 21)",
        "Responsabilidade penal: Lei 12.737/2012 (art. 154-A CP)",
        "DATAPREV: empresa pública federal — sujeita a todas essas normas",
        "ANPD: autarquia federal responsável por fiscalizar e regulamentar a LGPD (art. 55-A)"
      ],
      "tips": [
        "Monte um mapa mental: cada lei tem seu \"núcleo duro\" — LAI (transparência), LGPD (privacidade), MC (internet), Lei Penal (crimes)",
        "Quando houver conflito aparente entre transparência e privacidade, avalie: é agente público? Se sim, transparência tende a prevalecer (remuneração, atos oficiais)",
        "DATAPREV como empresa pública: sujeita à LAI (art. 1º, II), LGPD (controladora/operadora), Marco Civil (provedora de aplicações?) e penalidades da Lei 12.737",
        "A LGPD não revogou a LAI — são normas que convivem e devem ser interpretadas de forma harmônica"
      ],
      "errosComuns": [
        "Achar que a LGPD revogou dispositivos da LAI — são leis autônomas que coexistem",
        "Tratar o Marco Civil como se fosse absorvido pela LGPD — o Marco Civil continua em vigor e tem âmbito próprio (internet)",
        "Ignorar que a DATAPREV, como empresa pública, está sujeita à LAI — inclusive à transparência ativa",
        "Confundir os tipos de responsabilidade: penal (12.737), administrativa (LAI, LGPD), civil (todas)"
      ],
      "usefulLinks": [
        { "label": "Microsoft Learn — Power BI", "url": "https://learn.microsoft.com/pt-br/power-bi/", "type": "documentacao" },
        { "label": "Power BI para iniciantes — Hashtag Programação", "url": "https://www.youtube.com/watch?v=EhOTOuVGHXI", "type": "video" }
      ]
    }
  ],
  "logica": [
    {
      "title": "Estruturas lógicas e associação de informações",
      "summary": "Problemas de associação envolvem correlacionar elementos, pessoas e objetos fictícios a partir de pistas fornecidas, utilizando tabelas de dupla entrada para organizar as deduções.",
      "detail": "A associação de informações é a técnica mais clássica do raciocínio lógico. O método consiste em: (1) construir uma tabela de dupla entrada com os grupos de elementos (homens, esposas, profissões); (2) construir uma tabela-gabarito complementar que ajuda a enxergar informações escondidas; (3) preencher as informações mais óbvias primeiro, marcando \"S\" para confirmações e \"N\" para exclusões — quando um \"S\" é marcado, toda a linha e coluna recebem \"N\"; (4) procurar conclusões derivadas: se uma célula ficou em branco após todas as exclusões, ela é a resposta. A FGV adora esse tipo de questão, que exige paciência e organização visual.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~40% das questões de Lógica. A FGV varia o contexto (profissões, cidades, horários, pontuações) mas a técnica é sempre a mesma.",
      "examples": [
        {
          "question": "Como resolver uma questão de associação com 3 grupos de elementos?",
          "answer": "Monte uma tabela de dupla entrada com todos os grupos. Preencha as pistas diretas primeiro (marcando S e N). Use a regra: se S em uma célula, toda a linha e coluna recebem N. Depois, deduza por eliminação — células em branco são as respostas.",
          "aplication": "Exemplo real (FGV 2022): \"Ana, Bia e Carol são médica, enfermeira e professora, com animais diferentes.\" As pistas diretas (Ana tem cachorro, Bia é a mais velha) vão preenchendo a tabela até restar apenas uma opção por célula."
        },
        {
          "question": "Qual a diferença entre tabela principal e tabela-gabarito?",
          "answer": "A tabela principal cruza os 3 grupos (ex: homens × profissões × esposas). A tabela-gabarito é uma versão resumida (homens × profissões × esposas em 3 colunas) que ajuda a enxergar conclusões derivadas que ficam escondidas na tabela principal.",
          "aplication": "A tabela-gabarito é essencial quando a tabela principal tem muitas células — ela sintetiza o que já foi descoberto e revela conclusões indiretas."
        }
      ],
      "keyPoints": [
        "Construir tabela de dupla entrada com todos os grupos de elementos",
        "Tabela-gabarito complementar para enxergar conclusões derivadas",
        "Regra fundamental: S em uma célula → toda a linha e coluna recebem N",
        "Preencher pistas diretas primeiro, depois deduzir por eliminação",
        "Células em branco após todas as exclusões são as respostas",
        "Questões de ordem (quem chegou primeiro/último) usam a mesma técnica com tabela de posições"
      ],
      "tips": [
        "Sempre desenhe a tabela antes de tentar resolver de cabeça — a organização visual evita erros",
        "Comece pelas pistas mais restritivas (ex: \"Bia é a mais velha\" é mais útil que \"Ana não é médica\")",
        "Quando uma pista diz \"X não é Y\", marque N. Quando diz \"X é Y\", marque S e preencha N na linha e coluna",
        "Em questões de ordem temporal, use uma tabela com posições (1º, 2º, 3º...) em vez de cruzar elementos"
      ],
      "errosComuns": [
        "Tentar resolver sem tabela — a memória falha com mais de 3 grupos de elementos",
        "Esquecer de marcar N na linha e coluna quando marca S — gera contradições",
        "Desistir cedo demais — muitas questões exigem 4-5 passos de dedução antes da resposta final"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Conceitos de BD", "url": "https://www.postgresql.org/docs/current/tutorial-concepts.html", "type": "documentacao" },
        { "label": "Modelagem de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Zp0i5n4YJvg", "type": "video" }
      ]
    },
    {
      "title": "Lógica de argumentação e validade",
      "summary": "Um argumento é válido quando a conclusão decorre necessariamente das premissas, independentemente da veracidade das premissas. A validade depende da estrutura lógica, não do conteúdo.",
      "detail": "Um argumento é um conjunto de premissas (P1, P2, ... Pn) que levam a uma conclusão (Q). Um argumento é válido quando a conclusão decorre NECESSARIAMENTE das premissas — mesmo que as premissas sejam falsas no mundo real. Exemplo válido: \"Todos os homens são pássaros; nenhum pássaro é animal; logo, nenhum homem é animal\" — a estrutura é válida, mesmo com premissas absurdas. Um argumento é inválido (falacioso) quando as premissas não garantem a verdade da conclusão. Existem 4 métodos para validar argumentos: (1) Diagramas de Venn — para argumentos com \"todo\", \"algum\", \"nenhum\"; (2) Tabela-verdade — para argumentos com conectivos lógicos; (3) Premissas verdadeiras + conclusão verdadeira — método rápido; (4) Premissas verdadeiras + conclusão falsa — se essa combinação for impossível, o argumento é válido.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em praticamente todas as questões de lógica argumentativa. A FGV cobra identificação de validade, falácias e conclusões corretas.",
      "examples": [
        {
          "question": "Como usar diagramas de Venn para validar um argumento?",
          "answer": "Para \"Todo A é B\": desenhe A dentro de B. Para \"Nenhum A é B\": desenhe A e B separados. Para \"Algum A é B\": desenhe A e B com interseção. Depois verifique se a conclusão é obrigatória dado o diagrama — se sim, o argumento é válido.",
          "aplication": "Exemplo real (FGV 2021): \"Todos os sergipanos vivem em Aracaju; José é sergipano; José vive em Aracaju.\" A falha é que a primeira premissa não é verdadeira no mundo real — mas o argumento é estruturalmente válido. A FGV testa se você sabe separar validade de veracidade."
        },
        {
          "question": "Qual a diferença entre argumento válido e argumento verdadeiro?",
          "answer": "Validade é sobre a ESTRUTURA: a conclusão decorre necessariamente das premissas. Veracidade é sobre o CONTEÚDO: as premissas são factualmente verdadeiras. Um argumento pode ser válido com premissas falsas, ou ter premissas verdadeiras mas ser estruturalmente inválido.",
          "aplication": "A FGV adora confundir os dois conceitos. Questões como \"Esse raciocínio apresenta uma falha\" testam se você percebe que a validade não depende da verdade das premissas."
        }
      ],
      "keyPoints": [
        "Argumento válido: conclusão decorre necessariamente das premissas (estrutura correta)",
        "Argumento inválido (falacioso): premissas não garantem a conclusão",
        "Validade ≠ veracidade: argumento válido pode ter premissas falsas",
        "Silogismo: argumento com 2 premissas e 1 conclusão",
        "Método 1 — Diagramas de Venn: para \"todo\", \"algum\", \"nenhum\"",
        "Método 2 — Tabela-verdade: para conectivos lógicos (e, ou, se...então)",
        "Método 3 — Premissas verdadeiras + conclusão verdadeira: método rápido",
        "Método 4 — Premissas verdadeiras + conclusão falsa: se impossível, argumento é válido",
        "Falácias comuns: ad hominem, apelo à ignorância, espantalho"
      ],
      "tips": [
        "Quando a questão perguntar sobre validade, IGNORE se as premissas são verdadeiras no mundo real — foque só na estrutura",
        "Para diagramas de Venn: \"Todo A é B\" = A dentro de B; \"Nenhum A é B\" = A e B separados; \"Algum A é B\" = interseção",
        "Se a conclusão NÃO é obrigatória no diagrama (pode ser V ou F), o argumento é inválido",
        "O 4º método é o mais confiável: tente colocar premissas verdadeiras e conclusão falsa — se for impossível, é válido"
      ],
      "errosComuns": [
        "Confundir validade com veracidade — achar que premissas falsas invalidam o argumento",
        "Usar tabela-verdade para argumentos com \"todo/algum/nenhum\" — use diagramas de Venn nesses casos",
        "Não perceber que \"algum\" em lógica significa \"pelo menos um\" (pode ser todos)",
        "Achar que um argumento é inválido só porque a conclusão parece estranha — foque na estrutura"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Conceitos de BD", "url": "https://www.postgresql.org/docs/current/tutorial-concepts.html", "type": "documentacao" },
        { "label": "Modelagem de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Zp0i5n4YJvg", "type": "video" }
      ]
    },
    {
      "title": "Lógica proposicional e tabelas-verdade",
      "summary": "Proposições são sentenças que admitem valor lógico V ou F. Conectivos (negação, conjunção, disjunção, condicional, bicondicional) combinam proposições. Tabelas-verdade analisam todas as combinações possíveis.",
      "detail": "Uma proposição é uma sentença declarativa que pode ser classificada como verdadeira (V) ou falsa (F). Segue 3 axiomas: Princípio da Identidade (p≡p), Não Contradição (p não pode ser V e F ao mesmo tempo) e Terceiro Excluído (p é V ou F, sem meio-termo). Proposições simples (p, q, r) não contêm outras proposições. Proposições compostas (P, Q, R) usam conectivos: negação (~p, inverte V/F), conjunção (p∧q, V só se ambas V), disjunção inclusiva (p∨q, F só se ambas F), disjunção exclusiva (p⊕q, V se valores diferentes), condicional (p→q, F só se p=V e q=F), bicondicional (p↔q, V se valores iguais). A tabela-verdade tem 2^n linhas (n = número de proposições simples). Tautologia: sempre V. Contradição: sempre F. Contingência: pode ser V ou F.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~80% das questões de Lógica. A FGV cobra tabelas-verdade, negação de compostas, equivalências e classificação (tautologia/contradição/contingência).",
      "examples": [
        {
          "question": "Como montar a tabela-verdade de uma proposição composta com 3 variáveis?",
          "answer": "Com 3 variáveis (p, q, r), a tabela tem 2³ = 8 linhas. A coluna p alterna a cada 4: VVVVFFFF. A coluna q alterna a cada 2: VVFFVVFF. A coluna r alterna a cada 1: VFVFVFVF. Depois aplique cada conectivo seguindo as regras: ∧ é V só se ambas V; ∨ é F só se ambas F; → é F só se p=V e q=F; ↔ é V se valores iguais.",
          "aplication": "Exemplo real (CESPE): \"Se A, B, C, D são proposições distintas, quantas linhas tem a tabela-verdade de (A→B)↔(C→D)?\" Resposta: 2⁴ = 16 linhas."
        },
        {
          "question": "Qual a diferença entre tautologia, contradição e contingência?",
          "answer": "Tautologia: proposição composta sempre V (ex: p∨~p). Contradição: sempre F (ex: p∧~p). Contingência: pode ser V ou F dependendo dos valores (ex: p→q). Para classificar, monte a tabela-verdade completa e olhe a coluna final.",
          "aplication": "Exemplo real (CESPE): \"(P→Q)↔((~Q)→(~P))\" — como (~Q)→(~P) é equivalente a P→Q, temos P→Q ↔ P→Q, que é sempre V → tautologia."
        }
      ],
      "keyPoints": [
        "Proposição: sentença declarativa com valor lógico V ou F (não são proposições: perguntas, exclamações, imperativos, paradoxos, sentenças abertas)",
        "Negação (~p): inverte V/F",
        "Conjunção (p∧q): V só se ambas V",
        "Disjunção inclusiva (p∨q): F só se ambas F",
        "Disjunção exclusiva (p⊕q): V se valores diferentes, F se iguais",
        "Condicional (p→q): F só se p=V e q=F (a única!)",
        "Bicondicional (p↔q): V se valores iguais, F se diferentes",
        "Tabela-verdade: 2^n linhas (n = nº de proposições simples)",
        "Tautologia: coluna final toda V | Contradição: toda F | Contingência: mistura",
        "Condição suficiente: p→q significa p é suficiente para q",
        "Condição necessária: p→q significa q é necessária para p"
      ],
      "tips": [
        "Memorize a tabela-verdade do condicional (→): é a mais cobrada e a mais confundida. F só quando p=V e q=F",
        "Para contar linhas: 2^n. Com 4 proposições: 16 linhas. Com 5: 32 linhas",
        "Sentenças abertas (com variáveis), perguntas, imperativos e paradoxos NÃO são proposições",
        "Na negação de compostas: \"e\" vira \"ou\" e vice-versa (De Morgan) — detalhe no próximo tópico",
        "O bicondicional (↔) é V quando os dois lados têm o mesmo valor — use isso para resolver rápido"
      ],
      "errosComuns": [
        "Esquecer que p→q é F só quando p=V e q=F — essa é a pegadinha mais clássica da FGV",
        "Confundir disjunção inclusiva (∨) com exclusiva (⊕) — a inclusiva permite ambos V",
        "Achar que \"Se chove, então levo guarda-chuva\" é equivalente a \"Se não chove, então não levo\" — NÃO é (isso é a contrária, que não é equivalente)",
        "Contar errado as linhas da tabela-verdade: 2^n, não n²"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Conceitos de BD", "url": "https://www.postgresql.org/docs/current/tutorial-concepts.html", "type": "documentacao" },
        { "label": "Modelagem de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Zp0i5n4YJvg", "type": "video" }
      ]
    },
    {
      "title": "Equivalências e implicações lógicas",
      "summary": "Equivalências são proposições com a mesma tabela-verdade. As principais são: contrapositiva (p→q ≡ ~q→~p), Leis de De Morgan (~(p∧q) ≡ ~p∨~q) e negação de categóricas.",
      "detail": "Duas proposições são equivalentes (≡) quando têm a mesma tabela-verdade. A equivalência mais cobrada pela FGV é a CONTRAPOSITIVA: p→q ≡ ~q→~p. Exemplo: \"Se chove, então levo guarda-chuva\" ≡ \"Se não levo guarda-chuva, então não chove\". As Leis de De Morgan são fundamentais: ~(p∧q) ≡ ~p∨~q (nega a conjunção: \"e\" vira \"ou\", nega as partes) e ~(p∨q) ≡ ~p∧~q (nega a disjunção: \"ou\" vira \"e\", nega as partes). A negação da condicional p→q é p∧~q (mantém a primeira E nega a segunda). A negação da bicondicional p↔q é p⊕q (disjunção exclusiva). A recíproca de p→q é q→p (NÃO é equivalente). A contrária é ~p→~q (NÃO é equivalente). O Princípio de Substituição permite trocar proposições equivalentes sem alterar o valor lógico final.",
      "peso": "Muito alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~70% das questões de Lógica. A FGV adora pedir \"Uma negação lógica para...\" ou \"É equivalente a...\"",
      "examples": [
        {
          "question": "Qual a negação correta de \"Se João é rico, então Maria é pobre\"?",
          "answer": "A negação de p→q é p∧~q (mantém a primeira E nega a segunda). Logo: \"João é rico E Maria NÃO é pobre\". NÃO é \"~p→~q\" (isso é a contrária, não é negação).",
          "aplication": "Exemplo real (VUNESP): \"Uma negação para 'João é rico, ou Maria é pobre'\" — é uma disjunção (∨), então a negação usa De Morgan: ~(p∨q) ≡ ~p∧~q → \"João NÃO é rico E Maria NÃO é pobre\"."
        },
        {
          "question": "Como aplicar as Leis de De Morgan?",
          "answer": "De Morgan: ~(p∧q) ≡ ~p∨~q e ~(p∨q) ≡ ~p∧~q. Regra prática: \"nega tudo, inverte o conectivo (e↔ou), nega as partes\". Exemplo: ~(Estudo e passo) ≡ Não estudo OU não passo.",
          "aplication": "A FGV apresenta a negação de uma composta e pede a forma equivalente — se você souber De Morgan de cor, resolve em 10 segundos."
        }
      ],
      "keyPoints": [
        "Contrapositiva: p→q ≡ ~q→~p (a equivalência mais cobrada)",
        "De Morgan 1: ~(p∧q) ≡ ~p∨~q (nega e inverte e→ou)",
        "De Morgan 2: ~(p∨q) ≡ ~p∧~q (nega e inverte ou→e)",
        "Negação da condicional: ~(p→q) ≡ p∧~q (mantém 1ª E nega 2ª)",
        "Negação da bicondicional: ~(p↔q) ≡ p⊕q (disjunção exclusiva)",
        "Recíproca: q→p — NÃO é equivalente a p→q",
        "Contrária: ~p→~q — NÃO é equivalente a p→q",
        "Princípio de Substituição: proposições equivalentes são intercambiáveis",
        "Propriedades da equivalência: reflexiva (P≡P), simétrica (P≡Q → Q≡P), transitiva (P≡Q e Q≡R → P≡R)"
      ],
      "tips": [
        "Decore a tabela de equivalências — a FGV repete as mesmas 5-6 equivalências em todas as provas",
        "Para negar \"Se...então\": mantenha a primeira E negue a segunda (p∧~q). NÃO inverta!",
        "Para negar \"Todo A é B\": diga \"Algum A não é B\" (detalhe no tópico de quantificadores)",
        "Quando a questão pedir \"equivalente a\", desconfie de recíproca e contrária — elas NÃO são equivalentes",
        "Use a contrapositiva para resolver questões de \"Se...então\" mais rápido: inverta e negue ambas"
      ],
      "errosComuns": [
        "Achar que a recíproca (q→p) é equivalente à condicional (p→q) — NÃO É",
        "Negar \"Se p então q\" como \"Se ~p então ~q\" — isso é a contrária, não a negação",
        "Esquecer que De Morgan inverte o conectivo: ~(p∧q) vira ~p∨~q, não ~p∧~q",
        "Confundir negação com equivalência — negação inverte o valor lógico, equivalência mantém"
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Conceitos de BD", "url": "https://www.postgresql.org/docs/current/tutorial-concepts.html", "type": "documentacao" },
        { "label": "Modelagem de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Zp0i5n4YJvg", "type": "video" }
      ]
    },
    {
      "title": "Diagramas lógicos e proposições categóricas",
      "summary": "Proposições categóricas usam quantificadores (todo, nenhum, algum) e são representadas por diagramas de Venn. Os 4 tipos são: A (todo A é B), E (nenhum A é B), I (algum A é B), O (algum A não é B).",
      "detail": "Proposições categóricas estabelecem relações entre conjuntos usando quantificadores. Os 4 tipos são: Tipo A — \"Todo A é B\" (A está contido em B); Tipo E — \"Nenhum A é B\" (A e B são disjuntos); Tipo I — \"Algum A é B\" (existe interseção entre A e B — em lógica, \"algum\" significa \"pelo menos um\", podendo ser todos); Tipo O — \"Algum A não é B\" (existe elemento de A fora de B). Os diagramas de Venn representam visualmente essas relações. Para validar argumentos com essas proposições, desenhe todos os diagramas possíveis compatíveis com as premissas e verifique se a conclusão é obrigatória em todos eles. A negação de \"Todo A é B\" (tipo A) é \"Algum A não é B\" (tipo O), e vice-versa. A negação de \"Nenhum A é B\" (tipo E) é \"Algum A é B\" (tipo I), e vice-versa.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~30% das questões de Lógica. A FGV cobra validação de argumentos com \"todo/algum/nenhum\" e negação de categóricas.",
      "examples": [
        {
          "question": "Como negar \"Todo político é honesto\"?",
          "answer": "A negação de \"Todo A é B\" (tipo A) é \"Algum A não é B\" (tipo O). Logo: \"Algum político não é honesto\" — ou equivalentemente, \"Existe pelo menos um político que não é honesto\". NÃO é \"Nenhum político é honesto\" (isso seria a contrária, não a negação).",
          "aplication": "A FGV adora essa pegadinha: colocar \"Nenhum A é B\" como alternativa de negação de \"Todo A é B\" — está ERRADO. A negação correta é sempre \"Algum A não é B\"."
        },
        {
          "question": "O que \"Algum A é B\" significa em lógica?",
          "answer": "Em lógica, \"algum\" significa \"pelo menos um\" — pode ser um, pode ser todos. NÃO significa \"alguns sim e outros não\" como no português cotidiano. Isso muda completamente a interpretação dos diagramas.",
          "aplication": "Se \"Algum sergipano vive em Aracaju\" é verdadeiro, pode ser que TODOS os sergipanos vivam em Aracaju. A FGV testa essa diferença entre o uso lógico e o uso cotidiano de \"algum\"."
        }
      ],
      "keyPoints": [
        "Tipo A: \"Todo A é B\" → A contido em B",
        "Tipo E: \"Nenhum A é B\" → A e B disjuntos (sem interseção)",
        "Tipo I: \"Algum A é B\" → existe interseção (pelo menos 1 elemento comum)",
        "Tipo O: \"Algum A não é B\" → existe elemento de A fora de B",
        "Negação de A ↔ O: ~(Todo A é B) ≡ Algum A não é B",
        "Negação de E ↔ I: ~(Nenhum A é B) ≡ Algum A é B",
        "\"Todo A é B\" ≠ \"Todo B é A\" (a inclusão não é simétrica)",
        "\"Algum A é B\" ≡ \"Algum B é A\" (a interseção é simétrica)",
        "\"Algum A não é B\" ≠ \"Algum B não é A\" (a diferença NÃO é simétrica)",
        "Em lógica, \"algum\" = \"pelo menos um\" (pode ser todos)"
      ],
      "tips": [
        "Para negar categóricas: inverta o quantificador (todo↔algum, nenhum↔algum) e inverta a qualidade (afirmativa↔negativa)",
        "Desenhe TODOS os diagramas possíveis compatíveis com as premissas — se a conclusão vale em todos, o argumento é válido",
        "Lembre: \"Todo A é B\" NÃO implica \"Todo B é A\" — a inclusão é unilateral",
        "Quando a questão diz \"Algum A é B\", não assuma que \"Algum A não é B\" — em lógica, \"algum\" pode ser \"todos\""
      ],
      "errosComuns": [
        "Negar \"Todo A é B\" como \"Nenhum A é B\" — a negação correta é \"Algum A não é B\"",
        "Interpretar \"algum\" como \"alguns sim e outros não\" — em lógica, \"algum\" = \"pelo menos um\"",
        "Achar que \"Todo A é B\" implica \"Todo B é A\" — a inclusão não é simétrica",
        "Não desenhar todos os diagramas possíveis e concluir validade com apenas um caso"
      ],
      "usefulLinks": [
        { "label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course?hl=pt-br", "type": "documentacao" },
        { "label": "IA e Machine Learning — Código Fonte TV", "url": "https://www.youtube.com/watch?v=4_3c_83alC4", "type": "video" }
      ]
    },
    {
      "title": "Lógica de primeira ordem e quantificadores",
      "summary": "A lógica de primeira ordem estuda proposições com quantificadores universais (∀, \"para todo\") e existenciais (∃, \"existe\"). A negação inverte o quantificador: ~(∀x P(x)) ≡ ∃x ~P(x) e ~(∃x P(x)) ≡ ∀x ~P(x).",
      "detail": "A lógica de primeira ordem expande a proposicional ao introduzir quantificadores. O quantificador universal (∀) expressa \"para todo\", \"para cada\", \"qualquer que seja\". O quantificador existencial (∃) expressa \"existe\", \"há pelo menos um\", \"algum\". As regras de negação são fundamentais: ~(∀x P(x)) ≡ ∃x ~P(x) — \"nem todo\" vira \"existe algum que não\". ~(∃x P(x)) ≡ ∀x ~P(x) — \"não existe nenhum\" vira \"todo não é\". Essas regras são a formalização das negações de categóricas vistas no tópico anterior. A FGV cobra especialmente a negação de proposições com quantificadores em linguagem natural, pedindo para reescrever a negação de forma equivalente.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~20% das questões de Lógica, geralmente combinada com diagramas lógicos.",
      "examples": [
        {
          "question": "Como negar \"Todos os alunos passaram na prova\"?",
          "answer": "A negação de ∀x P(x) é ∃x ~P(x). Logo: \"Existe pelo menos um aluno que NÃO passou na prova\" — ou equivalentemente, \"Algum aluno não passou\". NÃO é \"Nenhum aluno passou\" (isso seria muito mais forte que a negação).",
          "aplication": "A FGV apresenta proposições como \"Todo funcionário público é concursado\" e pede a negação — a resposta correta é \"Existe funcionário público que não é concursado\", não \"Nenhum funcionário público é concursado\"."
        },
        {
          "question": "Como negar \"Existe número primo par\"?",
          "answer": "A negação de ∃x P(x) é ∀x ~P(x). Logo: \"Todo número primo NÃO é par\" — ou \"Nenhum número primo é par\". Note que essa proposição é FALSA (o 2 é primo e par), mas a negação está correta do ponto de vista lógico.",
          "aplication": "A FGV pode pedir a negação de \"Existe algum brasileiro que não gosta de futebol\" — a resposta é \"Todo brasileiro gosta de futebol\" (∀x P(x))."
        }
      ],
      "keyPoints": [
        "Quantificador universal (∀): \"para todo\", \"para cada\", \"qualquer que seja\"",
        "Quantificador existencial (∃): \"existe\", \"há pelo menos um\", \"algum\"",
        "Negação de ∀: ~(∀x P(x)) ≡ ∃x ~P(x) — \"nem todo\" vira \"existe algum que não\"",
        "Negação de ∃: ~(∃x P(x)) ≡ ∀x ~P(x) — \"não existe nenhum\" vira \"todo não é\"",
        "∀x (P(x)→Q(x)) ≡ \"Todo P é Q\"",
        "∃x (P(x)∧Q(x)) ≡ \"Algum P é Q\"",
        "A negação inverte o quantificador E nega o predicado",
        "Em linguagem natural: \"Todo\" nega com \"Existe algum que não\"; \"Existe\" nega com \"Nenhum/ todo não\""
      ],
      "tips": [
        "Para negar quantificadores: inverta o quantificador (∀↔∃) e negue o predicado",
        "Em linguagem natural: \"Todo A é B\" nega com \"Algum A não é B\"; \"Nenhum A é B\" nega com \"Algum A é B\"",
        "Cuidado com \"todo... não\" em português — pode ser ambíguo. Em lógica, formalize sempre com ∀ ou ∃",
        "A FGV costuma dar a proposição em linguagem natural e pedir a negação — traduza para ∀ ou ∃ antes de negar"
      ],
      "errosComuns": [
        "Negar \"Todo A é B\" como \"Nenhum A é B\" — a negação correta é \"Algum A não é B\"",
        "Negar \"Existe A que é B\" como \"Existe A que não é B\" — a negação correta é \"Nenhum A é B\"",
        "Esquecer de negar o predicado quando inverte o quantificador",
        "Confundir ∀x(P(x)→Q(x)) com ∀x(P(x)∧Q(x)) — o primeiro é \"todo P é Q\", o segundo é \"todo x é P e Q\""
      ],
      "usefulLinks": [
        { "label": "PostgreSQL — Conceitos de BD", "url": "https://www.postgresql.org/docs/current/tutorial-concepts.html", "type": "documentacao" },
        { "label": "Modelagem de dados — Bóson Treinamentos", "url": "https://www.youtube.com/watch?v=Zp0i5n4YJvg", "type": "video" }
      ]
    },
    {
      "title": "Problemas aritméticos, geométricos e matriciais",
      "summary": "Problemas de raciocínio lógico envolvendo aritmética (MMC, MDC, média, pares/ímpares, primos), geometria (área, perímetro, volume) e matrizes (estrutura, notação, elementos).",
      "detail": "A FGV cobra problemas que combinam raciocínio lógico com matemática básica. Em aritmética: números pares (divisíveis por 2) e ímpares (resto 1); primos (exatamente 2 divisores: 1 e ele mesmo — o 2 é o único primo par); MMC (menor múltiplo comum — decomposição simultânea em fatores primos); MDC (maior divisor comum — fatores comuns com menor expoente); média aritmética (soma dos valores ÷ quantidade). Em geometria: perímetro (soma dos lados); área do quadrado (l²), retângulo (b×h), losango (D×d/2), trapézio ((B+b)×h/2), círculo (πr²); volume do cubo (l³), paralelepípedo (b×h×l), pirâmide/cone (Ab×h/3), esfera (4/3×πr³). Em matrizes: estrutura m×n (m linhas, n colunas); notação aᵢⱼ (linha i, coluna j); identificação de elementos por posição.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~25% das questões de Lógica. A FGV mistura aritmética com raciocínio lógico em problemas contextualizados.",
      "examples": [
        {
          "question": "Como resolver: \"2 fichas azuis = 5 vermelhas; 1 preta = 3 azuis. Quantas vermelhas = 2 pretas?\"",
          "answer": "1 preta = 3 azuis. 2 pretas = 6 azuis. 2 azuis = 5 vermelhas, então 6 azuis = 3×(2 azuis) = 3×5 = 15 vermelhas. Resposta: 2 pretas = 15 vermelhas.",
          "aplication": "Exemplo real (FGV 2024): questão exatamente assim — a chave é encadear as equivalências passo a passo, convertendo tudo para a mesma unidade antes de calcular."
        },
        {
          "question": "Como calcular MMC e MDC de dois números?",
          "answer": "MMC: decomponha ambos em fatores primos simultaneamente e multiplique TODOS os fatores primos usados. MDC: decomponha separadamente e multiplique apenas os fatores COMUNS com o MENOR expoente. Ex.: MMC(8,242) = 2³×11² = 968. MDC(25,80) = 5¹ = 5.",
          "aplication": "A FGV pode pedir \"qual o menor número divisível por X e Y ao mesmo tempo\" (MMC) ou \"qual o maior número que divide X e Y\" (MDC) — identifique qual conceito a questão pede antes de calcular."
        }
      ],
      "keyPoints": [
        "Par: divisível por 2 (resto 0) | Ímpar: resto 1 na divisão por 2",
        "Primo: exatamente 2 divisores (1 e ele mesmo) — 2 é o único primo par",
        "MMC: menor múltiplo comum — decomposição simultânea, multiplica todos os fatores",
        "MDC: maior divisor comum — fatores comuns com menor expoente",
        "Média aritmética: soma dos valores ÷ quantidade de elementos",
        "Área: quadrado (l²), retângulo (b×h), losango (D×d/2), trapézio ((B+b)×h/2), círculo (πr²)",
        "Volume: cubo (l³), paralelepípedo (b×h×l), pirâmide/cone (Ab×h/3), esfera (4/3×πr³)",
        "Perímetro: soma de todos os lados",
        "Matriz m×n: m linhas, n colunas | Elemento aᵢⱼ: linha i, coluna j"
      ],
      "tips": [
        "Em problemas de equivalência (fichas, moedas, objetos), converta tudo para a mesma unidade antes de calcular",
        "Para MMC e MDC: decomposição em fatores primos é o método mais seguro — não tente de cabeça",
        "Em geometria: identifique a figura antes de aplicar a fórmula — a FGV descreve a figura em vez de mostrar",
        "Em matrizes: aᵢⱼ significa linha i, coluna j — não inverta! O primeiro índice é sempre a linha",
        "Problemas de idade/horário/ordem: use tabela de associação (tópico 1) combinada com equações simples"
      ],
      "errosComuns": [
        "Confundir MMC com MDC — MMC é o MENOR múltiplo (maior número), MDC é o MAIOR divisor (menor número)",
        "Esquecer que 2 é primo — muitos candidatos acham que primos são só os ímpares",
        "Inverter linha e coluna na notação de matrizes: aᵢⱼ é linha i, coluna j (não o contrário)",
        "Usar a fórmula de área errada para a figura — memorize as 5 principais: quadrado, retângulo, triângulo, círculo, trapézio"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    }
  ],
  "portugues": [
    {
      "title": "Compreensão e interpretação de textos",
      "summary": "Habilidade mais cobrada pela FGV. Exige distinguir o que está explícito no texto (compreensão) daquilo que exige inferência a partir do contexto e repertório do leitor (interpretação).",
      "detail": "A compreensão textual é o processo de decodificação da mensagem explícita — tema, fatos e argumentos centrais. Já a interpretação vai além: mobiliza conhecimento prévio para gerar sentido mais profundo. A FGV frequentemente cobra essa distinção em enunciados como \"De acordo com o texto...\" (compreensão) versus \"Conclui-se que...\" ou \"Infere-se do texto que...\" (interpretação). O domínio abrange textos verbais, não-verbais (imagens, gráficos, símbolos) e multimodais.",
      "peso": "Muito Alta (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em ~40% das questões de Português. A banca adora cobrar inferência a partir de textos técnicos e jurídicos.",
      "examples": [
        {
          "question": "Como a FGV costuma diferenciar compreensão de interpretação?",
          "answer": "Questões de compreensão usam enunciados como \"O autor afirma que...\" ou \"Segundo o texto...\" — a resposta está literalmente no texto. Questões de interpretação usam \"Conclui-se que...\" ou \"O texto permite deduzir que...\" — exigem raciocínio além do explícito.",
          "aplication": "Ao ler o enunciado, identifique imediatamente se a banca quer localização (compreensão) ou inferência (interpretação). Isso define a estratégia de busca no texto."
        }
      ],
      "keyPoints": [
        "Diferenciar compreensão (explícito) de interpretação (inferencial)",
        "Identificar tema central, ideia principal e ideias secundárias",
        "Reconhecer a intenção do autor: informar, persuadir, entreter, instruir",
        "Analisar textos não-verbais: cores, formas, símbolos, gestos",
        "Relacionar informações do texto com conhecimento prévio (inferência)"
      ],
      "tips": [
        "Leia o enunciado antes do texto para saber o que procurar",
        "Em questões de compreensão, a resposta é paráfrase do texto — não invente",
        "Desconfie de alternativas verdadeiras no mundo real mas não sustentadas pelo texto",
        "Sublinhe os verbos do enunciado: \"afirma\", \"deduz\", \"infere\", \"conclui\" — cada um pede uma operação diferente"
      ],
      "errosComuns": [
        "Levar opinião pessoal para a resposta em vez de se ater ao texto",
        "Confundir fato com opinião do autor",
        "Responder com base apenas no senso comum, ignorando o contexto do texto"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Tipos e gêneros textuais",
      "summary": "Os tipos textuais são modelos estruturais fixos (narrativo, descritivo, dissertativo-argumentativo, expositivo, injuntivo). Os gêneros são manifestações concretas e ilimitadas que se adaptam ao contexto social.",
      "detail": "Os cinco tipos textuais clássicos — narrativo (conta fatos com personagens, tempo, espaço), descritivo (caracteriza seres/objetos com adjetivos), dissertativo-argumentativo (defende tese com argumentos), expositivo (informa sem opinar) e injuntivo (instrui/orienta com imperativo) — são a base. Os gêneros textuais (conto, crônica, editorial, bula, receita, e-mail, notícia etc.) são as formas concretas que combinam um ou mais tipos. Um mesmo gênero pode mesclar características: uma notícia é predominantemente expositiva, mas pode ter trechos narrativos.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em questões que pedem classificação de fragmentos ou reconhecimento da função predominante do texto.",
      "examples": [
        {
          "question": "Qual a diferença entre tipo injuntivo e gênero \"receita culinária\"?",
          "answer": "O tipo injuntivo é a estrutura abstrata (verbos no imperativo, instruções sequenciais). A receita culinária é o gênero concreto que materializa esse tipo, com ingredientes e modo de preparo.",
          "aplication": "A FGV pode pedir para identificar o tipo predominante em um trecho de edital, reportagem ou crônica."
        }
      ],
      "keyPoints": [
        "Decorar os 5 tipos textuais e suas marcas linguísticas",
        "Narrativo: verbos no pretérito, personagens, enredo, tempo e espaço",
        "Descritivo: adjetivos, verbos de ligação, estrutura estática (sem ação)",
        "Dissertativo-argumentativo: tese + argumentos + conclusão",
        "Expositivo: linguagem neutra, informal, sem opinião",
        "Injuntivo: verbos no imperativo, frases curtas e objetivas",
        "Entender que gêneros são ilimitados e se adaptam a contextos sociais"
      ],
      "tips": [
        "Foque nas marcas linguísticas: presença de adjetivos = descritivo; verbos no passado com personagens = narrativo",
        "A mesma notícia pode ter parágrafos narrativos (o fato) e descritivos (o cenário)",
        "Gêneros digitais (e-mail, post, tweet) também são classificáveis — a FGV está atualizada nisso"
      ],
      "errosComuns": [
        "Confundir tipo expositivo com dissertativo: a diferença é a tese (expositivo não defende ideia)",
        "Achar que \"texto argumentativo\" e \"dissertativo\" são a mesma coisa — todo argumentativo é dissertativo, mas nem todo dissertativo é necessariamente argumentativo"
      ],
      "usefulLinks": [
        { "label": "MDN — Como funciona a Internet", "url": "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work", "type": "documentacao" },
        { "label": "Redes de computadores — Curso em Vídeo", "url": "https://www.youtube.com/watch?v=yOgirx5BcR4", "type": "video" }
      ]
    },
    {
      "title": "Ortografia oficial",
      "summary": "Domínio das regras de grafia conforme o Novo Acordo Ortográfico, incluindo o uso correto de X/CH, S/Z, G/J, SS/Ç e as letras K, W, Y incorporadas ao alfabeto.",
      "detail": "A ortografia oficial rege a escrita correta das palavras. O Novo Acordo Ortográfico (2009) reintroduziu K, W e Y no alfabeto (26 letras). As principais dúvidas recaem sobre: X (após ME/EN: mexer, enxergar; após ditongos: caixa, baixo; palavras indígenas/africanas: abacaxi, orixá), S/Z (sufixos -ês/-esa, -isar/-izar), e G/J (terminações -agem/-igem/-ugem). A leitura frequente é a melhor ferramenta de fixação, pois há muitas exceções.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Aparece em questões de reescrita e correção gramatical, geralmente combinada com outros conteúdos.",
      "examples": [
        {
          "question": "Quando usar X em vez de CH?",
          "answer": "Use X após as sílabas ME- (mexer, mexilhão) e EN- (enxada, enxergar), após ditongos (caixa, peixe, trouxa) e em palavras de origem indígena/africana (abacaxi, xavante, orixá).",
          "aplication": "A FGV insere erros ortográficos em alternativas de questões de reescrita — fique atento a palavras com som de /ch/ grafadas incorretamente."
        }
      ],
      "keyPoints": [
        "Alfabeto: 26 letras (K, W, Y são oficiais desde 2009)",
        "X após ME- e EN-: mexer, enxada, enxoval (exceto: encher e derivados de cheio)",
        "X após ditongos: caixa, baixo, peixe, trouxa",
        "Sufixos -ês/-esa (nacionalidade): português, francesa",
        "Sufixos -isar (formador de verbo a partir de palavra com S): avisar (aviso), paralisar (paralisia)",
        "Sufixos -izar (formador de verbo quando não há S na base): realizar (real), utilizar (útil)"
      ],
      "tips": [
        "Crie flashcards com pares problemáticos: concerto/conserto, sessão/seção/cessão",
        "A FGV gosta de testar parônimos em contexto — a diferença de uma letra muda todo o sentido",
        "Leia as alternativas em voz alta (mentalmente); o ouvido treinado detecta grafias estranhas"
      ],
      "errosComuns": [
        "\"Mecher\" em vez de \"mexer\" — word-final mental block",
        "Confundir \"viajem\" (verbo) com \"viagem\" (substantivo)",
        "\"Excessão\" em vez de \"exceção\""
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Coesão e coerência textual",
      "summary": "Coesão são os mecanismos linguísticos que conectam as partes do texto (conectores, pronomes, repetições). Coerência é a lógica interna que dá unidade de sentido ao texto.",
      "detail": "A coesão opera no nível da superfície textual por meio de elementos de referenciação (anáfora, catáfora), substituição lexical (sinônimos, hiperônimos), elipse e conectores (conjunções, preposições, advérbios). A coerência atua no nível profundo: exige que as ideias sejam compatíveis entre si, sem contradições. Um texto pode ser coeso mas incoerente (bem conectado, porém ilógico), e vice-versa. A FGV cobra especialmente a identificação de relações lógicas estabelecidas por conectores e a reorganização de períodos mantendo o sentido original.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em reescrita de trechos, substituição de conectores e identificação de falhas de coerência.",
      "examples": [
        {
          "question": "O que são elementos de referenciação?",
          "answer": "São palavras que retomam (anáfora) ou antecipam (catáfora) informações no texto. Ex.: \"João chegou. Ele estava cansado.\" — \"Ele\" é anafórico (retoma João). \"Só quero isto: paz.\" — \"Isto\" é catafórico (antecipa \"paz\").",
          "aplication": "A FGV pede para identificar o referente de um pronome ou termo coesivo — é preciso localizar a palavra ou expressão que ele substitui."
        }
      ],
      "keyPoints": [
        "Coesão referencial: anáfora (retoma), catáfora (antecipa), elipse (omissão)",
        "Coesão lexical: sinonímia, hiperonímia, repetição, nominalização",
        "Coesão sequencial: conectores de adição, oposição, causa, conclusão, tempo",
        "Coerência: compatibilidade lógica entre as ideias, ausência de contradição",
        "Reconhecer quando um conector estabelece relação inadequada (falha de coesão)"
      ],
      "tips": [
        "Ao resolver questões de reescrita, verifique primeiro se o conector preserva a relação lógica original",
        "Sublinhe os pronomes e pergunte: \"a que/quem se refere?\" — é o jeito mais rápido de testar coesão",
        "Cuidado com ambiguidade referencial: quando um pronome pode se referir a dois antecedentes"
      ],
      "errosComuns": [
        "Trocar conectores de causa (porque) por consequência (portanto) na reescrita",
        "Não perceber que a elipse do sujeito pode gerar ambiguidade",
        "Achar que um texto bem conectado é sempre coerente"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Classes de palavras e pontuação",
      "summary": "Domínio das 10 classes gramaticais e das regras de pontuação, dois conteúdos que a FGV frequentemente combina em questões de análise sintática e reescrita.",
      "detail": "As classes de palavras (substantivo, artigo, adjetivo, numeral, pronome, verbo, advérbio, preposição, conjunção, interjeição) são a base da análise morfológica. A pontuação (vírgula, ponto e vírgula, dois-pontos, travessão, parênteses, aspas) organiza a estrutura sintática e define relações de sentido. A FGV cobra especialmente: vírgula para separar orações coordenadas, isolar adjuntos adverbiais deslocados, marcar elipse verbal e separar apostos explicativos.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "As duas maiores incidências em correção gramatical: pontuação e concordância.",
      "examples": [
        {
          "question": "Qual a regra de vírgula mais cobrada pela FGV?",
          "answer": "A vírgula entre orações coordenadas assindéticas (sem conjunção) e a vírgula para isolar adjunto adverbial deslocado longo (mais de 3 palavras). A banca também adora testar a diferença entre oração adjetiva restritiva (sem vírgula) e explicativa (com vírgula).",
          "aplication": "Em questões de reescrita, a mudança de pontuação frequentemente altera o sentido — especialmente nas adjetivas."
        }
      ],
      "keyPoints": [
        "Substantivo: núcleo do sujeito/objeto; flexiona em gênero e número",
        "Adjetivo: caracteriza o substantivo; concorda em gênero e número",
        "Pronome: substitui ou acompanha o substantivo (pessoal, possessivo, demonstrativo, relativo)",
        "Verbo: núcleo do predicado; flexiona em pessoa, número, tempo e modo",
        "Conjunção: conecta orações (coordenativa: aditiva, adversativa, alternativa, conclusiva, explicativa / subordinativa: integrante, causal, concessiva, condicional, final, temporal etc.)",
        "Vírgula: nunca separa sujeito de predicado nem verbo de complemento",
        "Dois-pontos: anunciam citação, enumeração ou explicação",
        "Travessão: isola termo intercalado com mais ênfase que a vírgula"
      ],
      "tips": [
        "Para pontuação, leia a frase em voz alta; a pausa natural geralmente indica onde a vírgula é necessária",
        "Decore: não se separa por vírgula sujeito e predicado, verbo e objeto, nome e complemento nominal",
        "A diferença entre adjunto adverbial curto (vírgula opcional) e longo (vírgula obrigatória) é pegadinha clássica"
      ],
      "errosComuns": [
        "Colocar vírgula entre sujeito e predicado: \"O aluno, estudou.\" ❌",
        "Confundir \"porque\" (conjunção causal) com \"por que\" (preposição + pronome)",
        "Não reconhecer a diferença semântica entre oração restritiva (sem vírgula) e explicativa (com vírgula)"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Concordância, regência e crase",
      "summary": "Três pilares da norma culta que a FGV cobra de forma integrada: concordância (harmonia entre palavras), regência (relação entre verbo/nome e complemento) e crase (fusão de preposição + artigo).",
      "detail": "A concordância verbal segue a regra geral: verbo concorda com o núcleo do sujeito em pessoa e número. Casos especiais (sujeito composto, coletivo, porcentagem, expressões partitivas) são frequentes na FGV. A concordância nominal exige que artigo, adjetivo, numeral e pronome concordem com o substantivo. A regência verbal define a preposição exigida pelo verbo (ex.: \"assistir a\", \"obedecer a\", \"visar a\"). A crase ocorre apenas na fusão de preposição \"a\" com artigo \"a/as\" ou pronome demonstrativo \"aquele/aquela/aquilo\".",
      "peso": "Altíssima (⚖️ ⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Presente em praticamente toda prova. Concordância e crase são os campeões de incidência.",
      "examples": [
        {
          "question": "Quando usar crase?",
          "answer": "Crase = preposição \"a\" + artigo feminino \"a/as\". Use apenas quando um termo exige preposição \"a\" e o termo seguinte admite artigo feminino. Regra prática: substitua a palavra feminina por uma masculina; se aparecer \"ao\", há crase. Ex.: \"Fui à praia\" → \"Fui ao clube\" (tem crase). \"Gosto de praia\" → \"Gosto de clube\" (não tem crase, a preposição é \"de\").",
          "aplication": "A FGV adora testar crase em locuções adverbiais femininas (à noite, à tarde, às pressas) e antes de \"aquele/aquela/aquilo\"."
        }
      ],
      "keyPoints": [
        "Concordância verbal: verbo concorda com núcleo do sujeito",
        "Casos especiais: sujeito composto antes do verbo (plural), depois (concorda com o mais próximo ou plural)",
        "Concordância nominal: adjetivo concorda com todos os substantivos ou apenas com o mais próximo",
        "Regência verbal: decorar principais verbos (aspirar, assistir, visar, obedecer, preferir, simpatizar)",
        "Crase: preposição \"a\" + artigo \"a/as\" ou \"aquele/aquela/aquilo\"",
        "Crase proibida: antes de palavra masculina, verbo, pronome pessoal, \"casa\" sem especificação"
      ],
      "tips": [
        "Na dúvida da crase, use o truque do \"ao\": troque a palavra feminina pela masculina equivalente",
        "Decore os verbos que mudam de sentido com/sem preposição: aspirar (respirar/sorver vs. desejar), visar (mirar vs. objetivar)",
        "Concordância com \"a maioria de\", \"parte de\": verbo pode ficar no singular ou plural (as duas formas são aceitas, mas a FGV costuma cobrar uma delas no contexto)"
      ],
      "errosComuns": [
        "Esquecer que \"obedecer\" e \"assistir\" (no sentido de ver) exigem preposição \"a\"",
        "Colocar crase antes de verbo: \"à partir\" ❌ → \"a partir\" ✅",
        "Confundir \"à\" (crase) com \"a\" (artigo ou preposição isolada)"
      ],
      "usefulLinks": [
        { "label": "GitHub Actions Documentation", "url": "https://docs.github.com/pt/actions", "type": "documentacao" },
        { "label": "GitLab CI/CD Documentation", "url": "https://docs.gitlab.com/ci/", "type": "documentacao" },
        { "label": "DevOps explicado — Código Fonte TV", "url": "https://www.youtube.com/watch?v=iwGlorBQ3io", "type": "video" },
        { "label": "CI/CD na prática — Full Cycle", "url": "https://www.youtube.com/watch?v=nI4AJgZBriE", "type": "video" }
      ]
    },
    {
      "title": "Estrutura do período e sintaxe",
      "summary": "Análise da estrutura morfossintática do período composto por coordenação e subordinação. A FGV cobra a reorganização de períodos mantendo o sentido original.",
      "detail": "O período é a unidade sintática formada por uma ou mais orações. Na coordenação, as orações são independentes (aditivas, adversativas, alternativas, conclusivas, explicativas). Na subordinação, há dependência sintática: as orações subordinadas podem ser substantivas (exercem função de sujeito, objeto, complemento), adjetivas (restritivas ou explicativas) ou adverbiais (causais, concessivas, condicionais, finais, temporais, consecutivas, comparativas, conformativas, proporcionais). A FGV frequentemente pede para transformar uma estrutura em outra sem alterar o sentido.",
      "peso": "Alta (⚖️ ⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em reescrita e em questões que pedem classificação de orações.",
      "examples": [
        {
          "question": "Qual a diferença entre oração subordinada adjetiva restritiva e explicativa?",
          "answer": "A restritiva (sem vírgula) delimita o antecedente: \"Os alunos que estudaram passaram\" (só os que estudaram). A explicativa (com vírgula) generaliza: \"Os alunos, que estudaram, passaram\" (todos estudaram e todos passaram). A vírgula muda completamente o sentido.",
          "aplication": "A FGV adora pedir reescrita trocando restritiva por explicativa (ou vice-versa) e perguntar se o sentido se mantém."
        }
      ],
      "keyPoints": [
        "Período simples: uma oração (um verbo ou locução verbal)",
        "Período composto por coordenação: orações independentes ligadas por conjunções coordenativas",
        "Período composto por subordinação: oração principal + subordinada(s)",
        "Orações subordinadas substantivas: substituíveis por \"isso\" (sujeito, objeto direto, indireto, complemento nominal, predicativo, aposto)",
        "Orações subordinadas adjetivas: restritivas (sem vírgula) e explicativas (com vírgula)",
        "Orações subordinadas adverbiais: 9 tipos — causal, consecutiva, condicional, concessiva, final, temporal, comparativa, conformativa, proporcional"
      ],
      "tips": [
        "Para classificar oração subordinada substantiva, tente substituí-la por \"isso\" — se fizer sentido, é substantiva",
        "Decore os conectores de cada tipo de adverbial: causa (porque, já que, visto que), concessão (embora, ainda que, mesmo que), condição (se, caso, desde que)",
        "Na reescrita, verifique se a nova estrutura preserva a relação lógica original (causa ↔ consequência, condição ↔ resultado)"
      ],
      "errosComuns": [
        "Confundir oração coordenada explicativa com subordinada causal",
        "Não perceber que a inversão da ordem das orações pode exigir ajuste de pontuação",
        "Achar que toda oração com \"que\" é subordinada — pode ser coordenada explicativa"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Colocação pronominal e reescrita",
      "summary": "Regras de posição dos pronomes átonos (próclise, mesóclise, ênclise) e técnicas de reescrita de frases e parágrafos mantendo correção gramatical e sentido original.",
      "detail": "A colocação pronominal define a posição dos pronomes oblíquos átonos (me, te, se, o, a, lhe, nos, vos, os, as, lhes) em relação ao verbo. A ênclise (depois do verbo) é a regra geral no português brasileiro, mas a próclise (antes do verbo) é obrigatória com palavras atrativas: negativas (não, nunca), advérbios, pronomes relativos (que, quem, onde), indefinidos (tudo, nada, alguém) e conjunções subordinativas. A mesóclise (no meio do verbo) só ocorre com futuro do presente e futuro do pretérito sem palavra atrativa. A FGV cobra reescrita de frases mantendo correção e sentido.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Aparece em questões de reescrita e correção gramatical, frequentemente combinada com outros tópicos.",
      "examples": [
        {
          "question": "Quando usar próclise obrigatoriamente?",
          "answer": "Use próclise quando houver palavra atrativa antes do verbo: \"Não me diga isso\" (negativa), \"Sempre me ajuda\" (advérbio), \"Quem me conhece sabe\" (pronome relativo), \"Tudo me agrada\" (indefinido). Em frases iniciadas por verbo, sem palavra atrativa, a ênclise é recomendada: \"Diga-me a verdade\".",
          "aplication": "A FGV pede para identificar ou corrigir erro de colocação pronominal em alternativas de reescrita."
        }
      ],
      "keyPoints": [
        "Próclise (antes do verbo): obrigatória com palavras atrativas (negativas, advérbios, relativos, indefinidos, conjunções subordinativas)",
        "Ênclise (depois do verbo): regra geral, usada no início de frases e com verbos no infinitivo impessoal",
        "Mesóclise (meio do verbo): exclusiva do futuro do presente e futuro do pretérito sem palavra atrativa",
        "Reescrita: preservar o sentido original, a correção gramatical e o nível de formalidade",
        "Na reescrita, atenção à troca de voz ativa por passiva, discurso direto por indireto"
      ],
      "tips": [
        "Na dúvida, verifique se há palavra atrativa antes do verbo; se houver, próclise é obrigatória",
        "A mesóclise é raríssima na prática — a FGV cobra mais para confundir o candidato",
        "Em reescrita, a banca frequentemente insere erro sutil de colocação pronominal como distrator"
      ],
      "errosComuns": [
        "Iniciar frase com pronome átono: \"Me diga a verdade\" ❌ → \"Diga-me a verdade\" ✅",
        "Não reconhecer que \"que\" (pronome relativo) é palavra atrativa",
        "Usar mesóclise onde não cabe (fora do futuro) ou deixar de usar quando obrigatória"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    },
    {
      "title": "Significação e substituição de palavras",
      "summary": "Estudo do sentido das palavras (sinonímia, antonímia, homonímia, paronímia, polissemia) e técnicas de substituição lexical sem alterar o sentido do texto.",
      "detail": "A significação lexical é crucial para questões de vocabulário e reescrita. Sinônimos são palavras com sentido equivalente (contextual — nem sempre intercambiáveis). Antônimos têm sentido oposto. Homônimos têm mesma pronúncia/grafia mas significados diferentes (são/são, banco/banco). Parônimos são parecidos mas diferentes (comprimento/cumprimento, tráfego/tráfico, polissêmica, homógrafos). Polissemia é a multiplicidade de sentidos de uma mesma palavra. A FGV pede substituição de palavras por sinônimos que preservem o sentido exato no contexto.",
      "peso": "Média (⚖️ ⚖️ ⚖️)",
      "incidenciaFGV": "Cobrada em questões de vocabulário contextual e substituição de termos em reescrita.",
      "examples": [
        {
          "question": "Qual a diferença entre homônimos e parônimos?",
          "answer": "Homônimos: mesma pronúncia/grafia, significados diferentes. Ex.: \"manga\" (fruta) e \"manga\" (de camisa); \"são\" (saudável) e \"são\" (verbo ser). Parônimos: grafia/pronúncia parecida, mas significados diferentes. Ex.: \"comprimento\" (extensão) / \"cumprimento\" (saudação); \"tráfego\" (trânsito) / \"tráfico\" (comércio ilegal).",
          "aplication": "A FGV inclui parônimos em alternativas para testar se o candidato percebe a troca sutil de sentido."
        }
      ],
      "keyPoints": [
        "Sinonímia: equivalência de sentido (total ou parcial, dependendo do contexto)",
        "Antonímia: oposição de sentido",
        "Homonímia: mesma forma, sentidos diferentes (homógrafos ou homófonos)",
        "Paronímia: forma parecida, sentidos diferentes",
        "Polissemia: múltiplos sentidos de uma mesma palavra",
        "Substituição: escolher sinônimo que preserve o sentido e o registro (formal/informal)"
      ],
      "tips": [
        "Ao substituir uma palavra, verifique se o sinônimo mantém o mesmo tom (formal, técnico, coloquial)",
        "Cuidado com sinônimos \"falsos amigos\" que parecem equivalentes mas têm nuance diferente",
        "Decore os pares de parônimos mais cobrados: descrição/discrição, eminente/iminente, infligir/infringir"
      ],
      "errosComuns": [
        "Trocar \"eminente\" (ilustre) por \"iminente\" (prestes a acontecer)",
        "Usar sinônimo que não cabe no contexto específico — a sinonímia é quase sempre contextual",
        "Confundir \"ratificar\" (confirmar) com \"retificar\" (corrigir)"
      ],
      "usefulLinks": [
        { "label": "Canal Estratégia Concursos TI no YouTube", "url": "https://www.youtube.com/@estrategiaconcursos", "type": "video" }
      ]
    }
  ]
};
