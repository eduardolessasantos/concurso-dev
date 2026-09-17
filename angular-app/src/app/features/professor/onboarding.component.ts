import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-professor-onboarding',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="onboarding-container">
      <div class="onboarding-card">
        <div class="header-icon">🚀</div>
        <h2>Bem-vindo ao TeacherTech, Professor!</h2>
        <p class="subtitle">Sua jornada como criador de conteúdo e mentor educacional começa agora.</p>

        <div class="steps-guide">
          <div class="step-card">
            <span class="step-num">1</span>
            <div>
              <h3>Crie seus Planos e Disciplinas</h3>
              <p>Estruture módulos, matérias e tópicos personalizados para concursos e certames.</p>
            </div>
          </div>
          <div class="step-card">
            <span class="step-num">2</span>
            <div>
              <h3>Potencialize com Inteligência Artificial</h3>
              <p>Gere resumos direcionados, flashcards inteligentes e questões inéditas em segundos.</p>
            </div>
          </div>
          <div class="step-card">
            <span class="step-num">3</span>
            <div>
              <h3>Compartilhe e Monetize</h3>
              <p>Gere convites exclusivos para seus alunos ou venda acesso integrado via Pix/Cartão.</p>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <a routerLink="/professor/estudio" class="btn-primary">Acessar Estúdio do Professor</a>
          <a routerLink="/explorar" class="btn-secondary">Explorar Plataforma</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
    }
    .onboarding-card {
      max-width: 640px;
      width: 100%;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      backdrop-filter: blur(12px);
      text-align: center;
    }
    .header-icon { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.8rem; margin: 0 0 0.5rem; color: #fff; font-weight: 700; }
    .subtitle { color: #94a3b8; font-size: 1rem; margin-bottom: 2rem; }
    .steps-guide { display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-bottom: 2.5rem; }
    .step-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 1rem 1.2rem;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .step-num {
      background: #3b82f6;
      color: white;
      font-weight: bold;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.9rem;
    }
    .step-card h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #e2e8f0; font-weight: 600; }
    .step-card p { margin: 0; font-size: 0.875rem; color: #94a3b8; line-height: 1.4; }
    .action-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: #3b82f6;
      color: white;
      text-decoration: none;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary {
      background: transparent;
      color: #94a3b8;
      text-decoration: none;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s;
    }
    .btn-secondary:hover { color: white; border-color: rgba(255, 255, 255, 0.4); }
  `]
})
export class ProfessorOnboardingComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {}
}
