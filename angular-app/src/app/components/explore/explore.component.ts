import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PublicShowcaseService, PublicCourse } from '../../services/public-showcase.service';
import { StudentManagementService } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  public searchKeyword = '';
  public selectedCategory = '';

  public courses = signal<PublicCourse[]>([]);
  public enrolledCourseIds = signal<Set<string>>(new Set());
  public requestedCourseIds = signal<Set<string>>(new Set());
  
  public isLoading = signal<boolean>(true);
  public requestMessage = signal<string | null>(null);

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
    this.showcaseService.exploreCourses(this.searchKeyword, this.selectedCategory).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.courses.set(res);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.fetchCourses();
  }

  onSelectCategory(cat: string): void {
    this.selectedCategory = this.selectedCategory === cat ? '' : cat;
    this.fetchCourses();
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

    this.studentService.requestAccess(courseId, 'Gostaria de estudar por este curso!').subscribe({
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
