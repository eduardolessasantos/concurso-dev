import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Enrollment {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  grantedVia: string;
  status: string;
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  status: string;
  message: string;
  requestedAt: string;
}

export interface MyStudy {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  category: string;
  coverImageUrl?: string;
  professorName: string;
  grantedVia: string;
  grantedAt: string;
  subjectsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentManagementService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  inviteByEmail(courseId: string, studentEmail: string, welcomeMessage?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/enrollments/invite-by-email`,
      { courseId, studentEmail, welcomeMessage },
      { headers: this.getAuthHeaders() }
    );
  }

  getCourseEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(
      `${this.apiUrl}/enrollments/course/${courseId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  revokeAccess(enrollmentId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/enrollments/${enrollmentId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getPendingAccessRequests(): Observable<AccessRequest[]> {
    return this.http.get<AccessRequest[]>(
      `${this.apiUrl}/accessrequests/pending`,
      { headers: this.getAuthHeaders() }
    );
  }

  approveAccessRequest(requestId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/accessrequests/${requestId}/approve`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  rejectAccessRequest(requestId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/accessrequests/${requestId}/reject`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  requestAccess(courseId: string, message?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/accessrequests`,
      { courseId, message },
      { headers: this.getAuthHeaders() }
    );
  }

  getMyStudies(): Observable<MyStudy[]> {
    return this.http.get<MyStudy[]>(
      `${this.apiUrl}/enrollments/my-studies`,
      { headers: this.getAuthHeaders() }
    );
  }
}
