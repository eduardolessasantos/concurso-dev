import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface RecordAnswerPayload {
  topicId: string;
  questionId?: string | null;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface StudentAnswer {
  id: string;
  topicId: string;
  questionId?: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  answeredAt: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  accuracyPercentage: number;
  answers: StudentAnswer[];
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  // In-memory progress state (substituindo localStorage)
  private _courseProgress = signal<Record<string, CourseProgress>>({});
  public courseProgress = this._courseProgress.asReadonly();

  // Fila para respostas offline pendentes de sincronização
  private offlineQueue: RecordAnswerPayload[] = [];

  constructor() {
    // Sincroniza respostas pendentes quando o usuário estiver autenticado
    if (this.authService.isAuthenticated()) {
      this.syncPendingOfflineAnswers();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  recordAnswer(payload: RecordAnswerPayload): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      // Fallback em memória offline
      this.offlineQueue.push(payload);
      return of({ success: true, offline: true });
    }

    return this.http.post(
      `${this.apiUrl}/progress/answer`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((err) => {
        // Se falhar a conexão de rede, enfileira para sincronização posterior
        this.offlineQueue.push(payload);
        return of({ success: false, queued: true });
      })
    );
  }

  getMyProgress(courseId: string): Observable<CourseProgress> {
    if (!this.authService.isAuthenticated()) {
      return of({
        courseId,
        courseTitle: '',
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        accuracyPercentage: 0,
        answers: []
      });
    }

    return this.http.get<CourseProgress>(
      `${this.apiUrl}/progress/my-progress/${courseId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((progress) => {
        this._courseProgress.update(map => ({
          ...map,
          [courseId]: progress
        }));
      })
    );
  }

  syncPendingOfflineAnswers(): void {
    if (this.offlineQueue.length === 0 || !this.authService.isAuthenticated()) {
      return;
    }

    const toSync = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of toSync) {
      this.recordAnswer(item).subscribe();
    }
  }
}
