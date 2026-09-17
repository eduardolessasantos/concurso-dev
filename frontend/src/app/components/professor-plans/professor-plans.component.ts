import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

interface PlanCard {
  id: number;
  name: string;
  badge?: string;
  priceMonthly: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

@Component({
  selector: 'app-professor-plans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="plans-container">
      <div class="header-section">
        <span class="category-badge">🚀 Planos e Assinaturas</span>
        <h1>Escolha o Plano Ideal para seu Estúdio</h1>
        <p class="subtitle">
          Potencialize seus cursos com IA, convide alunos por WhatsApp e acompanhe o progresso em tempo real.
        </p>
      </div>

      @if (errorMessage()) {
        <div class="alert-banner error-banner">
          <span>⚠️ {{ errorMessage() }}</span>
        </div>
      }

      <div class="plans-grid">
        @for (plan of plans; track plan.id) {
          <div class="plan-card" [class.popular]="plan.isPopular">
            @if (plan.isPopular) {
              <div class="popular-tag">Mais Escolhido</div>
            }

            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <p class="plan-desc">{{ plan.description }}</p>
            </div>

            <div class="price-box">
              <span class="currency">R$</span>
              <span class="amount">{{ plan.priceMonthly }}</span>
              <span class="period">/mês</span>
            </div>

            <ul class="features-list">
              @for (feat of plan.features; track feat) {
                <li>
                  <span class="check-icon">✓</span>
                  <span>{{ feat }}</span>
                </li>
              }
            </ul>

            <button 
              type="button" 
              class="btn-subscribe" 
              [class.btn-popular]="plan.isPopular"
              [disabled]="loadingPlanId() !== null"
              (click)="onSubscribe(plan.id)">
              @if (loadingPlanId() === plan.id) {
                <span class="spinner-small"></span> Gerando Cobrança...
              } @else {
                Assinar {{ plan.name }} via Asaas
              }
            </button>
          </div>
        }
      </div>

      <div class="trust-footer">
        <div class="trust-item">
          <span class="icon">🔒</span>
          <div>
            <strong>Pagamento Seguro via Asaas</strong>
            <p>Cobrança mensal no PIX com cancelamento a qualquer momento.</p>
          </div>
        </div>
        <div class="trust-item">
          <span class="icon">⚡</span>
          <div>
            <strong>Ativação Instantânea</strong>
            <p>Seus limites de cursos e créditos de IA são liberados logo após a confirmação.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plans-container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
    }
    .header-section {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .category-badge {
      display: inline-block;
      padding: 0.35rem 0.9rem;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    h1 {
      font-size: 2.3rem;
      color: #f8fafc;
      font-weight: 800;
      margin-bottom: 0.8rem;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 1.1rem;
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .alert-banner {
      max-width: 700px;
      margin: 0 auto 2rem;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      text-align: center;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      align-items: stretch;
      margin-bottom: 4rem;
    }
    .plan-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      &:hover {
        transform: translateY(-4px);
        border-color: #475569;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);
      }
      &.popular {
        border: 2px solid #0284c7;
        background: linear-gradient(180deg, rgba(2, 132, 199, 0.08) 0%, #1e293b 100%);
      }
    }
    .popular-tag {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: #0284c7;
      color: #ffffff;
      padding: 0.3rem 1.2rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    .plan-header {
      margin-bottom: 1.5rem;
      h3 {
        font-size: 1.6rem;
        color: #f8fafc;
        margin-bottom: 0.4rem;
      }
      .plan-desc {
        color: #94a3b8;
        font-size: 0.95rem;
        min-height: 40px;
      }
    }
    .price-box {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #334155;
      .currency {
        font-size: 1.4rem;
        font-weight: 700;
        color: #cbd5e1;
      }
      .amount {
        font-size: 3rem;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1;
      }
      .period {
        color: #64748b;
        font-size: 1rem;
        font-weight: 600;
      }
    }
    .features-list {
      list-style: none;
      padding: 0;
      margin: 0 0 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
      li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        color: #cbd5e1;
        font-size: 0.95rem;
        line-height: 1.4;
      }
      .check-icon {
        color: #10b981;
        font-weight: 900;
        font-size: 1rem;
      }
    }
    .btn-subscribe {
      width: 100%;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      &:hover:not(:disabled) {
        background: #38bdf8;
        color: #0f172a;
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      &.btn-popular {
        background: #0284c7;
        color: #ffffff;
        border: none;
        &:hover:not(:disabled) {
          background: #0369a1;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
        }
      }
    }
    .trust-footer {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 1.8rem 2rem;
    }
    .trust-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      .icon {
        font-size: 1.6rem;
      }
      strong {
        color: #f8fafc;
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.95rem;
      }
      p {
        color: #64748b;
        font-size: 0.85rem;
        margin: 0;
        line-height: 1.4;
      }
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
export class ProfessorPlansComponent {
  private paymentService = inject(PaymentService);

  public loadingPlanId = signal<number | null>(null);
  public errorMessage = signal<string | null>(null);

  public plans: PlanCard[] = [
    {
      id: 0, // Basic
      name: 'Plano Basic',
      priceMonthly: '29,90',
      description: 'Ideal para professores que estão iniciando turmas e precisam de recursos essenciais.',
      features: [
        'Até 3 Cursos Publicados simultaneamente',
        '100 Créditos de IA para questões e resumos',
        'Convites ilimitados via Link direto e WhatsApp',
        'Painel com acompanhamento de progresso dos alunos',
        'Cobrança mensal automatizada via PIX no Asaas'
      ],
      isPopular: false
    },
    {
      id: 1, // Pro
      name: 'Plano Pro',
      priceMonthly: '59,90',
      description: 'Para educadores e criadores com múltiplas turmas que exigem alta escala e máxima IA.',
      features: [
        'Cursos e turmas ilimitadas',
        '500 Créditos de IA mensais para criação de conteúdo',
        'Convites ilimitados com envio em lote pelo WhatsApp',
        'Relatórios detalhados de acertos e tempo por questão',
        'Destaque no catálogo de cursos e suporte prioritário'
      ],
      isPopular: true
    }
  ];

  onSubscribe(planId: number): void {
    this.loadingPlanId.set(planId);
    this.errorMessage.set(null);

    this.paymentService.createSubscriptionCheckout(planId).subscribe({
      next: (res) => {
        this.loadingPlanId.set(null);
        if (res.invoiceUrl) {
          // Redireciona imediatamente para o checkout do Asaas
          window.location.href = res.invoiceUrl;
        } else {
          this.errorMessage.set('URL de pagamento não foi retornada pelo Asaas.');
        }
      },
      error: (err) => {
        this.loadingPlanId.set(null);
        const msg = err.error?.message || 'Erro ao comunicar com a operadora de pagamento (Asaas). Tente novamente.';
        this.errorMessage.set(msg);
      }
    });
  }
}
