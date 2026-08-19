import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaymentService, ProfessorBalance } from '../../services/payment.service';

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.scss']
})
export class FinancialDashboardComponent implements OnInit {
  public balance = signal<ProfessorBalance | null>(null);
  public pixKey = '';
  public isLoading = true;
  public isUpdatingPix = false;
  public statusMessage = signal<string | null>(null);

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadBalance();
  }

  loadBalance(): void {
    this.isLoading = true;
    this.paymentService.getProfessorBalance().subscribe({
      next: (res) => {
        this.isLoading = false;
        const safeBalance = res || {
          totalRevenue: 0,
          availableBalance: 0,
          pendingBalance: 0,
          salesCount: 0,
          pixKey: '',
          transactions: []
        };
        this.balance.set(safeBalance);
        if (safeBalance.pixKey) {
          this.pixKey = safeBalance.pixKey;
        }
      },
      error: () => {
        this.isLoading = false;
        this.balance.set({
          totalRevenue: 0,
          availableBalance: 0,
          pendingBalance: 0,
          salesCount: 0,
          pixKey: '',
          transactions: []
        });
      }
    });
  }

  onSavePixKey(): void {
    if (!this.pixKey.trim()) return;

    this.isUpdatingPix = true;
    this.paymentService.updatePixKey(this.pixKey).subscribe({
      next: (res) => {
        this.isUpdatingPix = false;
        this.statusMessage.set(res.message);
        this.loadBalance();
      },
      error: (err) => {
        this.isUpdatingPix = false;
        alert(err.error?.message || 'Erro ao atualizar chave PIX.');
      }
    });
  }
}
