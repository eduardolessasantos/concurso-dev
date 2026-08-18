import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { SubjectsService } from '../../services/subjects.service';
import { QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [],
  templateUrl: './subjects.component.html'
})
export class SubjectsComponent implements OnInit {
  private store = inject(StoreService);
  private subjectsService = inject(SubjectsService);
  private questionsService = inject(QuestionsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.subjectsService.loadSubjectsForCourse().subscribe();
  }

  subjectsWithProgress = computed(() => {
    const answers = this.store.state().answers;
    const all = this.subjectsService.getAll().map(subject => {
      const qs = this.questionsService.getBySubjectRange(subject.range[0], subject.range[1]);
      const total = qs.length;
      const answered = qs.filter(q => answers[q.number]).length;
      const correct = qs.filter(q => answers[q.number]?.correct).length;
      const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
      return { ...subject, total, answered, correct, pct };
    });

    return {
      gerais: all.filter(s => parseInt(s.number) <= 5),
      especificos: all.filter(s => parseInt(s.number) > 5)
    };
  });


  openSubject(id: string) { this.router.navigate(['/disciplinas', id]); }
  metaPrimary(meta: string) { return meta.split(' · ')[0]; }
  metaSecondary(meta: string) { return meta.split(' · ')[1]; }
}
