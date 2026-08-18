import { Injectable, signal } from '@angular/core';
import { UserAnswer, SimulatedSession } from '../models/question.model';

const THEME_KEY = 'dataprev_theme';
const ANSWERS_KEY = 'dataprev_answers';
const SIMULATED_KEY = 'dataprev_simulated';
const HISTORY_KEY = 'dataprev_history';

export interface AppState {
  theme: 'light' | 'dark';
  answers: Record<number, UserAnswer>;
  activeSimulated: SimulatedSession | null;
  historySimulated: SimulatedSession[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private _state = signal<AppState>({
    theme: (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light',
    answers: JSON.parse(localStorage.getItem(ANSWERS_KEY) || '{}'),
    activeSimulated: JSON.parse(localStorage.getItem(SIMULATED_KEY) || 'null'),
    historySimulated: JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'),
  });

  readonly state = this._state.asReadonly();

  constructor() {
    document.body.classList.toggle('dark', this._state().theme === 'dark');
  }

  setTheme(theme: 'light' | 'dark') {
    this._state.update(s => ({ ...s, theme }));
    localStorage.setItem(THEME_KEY, theme);
    document.body.classList.toggle('dark', theme === 'dark');
  }

  toggleTheme() {
    this.setTheme(this._state().theme === 'light' ? 'dark' : 'light');
  }

  answerQuestion(questionNumber: number, selectedOption: string, isCorrect: boolean) {
    const answers = {
      ...this._state().answers,
      [questionNumber]: { selected: selectedOption, correct: isCorrect, timestamp: new Date().toISOString() }
    };
    this._state.update(s => ({ ...s, answers }));
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }

  clearAnswers() {
    this._state.update(s => ({ ...s, answers: {} }));
    localStorage.setItem(ANSWERS_KEY, '{}');
  }

  startSimulated(type: 'complete' | 'quick', questionNumbers: number[]) {
    const activeSimulated: SimulatedSession = {
      type, startedAt: new Date().toISOString(),
      questions: questionNumbers, answers: {}, status: 'running'
    };
    this._state.update(s => ({ ...s, activeSimulated }));
    localStorage.setItem(SIMULATED_KEY, JSON.stringify(activeSimulated));
  }

  answerSimulatedQuestion(questionNumber: number, selectedOption: string) {
    const active = this._state().activeSimulated;
    if (!active) return;
    const updated = { ...active, answers: { ...active.answers, [questionNumber]: selectedOption } };
    this._state.update(s => ({ ...s, activeSimulated: updated }));
    localStorage.setItem(SIMULATED_KEY, JSON.stringify(updated));
  }

  finishSimulated(): SimulatedSession | null {
    const active = this._state().activeSimulated;
    if (!active) return null;
    const finished: SimulatedSession = { ...active, status: 'completed', finishedAt: new Date().toISOString() };
    const history = [...this._state().historySimulated, finished];
    this._state.update(s => ({ ...s, activeSimulated: null, historySimulated: history }));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.removeItem(SIMULATED_KEY);
    return finished;
  }

  cancelSimulated() {
    this._state.update(s => ({ ...s, activeSimulated: null }));
    localStorage.removeItem(SIMULATED_KEY);
  }

  clearHistory() {
    this._state.update(s => ({ ...s, historySimulated: [] }));
    localStorage.setItem(HISTORY_KEY, '[]');
  }
}
