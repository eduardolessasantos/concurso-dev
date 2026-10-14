import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  PublicShowcaseService, 
  ExploreItem, 
  ExploreFilters, 
  PagedResult 
} from '../../services/public-showcase.service';
import { StudentManagementService } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';
import { AdSenseSlotComponent } from '../shared/adsense-slot/adsense-slot.component';
import { SolicitarAcessoModalComponent } from '../shared/solicitar-acesso-modal/solicitar-acesso-modal.component';
import { PixP2pCheckoutModalComponent } from '../shared/pix-p2p-checkout-modal/pix-p2p-checkout-modal.component';

export function normalizeSearchString(val: string | null | undefined): string {
  if (!val) return '';
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdSenseSlotComponent, SolicitarAcessoModalComponent, PixP2pCheckoutModalComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  // Parâmetros de busca e filtros
  public searchKeyword = signal<string>('');
  public selectedSubject = signal<string>('');
  public selectedOfferingType = signal<string | undefined>(undefined);
  public selectedFormat = signal<string | undefined>(undefined);
  public selectedCity = signal<string>('');
  public minPriceInput = signal<number | undefined>(undefined);
  public maxPriceInput = signal<number | undefined>(undefined);

  public pageIndex = signal<number>(1);
  public pageSize = signal<number>(12);

  // Estados e dados
  public pagedResult = signal<PagedResult<ExploreItem> | null>(null);
  public availableFilters = signal<ExploreFilters | null>(null);
  public enrolledCourseIds = signal<Set<string>>(new Set());
  public requestedCourseIds = signal<Set<string>>(new Set());

  public isLoading = signal<boolean>(true);
  public technicalError = signal<string | null>(null);
  public requestMessage = signal<string | null>(null);

  // Modal de solicitação de acesso
  public isAccessModalOpen = signal<boolean>(false);
  public selectedCourseId = signal<string>('');
  public selectedCourseTitle = signal<string>('');

  // Modal Pix P2P
  public isPixModalOpen = signal<boolean>(false);
  public selectedPixCourseId = signal<string>('');
  public selectedPixCourseTitle = signal<string>('');
  public selectedPixPrice = signal<number | undefined>(undefined);
  public selectedPixPriceFormatted = signal<string | undefined>(undefined);
  public selectedPixProfessorName = signal<string | undefined>(undefined);

  constructor(
    private showcaseService: PublicShowcaseService,
    private studentService: StudentManagementService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.search();
    this.fetchUserEnrollments();
  }

  fetchUserEnrollments(): void {
    if (this.authService.isAuthenticated()) {
      this.studentService.getMyStudies().subscribe({
        next: (studies) => {
          const ids = new Set(studies.map(s => s.courseId));
          this.enrolledCourseIds.set(ids);
        },
        error: () => {}
      });
    }
  }

  loadFilters(): void {
    this.showcaseService.getFilters().subscribe({
      next: (res) => {
        this.availableFilters.set(res);
      },
      error: () => {}
    });
  }

  search(resetPage: boolean = false): void {
    if (resetPage) {
      this.pageIndex.set(1);
    }

    this.isLoading.set(true);
    this.technicalError.set(null);

    // Constrói termo de busca combinando keyword e offeringType se selecionado
    let searchTerm = this.searchKeyword().trim();
    if (this.selectedOfferingType() && !searchTerm.includes(this.selectedOfferingType()!)) {
      searchTerm = searchTerm ? `${searchTerm} ${this.selectedOfferingType()}` : this.selectedOfferingType()!;
    }

    const params = {
      search: searchTerm || undefined,
      subject: this.selectedSubject() || undefined,
      format: this.selectedFormat(),
      city: this.selectedCity() || undefined,
      priceMin: this.minPriceInput(),
      priceMax: this.maxPriceInput(),
      pageIndex: this.pageIndex() - 1, // backend 0-indexed
      pageSize: this.pageSize()
    };

    this.showcaseService.explore(params).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.pagedResult.set(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err?.status 
          ? `HTTP ${err.status} (${err.statusText || 'Erro no servidor'})` 
          : (err?.message || 'Falha de comunicação de rede');
        this.technicalError.set(`Falha ao conectar com o catálogo da plataforma: ${detail}.`);
        this.pagedResult.set(null);
      }
    });
  }

  onSelectSubject(subj: string): void {
    this.selectedSubject.set(this.selectedSubject() === subj ? '' : subj);
    this.search(true);
  }

  onSelectOfferingType(type?: string): void {
    this.selectedOfferingType.set(this.selectedOfferingType() === type ? undefined : type);
    this.search(true);
  }

  onSelectFormat(fmt?: string): void {
    this.selectedFormat.set(this.selectedFormat() === fmt ? undefined : fmt);
    this.search(true);
  }

  onSelectCity(city: string): void {
    this.selectedCity.set(city);
    this.search(true);
  }

  clearFilters(): void {
    this.searchKeyword.set('');
    this.selectedSubject.set('');
    this.selectedOfferingType.set(undefined);
    this.selectedFormat.set(undefined);
    this.selectedCity.set('');
    this.minPriceInput.set(undefined);
    this.maxPriceInput.set(undefined);
    this.search(true);
  }

  goToPage(page: number): void {
    const totalPages = this.pagedResult()?.totalPages || 1;
    if (page >= 1 && page <= totalPages && page !== this.pageIndex()) {
      this.pageIndex.set(page);
      this.search();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isEnrolled(courseId?: string): boolean {
    if (!courseId) return false;
    if (this.authService.isProfessor()) return true;
    return this.enrolledCourseIds().has(courseId);
  }

  isRequested(courseId?: string): boolean {
    if (!courseId) return false;
    return this.requestedCourseIds().has(courseId);
  }

  openExternal(url?: string): void {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }

  onCtaClick(item: ExploreItem): void {
    if (item.professorId) {
      this.showcaseService.trackClick({
        professorId: item.professorId,
        contentOfferingId: item.itemType === 'OFFERING' ? item.id : undefined,
        ctaType: item.ctaType || (item.itemType === 'COURSE' ? 'PlatformCourse' : 'WhatsApp')
      }).subscribe({ error: () => {} });
    }

    if (item.itemType === 'COURSE') {
      if (this.isEnrolled(item.id)) {
        this.router.navigate(['/estudo', item.id]);
      } else if (item.price && item.price > 0) {
        this.openPixCheckout(item);
      } else {
        this.onRequestAccess(item.id, item.title);
      }
      return;
    }

    if (item.ctaType === 'WhatsApp' || item.ctaType === '1') {
      if (item.professorSlug) {
        this.router.navigate(['/p', item.professorSlug]);
      }
    } else if (item.ctaType === 'Agendamento' || item.ctaType === 'Comprar Externo' || item.ctaType === '2' || item.ctaType === '3') {
      this.openExternal(item.ctaUrl);
    } else if (item.professorSlug) {
      this.router.navigate(['/p', item.professorSlug]);
    }
  }

  openPixCheckout(item: ExploreItem): void {
    this.selectedPixCourseId.set(item.id);
    this.selectedPixCourseTitle.set(item.title);
    this.selectedPixPrice.set(item.price ?? undefined);
    this.selectedPixPriceFormatted.set(item.priceFormatted);
    this.selectedPixProfessorName.set(item.professorName);
    this.isPixModalOpen.set(true);
  }

  onPixApproved(courseId: string): void {
    this.enrolledCourseIds.update(set => new Set([...set, courseId]));
  }

  onRequestAccess(courseId: string, courseTitle?: string): void {
    this.selectedCourseId.set(courseId);
    this.selectedCourseTitle.set(courseTitle || '');
    this.isAccessModalOpen.set(true);
  }

  getOfferingTypeIcon(type?: string): string {
    if (!type) return '📚';
    const lower = type.toLowerCase();
    if (lower.includes('aula')) return '🎓';
    if (lower.includes('ebook') || lower.includes('e-book')) return '📖';
    if (lower.includes('mentoria')) return '🤝';
    return '📚';
  }

  getCtaLabel(item: ExploreItem): string {
    if (item.itemType === 'COURSE') {
      if (this.isEnrolled(item.id)) return 'Acessar Trilha';
      return item.price && item.price > 0 ? 'Comprar via Pix' : 'Solicitar Acesso';
    }
    if (item.ctaType === 'WhatsApp' || item.ctaType === '1') return 'Falar com Professor';
    if (item.ctaType === 'Agendamento' || item.ctaType === '2') return 'Agendar Horário';
    if (item.ctaType === 'Comprar Externo' || item.ctaType === '3') return 'Comprar Agora';
    if (item.ctaType === 'Curso na Plataforma' || item.ctaType === '4') return 'Acessar Trilha';
    return 'Ver Detalhes';
  }

  getCtaIcon(item: ExploreItem): string {
    if (item.itemType === 'COURSE') {
      if (this.isEnrolled(item.id)) return '📖';
      return item.price && item.price > 0 ? '⚡' : '🙋';
    }
    if (item.ctaType === 'WhatsApp' || item.ctaType === '1') return '💬';
    if (item.ctaType === 'Agendamento' || item.ctaType === '2') return '📅';
    if (item.ctaType === 'Comprar Externo' || item.ctaType === '3') return '💳';
    if (item.ctaType === 'Curso na Plataforma' || item.ctaType === '4') return '📖';
    return '👉';
  }
}
