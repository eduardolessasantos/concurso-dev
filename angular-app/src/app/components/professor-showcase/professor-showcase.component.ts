import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicShowcaseService, PublicProfessorProfile, PublicOffering } from '../../services/public-showcase.service';
import { StudentManagementService } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';
import { SolicitarAcessoModalComponent } from '../shared/solicitar-acesso-modal/solicitar-acesso-modal.component';
import { ContactLeadModalComponent } from '../shared/contact-lead-modal/contact-lead-modal.component';
import { PixP2pCheckoutModalComponent } from '../shared/pix-p2p-checkout-modal/pix-p2p-checkout-modal.component';

export interface SocialLinkItem {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-professor-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule, SolicitarAcessoModalComponent, ContactLeadModalComponent, PixP2pCheckoutModalComponent],
  templateUrl: './professor-showcase.component.html',
  styleUrls: ['./professor-showcase.component.scss']
})
export class ProfessorShowcaseComponent implements OnInit {
  public profile = signal<PublicProfessorProfile | null>(null);
  public enrolledCourseIds = signal<Set<string>>(new Set());
  public requestedCourseIds = signal<Set<string>>(new Set());

  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string | null>(null);
  public requestMessage = signal<string | null>(null);

  // Filtro de ofertas por tipo
  public selectedOfferingType = signal<string>('TODOS');

  // Modal de solicitação de acesso para cursos nativos
  public isAccessModalOpen = signal<boolean>(false);
  public selectedCourseId = signal<string>('');
  public selectedCourseTitle = signal<string>('');

  // Modal Pix P2P
  public isPixModalOpen = signal<boolean>(false);
  public selectedPixCourseId = signal<string>('');
  public selectedPixCourseTitle = signal<string>('');
  public selectedPixPrice = signal<number | undefined>(undefined);
  public selectedPixPriceFormatted = signal<string | undefined>(undefined);
  public selectedPixOfferingId = signal<string | undefined>(undefined);

  // Modal de contato / captura de leads
  public isLeadModalOpen = signal<boolean>(false);
  public selectedLeadOfferingId = signal<string | undefined>(undefined);
  public selectedLeadOfferingTitle = signal<string | undefined>(undefined);

  // Computado: Ofertas filtradas
  public filteredOfferings = computed(() => {
    const prof = this.profile();
    if (!prof || !prof.offerings) return [];

    const filter = this.selectedOfferingType();
    if (filter === 'TODOS') return prof.offerings;

    return prof.offerings.filter(o => {
      if (filter === 'AULA' && o.offeringType === 1) return true;
      if (filter === 'CURSO' && o.offeringType === 2) return true;
      if (filter === 'EBOOK' && o.offeringType === 3) return true;
      if (filter === 'MENTORIA' && o.offeringType === 4) return true;
      return false;
    });
  });

  // Computado: URL sanitizada para o player de vídeo
  public safeVideoUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.profile()?.videoIntroUrl;
    if (!url) return null;

    let embedUrl: string | null = null;
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URL(url).searchParams;
        const v = urlParams.get('v');
        if (v) embedUrl = `https://www.youtube.com/embed/${v}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/')[1]?.split('?')[0];
        if (id) embedUrl = `https://player.vimeo.com/video/${id}`;
      } else if (url.includes('embed')) {
        embedUrl = url;
      }
    } catch {
      embedUrl = null;
    }

    if (embedUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return null;
  });

  // Computado: Redes sociais do professor
  public socialLinks = computed<SocialLinkItem[]>(() => {
    const json = this.profile()?.socialLinksJson;
    if (!json) return [];

    try {
      const parsed = JSON.parse(json);
      const items: SocialLinkItem[] = [];

      if (parsed.instagram) {
        items.push({ name: 'Instagram', url: parsed.instagram.startsWith('http') ? parsed.instagram : `https://instagram.com/${parsed.instagram.replace('@', '')}`, icon: '📷' });
      }
      if (parsed.linkedin) {
        items.push({ name: 'LinkedIn', url: parsed.linkedin.startsWith('http') ? parsed.linkedin : `https://linkedin.com/in/${parsed.linkedin}`, icon: '💼' });
      }
      if (parsed.youtube) {
        items.push({ name: 'YouTube', url: parsed.youtube, icon: '▶️' });
      }
      if (parsed.telegram) {
        items.push({ name: 'Telegram', url: parsed.telegram.startsWith('http') ? parsed.telegram : `https://t.me/${parsed.telegram.replace('@', '')}`, icon: '✈️' });
      }
      if (parsed.website) {
        items.push({ name: 'Website', url: parsed.website, icon: '🌐' });
      }

      return items;
    } catch {
      return [];
    }
  });

  constructor(
    private route: ActivatedRoute,
    private showcaseService: PublicShowcaseService,
    private studentService: StudentManagementService,
    public authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProfile(slug);
      }
    });

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

  loadProfile(slug: string): void {
    this.isLoading.set(true);
    this.showcaseService.getProfessorProfileBySlug(slug).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.profile.set(res);

        // Telemetria: Contabiliza visualização da vitrine em segundo plano
        if (res.userId) {
          this.showcaseService.trackClick({
            professorId: res.userId,
            ctaType: 'PageView'
          }).subscribe({ error: () => {} });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Perfil de professor não encontrado.');
      }
    });
  }

  isEnrolled(courseId: string): boolean {
    if (this.authService.isProfessor()) return true;
    return this.enrolledCourseIds().has(courseId);
  }

  isRequested(courseId: string): boolean {
    return this.requestedCourseIds().has(courseId);
  }

  setFilter(type: string): void {
    this.selectedOfferingType.set(type);
  }

  // Ação CTA: WhatsApp com telemetria
  openWhatsApp(offering?: PublicOffering): void {
    const prof = this.profile();
    if (!prof) return;

    // Dispara telemetria resiliente em segundo plano
    this.showcaseService.trackClick({
      professorId: prof.userId,
      contentOfferingId: offering?.id,
      ctaType: 'WhatsApp'
    }).subscribe({ error: () => {} });

    const phone = prof.whatsAppNumber || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let msg = offering?.ctaWhatsappMessage;
    if (!msg) {
      if (offering) {
        msg = `Olá Prof. ${prof.fullName}! Vi sua vitrine no TeacherTech e tenho interesse em: "${offering.title}".`;
      } else {
        msg = `Olá Prof. ${prof.fullName}! Vi sua vitrine no TeacherTech e gostaria de mais informações.`;
      }
    }

    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  // Ação CTA: Link externo com telemetria
  openExternal(url?: string, offering?: PublicOffering): void {
    if (!url) return;

    const prof = this.profile();
    if (prof) {
      this.showcaseService.trackClick({
        professorId: prof.userId,
        contentOfferingId: offering?.id,
        ctaType: offering?.ctaType === 2 ? 'Scheduling' : 'ExternalCheckout'
      }).subscribe({ error: () => {} });
    }

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }

  // Ação CTA: Abertura do modal de captura de lead
  openContactLead(offering?: PublicOffering): void {
    this.selectedLeadOfferingId.set(offering?.id);
    this.selectedLeadOfferingTitle.set(offering?.title);
    this.isLeadModalOpen.set(true);
  }

  onLeadCreated(): void {
    this.requestMessage.set('Sua mensagem foi enviada ao professor com sucesso!');
  }

  // Ação CTA: Tratamento unificado por tipo de oferta
  onCtaClick(offering: PublicOffering): void {
    if (offering.ctaType === 1) { // WhatsApp
      this.openWhatsApp(offering);
    } else if (offering.ctaType === 2 || offering.ctaType === 3) { // Agendamento ou Checkout Externo
      if (offering.ctaUrl) {
        this.openExternal(offering.ctaUrl, offering);
      } else {
        this.openContactLead(offering);
      }
    } else if (offering.ctaType === 4 && offering.courseStudyPlanId) { // Plataforma
      if (this.isEnrolled(offering.courseStudyPlanId)) {
        this.router.navigate(['/estudo', offering.courseStudyPlanId]);
      } else if (offering.price && offering.price > 0) {
        this.openPixCheckout(offering.courseStudyPlanId, offering.title, offering.price, offering.priceFormatted, offering.id);
      } else {
        this.onRequestAccess(offering.courseStudyPlanId, offering.title);
      }
    } else {
      if (this.profile()?.whatsAppNumber) {
        this.openWhatsApp(offering);
      } else {
        this.openContactLead(offering);
      }
    }
  }

  openPixCheckout(courseId: string, courseTitle: string, price?: number, priceFormatted?: string, offeringId?: string): void {
    this.selectedPixCourseId.set(courseId);
    this.selectedPixCourseTitle.set(courseTitle);
    this.selectedPixPrice.set(price);
    this.selectedPixPriceFormatted.set(priceFormatted);
    this.selectedPixOfferingId.set(offeringId);
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

  getOfferingTypeLabel(type: number): string {
    switch (type) {
      case 1: return 'Aula Particular';
      case 2: return 'Curso';
      case 3: return 'E-book';
      case 4: return 'Mentoria';
      default: return 'Conteúdo';
    }
  }

  getOfferingTypeIcon(type: number): string {
    switch (type) {
      case 1: return '🎓';
      case 2: return '📚';
      case 3: return '📖';
      case 4: return '🤝';
      default: return '✨';
    }
  }

  getOfferingFormatLabel(format: number): string {
    switch (format) {
      case 1: return 'Online';
      case 2: return 'Presencial';
      case 3: return 'Híbrido';
      default: return 'Online';
    }
  }

  getCtaLabel(offering: PublicOffering): string {
    switch (offering.ctaType) {
      case 1: return 'Chamar no WhatsApp';
      case 2: return 'Agendar Horário';
      case 3: return 'Comprar Agora';
      case 4: return offering.courseStudyPlanId && this.isEnrolled(offering.courseStudyPlanId) ? 'Acessar Trilha' : 'Solicitar Acesso';
      default: return 'Saiba Mais';
    }
  }

  getCtaIcon(offering: PublicOffering): string {
    switch (offering.ctaType) {
      case 1: return '💬';
      case 2: return '📅';
      case 3: return '💳';
      case 4: return '📖';
      default: return '👉';
    }
  }
}
