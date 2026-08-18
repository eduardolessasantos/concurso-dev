import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
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


  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  generateSummary(topicTitle: string, subjectName?: string, contextText?: string): Observable<AiResponse<string>> {
    return this.http.post<AiResponse<string>>(
      `${this.apiUrl}/generate-summary`,
      { topicTitle, subjectName, contextText },
      { headers: this.getAuthHeaders() }
    );
  }

  generateFlashcards(topicTitle: string, summaryText?: string, count: number = 5): Observable<AiResponse<GeneratedFlashcard[]>> {
    return this.http.post<AiResponse<GeneratedFlashcard[]>>(
      `${this.apiUrl}/generate-flashcards`,
      { topicTitle, summaryText, count },
      { headers: this.getAuthHeaders() }
    );
  }

  generateQuestions(topicTitle: string, summaryText?: string, examBoard: string = 'Inédita', count: number = 3): Observable<AiResponse<GeneratedQuestion[]>> {
    return this.http.post<AiResponse<GeneratedQuestion[]>>(
      `${this.apiUrl}/generate-questions`,
      { topicTitle, summaryText, examBoard, count },
      { headers: this.getAuthHeaders() }
    );
  }
}
