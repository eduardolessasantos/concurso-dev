import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { GeneratedFlashcard, GeneratedQuestion } from './ai-generator.service';

export interface StudioScheduleInput {
  dayOfWeek: string;
  goalMinutes: number;
  notes: string;
}

export interface StudioSimulatedInput {
  title: string;
  timeLimitMinutes: number;
}

export interface SaveStudioContentPayload {
  courseId?: string;
  courseTitle: string;
  subjectId?: string;
  subjectName: string;
  topicId?: string;
  topicTitle: string;
  examBoard: string;
  isPublic: boolean;
  contentMarkdown: string;
  flashcards: GeneratedFlashcard[];
  questions: GeneratedQuestion[];
  schedule?: StudioScheduleInput;
  simulated?: StudioSimulatedInput;
}

export interface SaveStudioResponse {
  courseId: string;
  subjectId: string;
  topicId: string;
  simulatedTestId?: string;
  flashcardsSavedCount: number;
  questionsSavedCount: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessorStudioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  saveStudioContent(payload: SaveStudioContentPayload): Observable<SaveStudioResponse> {
    return this.http.post<SaveStudioResponse>(
      `${this.apiUrl}/courses/studio-publish`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
}
