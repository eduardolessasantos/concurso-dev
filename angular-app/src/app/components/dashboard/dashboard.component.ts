import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { SubjectsService } from '../../services/subjects.service';
import { QuestionsService } from '../../services/questions.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private store = inject(StoreService);
  private subjectsService = inject(SubjectsService);
  private questionsService = inject(QuestionsService);
  private router = inject(Router);

  subjects = this.subjectsService.getAll();
  allQuestions = this.questionsService.getAll();

  daysLeft = computed(() => {
    const examDate = new Date('2026-10-11T13:00:00-03:00');
    return Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000));
  });

  progressPct = computed(() => {
    const answers = this.store.state().answers;
    const answered = Object.keys(answers).length;
    return Math.round((answered / this.allQuestions.length) * 100);
  });

  answeredCount = computed(() => Object.keys(this.store.state().answers).length);
  correctCount = computed(() => Object.values(this.store.state().answers).filter(a => a.correct).length);
  globalAccuracy = computed(() => {
    const answered = this.answeredCount();
    return answered > 0 ? Math.round((this.correctCount() / answered) * 100) : 0;
  });

  subjectProgress = computed(() => {
    const answers = this.store.state().answers;
    return this.subjects.map(subject => {
      const qs = this.questionsService.getBySubjectRange(subject.range[0], subject.range[1]);
      const total = qs.length;
      const answered = qs.filter(q => answers[q.number]).length;
      const correct = qs.filter(q => answers[q.number]?.correct).length;
      const pctSolved = total > 0 ? Math.round((answered / total) * 100) : 0;
      const pctCorrect = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      return { ...subject, total, answered, correct, pctSolved, pctCorrect };
    });
  });

  get progressLineWidth() { return `${Math.max(0, Math.min(100, 100 - (this.daysLeft() / 90) * 100))}%`; }
  get circumference() { return 2 * Math.PI * 50; }
  get strokeOffset() { return this.circumference * (1 - this.progressPct() / 100); }

  goTo(path: string) { this.router.navigate([path]); }

  clearProgress() {
    if (confirm('Deseja realmente redefinir todo o seu progresso? Isso apagará as respostas salvas.')) {
      this.store.clearAnswers();
    }
  }
}
