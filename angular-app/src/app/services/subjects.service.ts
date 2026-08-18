import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Subject } from '../models/subject.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private apiUrl = environment.apiUrl;
  public dynamicSubjects = signal<Subject[]>([]);


  private readonly _fallbackSubjects: Subject[] = [
    {
      id: 'portugues', number: '01', name: 'Língua Portuguesa',
      meta: '12 questões · peso 1', range: [1, 12],
      description: 'Compreensão, interpretação, gramática, ortografia, sintaxe e semântica.',
      topics: [
        'Compreensão e interpretação de textos', 'Tipos e gêneros textuais',
        'Ortografia oficial', 'Coesão e coerência textual',
        'Classes de palavras e pontuação', 'Concordância, regência e crase',
        'Estrutura do período e sintaxe', 'Colocação pronominal e reescrita',
        'Significação e substituição de palavras'
      ]
    },
    {
      id: 'ingles', number: '02', name: 'Língua Inglesa',
      meta: '12 questões · peso 1', range: [13, 24],
      description: 'Reading, vocabulário técnico, gramática e textos de tecnologia.',
      topics: [
        'Compreensão geral e organização textual', 'Coesão e coerência no discurso',
        'Localização de informações, inferência e predição', 'Análise, síntese e vocabulário',
        'Funções retóricas, metáfora e metonímia', 'Itens gramaticais relevantes para compreensão'
      ]
    },
    {
      id: 'logica', number: '03', name: 'Raciocínio Lógico',
      meta: '5 questões · peso 1', range: [25, 29],
      description: 'Proposições, conectivos, tabelas-verdade, equivalências, diagramas lógicos e problemas aritméticos.',
      topics: [
        'Estruturas lógicas e associação de informações', 'Lógica de argumentação e validade',
        'Lógica proposicional e tabelas-verdade', 'Equivalências e implicações lógicas',
        'Diagramas lógicos e proposições categóricas', 'Lógica de primeira ordem e quantificadores',
        'Problemas aritméticos, geométricos e matriciais'
      ]
    },
    {
      "id": "ia", number: "04", name: "Atualidades e IA",
      meta: "6 questões · peso 1", range: [30, 35],
      description: "Geopolítica, economia global, sustentabilidade, IA generativa, machine learning e ética em IA.",
      topics: [
        "Geopolítica mundial e conflitos contemporâneos", "Política, economia e sociedade na América Latina",
        "Economia global e desenvolvimento sustentável", "Fundamentos de IA e Machine Learning",
        "IA Generativa e Modelos de Linguagem (LLMs)", "Ética, governança e privacidade em IA"
      ]
    },
    {
      "id": "legislacao", number: "05", name: "Legislação e Dados",
      meta: "6 questões · peso 1", range: [36, 41],
      description: "LAI, Marco Civil da Internet, LGPD, Lei de Delitos Informáticos e Segurança da Informação.",
      topics: [
        "Lei de Acesso à Informação (LAI) — Lei 12.527/2011",
        "Marco Civil da Internet — Lei 12.965/2014",
        "LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018)",
        "Lei de Delitos Informáticos — Lei 12.737/2012 (Lei Carolina Dieckmann)",
        "Segurança da Informação: conceitos e aplicação normativa",
        "Integração normativa e responsabilidades"
      ]
    },
    {
      "id": "engenharia-software", number: "06", name: "Engenharia de Software",
      meta: "25% das específicas · peso 3", range: [42, 60],
      description: "Java, Spring, Clean Code, DevOps, Testes, Metodologias Ágeis, Requisitos e Métricas.",
      topics: [
        "Ciclo de vida de software e boas práticas", "Java, JavaEE, JakartaEE, JPA e Hibernate",
        "Spring Framework, Spring Boot e Spring Cloud", "JavaScript e integração front-end/back-end",
        "Análise estática: Clean Code e SonarQube", "DevOps, Git e gestão de configuração",
        "Testes: unitários, integração, TDD e automatizados", "Metodologias ágeis: Scrum, Kanban e XP",
        "Engenharia de Requisitos e elicitação", "Métricas: Ponto de Função e Story Points",
        "Desenvolvimento mobile (Android e iOS)", "Ferramentas low-code e no-code"
      ]
    },
    {
      "id": "arquitetura-software", number: "07", name: "Arquitetura de Software e Web",
      meta: "20% das específicas · peso 3", range: [61, 75],
      description: "SOA, Microsserviços, APIs, Mensageria, Frontend, UX, HTTPS/SSL e Blockchain.",
      topics: [
        "Arquitetura de software e princípios arquiteturais", "Orientação a objetos e arquitetura web",
        "Servidor web e servidor de aplicações", "Interoperabilidade, SOA e Web Services (SOAP/REST)",
        "APIs, Swagger e documentação", "Mensageria e integração assíncrona",
        "Arquitetura hexagonal e microsserviços", "Containers e orquestração",
        "Ambientes: Internet, Intranet, Extranet e Portais", "Padrões: XML, XSLT, UDDI, REST e JSON",
        "Frontend: HTML, CSS, UX, VueJS, Angular, React", "SPA, PWA e acessibilidade",
        "Protocolos HTTPS, SSL/TLS", "Blockchain"
      ]
    },
    {
      "id": "banco-dados", number: "08", name: "Banco de Dados e Big Data",
      meta: "20% das específicas · peso 3", range: [76, 90],
      description: "Modelagem, SQL, Normalização, NoSQL, Data Lakes, Big Data e ETL/ELT.",
      topics: [
        "Modelagem de dados: conceitual, lógica e física", "MER, DER, entidades, relacionamentos e cardinalidade",
        "Modelo relacional: chaves, integridade e ACID", "Normalização: 1FN, 2FN e 3FN",
        "SQL: DDL, DML, DQL, DCL e DTL", "SGBD, metadados e backup",
        "Abordagem multidimensional e modelagem dimensional", "Tabelas fato, dimensões e esquemas (estrela/floco de neve)",
        "NoSQL: documentos, chave-valor, colunas e grafos", "Bancos de dados em memória",
        "Data Lakes e soluções para Big Data", "ETL/ELT e técnicas de ingestão",
        "Dados estruturados, semiestruturados e não estruturados"
      ]
    },
    {
      "id": "business-intelligence", number: "09", name: "Business Intelligence",
      meta: "15% das específicas · peso 2", range: [91, 102],
      description: "BI, DSS, Data Warehouse, Data Mining, OLAP, Visualização e Ferramentas de BI.",
      topics: [
        "Conceitos de BI, DSS e Gestão de Conteúdo", "Arquitetura de BI e componentes (ETL, DW, Data Mart)",
        "Data Warehouse: camadas, Star Schema e Snowflake", "ETL: extração, transformação e carregamento",
        "OLAP: cubos, operações (slice, dice, drill, pivot)", "Data Mining: classificação, associação, agrupamento",
        "Visualização de dados e painéis (dashboards)", "Ferramentas: Power BI, Tableau, Qlik Sense, Google Data Studio",
        "Mapeamento de fontes e técnicas de coleta", "Cubos: medidas, dimensões e hierarquias"
      ]
    },
    {
      "id": "gestao-governanca", number: "10", name: "Gestão e Governança de TI",
      meta: "20% das específicas · peso 3", range: [103, 118],
      description: "PMBOK, Scrum/Kanban/Lean, Riscos, ITIL v4, COBIT 2019 e BPMN.",
      topics: [
        "Gerenciamento de projetos: conceitos, programas e portfólio", "Processos, grupos e áreas de conhecimento (PMBOK)",
        "Abordagens: tradicional, híbrida e ágil", "Scrum, Lean e Kanban (visão gestão)",
        "Guia Scrum: papéis, eventos e artefatos", "Gestão de riscos: identificação, resposta e monitoramento",
        "Apetite e tolerância ao risco", "ITIL v4: SVS, Cadeia de Valor e Práticas",
        "COBIT 2019: princípios, domínios e objetivos", "BPMN e modelagem de processos de negócio",
        "Macroprocessos, processos e subprocessos"
      ]
    }
  ];

  constructor(private http: HttpClient) {
    this.dynamicSubjects.set(this._fallbackSubjects);
  }

  loadSubjectsForCourse(courseId: string = '00000000-0000-0000-0000-000000000001'): Observable<Subject[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subjects/course/${courseId}`).pipe(
      map(apiSubjects => {
        if (!apiSubjects || apiSubjects.length === 0) return this._fallbackSubjects;

        return apiSubjects.map((s, index) => ({
          id: s.id,
          number: String(s.orderIndex || index + 1).padStart(2, '0'),
          name: s.name,
          meta: `${s.topics?.length || 0} tópicos de estudo`,
          range: [(index * 10) + 1, (index * 10) + 10] as [number, number],
          description: s.description || 'Disciplina cadastrada pelo professor mentor.',
          topics: s.topics ? s.topics.map((t: any) => t.title) : []
        }));
      }),
      tap(subjects => this.dynamicSubjects.set(subjects)),
      catchError(() => {
        this.dynamicSubjects.set(this._fallbackSubjects);
        return of(this._fallbackSubjects);
      })
    );
  }

  getAll(): Subject[] {
    return this.dynamicSubjects().length > 0 ? this.dynamicSubjects() : this._fallbackSubjects;
  }

  getById(id: string): Subject | undefined {
    return this.getAll().find(s => s.id === id);
  }
}

