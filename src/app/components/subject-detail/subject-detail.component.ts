import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { SubjectsService } from '../../services/subjects.service';
import { QuestionsService } from '../../services/questions.service';
import { TopicsService } from '../../services/topics.service';
import { Subject } from '../../models/subject.model';
import { Question } from '../../models/question.model';
import { UsefulLink } from '../../models/topic-detail.model';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './subject-detail.component.html'
})
export class SubjectDetailComponent implements OnInit {
  private store = inject(StoreService);
  private subjectsService = inject(SubjectsService);
  private questionsService = inject(QuestionsService);
  private topicsService = inject(TopicsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  subject: Subject | undefined;
  allSubjectQuestions: Question[] = [];
  filteredQuestions = signal<Question[]>([]);
  searchQuery = signal('');
  statusFilter = signal('todos');
  activeTopicIndex = signal<number | null>(null);

  activeTopicDetail = computed(() => {
    const idx = this.activeTopicIndex();
    if (idx === null || !this.subject) return null;

    const selectedTopic = this.subject.topics[idx];
    if (!selectedTopic) return null;

    return this.topicsService.getTopicDetail(this.subject.id, selectedTopic) ?? null;
  });

  /** Links úteis do tópico ativo, com youtubeId resolvido automaticamente da URL. */
  activeTopicLinks = computed<UsefulLink[]>(() => {
    const detail = this.activeTopicDetail();
    if (!detail?.usefulLinks?.length) return [];

    return detail.usefulLinks.map(link => {
      if (link.type === 'video' && !link.youtubeId) {
        const id = this.topicsService.extractYoutubeId(link.url);
        return id ? { ...link, youtubeId: id } : link;
      }
      return link;
    });
  });

  /** Separa links de documentação/estudo dos links de vídeo YouTube. */
  docLinks = computed(() =>
    this.activeTopicLinks().filter(l => l.type !== 'video')
  );

  youtubeLinks = computed(() =>
    this.activeTopicLinks().filter(l => l.type === 'video' && !!l.youtubeId)
  );

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('subjectId')!;
    this.subject = this.subjectsService.getById(id);
    if (!this.subject) { this.router.navigate(['/disciplinas']); return; }

    this.activeTopicIndex.set(null);
    this.allSubjectQuestions = this.questionsService.getBySubjectRange(this.subject.range[0], this.subject.range[1]);
    this.updateList();
  }

  get answers() { return this.store.state().answers; }

  updateList() {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    const answers = this.answers;
    let list = this.allSubjectQuestions;
    if (q) list = list.filter(qt => qt.title.toLowerCase().includes(q) || qt.prompt.toLowerCase().includes(q));
    if (status === 'nao_resolvidas') list = list.filter(qt => !answers[qt.number]);
    else if (status === 'resolvidas') list = list.filter(qt => !!answers[qt.number]);
    else if (status === 'corretas') list = list.filter(qt => answers[qt.number]?.correct);
    else if (status === 'incorretas') list = list.filter(qt => answers[qt.number] && !answers[qt.number].correct);
    this.filteredQuestions.set(list);
  }

  onSearch(val: string) { this.searchQuery.set(val); this.updateList(); }
  onFilter(val: string) { this.statusFilter.set(val); this.updateList(); }

  selectTopic(i: number) {
    if (!this.subject || !this.subject.topics[i]) return;
    this.activeTopicIndex.set(i === this.activeTopicIndex() ? null : i);
  }

  openQuestion(q: Question) {
    this.router.navigate(['/disciplinas', this.subject!.id, 'questao', q.number]);
  }

  getQuestionStatus(q: Question): 'correct' | 'wrong' | 'unanswered' {
    const a = this.answers[q.number];
    if (!a) return 'unanswered';
    return a.correct ? 'correct' : 'wrong';
  }

  getBadge(q: Question): string {
    const s = this.getQuestionStatus(q);
    if (s === 'correct') return 'Acerto ✓';
    if (s === 'wrong') return 'Erro ✗';
    return 'Pendente';
  }

  getYoutubeThumbnail(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  goBack() { this.router.navigate(['/disciplinas']); }
}
