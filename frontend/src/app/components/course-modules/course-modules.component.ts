import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { CourseStudyPlan, StudySessionHierarchyDto } from '../../models/course.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-course-modules',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbComponent],
  templateUrl: './course-modules.component.html',
  styleUrls: ['./course-modules.component.scss']
})
export class CourseModulesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public coursesService = inject(CoursesService);

  public courseId = signal<string>('');
  public course = signal<CourseStudyPlan | null>(null);
  public newModuleName = '';
  public statusMessage = signal<string | null>(null);
  public statusType = signal<'success' | 'error'>('success');

  // Quick suggestion chips
  public readonly suggestedCategories = [
    'Conhecimentos Específicos',
    'Conhecimentos Gerais',
    'Ciências Humanas',
    'Ciências Exatas',
    'Ciências Biológicas',
    'Linguagens e Códigos',
    'Legislação & Ética',
    'Raciocínio Lógico'
  ];

  public breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const c = this.course();
    return [
      { label: 'Studio do Professor', url: '/professor/estudio' },
      { label: c?.title || 'Plano de Estudos' },
      { label: 'Categorias do Edital' }
    ];
  });

  public modulesWithStats = computed(() => {
    const c = this.course();
    if (!c) return [];
    const sessions = c.studySessions || c.modules || [];
    const subjects = c.subjects || [];

    return sessions.map((sess, idx) => {
      const sessSubjects = subjects.filter(s =>
        s.sessionId === sess.id ||
        s.moduleId === sess.id ||
        (s.sessionName && s.sessionName.toLowerCase() === sess.name.toLowerCase()) ||
        (!s.sessionId && !s.moduleId && idx === 0)
      );
      const totalTopics = sessSubjects.reduce((acc, curr) => acc + (curr.topics?.length || 0), 0);
      return {
        ...sess,
        subjectsCount: sessSubjects.length,
        topicsCount: totalTopics
      };
    });
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('courseId');
      if (id) {
        this.courseId.set(id);
        this.loadCourse(id);
      }
    });
  }

  public loadCourse(id: string): void {
    this.coursesService.getCourseById(id).subscribe({
      next: (plan) => {
        if (plan) {
          this.course.set(plan);
        }
      },
      error: () => {
        this.showMessage('Erro ao carregar o plano de estudos.', 'error');
      }
    });
  }

  public onAddModule(nameToAdd?: string): void {
    const name = (nameToAdd || this.newModuleName).trim();
    if (!name) return;

    // Check if category already exists
    const currentSessions = this.course()?.studySessions || [];
    if (currentSessions.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      this.showMessage(`A categoria "${name}" já está cadastrada neste estudo.`, 'error');
      return;
    }

    this.coursesService.addModule(this.courseId(), name).subscribe({
      next: (newMod) => {
        this.newModuleName = '';
        this.loadCourse(this.courseId());
        this.showMessage(`Categoria "${name}" adicionada com sucesso!`, 'success');
      },
      error: () => {
        this.showMessage('Erro ao adicionar categoria.', 'error');
      }
    });
  }

  public onDeleteModule(moduleId: string, moduleName: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm(`Tem certeza que deseja remover a categoria "${moduleName}" e desvincular suas disciplinas?`)) {
      this.coursesService.deleteModule(this.courseId(), moduleId).subscribe({
        next: () => {
          this.loadCourse(this.courseId());
          this.showMessage(`Categoria "${moduleName}" removida com sucesso.`, 'success');
        },
        error: () => {
          this.showMessage('Erro ao remover categoria.', 'error');
        }
      });
    }
  }

  public openModuleDisciplines(moduleId: string): void {
    this.router.navigate(['/professor/estudio', this.courseId(), 'modulos', moduleId, 'disciplinas']);
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.statusMessage.set(msg);
    this.statusType.set(type);
    setTimeout(() => {
      if (this.statusMessage() === msg) {
        this.statusMessage.set(null);
      }
    }, 4000);
  }
}
