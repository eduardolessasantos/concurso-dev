import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { CourseStudyPlan, StudySessionHierarchyDto, SubjectHierarchyDto } from '../../models/course.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-module-disciplines',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbComponent],
  templateUrl: './module-disciplines.component.html',
  styleUrls: ['./module-disciplines.component.scss']
})
export class ModuleDisciplinesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public coursesService = inject(CoursesService);

  public courseId = signal<string>('');
  public moduleId = signal<string>('');
  public course = signal<CourseStudyPlan | null>(null);

  public newDisciplineName = '';
  public newDisciplineMeta = '';
  public newDisciplineDesc = '';

  public statusMessage = signal<string | null>(null);
  public statusType = signal<'success' | 'error'>('success');

  public activeModule = computed<StudySessionHierarchyDto | null>(() => {
    const c = this.course();
    if (!c || !c.studySessions) return null;
    return c.studySessions.find(s => s.id === this.moduleId()) || null;
  });

  public breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const c = this.course();
    const mod = this.activeModule();
    return [
      { label: 'Studio do Professor', url: '/professor/estudio' },
      { label: c?.title || 'Plano de Estudos', url: ['/professor/estudio', this.courseId(), 'modulos'] },
      { label: mod?.name || 'Categoria' },
      { label: 'Disciplinas' }
    ];
  });

  public disciplinesOfModule = computed<SubjectHierarchyDto[]>(() => {
    const c = this.course();
    if (!c || !c.subjects) return [];
    const mod = this.activeModule();
    const sessions = c.studySessions || c.modules || [];
    const isFirstModule = sessions.length > 0 && sessions[0].id === this.moduleId();

    return c.subjects.filter(s =>
      s.sessionId === this.moduleId() ||
      s.moduleId === this.moduleId() ||
      (mod && s.sessionName && s.sessionName.toLowerCase() === mod.name.toLowerCase()) ||
      (!s.sessionId && !s.moduleId && isFirstModule)
    );
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cId = params.get('courseId');
      const mId = params.get('moduleId');
      if (cId && mId) {
        this.courseId.set(cId);
        this.moduleId.set(mId);
        this.loadCourse(cId);
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
        this.showMessage('Erro ao carregar dados do estudo.', 'error');
      }
    });
  }

  public onAddDiscipline(): void {
    const name = this.newDisciplineName.trim();
    if (!name) return;

    const current = this.disciplinesOfModule();
    if (current.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      this.showMessage(`A disciplina "${name}" já existe nesta categoria.`, 'error');
      return;
    }

    this.coursesService.addSubject(
      this.courseId(),
      this.moduleId(),
      name,
      this.newDisciplineMeta.trim(),
      this.newDisciplineDesc.trim()
    ).subscribe({
      next: (newSubj) => {
        this.newDisciplineName = '';
        this.newDisciplineMeta = '';
        this.newDisciplineDesc = '';
        this.loadCourse(this.courseId());
        this.showMessage(`Disciplina "${name}" adicionada com sucesso!`, 'success');
      },
      error: () => {
        this.showMessage('Erro ao adicionar disciplina.', 'error');
      }
    });
  }

  public onDeleteDiscipline(subjectId: string, subjectName: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm(`Tem certeza que deseja remover a disciplina "${subjectName}" e todos os seus subtópicos?`)) {
      this.coursesService.deleteSubject(this.courseId(), subjectId).subscribe({
        next: () => {
          this.loadCourse(this.courseId());
          this.showMessage(`Disciplina "${subjectName}" removida com sucesso.`, 'success');
        },
        error: () => {
          this.showMessage('Erro ao remover disciplina.', 'error');
        }
      });
    }
  }

  public openSubjectStudio(subjectId: string): void {
    this.router.navigate(['/professor/estudio', this.courseId(), 'disciplinas', subjectId]);
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
