import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfessorManagementService } from '../../services/professor-management.service';
import { ShowcaseLeadResponse, ShowcaseMetricSummary, PublicProfessorProfile } from '../../services/public-showcase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.scss']
})
export class ProfessorDashboardComponent implements OnInit {
  public isLoading = signal<boolean>(true);
  public metrics = signal<ShowcaseMetricSummary | null>(null);
  public leads = signal<ShowcaseLeadResponse[]>([]);
  public profile = signal<PublicProfessorProfile | null>(null);
  public platformData = signal<any | null>(null);

  // Filtro de leads por status
  public filterStatus = signal<string>('ALL');

  // Lead status map: 0=New, 1=Contacted, 2=Converted, 3=Archived
  public leadStatuses = [
    { value: 0, key: 'New', label: 'Novo', colorClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 1, key: 'Contacted', label: 'Contatado', colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 2, key: 'Converted', label: 'Convertido', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 3, key: 'Archived', label: 'Arquivado', colorClass: 'bg-slate-100 text-slate-600 border-slate-200' }
  ];

  public filteredLeads = computed(() => {
    const list = this.leads();
    const filter = this.filterStatus();
    if (filter === 'ALL') return list;
    return list.filter(l => l.status.toLowerCase() === filter.toLowerCase());
  });

  public conversionRate = computed(() => {
    const m = this.metrics();
    if (!m || m.totalPageViews === 0) return '0%';
    const rate = ((m.totalLeads + m.totalWhatsAppClicks) / m.totalPageViews) * 100;
    return `${rate.toFixed(1)}%`;
  });

  constructor(
    private managementService: ProfessorManagementService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);

    // Carrega Métricas
    this.managementService.getMyMetrics().subscribe({
      next: (m) => this.metrics.set(m),
      error: () => {}
    });

    // Carrega Leads
    this.managementService.getMyLeads().subscribe({
      next: (l) => this.leads.set(l),
      error: () => {}
    });

    // Carrega Vitrine
    this.managementService.getMyShowcase().subscribe({
      next: (p) => this.profile.set(p),
      error: () => {}
    });

    // Carrega Dados de Assinatura e Alunos
    this.managementService.getPlatformDashboard().subscribe({
      next: (d) => {
        this.platformData.set(d);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onStatusChange(lead: ShowcaseLeadResponse, event: any): void {
    const newStatusInt = parseInt(event.target.value, 10);
    this.managementService.updateLeadStatus(lead.id, newStatusInt).subscribe({
      next: () => {
        const statusItem = this.leadStatuses.find(s => s.value === newStatusInt);
        const statusKey = statusItem ? statusItem.key : 'Contacted';
        this.leads.update(list =>
          list.map(l => l.id === lead.id ? { ...l, status: statusKey } : l)
        );
      },
      error: () => alert('Não foi possível atualizar o status do lead.')
    });
  }

  getWhatsAppLink(lead: ShowcaseLeadResponse): string {
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const profName = this.profile()?.fullName || 'Professor(a)';
    const text = encodeURIComponent(`Olá ${lead.name}, aqui é o ${profName} do TeacherTech! Vi seu interesse na nossa oferta e estou à disposição.`);
    return `https://wa.me/${phoneWithDDI}?text=${text}`;
  }

  getStatusClass(statusKey: string): string {
    const found = this.leadStatuses.find(s => s.key.toLowerCase() === (statusKey || '').toLowerCase());
    return found ? found.colorClass : 'bg-slate-100 text-slate-600 border-slate-200';
  }

  getStatusLabel(statusKey: string): string {
    const found = this.leadStatuses.find(s => s.key.toLowerCase() === (statusKey || '').toLowerCase());
    return found ? found.label : statusKey;
  }

  getStatusValue(statusKey: string): number {
    const found = this.leadStatuses.find(s => s.key.toLowerCase() === (statusKey || '').toLowerCase());
    return found ? found.value : 0;
  }
}
