import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfessorManagementService, SaveOffering } from '../../services/professor-management.service';
import { PublicOffering } from '../../services/public-showcase.service';
import { CoursesService } from '../../services/courses.service';

@Component({
  selector: 'app-offerings-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './offerings-manager.component.html',
  styleUrls: ['./offerings-manager.component.scss']
})
export class OfferingsManagerComponent implements OnInit {
  public offerings = signal<PublicOffering[]>([]);
  public isLoading = signal<boolean>(true);
  public isSaving = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  // Cursos do professor para vínculo opcional
  public myCourses = signal<any[]>([]);

  // Estado do Modal (Criar / Editar)
  public isModalOpen = signal<boolean>(false);
  public editingOfferingId = signal<string | null>(null);

  // Campos do formulário de oferta
  public formTitle = signal<string>('');
  public formDescription = signal<string>('');
  public formSubject = signal<string>('');
  public formPrice = signal<number | null>(null);
  public formOfferingType = signal<number>(1); // 0=Course, 1=PrivateClass, 2=Ebook, 3=Mentoring
  public formFormat = signal<number>(0); // 0=Online, 1=InPerson, 2=Hybrid
  public formCity = signal<string>('');
  public formState = signal<string>('');
  public formCtaType = signal<number>(0); // 0=WhatsApp, 1=Scheduling, 2=ExternalCheckout, 3=PlatformCourse
  public formCtaUrl = signal<string>('');
  public formCtaWhatsappMessage = signal<string>('');
  public formCoverImageUrl = signal<string>('');
  public formIsActive = signal<boolean>(true);
  public formCourseStudyPlanId = signal<string | undefined>(undefined);

  // Tipos para seleção
  public offeringTypes = [
    { value: 1, label: 'Aula Particular', icon: '👨‍🏫', desc: 'Sessões individuais ou em pequenos grupos' },
    { value: 3, label: 'Mentoria', icon: '🚀', desc: 'Acompanhamento periódico e plano personalizado' },
    { value: 0, label: 'Curso', icon: '🎓', desc: 'Conteúdo completo com módulos e aulas' },
    { value: 2, label: 'E-book / Material', icon: '📖', desc: 'Apostilas, resumos e livros digitais' }
  ];

  public formats = [
    { value: 0, label: '100% Online', desc: 'Aulas e atendimento via videoconferência' },
    { value: 1, label: 'Presencial', desc: 'Em local físico ou a domicílio' },
    { value: 2, label: 'Híbrido', desc: 'Mescla de encontros presenciais e digitais' }
  ];

  public ctaTypes = [
    { value: 0, label: 'Conversar no WhatsApp', desc: 'O aluno abre conversa direta no seu WhatsApp' },
    { value: 1, label: 'Link de Agendamento', desc: 'Calendly, Google Calendar ou similar' },
    { value: 2, label: 'Link de Compra Externo', desc: 'Kiwify, Hotmart, Eduzz ou checkout próprio' },
    { value: 3, label: 'Matrícula na Plataforma', desc: 'Vincular a um curso nativo do TeacherTech' }
  ];

  constructor(
    private managementService: ProfessorManagementService,
    private coursesService: CoursesService
  ) {}

  ngOnInit(): void {
    this.loadOfferings();
    this.loadMyCourses();
  }

  loadOfferings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.managementService.getMyOfferings().subscribe({
      next: (list) => {
        this.offerings.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar suas ofertas no momento.');
        this.isLoading.set(false);
      }
    });
  }

  loadMyCourses(): void {
    this.coursesService.getMyCourses().subscribe({
      next: (courses) => this.myCourses.set(courses || []),
      error: () => {}
    });
  }

  openCreateModal(): void {
    this.editingOfferingId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formSubject.set('');
    this.formPrice.set(null);
    this.formOfferingType.set(1); // Padrão: Aula Particular
    this.formFormat.set(0); // Online
    this.formCity.set('');
    this.formState.set('');
    this.formCtaType.set(0); // WhatsApp
    this.formCtaUrl.set('');
    this.formCtaWhatsappMessage.set('Olá professor! Vi sua oferta no TeacherTech e gostaria de mais informações.');
    this.formCoverImageUrl.set('');
    this.formIsActive.set(true);
    this.formCourseStudyPlanId.set(undefined);
    this.isModalOpen.set(true);
  }

  openEditModal(offering: PublicOffering): void {
    this.editingOfferingId.set(offering.id);
    this.formTitle.set(offering.title);
    this.formDescription.set(offering.description || '');
    this.formSubject.set(offering.subject);
    this.formPrice.set(offering.price ?? null);
    this.formOfferingType.set(offering.offeringType);
    this.formFormat.set(offering.format);
    this.formCity.set(offering.locationCity || '');
    this.formState.set(offering.locationState || '');
    this.formCtaType.set(offering.ctaType);
    this.formCtaUrl.set(offering.ctaUrl || '');
    this.formCtaWhatsappMessage.set(offering.ctaWhatsappMessage || '');
    this.formCoverImageUrl.set(offering.coverImageUrl || '');
    this.formIsActive.set(offering.displayOrder >= 0); // ativo
    this.formCourseStudyPlanId.set(offering.courseStudyPlanId);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveOffering(): void {
    if (!this.formTitle().trim()) {
      alert('Por favor, informe o título da oferta.');
      return;
    }
    if (!this.formSubject().trim()) {
      alert('Por favor, informe a matéria ou disciplina.');
      return;
    }

    this.isSaving.set(true);

    const payload: SaveOffering = {
      title: this.formTitle().trim(),
      description: this.formDescription().trim(),
      subject: this.formSubject().trim(),
      price: this.formPrice() != null && this.formPrice()! > 0 ? this.formPrice() : null,
      offeringType: this.formOfferingType(),
      format: this.formFormat(),
      locationCity: this.formFormat() > 0 ? this.formCity().trim() || undefined : undefined,
      locationState: this.formFormat() > 0 ? this.formState().trim() || undefined : undefined,
      ctaType: this.formCtaType(),
      ctaUrl: this.formCtaUrl().trim() || undefined,
      ctaWhatsappMessage: this.formCtaWhatsappMessage().trim() || undefined,
      coverImageUrl: this.formCoverImageUrl().trim() || undefined,
      isActive: this.formIsActive(),
      courseStudyPlanId: this.formCourseStudyPlanId()
    };

    const id = this.editingOfferingId();
    if (id) {
      this.managementService.updateOffering(id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.showSuccess('Oferta atualizada com sucesso!');
          this.loadOfferings();
        },
        error: (err) => {
          this.isSaving.set(false);
          alert(err.error?.message || 'Erro ao atualizar a oferta.');
        }
      });
    } else {
      this.managementService.createOffering(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.showSuccess('Nova oferta cadastrada com sucesso!');
          this.loadOfferings();
        },
        error: (err) => {
          this.isSaving.set(false);
          alert(err.error?.message || 'Erro ao criar a oferta.');
        }
      });
    }
  }

  toggleActive(offering: PublicOffering): void {
    this.managementService.toggleOfferingActive(offering.id).subscribe({
      next: (res) => {
        this.offerings.update(list =>
          list.map(o => o.id === offering.id ? { ...o, isActive: res.isActive } : o)
        );
        this.showSuccess(res.isActive ? 'Oferta ativada na vitrine!' : 'Oferta pausada.');
      },
      error: () => alert('Não foi possível alterar o status da oferta.')
    });
  }

  deleteOffering(offering: PublicOffering): void {
    if (!confirm(`Deseja realmente excluir a oferta "${offering.title}"?`)) return;

    this.managementService.deleteOffering(offering.id).subscribe({
      next: () => {
        this.offerings.update(list => list.filter(o => o.id !== offering.id));
        this.showSuccess('Oferta excluída com sucesso.');
      },
      error: () => alert('Não foi possível excluir a oferta.')
    });
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    const current = [...this.offerings()];
    const temp = current[index];
    current[index] = current[index - 1];
    current[index - 1] = temp;
    this.offerings.set(current);
    this.persistOrder(current);
  }

  moveDown(index: number): void {
    const current = [...this.offerings()];
    if (index >= current.length - 1) return;
    const temp = current[index];
    current[index] = current[index + 1];
    current[index + 1] = temp;
    this.offerings.set(current);
    this.persistOrder(current);
  }

  private persistOrder(list: PublicOffering[]): void {
    const ids = list.map(o => o.id);
    this.managementService.reorderOfferings(ids).subscribe();
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3500);
  }
}
