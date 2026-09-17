import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PublicShowcaseService, PublicCourse } from '../../services/public-showcase.service';
import { StudentManagementService } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';
import { AdSenseSlotComponent } from '../shared/adsense-slot/adsense-slot.component';
import { SolicitarAcessoModalComponent } from '../shared/solicitar-acesso-modal/solicitar-acesso-modal.component';

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
  imports: [CommonModule, FormsModule, RouterModule, AdSenseSlotComponent, SolicitarAcessoModalComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  public searchKeyword = '';
  public selectedCategory = '';

  public allLoadedCourses = signal<PublicCourse[]>([]);
  public courses = signal<PublicCourse[]>([]);
  public enrolledCourseIds = signal<Set<string>>(new Set());
  public requestedCourseIds = signal<Set<string>>(new Set());
  
  public isLoading = signal<boolean>(true);
  public technicalError = signal<string | null>(null);
  public requestMessage = signal<string | null>(null);

  public isAccessModalOpen = signal<boolean>(false);
  public selectedCourseId = signal<string>('');
  public selectedCourseTitle = signal<string>('');

  constructor(
    private showcaseService: PublicShowcaseService,
    private studentService: StudentManagementService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
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

  fetchCourses(): void {
    this.isLoading.set(true);
    this.technicalError.set(null);

    // Public search must work without authentication token
    this.showcaseService.exploreCourses(this.searchKeyword, this.selectedCategory).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.technicalError.set(null);
        this.allLoadedCourses.set(res || []);
        this.applyFilter();
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err?.status 
          ? `HTTP ${err.status} (${err.statusText || 'Erro no servidor'})` 
          : (err?.message || 'Falha de comunicação de rede');
        this.technicalError.set(`Falha ao conectar com o catálogo da plataforma: ${detail}.`);
        this.courses.set([]);
      }
    });
  }

  onSearch(): void {
    // If we already loaded courses, apply local search immediately for snappiness, plus sync with server
    if (this.allLoadedCourses().length > 0) {
      this.applyFilter();
    } else {
      this.fetchCourses();
    }
  }

  onSelectCategory(cat: string): void {
    this.selectedCategory = this.selectedCategory === cat ? '' : cat;
    if (this.allLoadedCourses().length > 0) {
      this.applyFilter();
    } else {
      this.fetchCourses();
    }
  }

  applyFilter(): void {
    const rawTerm = this.searchKeyword;
    const term = normalizeSearchString(rawTerm);
    const category = this.selectedCategory;
    let list = this.allLoadedCourses();

    if (category && category !== 'Todos') {
      list = list.filter(c => c.category === category);
    }

    if (term) {
      list = list.filter(c => {
        const title = normalizeSearchString(c.title);
        const desc = normalizeSearchString(c.description);
        const profName = normalizeSearchString(
          c.professorName || 
          c.professorProfile?.fullName || 
          (c as any).professor?.fullName
        );
        return title.includes(term) || desc.includes(term) || profName.includes(term);
      });
    }

    this.courses.set(list);
  }

  isEnrolled(courseId: string): boolean {
    if (this.authService.isProfessor()) return true;
    return this.enrolledCourseIds().has(courseId);
  }

  isRequested(courseId: string): boolean {
    return this.requestedCourseIds().has(courseId);
  }

  onRequestAccess(courseId: string, courseTitle?: string): void {
    // Abre modal no Modo A (sem código), NUNCA usa prompt()
    this.selectedCourseId.set(courseId);
    this.selectedCourseTitle.set(courseTitle || '');
    this.isAccessModalOpen.set(true);
  }
}
