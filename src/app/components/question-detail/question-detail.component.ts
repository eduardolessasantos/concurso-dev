import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { SubjectsService } from '../../services/subjects.service';
import { QuestionsService } from '../../services/questions.service';
import { Subject } from '../../models/subject.model';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './question-detail.component.html'
})
export class QuestionDetailComponent implements OnInit {
  private store = inject(StoreService);
  private subjectsService = inject(SubjectsService);
  private questionsService = inject(QuestionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subject: Subject | undefined;
  question: Question | undefined;
  selectedOption = signal<string | null>(null);
  letters = ['A','B','C','D','E'];

  ngOnInit() {
    const subjectId = this.route.snapshot.paramMap.get('subjectId')!;
    const qNum = parseInt(this.route.snapshot.paramMap.get('questionNumber')!, 10);
    this.subject = this.subjectsService.getById(subjectId);
    this.question = this.questionsService.getByNumber(qNum);
    if (!this.subject || !this.question) { this.router.navigate(['/disciplinas']); }
  }

  get answered() { return this.question ? this.store.state().answers[this.question.number] : null; }
  get prevNum() { return this.question && this.subject && this.question.number > this.subject.range[0] ? this.question.number - 1 : null; }
  get nextNum() { return this.question && this.subject && this.question.number < this.subject.range[1] ? this.question.number + 1 : null; }

  optionClass(letter: string): string {
    const a = this.answered;
    if (!a) return this.selectedOption() === letter ? 'selected' : '';
    if (letter === this.question!.answer) return 'correct';
    if (letter === a.selected) return 'wrong';
    return 'disabled';
  }

  selectOption(letter: string) { if (!this.answered) this.selectedOption.set(letter); }

  submit() {
    const selected = this.selectedOption();
    if (!selected || !this.question) return;
    const correct = selected === this.question.answer;
    this.store.answerQuestion(this.question.number, selected, correct);
    this.selectedOption.set(null);
  }

  navigate(qNum: number) {
    this.router.navigate(['/disciplinas', this.subject!.id, 'questao', qNum]);
  }
  goBack() { this.router.navigate(['/disciplinas', this.subject!.id]); }
}
