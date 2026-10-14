import { Component, Input, Output, EventEmitter, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService, P2pPixCheckoutResponse, P2pPixCheckoutRequest } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-pix-p2p-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pix-p2p-checkout-modal.component.html',
  styleUrls: ['./pix-p2p-checkout-modal.component.scss']
})
export class PixP2pCheckoutModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Input() courseId = '';
  @Input() courseTitle = '';
  @Input() offeringId?: string;
  @Input() price?: number;
  @Input() priceFormatted?: string;
  @Input() professorName?: string;
  @Input() professorPixKey?: string;
  @Input() professorWhatsApp?: string;

  @Output() close = new EventEmitter<void>();
  @Output() accessApproved = new EventEmitter<string>();

  public studentName = signal<string>('');
  public studentEmail = signal<string>('');
  public studentPhone = signal<string>('');

  public step = signal<'FORM' | 'PIX_READY' | 'APPROVED'>('FORM');
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public copied = signal<boolean>(false);

  public checkoutData = signal<P2pPixCheckoutResponse | null>(null);
  private pollingSub?: Subscription;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {
    effect(() => {
      if (this.isOpen) {
        const user = this.authService.currentUser();
        if (user) {
          if (!this.studentName()) this.studentName.set(user.fullName || '');
          if (!this.studentEmail()) this.studentEmail.set(user.email || '');
        }
      } else {
        this.stopPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  onPhoneChange(val: string): void {
    this.studentPhone.set(this.formatPhone(val));
  }

  generatePix(): void {
    this.errorMessage.set(null);
    const email = this.studentEmail().trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      this.errorMessage.set('Por favor, informe um endereço de e-mail válido para identificação da sua matrícula.');
      return;
    }

    this.isLoading.set(true);

    const payload: P2pPixCheckoutRequest = {
      courseId: this.courseId,
      offeringId: this.offeringId || undefined,
      name: this.studentName().trim() || undefined,
      email: email,
      phone: this.studentPhone().trim() || undefined
    };

    this.paymentService.createP2pPixCheckout(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.checkoutData.set(res);
        this.step.set('PIX_READY');
        this.startPolling(res.accessRequestId);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Não foi possível gerar a cobrança Pix. Verifique os dados e tente novamente.';
        this.errorMessage.set(msg);
      }
    });
  }

  copyPixCode(): void {
    const data = this.checkoutData();
    if (!data || !data.pixPayload) return;

    navigator.clipboard.writeText(data.pixPayload).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = data.pixPayload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    });
  }

  openWhatsAppProof(): void {
    const data = this.checkoutData();
    if (data?.whatsAppUrl) {
      window.open(data.whatsAppUrl, '_blank', 'noopener,noreferrer');
    }
  }

  get qrCodeImageUrl(): string {
    const data = this.checkoutData();
    if (!data?.pixPayload) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(data.pixPayload)}`;
  }

  private startPolling(requestId: string): void {
    this.stopPolling();
    // Poll every 3.5 seconds
    this.pollingSub = interval(3500).subscribe(() => {
      this.paymentService.getAccessRequestStatus(requestId).subscribe({
        next: (status) => {
          if (status.isApproved) {
            this.stopPolling();
            this.step.set('APPROVED');
            this.accessApproved.emit(this.courseId);
          }
        },
        error: () => {
          // Silent polling error to not disturb the user
        }
      });
    });
  }

  private stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  goToCourse(): void {
    this.closeModal();
    this.router.navigate(['/estudo', this.courseId]);
  }

  closeModal(): void {
    this.stopPolling();
    this.step.set('FORM');
    this.errorMessage.set(null);
    this.checkoutData.set(null);
    this.close.emit();
  }
}
