export interface Question {
  number: number;
  title: string;
  prompt: string;
  options: string[];
  answer: string;
  comment: string;
  concept: string;
}

export interface UserAnswer {
  selected: string;
  correct: boolean;
  timestamp: string;
}

export interface SimulatedSession {
  type: 'complete' | 'quick';
  startedAt: string;
  questions: number[];
  answers: Record<number, string>;
  status: 'running' | 'completed';
  finishedAt?: string;
}
