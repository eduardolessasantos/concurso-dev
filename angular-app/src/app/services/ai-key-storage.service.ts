import { Injectable, signal, computed } from '@angular/core';

export type AiProvider = 'openai' | 'gemini' | 'groq';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
}

export interface CustomPrompts {
  summaryPrompt: string;
  flashcardsPrompt: string;
  questionsPrompt: string;
}

export const DEFAULT_PROMPTS: CustomPrompts = {
  summaryPrompt: `Você é um professor especialista em concursos públicos de alto nível (Dataprev, BACEN, TCU, Receita Federal).
Produza um resumo teórico detalhado, esquematizado em Markdown rico, com conceitos-chave, jurisprudência/doutrina/padrões técnicos, tabelas comparativas e mnemônicos práticos.`,
  
  flashcardsPrompt: `Você é um tutor especialista em memorização ativa e repetição espaçada.
Gere flashcards atômicos com frente (pergunta conceitual clara ou situação-problema) e verso (resposta objetiva fundamentada) para o tema informado.`,
  
  questionsPrompt: `Você é um examinador de bancas de elite (FGV, Cebraspe, FCC).
Elabore questões inéditas de múltipla escolha (A a E) de alto nível, com pegadinhas inteligentes da banca e gabarito com fundamentação teórica completa para cada alternativa.`
};

@Injectable({
  providedIn: 'root'
})
export class AiKeyStorageService {
  private readonly STORAGE_KEY_CONFIG = 'teachertech_ai_config';
  private readonly STORAGE_KEY_PROMPTS = 'teachertech_ai_prompts';

  public config = signal<AiConfig>(this.loadConfig());
  public prompts = signal<CustomPrompts>(this.loadPrompts());

  public hasUserKey = computed(() => !!this.config().apiKey && this.config().apiKey.trim().length > 5);

  constructor() {}

  private loadConfig(): AiConfig {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CONFIG);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao carregar config de IA:', e);
    }
    return {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o-mini'
    };
  }

  private loadPrompts(): CustomPrompts {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_PROMPTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao carregar prompts customizados:', e);
    }
    return { ...DEFAULT_PROMPTS };
  }

  public saveConfig(config: AiConfig): void {
    this.config.set(config);
    localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(config));
  }

  public savePrompts(prompts: CustomPrompts): void {
    this.prompts.set(prompts);
    localStorage.setItem(this.STORAGE_KEY_PROMPTS, JSON.stringify(prompts));
  }

  public resetPromptsToDefault(): void {
    this.savePrompts({ ...DEFAULT_PROMPTS });
  }

  public clearKey(): void {
    const current = this.config();
    this.saveConfig({ ...current, apiKey: '' });
  }
}
