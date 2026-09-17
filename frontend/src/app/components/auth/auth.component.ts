import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  public isEmailConflict = signal<boolean>(false);
  
  public email = '';
  public password = '';
  public fullName = '';
  public headline = '';
  public goalExam = '';

  public invitedCourseTitle = signal<string | null>(null);
  public returnUrl: string | null = null;
  public acceptTerms = false;

  public isLoading = false;
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);

  // Password rules validation
  public hasMinLength = computed(() => (this.password || '').length >= 8);
  public hasUppercase = computed(() => /[A-Z]/.test(this.password || ''));
  public hasLowercase = computed(() => /[a-z]/.test(this.password || ''));
  public hasNumber = computed(() => /[0-9]/.test(this.password || ''));
  public hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.password || ''));

  public passwordScore = computed(() => {
    let score = 0;
    if (this.hasMinLength()) score++;
    if (this.hasUppercase()) score++;
    if (this.hasLowercase()) score++;
    if (this.hasNumber()) score++;
    if (this.hasSpecial()) score++;
    return score;
  });

  public strengthClass = computed(() => {
    const score = this.passwordScore();
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  });

  public strengthLabel = computed(() => {
    const score = this.passwordScore();
    if (score <= 2) return 'Fraca';
    if (score <= 4) return 'Média';
    return 'Forte';
  });

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

    this.initGoogleSignIn();
  }

  resetForm(): void {
    this.email = '';
    this.password = '';
    this.fullName = '';
    this.headline = '';
    this.goalExam = '';
    this.acceptTerms = false;
    this.showPassword.set(false);
    this.isEmailConflict.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.isEmailConflict.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    setTimeout(() => this.renderGoogleButton(), 100);
  }

  goToLogin(): void {
    this.isEmailConflict.set(false);
    this.errorMessage.set(null);
    this.switchTab('login');
  }

  setRole(role: 'PROFESSOR' | 'STUDENT'): void {
    this.selectedRole.set(role);
  }

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  private navigateAfterAuth(role?: string, isRegister = false): void {
    const normalized = (role || this.authService.currentUser()?.role || '').toString().trim().toUpperCase();
    if (normalized === 'STUDENT') {
      this.router.navigate(['/meus-estudos']);
    } else {
      if (isRegister) {
        this.router.navigate(['/professor/onboarding']);
      } else {
        this.router.navigate(['/professor/estudio']);
      }
    }
  }

  // --- GOOGLE SIGN-IN INTEGRATION ---
  private initGoogleSignIn(): void {
    if (typeof (window as any).google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.renderGoogleButton();
      document.head.appendChild(script);
    } else {
      setTimeout(() => this.renderGoogleButton(), 100);
    }
  }

  private renderGoogleButton(): void {
    const btnContainer = document.getElementById('googleSignInBtn');
    const googleObj = (window as any).google;
    if (!btnContainer || !googleObj || !googleObj.accounts?.id) return;

    try {
      googleObj.accounts.id.initialize({
        client_id: '1234567890-mock.apps.googleusercontent.com', // Substituível por Client ID real
        callback: (response: any) => this.handleGoogleCallback(response)
      });
      googleObj.accounts.id.renderButton(btnContainer, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 320,
        logo_alignment: 'left'
      });
    } catch (err) {
      console.warn('Google Identity initialization note:', err);
    }
  }

  public handleGoogleCustomClick(): void {
    const googleObj = (window as any).google;
    if (googleObj && googleObj.accounts?.id) {
      try {
        googleObj.accounts.id.prompt();
      } catch {
        this.errorMessage.set('Para login direto, configure o Google Client ID de produção.');
      }
    } else {
      this.errorMessage.set('Serviço de autenticação Google indisponível no momento.');
    }
  }

  private handleGoogleCallback(response: any): void {
    if (!response || !response.credential) {
      this.errorMessage.set('Credencial do Google não recebida.');
      return;
    }

    this.isLoading = true;
    this.errorMessage.set(null);
    this.authService.loginWithGoogle(response.credential, this.selectedRole()).subscribe({
      next: (res) => {
        this.isLoading = false;
        const role = res.userRole || res.role;
        this.navigateAfterAuth(role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage.set(err.error?.message || 'Falha ao autenticar com o Google no servidor.');
      }
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.activeTab() === 'register' && !this.acceptTerms) {
      this.errorMessage.set('Você deve concordar com os Termos de Uso e a Política de Privacidade (LGPD) para se cadastrar.');
      return;
    }

    this.isLoading = true;

    if (this.activeTab() === 'login') {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const role = res?.user?.role || res?.userRole || res?.role;
          this.navigateAfterAuth(role);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(err.error?.message || 'E-mail ou senha inválidos.');
        }
      });
    } else {
      let finalEmail = this.email.trim();
      if (/test|teste/i.test(finalEmail)) {
        const atIndex = finalEmail.indexOf('@');
        if (atIndex > 0) {
          const prefix = finalEmail.substring(0, atIndex);
          const domain = finalEmail.substring(atIndex + 1);
          finalEmail = `${prefix}_${Date.now()}@${domain}`;
        } else {
          finalEmail = `prof_teste_${Date.now()}@test.com`;
        }
      }

      const payload = {
        email: finalEmail,
        password: this.password,
        fullName: this.fullName,
        role: this.selectedRole(),
        userRole: this.selectedRole(),
        headline: this.headline,
        goalExam: this.goalExam
      };

      this.authService.register(payload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.successMessage.set('Conta criada com sucesso! Redirecionando...');
          const chosenRole = (this.selectedRole() || res?.user?.role || res?.userRole || res?.role || 'STUDENT').toString().trim().toUpperCase();
          setTimeout(() => {
            this.navigateAfterAuth(chosenRole, true);
          }, 600);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409 || err.error?.error === 'EMAIL_EXISTS') {
            this.isEmailConflict.set(true);
            this.errorMessage.set(err.error?.message || 'Este e-mail já está cadastrado. Faça login.');
          } else {
            this.isEmailConflict.set(false);
            this.errorMessage.set(err.error?.message || 'Erro ao criar conta. Verifique os dados inseridos.');
          }
        }
      });
    }
  }
}

