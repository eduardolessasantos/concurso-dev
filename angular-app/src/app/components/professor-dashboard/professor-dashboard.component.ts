import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfessorManagementService } from '../../services/professor-management.service';
import { StudentManagementService, AccessRequestItem } from '../../services/student-management.service';
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
  public pendingRequests = signal<AccessRequestItem[]>([]);
  public approvingId = signal<string | null>(null);
  public actionSuccessMessage = signal<string | null>(null);

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
    private studentService: StudentManagementService,
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

    // Carrega Solicitações de Acesso & Pagamentos Pix Pendentes
    this.loadPendingRequests();

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

  loadPendingRequests(): void {
    this.studentService.getPendingAccessRequests().subscribe({
      next: (reqs) => this.pendingRequests.set(reqs),
      error: () => {}
    });
  }

  approveRequest(request: AccessRequestItem): void {
    this.approvingId.set(request.id);
    this.actionSuccessMessage.set(null);

    this.studentService.approveAccessRequest(request.id).subscribe({
      next: () => {
        this.approvingId.set(null);
        this.pendingRequests.update(list => list.filter(r => r.id !== request.id));
        this.actionSuccessMessage.set(`✅ Acesso liberado com sucesso para ${request.studentName}! O aluno já foi matriculado.`);
        // Atualiza contadores
        if (this.platformData()) {
          const current = this.platformData();
          this.platformData.set({
            ...current,
            totalActiveStudents: (current.totalActiveStudents || 0) + 1
          });
        }
        setTimeout(() => this.actionSuccessMessage.set(null), 6000);
      },
      error: (err) => {
        this.approvingId.set(null);
        alert(err.error?.message || 'Falha ao liberar acesso. Tente novamente.');
      }
    });
  }

  rejectRequest(request: AccessRequestItem): void {
    if (!confirm(`Deseja realmente recusar a solicitação de ${request.studentName}?`)) return;

    this.studentService.rejectAccessRequest(request.id).subscribe({
      next: () => {
        this.pendingRequests.update(list => list.filter(r => r.id !== request.id));
      },
      error: (err) => alert(err.error?.message || 'Falha ao recusar solicitação.')
    });
  }

  getStudentWhatsAppUrl(request: AccessRequestItem): string | null {
    if (!request.studentPhone) return null;
    const clean = request.studentPhone.replace(/\D/g, '');
    const phone = clean.startsWith('55') ? clean : `55${clean}`;
    const profName = this.profile()?.fullName || 'Professor(a)';
    const text = encodeURIComponent(`Olá ${request.studentName}! Aqui é o(a) Prof. ${profName} do TeacherTech. Recebi sua solicitação do curso '${request.courseTitle}'.`);
    return `https://wa.me/${phone}?text=${text}`;
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
