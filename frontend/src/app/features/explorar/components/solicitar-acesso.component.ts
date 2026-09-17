import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-solicitar-acesso-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-dialog" role="dialog" aria-modal="true">
          <button type="button" class="btn-close" (click)="onClose()" aria-label="Fechar">✕</button>

          <!-- MODAL HEADER -->
          <div class="modal-header">
            @if (mode() === 'A') {
              <div class="header-icon">🙋</div>
              <h2>Solicitar Acesso ao Estudo</h2>
              <p class="subtitle">{{ courseTitle || 'Conteúdo exclusivo orientado pelo professor' }}</p>
            } @else {
              <div class="header-icon">🔑</div>
              <h2>Resgatar Código de Convite</h2>
              <p class="subtitle">Insira o código de 8 caracteres que você recebeu do professor</p>
            }
          </div>

          <!-- MODAL BODY -->
          <div class="modal-body">
            <!-- MODO A: SEM CÓDIGO -->
            @if (mode() === 'A') {
              @if (successMessageA()) {
                <div class="alert-success">
                  <span class="icon">✅</span>
                  <div>
                    <strong>{{ successMessageA() }}</strong>
                    <p class="hint">Fique atento às notificações do seu e-mail e WhatsApp.</p>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn-primary" (click)="onClose()">Entendido</button>
                </div>
              } @else {
                <form (ngSubmit)="onSubmitModeA()" class="modal-form">
                  @if (errorMessageA()) {
                    <div class="alert-error">
                      ⚠️ {{ errorMessageA() }}
                    </div>
                  }

                  <div class="form-group">
                    <label for="studentName">Seu Nome Completo *</label>
                    <input 
                      id="studentName"
                      type="text" 
                      [(ngModel)]="name" 
                      name="name" 
                      placeholder="Ex: Ana Beatriz Silva" 
                      required />
                  </div>

                  <div class="form-group">
                    <label for="studentEmail">Seu Melhor E-mail *</label>
                    <input 
                      id="studentEmail"
                      type="email" 
                      [(ngModel)]="email" 
                      name="email" 
                      placeholder="ana@email.com" 
                      required />
                  </div>

                  <div class="form-group">
                    <label for="studentMessage">Mensagem / Observação (Opcional)</label>
                    <textarea 
                      id="studentMessage"
                      [(ngModel)]="message" 
                      name="message" 
                      rows="3" 
                      placeholder="Ex: Gostaria de estudar para o concurso da Dataprev com este cronograma..."></textarea>
                  </div>

                  <div class="form-actions">
                    <button 
                      type="submit" 
                      class="btn-primary" 
                      [disabled]="isSubmittingA() || !name.trim() || !email.trim()">
                      @if (isSubmittingA()) {
                        <span class="spinner-sm"></span> Enviando...
                      } @else {
                        📨 Enviar Solicitação
                      }
                    </button>

                    <button 
                      type="button" 
                      class="btn-switch-mode" 
                      (click)="switchMode('B')">
                      🔑 Já tenho um código de convite
                    </button>
                  </div>
                </form>
              }
            }

            <!-- MODO B: COM CÓDIGO (8 CARACTERES) -->
            @if (mode() === 'B') {
              <form (ngSubmit)="onSubmitModeB()" class="modal-form">
                @if (errorMessageB()) {
                  <div class="alert-error">
                    ⚠️ {{ errorMessageB() }}
                  </div>
                }

                <div class="form-group">
                  <label for="inviteCodeInput">Código de Convite (8 dígitos/letras) *</label>
                  <input 
                    id="inviteCodeInput"
                    type="text" 
                    maxlength="8" 
                    [(ngModel)]="inviteCode" 
                    name="inviteCode" 
                    placeholder="Ex: aB3x9Z1q" 
                    class="code-input"
                    autocapitalize="none"
                    autocomplete="off"
                    required />
                  <span class="helper-text">Digite os 8 caracteres alfanuméricos recebidos.</span>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn-primary" 
                    [disabled]="isSubmittingB() || inviteCode.trim().length !== 8">
                    @if (isSubmittingB()) {
                      <span class="spinner-sm"></span> Validando Código...
                    } @else {
                      🚀 Validar & Acessar Estudo
                    }
                  </button>

                  <button 
                    type="button" 
                    class="btn-switch-mode" 
                    (click)="switchMode('A')">
                    ← Não tenho código, quero solicitar acesso
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-dialog {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .btn-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .btn-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .modal-header {
      padding: 2rem 2rem 1rem 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .header-icon {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #f8fafc;
    }
    .subtitle {
      margin: 0.35rem 0 0 0;
      font-size: 0.88rem;
      color: #94a3b8;
    }

    .modal-body {
      padding: 1.5rem 2rem 2rem 2rem;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      text-align: left;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }
    .form-group input,
    .form-group textarea {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #f8fafc;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .code-input {
      letter-spacing: 4px;
      font-size: 1.25rem !important;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
    }
    .helper-text {
      font-size: 0.78rem;
      color: #64748b;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-top: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      border: none;
      padding: 0.85rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .btn-switch-mode {
      background: transparent;
      border: none;
      color: #38bdf8;
      font-size: 0.88rem;
      cursor: pointer;
      text-decoration: underline;
      padding: 0.4rem;
      transition: color 0.2s;
    }
    .btn-switch-mode:hover {
      color: #7dd3fc;
    }

    .alert-success {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86efac;
      padding: 1.25rem;
      border-radius: 10px;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .alert-success .hint {
      margin: 0.4rem 0 0 0;
      font-size: 0.82rem;
      color: #bbf7d0;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SolicitarAcessoModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() courseId: string = '';
  @Input() courseTitle: string = '';
  @Input() initialMode: 'A' | 'B' = 'A';

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  public mode = signal<'A' | 'B'>('A');

  // Modo A Fields
  public name: string = '';
  public email: string = '';
  public message: string = '';
  public isSubmittingA = signal<boolean>(false);
  public successMessageA = signal<string | null>(null);
  public errorMessageA = signal<string | null>(null);

  // Modo B Fields
  public inviteCode: string = '';
  public isSubmittingB = signal<boolean>(false);
  public errorMessageB = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mode.set(this.initialMode);

    // Pre-fill user data if logged in
    const user = this.authService.currentUser();
    if (user) {
      this.name = user.fullName || '';
      this.email = user.email || '';
    }
  }

  switchMode(newMode: 'A' | 'B'): void {
    this.mode.set(newMode);
    this.errorMessageA.set(null);
    this.errorMessageB.set(null);
  }

  onClose(): void {
    this.isOpen = false;
    this.successMessageA.set(null);
    this.errorMessageA.set(null);
    this.errorMessageB.set(null);
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  onSubmitModeA(): void {
    if (!this.name.trim() || !this.email.trim()) {
      this.errorMessageA.set('Preencha seu nome e e-mail.');
      return;
    }

    this.isSubmittingA.set(true);
    this.errorMessageA.set(null);

    const payload = {
      courseId: this.courseId,
      name: this.name.trim(),
      email: this.email.trim(),
      message: this.message.trim()
    };

    this.http.post<any>(`${environment.apiUrl}/accessrequests`, payload).subscribe({
      next: (res) => {
        this.isSubmittingA.set(false);
        this.successMessageA.set(res?.message || 'Solicitação enviada! Professor vai te enviar o convite no WhatsApp.');
        this.success.emit();
      },
      error: (err) => {
        this.isSubmittingA.set(false);
        this.errorMessageA.set(err.error?.message || 'Erro ao enviar solicitação. Tente novamente.');
      }
    });
  }

  onSubmitModeB(): void {
    const token = this.inviteCode.trim();
    if (token.length !== 8) {
      this.errorMessageB.set('O código de convite deve ter exatamente 8 caracteres.');
      return;
    }

    this.isSubmittingB.set(true);
    this.errorMessageB.set(null);

    // Se o usuário estiver autenticado, faz o resgate imediatamente
    if (this.authService.isAuthenticated()) {
      this.http.post<any>(`${environment.apiUrl}/invites/redeem/${token}`, {}).subscribe({
        next: (res) => {
          this.isSubmittingB.set(false);
          this.onClose();
          const targetCourseId = res?.courseId || this.courseId;
          this.router.navigate(['/estudo', targetCourseId]);
        },
        error: (err) => {
          this.isSubmittingB.set(false);
          // Mostra erro inline, NUNCA abre prompt
          this.errorMessageB.set(err.error?.message || 'Código de convite inválido ou expirado.');
        }
      });
    } else {
      // Se não autenticado, redireciona para a tela pública de convite com preenchimento automático
      this.isSubmittingB.set(false);
      this.onClose();
      this.router.navigate(['/convite', token], { queryParams: { code: token } });
    }
  }
}

// Alias de exportação para compatibilidade
export { SolicitarAcessoModalComponent as SolicitarAcessoComponent };
