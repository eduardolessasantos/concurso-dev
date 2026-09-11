import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentManagementService, ValidateInvite } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-invite-redeem',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="invite-container">
      @if (isLoading()) {
        <div class="card loading-card">
          <div class="spinner"></div>
          <h2>Validando seu convite...</h2>
          <p>Aguarde um instante enquanto preparamos seu acesso.</p>
        </div>
      } @else if (error()) {
        <div class="card error-card">
          <div class="icon">⚠️</div>
          <h2>Convite Indisponível</h2>
          <p>{{ error() }}</p>
          <a routerLink="/explorar" class="btn-primary">Explorar Outros Estudos</a>
        </div>
      } @else if (invite()) {
        <div class="card success-card">
          <div class="badge-invite">🎉 Convite Exclusivo</div>
          <h1>{{ invite()?.courseTitle }}</h1>
          <p class="professor">Liberado pelo Professor: <strong>{{ invite()?.professorName }}</strong></p>

          <div class="course-meta">
            <span class="meta-item">⏱️ Acesso Imediato</span>
            <span class="meta-item">🔑 Válido até {{ invite()?.expiresAt | date:'dd/MM/yyyy' }}</span>
          </div>

          @if (invite()?.courseDescription) {
            <p class="description">{{ invite()?.courseDescription }}</p>
          }

          <div class="actions">
            @if (authService.isAuthenticated()) {
              <div class="user-logged-info">
                <p class="welcome-user">Você está conectado como <strong>{{ authService.currentUser()?.fullName }}</strong></p>
              </div>
              <button 
                type="button" 
                class="btn-redeem" 
                [disabled]="isRedeeming()" 
                (click)="onRedeem()">
                @if (isRedeeming()) {
                  <span class="spinner-small"></span> Confirmando Matrícula...
                } @else {
                  🚀 Entrar na Turma Agora
                }
              </button>
            } @else {
              <div class="quick-register-box">
                <div class="box-header">
                  <h3>Cadastro Rápido de Aluno</h3>
                  <p>Crie sua conta em 5 segundos para acessar este estudo gratuitamente.</p>
                </div>

                @if (authErrorMessage()) {
                  <div class="auth-error">
                    {{ authErrorMessage() }}
                  </div>
                }

                <form (ngSubmit)="onQuickRegisterAndRedeem()" class="quick-form">
                  <div class="form-group">
                    <label>Seu Nome Completo</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      [(ngModel)]="quickFullName" 
                      placeholder="Ex: Maria Silva" 
                      required />
                  </div>

                  <div class="form-group">
                    <label>Seu E-mail</label>
                    <input 
                      type="email" 
                      name="email" 
                      [(ngModel)]="quickEmail" 
                      placeholder="exemplo@email.com" 
                      required />
                  </div>

                  <div class="form-group">
                    <label>Crie uma Senha</label>
                    <input 
                      type="password" 
                      name="password" 
                      [(ngModel)]="quickPassword" 
                      placeholder="Mínimo 6 caracteres" 
                      required />
                  </div>

                  <button 
                    type="submit" 
                    class="btn-redeem" 
                    [disabled]="isSubmittingAuth() || isRedeeming()">
                    @if (isSubmittingAuth() || isRedeeming()) {
                      <span class="spinner-small"></span> Criando Conta e Entrando...
                    } @else {
                      ✨ Criar Conta e Entrar no Estudo
                    }
                  </button>
                </form>

                <div class="login-redirect">
                  <span>Já possui uma conta?</span>
                  <a [routerLink]="['/login']" [queryParams]="{ returnUrl: '/convite/' + token() }">
                    Fazer Login
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .invite-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }
    .badge-invite {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #f8fafc;
      font-size: 1.7rem;
      margin: 0 0 0.5rem;
    }
    .professor {
      color: #94a3b8;
      font-size: 0.95rem;
      margin-bottom: 1.25rem;
      strong { color: #cbd5e1; }
    }
    .course-meta {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
      color: #64748b;
    }
    .description {
      color: #cbd5e1;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 2rem;
    }
    .btn-redeem {
      width: 100%;
      padding: 0.85rem 1.5rem;
      background: #10b981;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: filter 0.2s;
      &:hover:not(:disabled) { filter: brightness(1.15); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .user-logged-info {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      margin-bottom: 1.25rem;
      .welcome-user {
        margin: 0;
        font-size: 0.9rem;
        color: #6ee7b7;
        strong { color: #ffffff; }
      }
    }
    .quick-register-box {
      text-align: left;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .box-header {
      margin-bottom: 1.25rem;
      h3 {
        color: #f8fafc;
        font-size: 1.15rem;
        margin: 0 0 0.25rem;
      }
      p {
        color: #94a3b8;
        font-size: 0.85rem;
        margin: 0;
      }
    }
    .auth-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .quick-form {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #cbd5e1;
      }
      input {
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        color: #ffffff;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s;
        &:focus {
          border-color: #38bdf8;
        }
      }
    }
    .login-redirect {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.85rem;
      color: #94a3b8;
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      a {
        color: #38bdf8;
        text-decoration: none;
        font-weight: 600;
        &:hover { text-decoration: underline; }
      }
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #0284c7;
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }
    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class InviteRedeemComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentManagementService);
  public authService = inject(AuthService);

  public token = signal<string>('');
  public invite = signal<ValidateInvite | null>(null);
  public isLoading = signal<boolean>(true);
  public isRedeeming = signal<boolean>(false);
  public isSubmittingAuth = signal<boolean>(false);
  public error = signal<string | null>(null);
  public authErrorMessage = signal<string | null>(null);

  public quickFullName = '';
  public quickEmail = '';
  public quickPassword = '';

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.paramMap.get('token');
    if (!tokenParam) {
      this.error.set('Código do convite não fornecido.');
      this.isLoading.set(false);
      return;
    }

    this.token.set(tokenParam);
    this.studentService.validateInvite(tokenParam).subscribe({
      next: (res) => {
        this.invite.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Este convite é inválido ou já expirou.');
        this.isLoading.set(false);
      }
    });
  }

  onQuickRegisterAndRedeem(): void {
    if (!this.quickFullName.trim() || !this.quickEmail.trim() || !this.quickPassword.trim()) {
      this.authErrorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    if (this.quickPassword.length < 6) {
      this.authErrorMessage.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.authErrorMessage.set(null);
    this.isSubmittingAuth.set(true);

    this.authService.register({
      fullName: this.quickFullName.trim(),
      email: this.quickEmail.trim(),
      password: this.quickPassword,
      userRole: 'Student'
    }).subscribe({
      next: () => {
        this.isSubmittingAuth.set(false);
        // Após cadastrar e logar com sucesso, resgata o convite
        this.onRedeem();
      },
      error: (err) => {
        this.isSubmittingAuth.set(false);
        const msg = err.error?.message || 'Falha ao criar conta de aluno. Verifique se o e-mail já está em uso.';
        this.authErrorMessage.set(msg);
      }
    });
  }

  onRedeem(): void {
    const t = this.token();
    if (!t) return;

    this.isRedeeming.set(true);
    this.studentService.redeemInvite(t).subscribe({
      next: (res) => {
        this.isRedeeming.set(false);
        this.router.navigate(['/estudo', res.courseId]);
      },
      error: (err) => {
        this.isRedeeming.set(false);
        alert(err.error?.message || 'Erro ao resgatar convite.');
      }
    });
  }
}
