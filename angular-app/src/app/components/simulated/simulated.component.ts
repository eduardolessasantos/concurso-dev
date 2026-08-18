import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { QuestionsService } from '../../services/questions.service';
import { SimulatedSession } from '../../models/question.model';

@Component({
  selector: 'app-simulated',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './simulated.component.html'
})
export class SimulatedComponent implements OnInit, OnDestroy {
  private store = inject(StoreService);
  private questionsService = inject(QuestionsService);
  private router = inject(Router);

  activeSim = computed(() => this.store.state().activeSimulated);
  history = computed(() => this.store.state().historySimulated);

  // Active simulated state
  currentIndex = signal(0);
  timeLeft = signal(0);
  timerInterval: any;

  letters = ['A','B','C','D','E'];

  ngOnInit() {
    this.setupTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  setupTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (!this.activeSim()) return;
    
    const sim = this.activeSim()!;
    const totalDuration = sim.type === 'complete' ? 4 * 60 * 60 : 30 * 60; // 4h or 30m
    const elapsed = Math.floor((Date.now() - new Date(sim.startedAt).getTime()) / 1000);
    this.timeLeft.set(Math.max(0, totalDuration - elapsed));
    
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => Math.max(0, t - 1));
      if (this.timeLeft() <= 0) {
        clearInterval(this.timerInterval);
        this.finishSimulated();
      }
    }, 1000);
  }

  get formattedTime() {
    const t = this.timeLeft();
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get currentQuestionNum() { return this.activeSim()?.questions[this.currentIndex()]; }
  get currentQuestion() { return this.currentQuestionNum ? this.questionsService.getByNumber(this.currentQuestionNum) : null; }
  get answeredCount() { return Object.keys(this.activeSim()?.answers || {}).length; }

  startSimulated(type: 'complete' | 'quick') {
    const questions = this.questionsService.getAll().map(q => q.number);
    let selected: number[];
    if (type === 'complete') {
      selected = questions;
    } else {
      // Pick 20 random questions
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, 20).sort((a,b) => a - b);
    }
    
    this.store.startSimulated(type, selected);
    this.currentIndex.set(0);
    this.setupTimer();
  }

  selectOption(letter: string) {
    if (!this.currentQuestionNum) return;
    this.store.answerSimulatedQuestion(this.currentQuestionNum, letter);
  }

  optionClass(letter: string): string {
    const ans = this.activeSim()?.answers[this.currentQuestionNum!];
    return ans === letter ? 'selected' : '';
  }

  navBtnClass(idx: number): string {
    let cls = '';
    if (idx === this.currentIndex()) cls += ' active';
    const qNum = this.activeSim()!.questions[idx];
    if (this.activeSim()!.answers[qNum]) cls += ' answered';
    return cls;
  }

  cancelSimulated() {
    if (confirm('Deseja realmente cancelar este simulado? Todo o progresso será perdido.')) {
      this.store.cancelSimulated();
      if (this.timerInterval) clearInterval(this.timerInterval);
    }
  }

  finishSimulated() {
    if (confirm('Deseja finalizar o simulado e ver o resultado?')) {
      this.store.finishSimulated();
      if (this.timerInterval) clearInterval(this.timerInterval);
      const latestIndex = this.store.state().historySimulated.length - 1;
      this.router.navigate(['/simulado/resultado', latestIndex]);
    }
  }

  viewReport(index: number) {
    this.router.navigate(['/simulado/resultado', index]);
  }

  getScoreInfo(sim: SimulatedSession) {
    let correct = 0;
    sim.questions.forEach(qNum => {
      const q = this.questionsService.getByNumber(qNum);
      if (q && sim.answers[qNum] === q.answer) correct++;
    });
    const pct = Math.round((correct / sim.questions.length) * 100);
    return { correct, total: sim.questions.length, pct };
  }

  clearHistory() {
    if (confirm('Deseja apagar o histórico de simulados?')) {
      this.store.clearHistory();
    }
  }
}
