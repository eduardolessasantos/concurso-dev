import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PublicShowcaseService, PublicProfessorProfile } from '../../services/public-showcase.service';
import { StudentManagementService } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';

import { SolicitarAcessoModalComponent } from '../shared/solicitar-acesso-modal/solicitar-acesso-modal.component';

@Component({
  selector: 'app-professor-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule, SolicitarAcessoModalComponent],
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

  public isAccessModalOpen = signal<boolean>(false);
  public selectedCourseId = signal<string>('');
  public selectedCourseTitle = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private showcaseService: PublicShowcaseService,
    private studentService: StudentManagementService,
    public authService: AuthService,
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

  onRequestAccess(courseId: string, courseTitle?: string): void {
    // Abre modal no Modo A (sem código), NUNCA usa prompt()
    this.selectedCourseId.set(courseId);
    this.selectedCourseTitle.set(courseTitle || '');
    this.isAccessModalOpen.set(true);
  }
}
