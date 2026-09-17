import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { AiGeneratorService, GeneratedFlashcard, GeneratedQuestion } from '../../services/ai-generator.service';
import {
  CourseStudyPlan,
  SubjectHierarchyDto,
  TopicHierarchyDto
} from '../../models/course.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb/breadcrumb.component';

export type WorkspaceTab = 'theory' | 'flashcards' | 'questions' | 'tips';

@Component({
  selector: 'app-subject-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbComponent],
  templateUrl: './subject-studio.component.html',
  styleUrls: ['./subject-studio.component.scss']
})
export class SubjectStudioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public coursesService = inject(CoursesService);
  public aiService = inject(AiGeneratorService);

  public courseId = signal<string>('');
  public subjectId = signal<string>('');
  public course = signal<CourseStudyPlan | null>(null);

  // Active Subject details
  public subject = signal<SubjectHierarchyDto | null>(null);
  public subjectName = signal<string>('');
  public subjectMeta = signal<string>('');
  public subjectDesc = signal<string>('');
  public defaultExamBoard = signal<string>('Cebraspe');

  // Subtopics Master List
  public filterText = signal<string>('');
  public newSubtopicTitle = '';
  public selectedTopicId = signal<string | null>(null);

  // Active Selected Topic Workspace (Detail)
  public activeTopic = signal<TopicHierarchyDto | null>(null);
  public activeTab = signal<WorkspaceTab>('theory');

  // Workspace Theory Form
  public theoryContent = '';
  public aiPromptQuery = '';
  public isAiGeneratingTheory = signal<boolean>(false);
  public isExtractingDocument = signal<boolean>(false);

  // Workspace Flashcards Form
  public isAiGeneratingFlashcards = signal<boolean>(false);
  public newCardFront = '';
  public newCardBack = '';
  public newCardDifficulty = 'MEDIUM';

  // Workspace Questions Form
  public isAiGeneratingQuestions = signal<boolean>(false);
  public newQuestionStatement = '';
  public newQuestionOptions = ['', '', '', '', ''];
  public newQuestionCorrectIndex = 0;
  public newQuestionExplanation = '';

  // Tips & Points
  public keyPointsText = '';
  public tipsText = '';

  // Notifications
  public statusMessage = signal<string | null>(null);
  public statusType = signal<'success' | 'error' | 'info'>('info');

  public breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const c = this.course();
    const s = this.subject();
    const moduleId = s?.sessionId || (c?.studySessions && c.studySessions[0]?.id) || '';

    return [
      { label: 'Studio do Professor', url: '/professor/estudio' },
      { label: c?.title || 'Plano de Estudos', url: ['/professor/estudio', this.courseId(), 'modulos'] },
      {
        label: s?.sessionName || 'Categoria',
        url: moduleId ? ['/professor/estudio', this.courseId(), 'modulos', moduleId, 'disciplinas'] : undefined
      },
      { label: s?.name || 'Disciplina' }
    ];
  });

  public filteredTopics = computed(() => {
    const s = this.subject();
    if (!s || !s.topics) return [];
    const filter = this.filterText().trim().toLowerCase();
    if (!filter) return s.topics;
    return s.topics.filter(t =>
      t.title.toLowerCase().includes(filter) ||
      (t.contentMarkdown && t.contentMarkdown.toLowerCase().includes(filter))
    );
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cId = params.get('courseId');
      const sId = params.get('subjectId');
      if (cId && sId) {
        this.courseId.set(cId);
        this.subjectId.set(sId);
        this.loadSubject(cId, sId);
      }
    });
  }

  public loadSubject(courseId: string, subjectId: string): void {
    this.coursesService.getCourseById(courseId).subscribe({
      next: (plan) => {
        if (plan) {
          this.course.set(plan);
          const foundSubject = plan.subjects?.find(s => s.id === subjectId);
          if (foundSubject) {
            this.subject.set(foundSubject);
            this.subjectName.set(foundSubject.name);
            this.subjectMeta.set(foundSubject.meta || '');
            this.subjectDesc.set(foundSubject.description || '');

            if (foundSubject.topics && foundSubject.topics.length > 0) {
              this.selectTopic(foundSubject.topics[0]);
            }
          }
        }
      },
      error: () => {
        this.showMessage('Erro ao carregar disciplina.', 'error');
      }
    });
  }

  // --- TOPIC SELECTION & SYNC ---

  public selectTopic(topic: TopicHierarchyDto): void {
    this.selectedTopicId.set(topic.id);
    this.activeTopic.set({ ...topic });
    this.theoryContent = topic.contentMarkdown || topic.topicDetail?.detail || '';
    this.defaultExamBoard.set(topic.examBoard || 'Cebraspe');
    this.keyPointsText = (topic.topicDetail?.keyPoints || []).join('\n');
    this.tipsText = (topic.topicDetail?.tips || []).join('\n');
  }

  // --- SUBTOPIC CREATION & REMOVAL (MASTER LIST) ---

  public onAddSubtopic(): void {
    const title = this.newSubtopicTitle.trim();
    if (!title) return;

    this.coursesService.addTopic(
      this.courseId(),
      this.subjectId(),
      title,
      this.defaultExamBoard()
    ).subscribe({
      next: (created) => {
        this.newSubtopicTitle = '';
        this.refreshLocalSubject();
        this.selectTopic(created);
        this.showMessage(`Subtópico "${title}" adicionado com sucesso!`, 'success');
      },
      error: () => {
        this.showMessage('Erro ao adicionar subtópico.', 'error');
      }
    });
  }

  public onDeleteTopic(topicId: string, topicTitle: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm(`Tem certeza que deseja remover o subtópico "${topicTitle}"?`)) {
      this.coursesService.deleteTopic(this.courseId(), this.subjectId(), topicId).subscribe({
        next: () => {
          this.refreshLocalSubject();
          const remaining = this.subject()?.topics || [];
          if (remaining.length > 0) {
            this.selectTopic(remaining[0]);
          } else {
            this.selectedTopicId.set(null);
            this.activeTopic.set(null);
          }
          this.showMessage(`Subtópico "${topicTitle}" removido.`, 'success');
        },
        error: () => {
          this.showMessage('Erro ao remover subtópico.', 'error');
        }
      });
    }
  }

  // --- WORKSPACE TAB 1: THEORY & AI & PDF ---

  public generateAiTheory(): void {
    const topic = this.activeTopic();
    if (!topic) return;

    this.isAiGeneratingTheory.set(true);
    const query = this.aiPromptQuery.trim() || topic.title;

    this.aiService.generateSummary(query, this.subjectName(), this.theoryContent).subscribe({
      next: (res) => {
        this.isAiGeneratingTheory.set(false);
        const timestamp = new Date().toLocaleString('pt-BR');
        const separator = `\n\n----------------- ${timestamp} (IA) -----------------\n\n`;
        this.theoryContent = this.theoryContent ? (this.theoryContent + separator + res.data) : res.data;
        this.saveCurrentTopic(false);
        this.showMessage('Conteúdo teórico gerado com IA e incorporado!', 'success');
      },
      error: () => {
        this.isAiGeneratingTheory.set(false);
        this.showMessage('Erro ao gerar conteúdo com IA.', 'error');
      }
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isExtractingDocument.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.isExtractingDocument.set(false);
      const timestamp = new Date().toLocaleString('pt-BR');
      const snippet = text.slice(0, 3000);
      const separator = `\n\n----------------- ${timestamp} (Arquivo: ${file.name}) -----------------\n\n`;
      this.theoryContent = this.theoryContent ? (this.theoryContent + separator + snippet) : snippet;
      this.saveCurrentTopic(false);
      this.showMessage(`Texto extraído do arquivo "${file.name}"!`, 'success');
      input.value = '';
    };

    reader.onerror = () => {
      this.isExtractingDocument.set(false);
      this.showMessage('Erro ao ler o arquivo selecionado.', 'error');
      input.value = '';
    };

    reader.readAsText(file);
  }

  // --- WORKSPACE TAB 2: FLASHCARDS ---

  public generateAiFlashcards(): void {
    const topic = this.activeTopic();
    if (!topic) return;

    this.isAiGeneratingFlashcards.set(true);
    this.aiService.generateFlashcards(topic.title, this.theoryContent, 4).subscribe({
      next: (res) => {
        this.isAiGeneratingFlashcards.set(false);
        const generated = res.data || [];
        const existing = topic.flashcards || [];

        const formatted = generated.map(g => ({
          frontText: g.frontText,
          backText: g.backText,
          difficulty: g.difficultyLevel || 'MEDIUM'
        }));

        topic.flashcards = [...existing, ...formatted];
        this.activeTopic.set({ ...topic });
        this.saveCurrentTopic(false);
        this.showMessage(`${formatted.length} flashcards gerados com IA!`, 'success');
      },
      error: () => {
        this.isAiGeneratingFlashcards.set(false);
        this.showMessage('Erro ao gerar flashcards com IA.', 'error');
      }
    });
  }

  public onAddManualFlashcard(): void {
    if (!this.newCardFront.trim() || !this.newCardBack.trim()) return;

    const topic = this.activeTopic();
    if (!topic) return;

    topic.flashcards = topic.flashcards || [];
    topic.flashcards.push({
      frontText: this.newCardFront.trim(),
      backText: this.newCardBack.trim(),
      difficulty: this.newCardDifficulty
    });

    this.newCardFront = '';
    this.newCardBack = '';
    this.activeTopic.set({ ...topic });
    this.saveCurrentTopic(false);
    this.showMessage('Flashcard adicionado!', 'success');
  }

  public onDeleteFlashcard(index: number): void {
    const topic = this.activeTopic();
    if (!topic || !topic.flashcards) return;

    topic.flashcards.splice(index, 1);
    this.activeTopic.set({ ...topic });
    this.saveCurrentTopic(false);
    this.showMessage('Flashcard removido.', 'info');
  }

  // --- WORKSPACE TAB 3: QUESTIONS ---

  public generateAiQuestions(): void {
    const topic = this.activeTopic();
    if (!topic) return;

    this.isAiGeneratingQuestions.set(true);
    this.aiService.generateQuestions(topic.title, this.theoryContent, this.defaultExamBoard(), 3).subscribe({
      next: (res) => {
        this.isAiGeneratingQuestions.set(false);
        const generated = res.data || [];
        const existing = topic.questions || [];

        const formatted = generated.map(q => ({
          statement: q.statement,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          examBoard: q.examBoard || this.defaultExamBoard()
        }));

        topic.questions = [...existing, ...formatted];
        this.activeTopic.set({ ...topic });
        this.saveCurrentTopic(false);
        this.showMessage(`${formatted.length} questões no padrão ${this.defaultExamBoard()} geradas!`, 'success');
      },
      error: () => {
        this.isAiGeneratingQuestions.set(false);
        this.showMessage('Erro ao gerar questões com IA.', 'error');
      }
    });
  }

  public onAddManualQuestion(): void {
    if (!this.newQuestionStatement.trim()) return;

    const topic = this.activeTopic();
    if (!topic) return;

    const validOptions = this.newQuestionOptions.filter(o => o.trim().length > 0);
    if (validOptions.length < 2) {
      this.showMessage('Informe ao menos duas alternativas.', 'error');
      return;
    }

    topic.questions = topic.questions || [];
    topic.questions.push({
      statement: this.newQuestionStatement.trim(),
      options: validOptions,
      correctOptionIndex: this.newQuestionCorrectIndex,
      explanation: this.newQuestionExplanation.trim(),
      examBoard: this.defaultExamBoard()
    });

    this.newQuestionStatement = '';
    this.newQuestionOptions = ['', '', '', '', ''];
    this.newQuestionExplanation = '';
    this.activeTopic.set({ ...topic });
    this.saveCurrentTopic(false);
    this.showMessage('Questão cadastrada!', 'success');
  }

  public onDeleteQuestion(index: number): void {
    const topic = this.activeTopic();
    if (!topic || !topic.questions) return;

    topic.questions.splice(index, 1);
    this.activeTopic.set({ ...topic });
    this.saveCurrentTopic(false);
    this.showMessage('Questão removida.', 'info');
  }

  // --- SAVE ACTIONS ---

  public saveCurrentTopic(notifyUser = true): void {
    const topic = this.activeTopic();
    if (!topic) return;

    topic.contentMarkdown = this.theoryContent;
    topic.examBoard = this.defaultExamBoard();
    topic.topicDetail = topic.topicDetail || {
      title: topic.title,
      summary: this.theoryContent.slice(0, 200),
      detail: this.theoryContent,
      peso: 'Média (⚖️ ⚖️ ⚖️)',
      keyPoints: [],
      tips: [],
      examples: []
    };

    topic.topicDetail.detail = this.theoryContent;
    topic.topicDetail.keyPoints = this.keyPointsText.split('\n').filter(s => s.trim().length > 0);
    topic.topicDetail.tips = this.tipsText.split('\n').filter(s => s.trim().length > 0);

    this.coursesService.updateTopic(this.courseId(), this.subjectId(), topic).subscribe({
      next: () => {
        this.refreshLocalSubject();
        if (notifyUser) {
          this.showMessage('Conteúdo do subtópico salvo com sucesso!', 'success');
        }
      },
      error: () => {
        this.showMessage('Erro ao salvar conteúdo do subtópico no servidor.', 'error');
      }
    });
  }

  public saveSubjectMeta(): void {
    const s = this.subject();
    if (!s) return;

    s.name = this.subjectName();
    s.meta = this.subjectMeta();
    s.description = this.subjectDesc();

    this.coursesService.updateSubject(this.courseId(), s).subscribe({
      next: () => {
        this.showMessage('Informações da disciplina atualizadas com sucesso!', 'success');
      }
    });
  }

  private refreshLocalSubject(): void {
    const updatedPlan = this.coursesService.activeCourse();
    if (updatedPlan) {
      this.course.set(updatedPlan);
      const s = updatedPlan.subjects?.find(sub => sub.id === this.subjectId());
      if (s) {
        this.subject.set(s);
      }
    }
  }

  private showMessage(msg: string, type: 'success' | 'error' | 'info'): void {
    this.statusMessage.set(msg);
    this.statusType.set(type);
    setTimeout(() => {
      if (this.statusMessage() === msg) {
        this.statusMessage.set(null);
      }
    }, 4000);
  }
}
