import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService, CheckoutResponse } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  public courseId = '';
  public checkoutData = signal<CheckoutResponse | null>(null);
  public isLoading = true;
  public isConfirming = false;
  public paymentSuccess = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      if (this.courseId) {
        this.initCheckout();
      }
    });
  }

  initCheckout(): void {
    this.isLoading = true;
    this.paymentService.createCheckout(this.courseId, 'PIX').subscribe({
      next: (res) => {
        this.isLoading = false;
        this.checkoutData.set(res);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Erro ao gerar checkout.');
      }
    });
  }

  copyPixCode(): void {
    if (this.checkoutData()?.pixQrCodeCode) {
      navigator.clipboard.writeText(this.checkoutData()!.pixQrCodeCode);
      alert('Código PIX Copia e Cola copiado com sucesso!');
    }
  }

  onSimulatePayment(): void {
    if (!this.checkoutData()?.transactionId) return;

    this.isConfirming = true;
    this.paymentService.confirmSimulatedPayment(this.checkoutData()!.transactionId).subscribe({
      next: (res) => {
        this.isConfirming = false;
        this.paymentSuccess.set(res.message);
        setTimeout(() => {
          this.router.navigate(['/meus-estudos']);
        }, 2000);
      },
      error: (err) => {
        this.isConfirming = false;
        alert(err.error?.message || 'Erro ao confirmar pagamento.');
      }
    });
  }
}
