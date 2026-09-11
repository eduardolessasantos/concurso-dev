import { Injectable, inject, signal } from '@angular/core';
import { UserAnswer, SimulatedSession } from '../models/question.model';
import { ProgressService } from './progress.service';

const THEME_KEY = 'dataprev_theme';
const HISTORY_KEY = 'dataprev_history';

export interface AppState {
  theme: 'light' | 'dark';
  answers: Record<number, UserAnswer>;
  activeSimulated: SimulatedSession | null;
  historySimulated: SimulatedSession[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private progressService = inject(ProgressService);

  private _state = signal<AppState>({
    theme: (typeof localStorage !== 'undefined' ? (localStorage.getItem(THEME_KEY) as 'light' | 'dark') : null) || 'light',
    answers: {},
    activeSimulated: null,
    historySimulated: typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') : [],
  });

  readonly state = this._state.asReadonly();

  constructor() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', this._state().theme === 'dark');
    }
    // Remove chaves legadas de respostas locais, transferindo responsabilidade para o StudentProgress
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dataprev_answers');
      localStorage.removeItem('dataprev_simulated');
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this._state.update(s => ({ ...s, theme }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
    }
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', theme === 'dark');
    }
  }

  toggleTheme() {
    this.setTheme(this._state().theme === 'light' ? 'dark' : 'light');
  }

  answerQuestion(questionNumber: number, selectedOption: string, isCorrect: boolean, topicId?: string) {
    const answers = {
      ...this._state().answers,
      [questionNumber]: { selected: selectedOption, correct: isCorrect, timestamp: new Date().toISOString() }
    };
    this._state.update(s => ({ ...s, answers }));

    // Sincroniza via ProgressService caso o ID do tópico seja informado
    if (topicId) {
      this.progressService.recordAnswer({
        topicId,
        isCorrect
      }).subscribe();
    }
  }

  clearAnswers() {
    this._state.update(s => ({ ...s, answers: {} }));
  }

  startSimulated(type: 'complete' | 'quick', questionNumbers: number[]) {
    const activeSimulated: SimulatedSession = {
      type, startedAt: new Date().toISOString(),
      questions: questionNumbers, answers: {}, status: 'running'
    };
    this._state.update(s => ({ ...s, activeSimulated }));
  }

  answerSimulatedQuestion(questionNumber: number, selectedOption: string) {
    const active = this._state().activeSimulated;
    if (!active) return;
    const updated = { ...active, answers: { ...active.answers, [questionNumber]: selectedOption } };
    this._state.update(s => ({ ...s, activeSimulated: updated }));
  }

  finishSimulated(): SimulatedSession | null {
    const active = this._state().activeSimulated;
    if (!active) return null;
    const finished: SimulatedSession = { ...active, status: 'completed', finishedAt: new Date().toISOString() };
    const history = [...this._state().historySimulated, finished];
    this._state.update(s => ({ ...s, activeSimulated: null, historySimulated: history }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
    return finished;
  }

  cancelSimulated() {
    this._state.update(s => ({ ...s, activeSimulated: null }));
  }

  clearHistory() {
    this._state.update(s => ({ ...s, historySimulated: [] }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, '[]');
    }
  }
}
