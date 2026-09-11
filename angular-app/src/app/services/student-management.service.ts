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

export interface InviteGenerated {
  token: string;
  inviteUrl: string;
  qrCodeBase64: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  channel: number;
  targetPhone?: string;
  courseTitle: string;
}

export interface ValidateInvite {
  valid: boolean;
  token: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  professorName: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  remainingUses: number;
  channel: number;
  message?: string;
}

export interface RedeemInvite {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  status: string;
  grantedVia: string;
  enrolledAt: string;
}

export interface ProfessorDashboard {
  totalActiveStudents: number;
  publishedCoursesCount: number;
  averageCompletionRate: number;
  pendingInvitesCount: number;
  subscription?: {
    planType: number;
    status: number;
    price: number;
    currentPeriodEnd?: string;
    maxCoursesAllowed: number;
    aiCreditsLimit: number;
    aiCreditsUsed: number;
    aiCreditsRemaining: number;
  };
  invites: Array<{
    id: string;
    token: string;
    courseId: string;
    courseTitle: string;
    channel: string;
    targetPhone?: string;
    usedCount: number;
    maxUses: number;
    expiresAt?: string;
    status: string;
    createdAt: string;
  }>;
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

  generateInvite(courseId: string, channel: 'Link' | 'WhatsApp' | 'QrCode' | number, targetPhone?: string): Observable<InviteGenerated> {
    const channelValue = typeof channel === 'number' ? channel : (channel === 'WhatsApp' ? 2 : channel === 'QrCode' ? 3 : 1);
    return this.http.post<InviteGenerated>(
      `${this.apiUrl}/invites/generate`,
      { courseId, channel: channelValue, targetPhone },
      { headers: this.getAuthHeaders() }
    );
  }

  validateInvite(token: string): Observable<ValidateInvite> {
    return this.http.get<ValidateInvite>(
      `${this.apiUrl}/invites/validate/${token}`
    );
  }

  redeemInvite(token: string): Observable<RedeemInvite> {
    return this.http.post<RedeemInvite>(
      `${this.apiUrl}/invites/redeem/${token}`,
      {},
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

  getMyStudies(): Observable<MyStudy[]> {
    return this.http.get<MyStudy[]>(
      `${this.apiUrl}/enrollments/my-studies`,
      { headers: this.getAuthHeaders() }
    );
  }

  getProfessorDashboard(): Observable<ProfessorDashboard> {
    return this.http.get<ProfessorDashboard>(
      `${this.apiUrl}/invites/dashboard`,
      { headers: this.getAuthHeaders() }
    );
  }
}
