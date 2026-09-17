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
  avatarUrl?: string;
  customSlug?: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  public currentUser = signal<UserProfile | null>(this.loadUserFromStorage());
  public token = signal<string | null>(this.loadTokenFromStorage());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  public clearAuthStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dataprev_token');
      localStorage.removeItem('dataprev_user');
      localStorage.removeItem('dataprev_role');
      localStorage.removeItem('dataprev_answers');
      localStorage.removeItem('dataprev_simulated');
      localStorage.removeItem('teachertech_test.db');
      localStorage.removeItem('teachertech_token');
      localStorage.removeItem('teachertech_user');
      localStorage.removeItem('teachertech_role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('dataprev_token');
      sessionStorage.removeItem('dataprev_user');
      sessionStorage.removeItem('dataprev_role');
      sessionStorage.removeItem('teachertech_test.db');
      sessionStorage.removeItem('teachertech_token');
      sessionStorage.removeItem('teachertech_user');
      sessionStorage.removeItem('teachertech_role');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
    }
  }

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

  loginWithGoogle(idToken: string, preferredRole?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { idToken, preferredRole }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    this.clearAuthStorage();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
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

  private handleAuthSuccess(res: any): void {
    // 1. LIMPE completamente localStorage e sessionStorage antes de salvar novo token
    this.clearAuthStorage();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    // 2. Extrai role exatamente como vem da API sem default hardcoded
    const rawRole = (res.user?.role || res.user?.userRole || res.userRole || res.role || '').toString().trim().toUpperCase();
    const normalizedRole: 'STUDENT' | 'PROFESSOR' | 'ADMIN' =
      rawRole === 'PROFESSOR' ? 'PROFESSOR' :
      rawRole === 'ADMIN' ? 'ADMIN' : 'STUDENT';

    const user: UserProfile = {
      id: res.user?.id || res.userId || '',
      email: res.user?.email || res.email || '',
      fullName: res.user?.fullName || res.fullName || '',
      role: normalizedRole,
      avatarUrl: res.user?.avatarUrl || res.avatarUrl,
      customSlug: res.user?.customSlug || res.customSlug
    };

    const token = res.token || '';

    // Salva token e user em sessionStorage e localStorage para robustez
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('teachertech_token', token);
      sessionStorage.setItem('teachertech_user', JSON.stringify(user));
      sessionStorage.setItem('teachertech_role', normalizedRole);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('teachertech_token', token);
      localStorage.setItem('teachertech_user', JSON.stringify(user));
      localStorage.setItem('teachertech_role', normalizedRole);
    }
    
    this.token.set(token);
    this.currentUser.set(user);
  }

  private loadTokenFromStorage(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      const sToken = sessionStorage.getItem('teachertech_token');
      if (sToken) return sToken;
    }
    if (typeof localStorage !== 'undefined') {
      const lToken = localStorage.getItem('teachertech_token');
      if (lToken) return lToken;
    }
    return null;
  }

  private loadUserFromStorage(): UserProfile | null {
    let storedUser: string | null = null;
    if (typeof sessionStorage !== 'undefined') {
      storedUser = sessionStorage.getItem('teachertech_user');
    }
    if (!storedUser && typeof localStorage !== 'undefined') {
      storedUser = localStorage.getItem('teachertech_user');
    }
    if (!storedUser) return null;
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.role) {
        parsed.role = parsed.role.toString().toUpperCase();
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
