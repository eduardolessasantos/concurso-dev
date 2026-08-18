import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PublicShowcaseService, PublicProfessorProfile } from '../../services/public-showcase.service';
import { StudentManagementService } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-professor-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  onRequestAccess(courseId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.studentService.requestAccess(courseId, 'Gostaria de estudar por esta trilha de conteúdos!').subscribe({
      next: (res) => {
        this.requestMessage.set(res.message);
        this.requestedCourseIds.update(set => {
          const updated = new Set(set);
          updated.add(courseId);
          return updated;
        });
      },
      error: (err) => {
        alert(err.error?.message || 'Erro ao solicitar acesso.');
      }
    });
  }
}
