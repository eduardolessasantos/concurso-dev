/**
 * Script para adicionar usefulLinks a cada tópico do topics.data.ts
 * Execução: node add-useful-links.js
 * (Executar dentro de angular-app/)
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'src/app/services/topics.data.ts');

// ─── Base de links curados por palavra-chave ────────────────────────────────
// Cada entrada: { keywords: string[], docs: UsefulLink[], videos: UsefulLink[] }
// Prioridade: primeiro match de keywords é usado.
// keywords são testadas contra title.toLowerCase()

const LINK_DB = [
  // ── Arquitetura de Software ──────────────────────────────────────────────
  {
    keywords: ['arquitetura de software', 'princípios arquiteturais', 'princípios arquiteturais'],
    docs: [
      { label: 'Martin Fowler — Patterns of Enterprise Architecture', url: 'https://martinfowler.com/architecture/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Arquitetura de Software — o que é? — Código Fonte TV', url: 'https://www.youtube.com/watch?v=kYx6GIU2Kbk', type: 'video' },
      { label: 'Princípios SOLID na prática — DevSuperior', url: 'https://www.youtube.com/watch?v=mkx0CdWiPRA', type: 'video' }
    ]
  },
  {
    keywords: ['orientação a objetos', 'arquitetura web'],
    docs: [
      { label: 'MDN — Conceitos de POO', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object-oriented_programming', type: 'documentacao' }
    ],
    videos: [
      { label: 'Orientação a Objetos — Curso em Vídeo (Gustavo Guanabara)', url: 'https://www.youtube.com/watch?v=KlIL63MeyMY', type: 'video' }
    ]
  },
  {
    keywords: ['servidor web', 'servidor de aplicações'],
    docs: [
      { label: 'MDN — Visão geral de servidores web', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_web_server', type: 'documentacao' },
      { label: 'Documentação Nginx', url: 'https://nginx.org/en/docs/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Servidor Web vs Servidor de Aplicações — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=t9tXWBq7FV0', type: 'video' }
    ]
  },
  {
    keywords: ['interoperabilidade', 'soa', 'web services'],
    docs: [
      { label: 'W3C — Web Services Architecture', url: 'https://www.w3.org/TR/ws-arch/', type: 'documentacao' },
      { label: 'Swagger/OpenAPI Specification', url: 'https://swagger.io/specification/', type: 'documentacao' }
    ],
    videos: [
      { label: 'SOA e Web Services explicado — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=rNGNfkOhZ5E', type: 'video' },
      { label: 'SOAP vs REST — Código Fonte TV', url: 'https://www.youtube.com/watch?v=yXLBvUBMp8A', type: 'video' }
    ]
  },
  {
    keywords: ['apis', 'swagger', 'documentação de api'],
    docs: [
      { label: 'OpenAPI Initiative', url: 'https://www.openapis.org/', type: 'documentacao' },
      { label: 'Swagger Documentation', url: 'https://swagger.io/docs/', type: 'documentacao' }
    ],
    videos: [
      { label: 'API RESTful com Swagger — Michelli Brito', url: 'https://www.youtube.com/watch?v=az-g2L1E5-s', type: 'video' }
    ]
  },
  {
    keywords: ['mensageria', 'integração assíncrona', 'broker', 'kafka', 'rabbitmq'],
    docs: [
      { label: 'Apache Kafka Documentation', url: 'https://kafka.apache.org/documentation/', type: 'documentacao' },
      { label: 'RabbitMQ Documentation', url: 'https://www.rabbitmq.com/documentation.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Kafka do zero ao essencial — Full Cycle', url: 'https://www.youtube.com/watch?v=o5yviW6QSn8', type: 'video' },
      { label: 'Mensageria com RabbitMQ — DevSuperior', url: 'https://www.youtube.com/watch?v=h3MoSnctMdE', type: 'video' }
    ]
  },
  {
    keywords: ['hexagonal', 'microsserviços', 'api gateway'],
    docs: [
      { label: 'Martin Fowler — Microservices', url: 'https://martinfowler.com/articles/microservices.html', type: 'documentacao' },
      { label: 'Alistair Cockburn — Hexagonal Architecture', url: 'https://alistair.cockburn.us/hexagonal-architecture/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Microsserviços na prática — Full Cycle', url: 'https://www.youtube.com/watch?v=BYR81LAQlQ4', type: 'video' },
      { label: 'Arquitetura Hexagonal — DevSuperior', url: 'https://www.youtube.com/watch?v=MuRMCk5sqIg', type: 'video' }
    ]
  },
  {
    keywords: ['containers', 'orquestração', 'docker', 'kubernetes'],
    docs: [
      { label: 'Docker Documentation', url: 'https://docs.docker.com/', type: 'documentacao' },
      { label: 'Kubernetes Documentation', url: 'https://kubernetes.io/pt-br/docs/home/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Docker para iniciantes — LinuxTips', url: 'https://www.youtube.com/watch?v=Wm99C_f7Kxw', type: 'video' },
      { label: 'Kubernetes do zero — Full Cycle', url: 'https://www.youtube.com/watch?v=Za8WFjO_8WQ', type: 'video' }
    ]
  },
  {
    keywords: ['internet', 'intranet', 'extranet', 'portais'],
    docs: [
      { label: 'W3C — Web Standards', url: 'https://www.w3.org/standards/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Internet, Intranet e Extranet — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=5hEW8kC3qxI', type: 'video' }
    ]
  },
  {
    keywords: ['xml', 'xslt', 'json', 'uddi'],
    docs: [
      { label: 'MDN — XML', url: 'https://developer.mozilla.org/pt-BR/docs/Web/XML', type: 'documentacao' },
      { label: 'MDN — JSON', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/JSON', type: 'documentacao' }
    ],
    videos: [
      { label: 'XML e JSON — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=TPi5cQIeRts', type: 'video' }
    ]
  },
  {
    keywords: ['frontend', 'html', 'css', 'vuejs', 'angular', 'react'],
    docs: [
      { label: 'MDN Web Docs', url: 'https://developer.mozilla.org/pt-BR/', type: 'documentacao' },
      { label: 'Angular Documentation', url: 'https://angular.dev/', type: 'documentacao' },
      { label: 'React Documentation', url: 'https://react.dev/', type: 'documentacao' }
    ],
    videos: [
      { label: 'HTML e CSS para iniciantes — Curso em Vídeo', url: 'https://www.youtube.com/watch?v=Ejkb_YpuHWs', type: 'video' },
      { label: 'React do zero — Filipe Deschamps', url: 'https://www.youtube.com/watch?v=aJR7f45dBNs', type: 'video' }
    ]
  },
  {
    keywords: ['spa', 'pwa', 'acessibilidade', 'service worker'],
    docs: [
      { label: 'MDN — Progressive web apps', url: 'https://developer.mozilla.org/pt-BR/docs/Web/Progressive_web_apps', type: 'documentacao' },
      { label: 'WCAG 2.1 (W3C)', url: 'https://www.w3.org/TR/WCAG21/', type: 'documentacao' }
    ],
    videos: [
      { label: 'PWA do zero — Filipe Deschamps', url: 'https://www.youtube.com/watch?v=B4hWcswz4oo', type: 'video' },
      { label: 'Acessibilidade Web na prática — Código Fonte TV', url: 'https://www.youtube.com/watch?v=ixoNjTkzAug', type: 'video' }
    ]
  },
  {
    keywords: ['https', 'ssl', 'tls', 'criptografia'],
    docs: [
      { label: 'MDN — HTTPS', url: 'https://developer.mozilla.org/pt-BR/docs/Glossary/HTTPS', type: 'documentacao' },
      { label: 'RFC 8446 — TLS 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446', type: 'documentacao' }
    ],
    videos: [
      { label: 'HTTPS e TLS explicados — Código Fonte TV', url: 'https://www.youtube.com/watch?v=cuR05y_2Gxc', type: 'video' }
    ]
  },
  {
    keywords: ['blockchain'],
    docs: [
      { label: 'Ethereum.org — O que é blockchain?', url: 'https://ethereum.org/pt-br/what-is-ethereum/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Blockchain explicado — Código Fonte TV', url: 'https://www.youtube.com/watch?v=HBFwOmGQAao', type: 'video' }
    ]
  },
  {
    keywords: ['ux', 'usabilidade', 'experiência do usuário'],
    docs: [
      { label: 'Nielsen Norman Group — UX', url: 'https://www.nngroup.com/', type: 'documentacao' },
      { label: 'WCAG 2.1 — Acessibilidade Web', url: 'https://www.w3.org/TR/WCAG21/', type: 'documentacao' }
    ],
    videos: [
      { label: 'UX Design para iniciantes — Attekita Dev', url: 'https://www.youtube.com/watch?v=cXVmN2b7-H0', type: 'video' }
    ]
  },
  // ── Banco de Dados ────────────────────────────────────────────────────────
  {
    keywords: ['modelagem de dados', 'conceitual', 'lógica', 'física'],
    docs: [
      { label: 'PostgreSQL — Conceitos de BD', url: 'https://www.postgresql.org/docs/current/tutorial-concepts.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Modelagem de dados — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=Zp0i5n4YJvg', type: 'video' }
    ]
  },
  {
    keywords: ['mer', 'der', 'entidades', 'relacionamentos', 'cardinalidade'],
    docs: [
      { label: 'Bóson Treinamentos — MER e DER', url: 'https://www.bosontreinamentos.com.br/bancos-de-dados/curso-de-modelagem-de-dados/', type: 'documentacao' }
    ],
    videos: [
      { label: 'MER e DER na prática — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=Q_KTYFgvu1s', type: 'video' }
    ]
  },
  {
    keywords: ['modelo relacional', 'chaves', 'integridade', 'acid'],
    docs: [
      { label: 'PostgreSQL — ACID e transações', url: 'https://www.postgresql.org/docs/current/tutorial-transactions.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'ACID explicado — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=pomxJOFVcQs', type: 'video' }
    ]
  },
  {
    keywords: ['normalização', '1fn', '2fn', '3fn'],
    docs: [
      { label: 'PostgreSQL — Modelagem relacional', url: 'https://www.postgresql.org/docs/current/tutorial-sql.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Normalização de banco de dados — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=1HqLxhGBmLE', type: 'video' }
    ]
  },
  {
    keywords: ['sql', 'ddl', 'dml', 'dql', 'dcl', 'dtl'],
    docs: [
      { label: 'PostgreSQL Documentation — SQL', url: 'https://www.postgresql.org/docs/current/sql.html', type: 'documentacao' },
      { label: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'documentacao' }
    ],
    videos: [
      { label: 'SQL completo — Curso em Vídeo', url: 'https://www.youtube.com/watch?v=Ofktsne-utM', type: 'video' }
    ]
  },
  {
    keywords: ['sgbd', 'metadados', 'backup'],
    docs: [
      { label: 'PostgreSQL — Backup e Restore', url: 'https://www.postgresql.org/docs/current/backup.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Tipos de backup de banco de dados — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=A_pQimn0Lx8', type: 'video' }
    ]
  },
  {
    keywords: ['multidimensional', 'modelagem dimensional', 'estrela', 'floco de neve', 'data warehouse'],
    docs: [
      { label: 'Kimball Group — Data Warehouse', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Modelagem dimensional — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=h1fQRRWvFYY', type: 'video' }
    ]
  },
  {
    keywords: ['nosql', 'documentos', 'chave-valor', 'grafos', 'mongodb', 'redis'],
    docs: [
      { label: 'MongoDB Documentation', url: 'https://www.mongodb.com/docs/', type: 'documentacao' },
      { label: 'Redis Documentation', url: 'https://redis.io/docs/latest/', type: 'documentacao' }
    ],
    videos: [
      { label: 'NoSQL explicado — Código Fonte TV', url: 'https://www.youtube.com/watch?v=7W1GGMK7gL8', type: 'video' },
      { label: 'MongoDB na prática — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=x9tC0eK0GtA', type: 'video' }
    ]
  },
  {
    keywords: ['data lake', 'big data', 'hadoop', 'spark'],
    docs: [
      { label: 'Apache Spark Documentation', url: 'https://spark.apache.org/docs/latest/', type: 'documentacao' },
      { label: 'Databricks — Data Lake vs DW', url: 'https://www.databricks.com/br/glossary/data-lakehouse', type: 'documentacao' }
    ],
    videos: [
      { label: 'Big Data e Data Lake — Código Fonte TV', url: 'https://www.youtube.com/watch?v=W2-g7TjbByw', type: 'video' }
    ]
  },
  // ── Gestão e Governança de TI ─────────────────────────────────────────────
  {
    keywords: ['governança de ti', 'cobit'],
    docs: [
      { label: 'ISACA — COBIT', url: 'https://www.isaca.org/resources/cobit', type: 'documentacao' }
    ],
    videos: [
      { label: 'COBIT para concursos — Gran Cursos Online', url: 'https://www.youtube.com/watch?v=IY9Y-wJ7gDk', type: 'video' }
    ]
  },
  {
    keywords: ['itil'],
    docs: [
      { label: 'AXELOS — ITIL', url: 'https://www.axelos.com/certifications/itil-service-management', type: 'documentacao' }
    ],
    videos: [
      { label: 'ITIL para concursos — Estratégia Concursos', url: 'https://www.youtube.com/watch?v=vu2KcjuCj-0', type: 'video' }
    ]
  },
  {
    keywords: ['scrum', 'kanban', 'lean', 'ágil', 'agile'],
    docs: [
      { label: 'Scrum Guide (2020)', url: 'https://scrumguides.org/scrum-guide.html', type: 'documentacao' },
      { label: 'Agile Manifesto', url: 'https://agilemanifesto.org/iso/ptbr/manifesto.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Scrum em 9 minutos — Código Fonte TV', url: 'https://www.youtube.com/watch?v=XfvQWnRgxG0', type: 'video' },
      { label: 'Kanban na prática — Attekita Dev', url: 'https://www.youtube.com/watch?v=LPqXhOGVe6E', type: 'video' }
    ]
  },
  {
    keywords: ['bpmn', 'processos', 'processo de negócio'],
    docs: [
      { label: 'OMG — BPMN 2.0 Specification', url: 'https://www.omg.org/spec/BPMN/2.0/', type: 'documentacao' }
    ],
    videos: [
      { label: 'BPMN para iniciantes — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=ZFD-cjRPCVA', type: 'video' }
    ]
  },
  {
    keywords: ['gestão de risco', 'riscos', 'risco'],
    docs: [
      { label: 'ISO 31000 — Gestão de Riscos', url: 'https://www.iso.org/standard/65694.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Gestão de riscos em TI — Gran Cursos Online', url: 'https://www.youtube.com/watch?v=gXFTBfZWaG0', type: 'video' }
    ]
  },
  {
    keywords: ['contratação de ti', 'contratação pública', 'in 94', 'in 1'],
    docs: [
      { label: 'IN SGD/ME nº 94/2022', url: 'https://www.gov.br/compras/pt-br/assuntos/noticias/instrucao-normativa-sgdme-no-94', type: 'documentacao' }
    ],
    videos: [
      { label: 'Contratação de TI no setor público — Gran Cursos', url: 'https://www.youtube.com/watch?v=y7GhKUZ-4Ig', type: 'video' }
    ]
  },
  {
    keywords: ['planejamento estratégico', 'pdti', 'peti'],
    docs: [
      { label: 'TCU — Governança de TI', url: 'https://portal.tcu.gov.br/governanca/governancadeti/', type: 'documentacao' }
    ],
    videos: [
      { label: 'PDTI e PETI — Gran Cursos Online', url: 'https://www.youtube.com/watch?v=Hq0LqCqsGkE', type: 'video' }
    ]
  },
  // ── Segurança ─────────────────────────────────────────────────────────────
  {
    keywords: ['segurança da informação', 'segurança cibernética', 'segurança'],
    docs: [
      { label: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework', type: 'documentacao' },
      { label: 'ISO 27001 — Segurança da Informação', url: 'https://www.iso.org/standard/27001', type: 'documentacao' }
    ],
    videos: [
      { label: 'Segurança da informação para concursos — Estratégia Concursos', url: 'https://www.youtube.com/watch?v=p7R_pDHs3hk', type: 'video' }
    ]
  },
  {
    keywords: ['criptografia', 'hash', 'chave pública', 'chave privada', 'certificado digital'],
    docs: [
      { label: 'MDN — Conceitos de criptografia', url: 'https://developer.mozilla.org/pt-BR/docs/Glossary/Cryptography', type: 'documentacao' }
    ],
    videos: [
      { label: 'Criptografia explicada — Código Fonte TV', url: 'https://www.youtube.com/watch?v=CcU5Kc_FN_4', type: 'video' }
    ]
  },
  {
    keywords: ['autenticação', 'autorização', 'oauth', 'jwt', 'sso'],
    docs: [
      { label: 'Auth0 — Guia de OAuth 2.0', url: 'https://auth0.com/intro-to-iam/what-is-oauth-2', type: 'documentacao' },
      { label: 'jwt.io — JSON Web Tokens', url: 'https://jwt.io/introduction', type: 'documentacao' }
    ],
    videos: [
      { label: 'OAuth 2.0 e JWT — Código Fonte TV', url: 'https://www.youtube.com/watch?v=68azMcqPpyo', type: 'video' }
    ]
  },
  {
    keywords: ['firewall', 'ids', 'ips', 'dmz', 'vpn'],
    docs: [
      { label: 'Cisco — O que é firewall', url: 'https://www.cisco.com/c/pt_br/products/security/firewalls/what-is-a-firewall.html', type: 'documentacao' }
    ],
    videos: [
      { label: 'Firewall, IDS e IPS para concursos — Estratégia Concursos', url: 'https://www.youtube.com/watch?v=Spu2hq8KYe0', type: 'video' }
    ]
  },
  {
    keywords: ['ataques', 'vulnerabilidades', 'owasp', 'sql injection', 'xss'],
    docs: [
      { label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'documentacao' }
    ],
    videos: [
      { label: 'OWASP Top 10 explicado — Código Fonte TV', url: 'https://www.youtube.com/watch?v=_Z9RmFJ9Rw0', type: 'video' }
    ]
  },
  {
    keywords: ['lgpd', 'proteção de dados', 'privacidade'],
    docs: [
      { label: 'ANPD — Lei Geral de Proteção de Dados', url: 'https://www.gov.br/anpd/pt-br', type: 'documentacao' },
      { label: 'Lei nº 13.709/2018 (LGPD)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm', type: 'documentacao' }
    ],
    videos: [
      { label: 'LGPD para concursos — Gran Cursos Online', url: 'https://www.youtube.com/watch?v=RGv90bWJ9WQ', type: 'video' }
    ]
  },
  // ── DevOps e Qualidade ────────────────────────────────────────────────────
  {
    keywords: ['devops', 'ci', 'cd', 'integração contínua', 'entrega contínua', 'pipeline'],
    docs: [
      { label: 'GitHub Actions Documentation', url: 'https://docs.github.com/pt/actions', type: 'documentacao' },
      { label: 'GitLab CI/CD Documentation', url: 'https://docs.gitlab.com/ci/', type: 'documentacao' }
    ],
    videos: [
      { label: 'DevOps explicado — Código Fonte TV', url: 'https://www.youtube.com/watch?v=iwGlorBQ3io', type: 'video' },
      { label: 'CI/CD na prática — Full Cycle', url: 'https://www.youtube.com/watch?v=nI4AJgZBriE', type: 'video' }
    ]
  },
  {
    keywords: ['git', 'controle de versão', 'versionamento'],
    docs: [
      { label: 'Git Documentation', url: 'https://git-scm.com/doc', type: 'documentacao' },
      { label: 'GitHub Guides', url: 'https://guides.github.com/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Git e GitHub para iniciantes — Filipe Deschamps', url: 'https://www.youtube.com/watch?v=UBAX-13g8OM', type: 'video' }
    ]
  },
  {
    keywords: ['testes', 'qualidade de software', 'qa', 'junit', 'tdd', 'bdd'],
    docs: [
      { label: 'ISTQB — Glossário de testes', url: 'https://glossary.istqb.org/en_US/search', type: 'documentacao' }
    ],
    videos: [
      { label: 'Testes de software para concursos — Estratégia Concursos', url: 'https://www.youtube.com/watch?v=aqIW9LJlmUQ', type: 'video' },
      { label: 'TDD na prática — DevSuperior', url: 'https://www.youtube.com/watch?v=bLdEypr2e-8', type: 'video' }
    ]
  },
  {
    keywords: ['observabilidade', 'monitoramento', 'logs', 'métricas', 'rastreamento'],
    docs: [
      { label: 'OpenTelemetry Documentation', url: 'https://opentelemetry.io/docs/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Observabilidade e monitoramento — Full Cycle', url: 'https://www.youtube.com/watch?v=4BmSz5KqFTk', type: 'video' }
    ]
  },
  // ── Java / Spring ─────────────────────────────────────────────────────────
  {
    keywords: ['spring', 'spring boot', 'spring framework'],
    docs: [
      { label: 'Spring Boot Documentation', url: 'https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Spring Boot completo — Michelli Brito', url: 'https://www.youtube.com/watch?v=LXRU-Z36GEU', type: 'video' }
    ]
  },
  {
    keywords: ['java', 'jvm', 'programação java'],
    docs: [
      { label: 'Oracle Java Documentation', url: 'https://docs.oracle.com/en/java/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Java para iniciantes — Curso em Vídeo', url: 'https://www.youtube.com/watch?v=sTX0UEplF54', type: 'video' }
    ]
  },
  // ── Redes ─────────────────────────────────────────────────────────────────
  {
    keywords: ['redes de computadores', 'protocolo', 'tcp', 'ip', 'udp', 'dns', 'dhcp'],
    docs: [
      { label: 'MDN — Como funciona a Internet', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work', type: 'documentacao' }
    ],
    videos: [
      { label: 'Redes de computadores — Curso em Vídeo', url: 'https://www.youtube.com/watch?v=yOgirx5BcR4', type: 'video' }
    ]
  },
  {
    keywords: ['http', 'rest', 'protocolo http', 'métodos http'],
    docs: [
      { label: 'MDN — HTTP', url: 'https://developer.mozilla.org/pt-BR/docs/Web/HTTP', type: 'documentacao' }
    ],
    videos: [
      { label: 'HTTP e REST — Bóson Treinamentos', url: 'https://www.youtube.com/watch?v=E3NHWZkD0Kk', type: 'video' }
    ]
  },
  // ── Inteligência Artificial / Machine Learning ─────────────────────────────
  {
    keywords: ['inteligência artificial', 'machine learning', 'ia', 'ml', 'deep learning'],
    docs: [
      { label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course?hl=pt-br', type: 'documentacao' }
    ],
    videos: [
      { label: 'IA e Machine Learning — Código Fonte TV', url: 'https://www.youtube.com/watch?v=4_3c_83alC4', type: 'video' }
    ]
  },
  {
    keywords: ['data science', 'ciência de dados', 'python para dados', 'pandas', 'numpy'],
    docs: [
      { label: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/', type: 'documentacao' },
      { label: 'NumPy Documentation', url: 'https://numpy.org/doc/stable/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Python para Data Science — Hashtag Programação', url: 'https://www.youtube.com/watch?v=F5mRW0jo-U4', type: 'video' }
    ]
  },
  // ── Power BI / BI ─────────────────────────────────────────────────────────
  {
    keywords: ['power bi', 'tableau', 'qlik', 'business intelligence', 'bi'],
    docs: [
      { label: 'Microsoft Learn — Power BI', url: 'https://learn.microsoft.com/pt-br/power-bi/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Power BI para iniciantes — Hashtag Programação', url: 'https://www.youtube.com/watch?v=EhOTOuVGHXI', type: 'video' }
    ]
  },
  // ── ETL / ELT ─────────────────────────────────────────────────────────────
  {
    keywords: ['etl', 'elt', 'integração de dados', 'pipeline de dados'],
    docs: [
      { label: 'AWS — O que é ETL', url: 'https://aws.amazon.com/pt/what-is/etl/', type: 'documentacao' }
    ],
    videos: [
      { label: 'ETL vs ELT — Código Fonte TV', url: 'https://www.youtube.com/watch?v=lLXF9pKXQ1g', type: 'video' }
    ]
  },
  // ── Nuvem ─────────────────────────────────────────────────────────────────
  {
    keywords: ['computação em nuvem', 'cloud', 'aws', 'azure', 'google cloud', 'iaas', 'paas', 'saas'],
    docs: [
      { label: 'AWS — O que é computação em nuvem', url: 'https://aws.amazon.com/pt/what-is-cloud-computing/', type: 'documentacao' },
      { label: 'Azure Documentation', url: 'https://learn.microsoft.com/pt-br/azure/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Cloud Computing explicado — Código Fonte TV', url: 'https://www.youtube.com/watch?v=97l0Ahu2efE', type: 'video' }
    ]
  },
  // ── Governança / Legislação ───────────────────────────────────────────────
  {
    keywords: ['previdência', 'benefícios', 'inss', 'dataprev', 'previdência social'],
    docs: [
      { label: 'Portal Gov.br — Previdência Social', url: 'https://www.gov.br/previdencia/pt-br', type: 'documentacao' },
      { label: 'Dataprev — Institucional', url: 'https://www.dataprev.gov.br/', type: 'documentacao' }
    ],
    videos: [
      { label: 'Previdência Social para concursos — Gran Cursos', url: 'https://www.youtube.com/watch?v=r6CqDUh3Bk8', type: 'video' }
    ]
  },
  // ── Fallback genérico ─────────────────────────────────────────────────────
  {
    keywords: ['__fallback__'],
    docs: [],
    videos: [
      { label: 'Estude esse tópico — canal Estratégia Concursos TI', url: 'https://www.youtube.com/c/EstratégiaConcursos', type: 'video' }
    ]
  }
];

// ─── Funções utilitárias ──────────────────────────────────────────────────────

function findLinks(title) {
  const t = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const entry of LINK_DB) {
    if (entry.keywords[0] === '__fallback__') continue;
    const matched = entry.keywords.some(kw => {
      const nkw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return t.includes(nkw);
    });
    if (matched) {
      return { docs: entry.docs, videos: entry.videos };
    }
  }
  // fallback
  return { docs: [], videos: [{ label: 'Canal Estratégia Concursos TI no YouTube', url: 'https://www.youtube.com/@estrategiaconcursos', type: 'video' }] };
}

function buildUsefulLinksBlock(title, indent) {
  const { docs, videos } = findLinks(title);
  const all = [...docs, ...videos];
  if (!all.length) return null;

  const lines = [`${indent}"usefulLinks": [`];
  all.forEach((link, i) => {
    const comma = i < all.length - 1 ? ',' : '';
    lines.push(`${indent}  { "label": ${JSON.stringify(link.label)}, "url": ${JSON.stringify(link.url)}, "type": ${JSON.stringify(link.type)} }${comma}`);
  });
  lines.push(`${indent}]`);
  return lines.join('\n');
}

// ─── Processar arquivo ───────────────────────────────────────────────────────

let content = fs.readFileSync(DATA_FILE, 'utf-8');

// Já tem usefulLinks? Não reprocessar.
if (content.includes('"usefulLinks"')) {
  console.log('Arquivo já contém usefulLinks. Nada a fazer.');
  process.exit(0);
}

// Estratégia: encontrar cada object que tem "title": e inserir usefulLinks
// antes do fechamento do objeto (última chave "}") que precede "," ou "]" 
// dentro do array de TopicDetail.

// Regex que captura o título de cada tópico
const titleRegex = /"title":\s*"([^"\\]*)"/g;

// Vamos processar linha a linha para manter formatação.
const lines = content.split('\n');
const output = [];

let i = 0;
while (i < lines.length) {
  const line = lines[i];
  output.push(line);

  // Detectar início de bloco de tópico com "title":
  const titleMatch = line.match(/^(\s*)"title":\s*"((?:[^"\\]|\\.)*)"/);
  if (titleMatch) {
    const topicTitle = titleMatch[2].replace(/\\"/g, '"');
    const baseIndent = titleMatch[1];

    // Agora encontrar o fechamento deste bloco de tópico
    // Vamos avançar até encontrar a linha que fecha este objeto (}, com ou sem vírgula)
    // e inserir usefulLinks antes dela.
    // Usamos um contador de chaves para saber quando o objeto fecha.
    let braceDepth = 1; // já estamos dentro do objeto que contém "title":
    // Mas precisamos saber a partir de qual linha o objeto começou.
    // Como o título sempre está no início do objeto, a linha anterior com "{" é o início.
    // Vamos apenas procurar para frente onde o objeto fecha.
    
    // Encontrar a linha do "{" de abertura deste objeto (acima)
    // A última linha adicionada ao output é o título. O "{" está antes.
    // Mas já avançamos — vamos continuar lendo até fechar o objeto.

    // Coletar linhas do objeto atual a partir do próximo índice
    let objectLines = [];
    let j = i + 1;
    let depth = 1;

    while (j < lines.length && depth > 0) {
      const l = lines[j];
      for (const ch of l) {
        if (ch === '{' || ch === '[') depth++;
        else if (ch === '}' || ch === ']') depth--;
      }
      objectLines.push({ line: l, index: j });
      j++;
    }

    // objectLines contém tudo até o "}" de fechamento (inclusive)
    // O último elemento é a linha com "}"
    const closingLineInfo = objectLines[objectLines.length - 1];
    const closingLine = closingLineInfo.line;
    const closingLineTrimmed = closingLine.trimStart();

    // Inserir todas as linhas do objeto exceto a última
    for (let k = 0; k < objectLines.length - 1; k++) {
      output.push(objectLines[k].line);
    }

    // Construir e inserir usefulLinks antes do fechamento
    const usefulLinksBlock = buildUsefulLinksBlock(topicTitle, baseIndent);
    if (usefulLinksBlock) {
      // A linha anterior pode ou não ter vírgula. Garantir que a anterior tem vírgula.
      // Pegar a última linha de conteúdo inserida (objectLines[length-2])
      const lastContentLineIdx = output.length - 1;
      const lastContentLine = output[lastContentLineIdx];
      // Adicionar vírgula ao final da última linha de conteúdo se não tiver
      if (!lastContentLine.trimEnd().endsWith(',')) {
        output[lastContentLineIdx] = lastContentLine.trimEnd() + ',';
      }
      output.push(usefulLinksBlock);
    }

    // Inserir a linha de fechamento
    output.push(closingLine);

    // Avançar i para após o objeto processado
    i = j - 1;
  }

  i++;
}

const newContent = output.join('\n');
fs.writeFileSync(DATA_FILE, newContent, 'utf-8');
console.log('✅ usefulLinks adicionados com sucesso ao topics.data.ts');
