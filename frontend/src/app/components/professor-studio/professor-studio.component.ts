import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CoursesService } from '../../services/courses.service';
import { CourseResponseDto, CourseStudyPlan, SubjectHierarchyDto, TopicHierarchyDto } from '../../models/course.model';
import { AiGeneratorService, GeneratedFlashcard, GeneratedQuestion } from '../../services/ai-generator.service';
import { AiKeyStorageService } from '../../services/ai-key-storage.service';
import { ProfessorStudioService, SaveStudioContentPayload } from '../../services/professor-studio.service';
import { AiConfigModalComponent } from '../ai-config-modal/ai-config-modal.component';

export type StudioViewMode = 'list' | 'editor';

@Component({
  selector: 'app-professor-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AiConfigModalComponent],
  templateUrl: './professor-studio.component.html',
  styleUrls: ['./professor-studio.component.scss']
})
export class ProfessorStudioComponent implements OnInit {
  public authService = inject(AuthService);
  public coursesService = inject(CoursesService);
  public aiService = inject(AiGeneratorService);
  public aiStorage = inject(AiKeyStorageService);
  private studioService = inject(ProfessorStudioService);
  private router = inject(Router);

  // View state
  public viewMode = signal<StudioViewMode>('list');
  public isAiModalOpen = signal<boolean>(false);
  public statusMessage = signal<string | null>(null);
  public statusType = signal<'success' | 'error' | 'info'>('info');

  // Active loaded course plan with deep hierarchy
  public activeCoursePlan = signal<CourseStudyPlan | null>(null);
  public availableSubjects = signal<SubjectHierarchyDto[]>([]);
  public availableTopics = signal<TopicHierarchyDto[]>([]);

  // Hierarchy Level 1: Course
  public selectedCourseId: string = '';
  public courseTitle = 'Plano Estratégico de Estudos - Dataprev 2026';
  public courseDescription = 'Preparação completa e direcionada para o cargo de Analista de Tecnologia da Informação.';
  public courseCategory = 'TI & Dados';
  public coursePrice: number = 0;
  public isPublic = true;

  // Hierarchy Level 1.5: Session/Module
  public sessionName: string = 'Conhecimentos Específicos';
  public commonSessions: string[] = [
    'Conhecimentos Específicos',
    'Conhecimentos Gerais',
    'Ciências Humanas',
    'Ciências Biológicas',
    'Ciências Exatas',
    'Linguagens e Códigos',
    'Matemática'
  ];

  // Hierarchy Level 2: Subject
  public selectedSubjectId = signal<string>('NEW');
  public isSubjectNew = signal<boolean>(true);
  public subjectName = 'Engenharia de Software';
  public subjectMeta = '25% das específicas · peso 3';
  public subjectDescription = 'Foco em desenvolvimento, ciclo de vida, arquitetura e boas práticas.';

  // Hierarchy Level 3: Topic & Exam Board
  public selectedTopicId = signal<string>('NEW');
  public isTopicNew = signal<boolean>(true);
  public topicTitle = 'Arquitetura de Microsserviços e APIs REST';
  public examBoard = 'Cebraspe';

  // Hierarchy Level 4: Topic Details (Unificado a partir da página estática Vanilla)
  public topicSummary = '';
  public topicDetailFull = '';
  public topicPeso = 'Alta (⚖️ ⚖️ ⚖️ ⚖️)';
  public keyPointsText = '';
  public tipsText = '';
  public examplesList: { question: string; answer: string; application: string }[] = [];
  public usefulLinksList: { label: string; url: string; type: 'documentacao' | 'video' | 'estudo'; youtubeId?: string }[] = [];

  // Custom AI Prompt Overrides per section
  public summaryPromptCustom = '';
  public flashcardsPromptCustom = '';
  public questionsPromptCustom = '';

  // Hierarchy Level 5: Generated Content State
  public generatedSummary = signal<string>('');
  public generatedFlashcards = signal<GeneratedFlashcard[]>([]);
  public generatedQuestions = signal<GeneratedQuestion[]>([]);

  // Generation loading flags
  public isGeneratingAll = false;
  public isGeneratingSummary = false;
  public isGeneratingFlashcards = false;
  public isGeneratingQuestions = false;
  public isSaving = false;
  public isLoadingCourseTree = false;

  // Key Status
  public hasUserKey = this.aiStorage.hasUserKey;

  ngOnInit(): void {
    this.loadCourses();
  }

  public loadCourses(): void {
    this.coursesService.getMyCourses().subscribe();
  }

  // --- View Switching & Deep Course Loading ---
  public openCourseModules(course: CourseResponseDto): void {
    this.router.navigate(['/professor/estudio', course.id, 'modulos']);
  }

  public openCourseEditor(course?: CourseResponseDto): void {
    if (course) {
      this.selectedCourseId = course.id;
      this.courseTitle = course.title;
      this.courseDescription = course.description;
      this.courseCategory = course.category;
      this.coursePrice = course.price;
      this.isPublic = course.isPublic;
      this.loadCourseDetails(course.id);
    } else {
      this.selectedCourseId = '';
      this.courseTitle = 'Novo Plano de Estudos Estratégico';
      this.courseDescription = 'Descreva os objetivos e foco deste estudo...';
      this.courseCategory = 'TI & Dados';
      this.coursePrice = 0;
      this.isPublic = true;
      this.activeCoursePlan.set(null);
      this.availableSubjects.set([]);
      this.availableTopics.set([]);
      this.onSelectSubject('NEW');
    }
    this.viewMode.set('editor');
    this.statusMessage.set(null);
  }

  public loadCourseDetails(courseId: string, preselectSubjectId?: string, preselectTopicId?: string): void {
    this.isLoadingCourseTree = true;
    this.coursesService.getCourseById(courseId).subscribe({
      next: (plan) => {
        this.isLoadingCourseTree = false;
        if (plan) {
          this.activeCoursePlan.set(plan);
          const subjects = plan.subjects || [];
          this.availableSubjects.set(subjects);

          if (subjects.length > 0) {
            const targetSubjectId = preselectSubjectId && subjects.some(s => s.id === preselectSubjectId)
              ? preselectSubjectId
              : subjects[0].id;

            this.onSelectSubject(targetSubjectId, preselectTopicId);
          } else {
            this.onSelectSubject('NEW');
          }
        }
      },
      error: () => {
        this.isLoadingCourseTree = false;
        this.onSelectSubject('NEW');
      }
    });
  }

  public onSubjectDropdownChange(targetVal: string): void {
    this.onSelectSubject(targetVal);
  }

  public onSelectSubject(subjectId: string, preselectTopicId?: string): void {
    this.selectedSubjectId.set(subjectId);

    if (subjectId === 'NEW') {
      this.isSubjectNew.set(true);
      this.subjectName = '';
      this.subjectMeta = '';
      this.subjectDescription = '';
      this.availableTopics.set([]);
      this.onSelectTopic('NEW');
    } else {
      this.isSubjectNew.set(false);
      const subject = this.availableSubjects().find(s => s.id === subjectId);
      if (subject) {
        this.subjectName = subject.name;
        this.sessionName = subject.sessionName || 'Conhecimentos Específicos';
        this.subjectMeta = subject.meta || '';
        this.subjectDescription = subject.description || '';
        const topics = subject.topics || [];
        this.availableTopics.set(topics);

        if (topics.length > 0) {
          const targetTopicId = preselectTopicId && topics.some(t => t.id === preselectTopicId)
            ? preselectTopicId
            : topics[0].id;
          this.onSelectTopic(targetTopicId);
        } else {
          this.onSelectTopic('NEW');
        }
      }
    }
  }

  public onTopicDropdownChange(targetVal: string): void {
    this.onSelectTopic(targetVal);
  }

  public onSelectTopic(topicId: string): void {
    this.selectedTopicId.set(topicId);

    if (topicId === 'NEW') {
      this.isTopicNew.set(true);
      this.topicTitle = '';
      this.examBoard = 'Cebraspe';
      this.topicSummary = '';
      this.topicDetailFull = '';
      this.topicPeso = 'Alta (⚖️ ⚖️ ⚖️ ⚖️)';
      this.keyPointsText = '';
      this.tipsText = '';
      this.examplesList = [];
      this.usefulLinksList = [];
      this.generatedSummary.set('');
      this.generatedFlashcards.set([]);
      this.generatedQuestions.set([]);
    } else {
      this.isTopicNew.set(false);
      const topic = this.availableTopics().find(t => t.id === topicId);
      if (topic) {
        this.topicTitle = topic.title;
        this.examBoard = topic.examBoard || 'Cebraspe';
        this.generatedSummary.set(topic.contentMarkdown || '');

        if (topic.topicDetail) {
          this.topicSummary = topic.topicDetail.summary || '';
          this.topicDetailFull = topic.topicDetail.detail || '';
          this.topicPeso = topic.topicDetail.peso || 'Alta (⚖️ ⚖️ ⚖️ ⚖️)';
          this.keyPointsText = (topic.topicDetail.keyPoints || []).join('\n');
          this.tipsText = (topic.topicDetail.tips || []).join('\n');
          this.examplesList = topic.topicDetail.examples
            ? topic.topicDetail.examples.map(e => ({ question: e.question, answer: e.answer, application: e.application || '' }))
            : [];
          this.usefulLinksList = topic.topicDetail.usefulLinks
            ? topic.topicDetail.usefulLinks.map(l => ({ label: l.label, url: l.url, type: l.type as any, youtubeId: l.youtubeId }))
            : [];
        }

        // Load existing flashcards
        if (topic.flashcards && topic.flashcards.length > 0) {
          this.generatedFlashcards.set(topic.flashcards.map(fc => ({
            frontText: fc.frontText,
            backText: fc.backText,
            difficultyLevel: (fc.difficulty || 'MEDIUM') as any
          })));
        } else {
          this.generatedFlashcards.set([]);
        }

        // Load existing questions
        if (topic.questions && topic.questions.length > 0) {
          this.generatedQuestions.set(topic.questions.map(q => {
            let options: string[] = [];
            if (q.options && q.options.length > 0) {
              options = q.options;
            } else if (q.optionsJson) {
              try {
                options = JSON.parse(q.optionsJson);
              } catch {
                options = [];
              }
            }
            return {
              statement: q.statement,
              options: options,
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation || '',
              examBoard: q.examBoard || topic.examBoard || 'Cebraspe'
            };
          }));
        } else {
          this.generatedQuestions.set([]);
        }
      }
    }
  }

  public backToList(): void {
    this.viewMode.set('list');
    this.statusMessage.set(null);
    this.loadCourses();
  }

  public deleteCourse(course: CourseResponseDto, event: Event): void {
    event.stopPropagation();
    if (confirm(`Tem certeza de que deseja excluir o estudo "${course.title}"?`)) {
      this.coursesService.deleteCourse(course.id).subscribe({
        next: () => {
          this.showMessage(`Estudo "${course.title}" removido com sucesso.`, 'success');
        }
      });
    }
  }

  // --- Dynamic Examples and Useful Links Helpers ---
  public addExample(): void {
    this.examplesList.push({ question: '', answer: '', application: '' });
  }

  public removeExample(index: number): void {
    this.examplesList.splice(index, 1);
  }

  public addUsefulLink(): void {
    this.usefulLinksList.push({ label: '', url: '', type: 'estudo' });
  }

  public removeUsefulLink(index: number): void {
    this.usefulLinksList.splice(index, 1);
  }

  // --- AI Key Check Helper ---
  private validateAiKey(): boolean {
    if (!this.aiStorage.hasUserKey()) {
      this.showMessage('🔑 Nenhuma Chave de API da IA configurada. Por favor, adicione sua chave para liberar a geração.', 'info');
      this.isAiModalOpen.set(true);
      return false;
    }
    return true;
  }

  // --- AI Content Generation ---
  public onGenerateAllWithAi(): void {
    if (!this.topicTitle.trim()) {
      this.showMessage('Por favor, informe o título do tópico antes de gerar.', 'error');
      return;
    }

    if (!this.validateAiKey()) return;

    this.isGeneratingAll = true;
    this.showMessage('⚡ Gerando Resumo, Detalhes, Flashcards e Questões com IA...', 'info');

    this.aiService.generateSummary(this.topicTitle, this.subjectName, '', this.summaryPromptCustom).subscribe({
      next: (summaryRes) => {
        this.generatedSummary.set(summaryRes.data);
        if (!this.topicSummary) this.topicSummary = summaryRes.data.slice(0, 300);
        if (!this.topicDetailFull) this.topicDetailFull = summaryRes.data;

        this.aiService.generateFlashcards(this.topicTitle, summaryRes.data, 4, this.flashcardsPromptCustom).subscribe({
          next: (fcRes) => {
            this.generatedFlashcards.set(fcRes.data);

            this.aiService.generateQuestions(this.topicTitle, summaryRes.data, this.examBoard, 3, this.questionsPromptCustom).subscribe({
              next: (qRes) => {
                this.generatedQuestions.set(qRes.data);
                this.isGeneratingAll = false;
                this.showMessage('✨ Todos os conteúdos foram gerados com sucesso!', 'success');
              },
              error: () => { this.isGeneratingAll = false; }
            });
          },
          error: () => { this.isGeneratingAll = false; }
        });
      },
      error: () => {
        this.isGeneratingAll = false;
        this.showMessage('Erro ao gerar conteúdos.', 'error');
      }
    });
  }

  public onGenerateSummary(): void {
    if (!this.topicTitle.trim()) return;
    if (!this.validateAiKey()) return;
    this.isGeneratingSummary = true;
    this.aiService.generateSummary(this.topicTitle, this.subjectName, '', this.summaryPromptCustom).subscribe({
      next: (res) => {
        this.isGeneratingSummary = false;
        this.generatedSummary.set(res.data);
        if (!this.topicSummary) this.topicSummary = res.data.slice(0, 300);
        if (!this.topicDetailFull) this.topicDetailFull = res.data;
        this.showMessage('✨ Resumo teórico gerado com sucesso!', 'success');
      },
      error: () => { this.isGeneratingSummary = false; }
    });
  }

  public onGenerateFlashcards(): void {
    if (!this.topicTitle.trim()) return;
    if (!this.validateAiKey()) return;
    this.isGeneratingFlashcards = true;
    this.aiService.generateFlashcards(this.topicTitle, this.generatedSummary() || this.topicDetailFull, 4, this.flashcardsPromptCustom).subscribe({
      next: (res) => {
        this.isGeneratingFlashcards = false;
        this.generatedFlashcards.set(res.data);
        this.showMessage(`✨ ${res.data.length} Flashcards gerados!`, 'success');
      },
      error: () => { this.isGeneratingFlashcards = false; }
    });
  }

  public onGenerateQuestions(): void {
    if (!this.topicTitle.trim()) return;
    if (!this.validateAiKey()) return;
    this.isGeneratingQuestions = true;
    this.aiService.generateQuestions(this.topicTitle, this.generatedSummary() || this.topicDetailFull, this.examBoard, 3, this.questionsPromptCustom).subscribe({
      next: (res) => {
        this.isGeneratingQuestions = false;
        this.generatedQuestions.set(res.data);
        this.showMessage(`✨ ${res.data.length} Questões inéditas geradas!`, 'success');
      },
      error: () => { this.isGeneratingQuestions = false; }
    });
  }

  // --- Save to Backend ---
  public onSaveStudio(): void {
    if (!this.courseTitle.trim() || !this.subjectName.trim() || !this.topicTitle.trim()) {
      this.showMessage('Preencha os dados do Curso, Disciplina e Tópico.', 'error');
      return;
    }

    this.isSaving = true;
    this.showMessage('⏳ Salvando estudo e publicando conteúdos na hierarquia...', 'info');

    const keyPoints = this.keyPointsText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const tips = this.tipsText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const isValidGuid = (id?: string | null): boolean =>
      !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const payload: SaveStudioContentPayload = {
      courseId: isValidGuid(this.selectedCourseId) ? this.selectedCourseId : undefined,
      courseTitle: this.courseTitle,
      sessionName: this.sessionName,
      subjectId: !this.isSubjectNew() && this.selectedSubjectId() !== 'NEW' && isValidGuid(this.selectedSubjectId()) ? this.selectedSubjectId() : undefined,
      subjectName: this.subjectName,
      subjectMeta: this.subjectMeta,
      subjectDescription: this.subjectDescription,
      topicId: !this.isTopicNew() && this.selectedTopicId() !== 'NEW' && isValidGuid(this.selectedTopicId()) ? this.selectedTopicId() : undefined,
      topicTitle: this.topicTitle,
      examBoard: this.examBoard,
      isPublic: this.isPublic,
      contentMarkdown: this.generatedSummary() || this.topicDetailFull || `### ${this.topicTitle}\nConteúdo estruturado pelo professor.`,
      topicDetail: {
        title: this.topicTitle,
        summary: this.topicSummary || (this.generatedSummary() ? this.generatedSummary().slice(0, 300) : ''),
        detail: this.topicDetailFull || this.generatedSummary(),
        peso: this.topicPeso,
        keyPoints: keyPoints,
        tips: tips,
        examples: this.examplesList.filter(e => e.question.trim().length > 0),
        usefulLinks: this.usefulLinksList.filter(l => l.url.trim().length > 0)
      },
      flashcards: this.generatedFlashcards(),
      questions: this.generatedQuestions()
    };

    this.studioService.saveStudioContent(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.showMessage(res.message || '🎉 Estudo salvo e publicado com sucesso!', 'success');
        this.loadCourses();

        if (!this.selectedCourseId && res.courseId) {
          this.selectedCourseId = res.courseId;
        }

        if (this.selectedCourseId) {
          this.loadCourseDetails(this.selectedCourseId, res.subjectId, res.topicId);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.showMessage(err.error?.message || 'Erro ao salvar conteúdo.', 'error');
      }
    });
  }

  public showMessage(msg: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.statusMessage.set(msg);
    this.statusType.set(type);
    if (type === 'success') {
      setTimeout(() => this.statusMessage.set(null), 5000);
    }
  }
}

