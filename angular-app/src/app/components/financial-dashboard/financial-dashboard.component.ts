import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentManagementService, ProfessorDashboard } from '../../services/student-management.service';

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.scss']
})
export class FinancialDashboardComponent implements OnInit {
  private studentService = inject(StudentManagementService);

  public dashboard = signal<ProfessorDashboard | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.studentService.getProfessorDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar métricas do painel.');
        this.isLoading.set(false);
      }
    });
  }

  getPlanName(type?: number): string {
    if (type === 1) return 'Plano Basic (R$ 29,90/mês)';
    if (type === 2) return 'Plano Pro (R$ 59,90/mês)';
    return 'Sem Assinatura Ativa';
  }

  getStatusName(status?: number): string {
    if (status === 1) return 'Ativo';
    if (status === 2) return 'Pendente';
    if (status === 3) return 'Inadimplente (Atrasado)';
    return 'Inativo';
  }
}
