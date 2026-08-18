export interface Subject {
  id: string;
  number: string;
  name: string;
  meta: string;
  range: [number, number];
  description: string;
  topics: string[];
  major?: boolean;
}

export interface SubjectWithProgress extends Subject {
  total: number;
  answered: number;
  correct: number;
  pct: number;
}
