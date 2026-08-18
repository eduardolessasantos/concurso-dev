import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentManagementService, MyStudy } from '../../services/student-management.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-my-studies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-studies.component.html',
  styleUrls: ['./my-studies.component.scss']
})
export class MyStudiesComponent implements OnInit {
  public allStudies = signal<MyStudy[]>([]);
  public filteredStudies = signal<MyStudy[]>([]);
  public searchKeyword = '';
  public isSearching = signal<boolean>(false);

  private readonly defaultStudy: MyStudy = {
    enrollmentId: '00000000-0000-0000-0000-000000000001',
    courseId: '00000000-0000-0000-0000-000000000001',
    courseTitle: 'Plano Estratégico de Estudos - Tecnologia da Informação',
    courseDescription: 'Trilha didática completa com resumos em Markdown, flashcards de memorização, cronograma semanal de estudos e simulado inédito com questões comentadas.',
    category: 'TI & Dados',
    professorName: 'Eduardo Lessa',
    grantedVia: 'Aprovado pelo Professor',
    grantedAt: new Date().toISOString(),
    subjectsCount: 3
  };

  constructor(
    private studentService: StudentManagementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.allStudies.set([]);
      this.filteredStudies.set([]);
      return;
    }
    this.fetchStudies();
  }

  fetchStudies(): void {
    if (!this.authService.isAuthenticated()) {
      this.allStudies.set([]);
      this.filteredStudies.set([]);
      return;
    }

    this.studentService.getMyStudies().subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.allStudies.set(res);
        } else {
          this.allStudies.set([this.defaultStudy]);
        }
        this.onSearch();
      },
      error: () => {
        this.allStudies.set([this.defaultStudy]);
        this.onSearch();
      }
    });
  }


  onSearch(): void {
    const term = this.searchKeyword.toLowerCase().trim();
    if (!term) {
      this.filteredStudies.set(this.allStudies());
      this.isSearching.set(false);
      return;
    }

    this.isSearching.set(true);
    setTimeout(() => {
      const filtered = this.allStudies().filter(s =>
        s.courseTitle.toLowerCase().includes(term) ||
        s.professorName.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
      );
      this.filteredStudies.set(filtered);
      this.isSearching.set(false);
    }, 200);
  }
}

