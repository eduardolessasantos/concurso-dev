import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public activeTab = signal<'login' | 'register'>('login');
  public selectedRole = signal<'PROFESSOR' | 'STUDENT'>('STUDENT');
  public showPassword = signal<boolean>(false);
  
  public email = '';
  public password = '';
  public fullName = '';
  public headline = '';
  public goalExam = '';

  public invitedCourseTitle = signal<string | null>(null);
  public returnUrl: string | null = null;

  public isLoading = false;
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.resetForm();

    // Parse query params for direct invite links and returnUrl
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      } else if (params['redirect']) {
        this.returnUrl = params['redirect'];
      }

      if (params['email']) {
        this.email = params['email'];
      }

      if (params['courseTitle']) {
        this.invitedCourseTitle.set(params['courseTitle']);
      }

      if (params['tab'] === 'register' || this.router.url.includes('/cadastro')) {
        this.activeTab.set('register');
        this.selectedRole.set('STUDENT');
      }
    });
  }

  resetForm(): void {
    this.email = '';
    this.password = '';
    this.fullName = '';
    this.headline = '';
    this.goalExam = '';
    this.showPassword.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  setRole(role: 'PROFESSOR' | 'STUDENT'): void {
    this.selectedRole.set(role);
  }

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  private navigateAfterAuth(role?: string): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      if (role?.toUpperCase() === 'PROFESSOR') {
        this.router.navigate(['/professor/estudio']);
      } else {
        this.router.navigate(['/meus-estudos']);
      }
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading = true;

    if (this.activeTab() === 'login') {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          const role = res.userRole || res.role;
          this.navigateAfterAuth(role);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(err.error?.message || 'E-mail ou senha inválidos.');
        }
      });
    } else {
      const payload = {
        email: this.email,
        password: this.password,
        fullName: this.fullName,
        role: this.selectedRole(),
        userRole: this.selectedRole(),
        headline: this.headline,
        goalExam: this.goalExam
      };

      this.authService.register(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage.set('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => {
            const role = res.userRole || res.role;
            this.navigateAfterAuth(role);
          }, 800);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(err.error?.message || 'Erro ao criar conta. Verifique os dados inseridos.');
        }
      });
    }
  }
}

