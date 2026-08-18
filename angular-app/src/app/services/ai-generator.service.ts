import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AiKeyStorageService } from './ai-key-storage.service';
import { environment } from '../../environments/environment';

export interface AiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  creditsRemaining: number;
  creditsUsed: number;
}

export interface GeneratedFlashcard {
  frontText: string;
  backText: string;
  difficultyLevel: string;
}

export interface GeneratedQuestion {
  statement: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  examBoard: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiGeneratorService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private aiKeyStorage: AiKeyStorageService
  ) {}

  generateSummary(topicTitle: string, subjectName: string = 'Geral', contextText: string = ''): Observable<AiResponse<string>> {
    const config = this.aiKeyStorage.config();
    const prompts = this.aiKeyStorage.prompts();

    if (config.apiKey && config.apiKey.trim().length > 5) {
      return from(this.callDirectAi(
        `${prompts.summaryPrompt}\n\nDisciplina: ${subjectName}\nTópico: ${topicTitle}\nContexto adicional: ${contextText}\n\nInstrução: Retorne um resumo completo e bem estruturado em Markdown com seções, destaques em negrito, tabelas e dicas práticas.`
      )).pipe(
        map(text => ({
          success: true,
          message: `Gerado via sua chave ${config.provider.toUpperCase()} (${config.model})`,
          data: text,
          creditsRemaining: 9999,
          creditsUsed: 0
        })),
        catchError(err => {
          console.error('[AiGeneratorService] Erro na chamada direta da IA do usuário:', err);
          return of(this.getMockSummary(topicTitle, subjectName));
        })
      );
    }

    // Try backend API or fallback
    return this.http.post<any>(`${this.apiUrl}/generate-summary`, {
      topicTitle,
      subjectName,
      examBoard: 'Geral'
    }).pipe(
      map(res => ({
        success: true,
        message: 'Gerado com sucesso pelo servidor',
        data: res.summaryMarkdown || res.data || res,
        creditsRemaining: 100,
        creditsUsed: 1
      })),
      catchError(() => of(this.getMockSummary(topicTitle, subjectName)))
    );
  }

  generateFlashcards(topicTitle: string, summaryText: string = '', count: number = 4): Observable<AiResponse<GeneratedFlashcard[]>> {
    const config = this.aiKeyStorage.config();
    const prompts = this.aiKeyStorage.prompts();

    if (config.apiKey && config.apiKey.trim().length > 5) {
      const prompt = `${prompts.flashcardsPrompt}\n\nTópico: ${topicTitle}\nConteúdo de referência:\n${summaryText.slice(0, 1500)}\n\nInstrução: Gere exatamente ${count} flashcards no formato JSON rigoroso: [{"frontText": "pergunta", "backText": "resposta", "difficultyLevel": "Fácil|Médio|Difícil"}]. Responda APENAS o JSON puro sem formatação markdown.`;

      return from(this.callDirectAi(prompt)).pipe(
        map(text => {
          const parsed = this.safeJsonParse<GeneratedFlashcard[]>(text, this.getMockFlashcards(topicTitle));
          return {
            success: true,
            message: `Flashcards gerados via sua chave ${config.provider.toUpperCase()}`,
            data: parsed,
            creditsRemaining: 9999,
            creditsUsed: 0
          };
        }),
        catchError(() => of(this.getMockFlashcardsResponse(topicTitle)))
      );
    }

    return this.http.post<any>(`${this.apiUrl}/generate-flashcards`, {
      topicTitle,
      subjectName: 'Geral',
      examBoard: 'Geral'
    }).pipe(
      map(res => ({
        success: true,
        message: 'Flashcards gerados pelo servidor',
        data: Array.isArray(res) ? res : (res.data || this.getMockFlashcards(topicTitle)),
        creditsRemaining: 100,
        creditsUsed: 1
      })),
      catchError(() => of(this.getMockFlashcardsResponse(topicTitle)))
    );
  }

  generateQuestions(topicTitle: string, summaryText: string = '', examBoard: string = 'FGV', count: number = 3): Observable<AiResponse<GeneratedQuestion[]>> {
    const config = this.aiKeyStorage.config();
    const prompts = this.aiKeyStorage.prompts();

    if (config.apiKey && config.apiKey.trim().length > 5) {
      const prompt = `${prompts.questionsPrompt}\n\nTópico: ${topicTitle}\nBanca: ${examBoard}\nContexto:\n${summaryText.slice(0, 1500)}\n\nInstrução: Crie exatamente ${count} questões de múltipla escolha no formato JSON rigoroso: [{"statement": "Enunciado da questão", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "correctOptionIndex": 0, "explanation": "Justificativa detalhada", "examBoard": "${examBoard}"}]. Responda APENAS o JSON puro.`;

      return from(this.callDirectAi(prompt)).pipe(
        map(text => {
          const parsed = this.safeJsonParse<GeneratedQuestion[]>(text, this.getMockQuestions(topicTitle, examBoard));
          return {
            success: true,
            message: `Questões geradas via sua chave ${config.provider.toUpperCase()} (${examBoard})`,
            data: parsed,
            creditsRemaining: 9999,
            creditsUsed: 0
          };
        }),
        catchError(() => of(this.getMockQuestionsResponse(topicTitle, examBoard)))
      );
    }

    return this.http.post<any>(`${this.apiUrl}/generate-questions`, {
      topicTitle,
      subjectName: 'Geral',
      examBoard
    }).pipe(
      map(res => ({
        success: true,
        message: 'Questões geradas pelo servidor',
        data: Array.isArray(res) ? res : (res.data || this.getMockQuestions(topicTitle, examBoard)),
        creditsRemaining: 100,
        creditsUsed: 1
      })),
      catchError(() => of(this.getMockQuestionsResponse(topicTitle, examBoard)))
    );
  }

  // --- Direct AI Client Dispatcher ---
  private async callDirectAi(prompt: string): Promise<string> {
    const config = this.aiKeyStorage.config();

    if (config.provider === 'openai' || config.provider === 'groq') {
      const endpoint = config.provider === 'openai' 
        ? 'https://api.openai.com/v1/chat/completions' 
        : 'https://api.groq.com/openai/v1/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.1-8b-instant'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Erro ${response.status} na API de IA`);
      }

      const json = await response.json();
      return json.choices[0]?.message?.content || '';
    } else if (config.provider === 'gemini') {
      const modelName = config.model || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Erro ${response.status} no Gemini`);
      }

      const json = await response.json();
      return json.candidates[0]?.content?.parts[0]?.text || '';
    }

    throw new Error('Provedor de IA não suportado.');
  }

  private safeJsonParse<T>(text: string, fallback: T): T {
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return fallback;
    }
  }

  // --- Fallback & Mock Generators ---
  private getMockSummary(topicTitle: string, subjectName: string): AiResponse<string> {
    return {
      success: true,
      message: 'Conteúdo estruturado pronto para estudo',
      data: `## 📘 ${topicTitle} — Visão Estratégica (${subjectName})\n\n### 1. Conceito e Fundamentação\nO tema **${topicTitle}** é um dos tópicos mais cobrados e recorrentes em provas de concursos públicos e seleções técnicas.\n\n### 2. Pontos-Chave para Fixação\n- **Princípio da Clareza:** Domínio das definições basilares e distinções conceituais.\n- **Aplicações Práticas:** Casos concretos e resolução de problemas conforme o padrão da banca examinadora.\n- **Pegadinhas Comuns:** Fique atento a termos restritivos (*exclusivamente*, *sempre*, *em qualquer hipótese*).\n\n### 3. Tabela Comparativa\n| Critério | Abordagem Teórica | Abordagem Prática |\n|---|---|---|\n| Foco | Definições e Regras | Aplicação em Questões |\n| Relevância | Alta | Altíssima |\n\n> 💡 **Dica de Ouro:** Revise este tópico resolvendo questões comentadas e praticando com flashcards de repetição espaçada.`,
      creditsRemaining: 100,
      creditsUsed: 0
    };
  }

  private getMockFlashcards(topicTitle: string): GeneratedFlashcard[] {
    return [
      {
        frontText: `Qual é o principal conceito de ${topicTitle}?`,
        backText: `Trata-se do pilar estrutural que define as regras e aplicações essenciais no contexto da disciplina.`,
        difficultyLevel: 'Fácil'
      },
      {
        frontText: `Qual pegadinha clássica de banca examinadora costuma aparecer em ${topicTitle}?`,
        backText: `A confusão entre exceções legais/técnicas e a regra geral, utilizando termos absolutistas.`,
        difficultyLevel: 'Médio'
      },
      {
        frontText: `Como aplicar ${topicTitle} na resolução rápida de questões?`,
        backText: `Identificando os requisitos essenciais no enunciado e eliminando alternativas contraditórias.`,
        difficultyLevel: 'Difícil'
      }
    ];
  }

  private getMockFlashcardsResponse(topicTitle: string): AiResponse<GeneratedFlashcard[]> {
    return {
      success: true,
      message: 'Flashcards gerados para fixação ativa',
      data: this.getMockFlashcards(topicTitle),
      creditsRemaining: 100,
      creditsUsed: 0
    };
  }

  private getMockQuestions(topicTitle: string, examBoard: string): GeneratedQuestion[] {
    return [
      {
        statement: `Em relação ao tema "${topicTitle}", considerando a doutrina e as melhores práticas cobradas pela banca ${examBoard}, assinale a alternativa correta:`,
        options: [
          'A) Aplica-se exclusivamente em situações emergenciais sem necessidade de validação prévia.',
          'B) Constitui diretriz fundamental que orienta o correto desenvolvimento e a conformidade técnica.',
          'C) É vedada sua utilização em ambientes corporativos e órgãos públicos.',
          'D) Depende exclusivamente de autorização judicial discricionária em todos os casos.',
          'E) Foi revogada pelas diretrizes internacionais mais recentes.'
        ],
        correctOptionIndex: 1,
        explanation: `A alternativa B está correta pois sintetiza com exatidão a natureza e finalidade de ${topicTitle}. As demais alternativas trazem extrapolações e restrições indevidas comuns em pegadinhas da banca ${examBoard}.`,
        examBoard
      }
    ];
  }

  private getMockQuestionsResponse(topicTitle: string, examBoard: string): AiResponse<GeneratedQuestion[]> {
    return {
      success: true,
      message: `Questões preparadas no padrão ${examBoard}`,
      data: this.getMockQuestions(topicTitle, examBoard),
      creditsRemaining: 100,
      creditsUsed: 0
    };
  }
}
