import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'PROFESSOR' | 'STUDENT' | 'ADMIN';
  avatarUrl?: string;
  customSlug?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  userRole?: 'PROFESSOR' | 'STUDENT' | 'ADMIN';
  role?: 'PROFESSOR' | 'STUDENT' | 'ADMIN';
  customSlug?: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  public currentUser = signal<UserProfile | null>(this.loadUserFromStorage());
  public token = signal<string | null>(localStorage.getItem('teachertech_token'));

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem('teachertech_token');
    localStorage.removeItem('teachertech_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }


  isAuthenticated(): boolean {
    return !!this.token();
  }

  isProfessor(): boolean {
    return this.currentUser()?.role === 'PROFESSOR';
  }

  isStudent(): boolean {
    return this.currentUser()?.role === 'STUDENT';
  }

  private handleAuthSuccess(res: AuthResponse): void {
    const role = res.userRole || res.role || 'STUDENT';
    const user: UserProfile = {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: role,
      customSlug: res.customSlug
    };

    localStorage.setItem('teachertech_token', res.token);
    localStorage.setItem('teachertech_user', JSON.stringify(user));
    
    this.token.set(res.token);
    this.currentUser.set(user);
  }

  private loadUserFromStorage(): UserProfile | null {
    const storedUser = localStorage.getItem('teachertech_user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
}
