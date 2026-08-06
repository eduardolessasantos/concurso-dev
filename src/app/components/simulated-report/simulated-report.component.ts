import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-simulated-report',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './simulated-report.component.html'
})
export class SimulatedReportComponent implements OnInit {
  private store = inject(StoreService);
  private questionsService = inject(QuestionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sessionIndex = -1;
  
  // Track selected question index within the session
  selectedQuestionIdx = signal<number | null>(null);

  letters = ['A','B','C','D','E'];

  ngOnInit() {
    this.sessionIndex = parseInt(this.route.snapshot.paramMap.get('historyIndex')!, 10);
    if (!this.session) {
      this.router.navigate(['/simulado']);
    }
  }

  get session() { return this.store.state().historySimulated[this.sessionIndex]; }

  get results() {
    if (!this.session) return { correct: 0, wrong: 0, unanswered: 0, pct: 0 };
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    this.session.questions.forEach(qNum => {
      const ans = this.session.answers[qNum];
      const q = this.questionsService.getByNumber(qNum);
      if (!ans) unanswered++;
      else if (q && ans === q.answer) correct++;
      else wrong++;
    });

    const total = this.session.questions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { correct, wrong, unanswered, pct };
  }

  get strokeOffset() {
    return 2 * Math.PI * 50 * (1 - this.results.pct / 100);
  }

  navBtnClass(idx: number): string {
    const qNum = this.session.questions[idx];
    const ans = this.session.answers[qNum];
    const q = this.questionsService.getByNumber(qNum);
    
    let cls = '';
    if (idx === this.selectedQuestionIdx()) cls += ' active';
    
    if (!ans) cls += ' unanswered';
    else if (q && ans === q.answer) cls += ' correct';
    else cls += ' wrong';
    
    return cls;
  }

  get selectedQuestion() {
    if (this.selectedQuestionIdx() === null) return null;
    const qNum = this.session.questions[this.selectedQuestionIdx()!];
    return this.questionsService.getByNumber(qNum);
  }
  
  get selectedQuestionAnswer() {
    if (this.selectedQuestionIdx() === null) return null;
    const qNum = this.session.questions[this.selectedQuestionIdx()!];
    return this.session.answers[qNum];
  }

  optionClass(letter: string): string {
    const q = this.selectedQuestion;
    const ans = this.selectedQuestionAnswer;
    if (!q) return '';
    
    if (letter === q.answer) return 'correct';
    if (letter === ans) return 'wrong';
    return 'disabled';
  }

  goBack() {
    this.router.navigate(['/simulado']);
  }
}
