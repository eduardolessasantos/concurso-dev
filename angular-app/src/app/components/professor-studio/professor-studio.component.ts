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

  // Hierarchy Level 2: Subject
  public selectedSubjectId = signal<string>('NEW');
  public isSubjectNew = signal<boolean>(true);
  public subjectName = 'Engenharia de Software';

  // Hierarchy Level 3: Topic & Exam Board
  public selectedTopicId = signal<string>('NEW');
  public isTopicNew = signal<boolean>(true);
  public topicTitle = 'Arquitetura de Microsserviços e APIs REST';
  public examBoard = 'Cebraspe';

  // Hierarchy Level 4: Generated Content State
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
      this.availableTopics.set([]);
      this.onSelectTopic('NEW');
    } else {
      this.isSubjectNew.set(false);
      const subject = this.availableSubjects().find(s => s.id === subjectId);
      if (subject) {
        this.subjectName = subject.name;
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

  // --- AI Content Generation ---
  public onGenerateAllWithAi(): void {
    if (!this.topicTitle.trim()) {
      this.showMessage('Por favor, informe o título do tópico antes de gerar.', 'error');
      return;
    }

    this.isGeneratingAll = true;
    this.showMessage('⚡ Gerando Resumo, Flashcards e Questões com Inteligência Artificial...', 'info');

    this.aiService.generateSummary(this.topicTitle, this.subjectName).subscribe({
      next: (summaryRes) => {
        this.generatedSummary.set(summaryRes.data);

        this.aiService.generateFlashcards(this.topicTitle, summaryRes.data, 4).subscribe({
          next: (fcRes) => {
            this.generatedFlashcards.set(fcRes.data);

            this.aiService.generateQuestions(this.topicTitle, summaryRes.data, this.examBoard, 3).subscribe({
              next: (qRes) => {
                this.generatedQuestions.set(qRes.data);
                this.isGeneratingAll = false;
                this.showMessage('✨ Conteúdos gerados com sucesso!', 'success');
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
    this.isGeneratingSummary = true;
    this.aiService.generateSummary(this.topicTitle, this.subjectName).subscribe({
      next: (res) => {
        this.isGeneratingSummary = false;
        this.generatedSummary.set(res.data);
        this.showMessage('✨ Resumo teórico gerado com sucesso!', 'success');
      },
      error: () => { this.isGeneratingSummary = false; }
    });
  }

  public onGenerateFlashcards(): void {
    if (!this.topicTitle.trim()) return;
    this.isGeneratingFlashcards = true;
    this.aiService.generateFlashcards(this.topicTitle, this.generatedSummary(), 4).subscribe({
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
    this.isGeneratingQuestions = true;
    this.aiService.generateQuestions(this.topicTitle, this.generatedSummary(), this.examBoard, 3).subscribe({
      next: (res) => {
        this.isGeneratingQuestions = false;
        this.generatedQuestions.set(res.data);
        this.showMessage(`✨ ${res.data.length} Questões inéditas geradas!`, 'success');
      },
      error: () => { this.isGeneratingQuestions = false; }
    });
  }

  // --- Save to Backend & Local ---
  public onSaveStudio(): void {
    if (!this.courseTitle.trim() || !this.subjectName.trim() || !this.topicTitle.trim()) {
      this.showMessage('Preencha os dados do Curso, Disciplina e Tópico.', 'error');
      return;
    }

    this.isSaving = true;
    this.showMessage('⏳ Salvando estudo e publicando conteúdos na hierarquia...', 'info');

    const payload: SaveStudioContentPayload = {
      courseId: this.selectedCourseId || undefined,
      courseTitle: this.courseTitle,
      subjectId: !this.isSubjectNew() && this.selectedSubjectId() !== 'NEW' ? this.selectedSubjectId() : undefined,
      subjectName: this.subjectName,
      topicId: !this.isTopicNew() && this.selectedTopicId() !== 'NEW' ? this.selectedTopicId() : undefined,
      topicTitle: this.topicTitle,
      examBoard: this.examBoard,
      isPublic: this.isPublic,
      contentMarkdown: this.generatedSummary() || `### ${this.topicTitle}\nConteúdo estruturado pelo professor mentor.`,
      flashcards: this.generatedFlashcards(),
      questions: this.generatedQuestions()
    };

    this.studioService.saveStudioContent(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.showMessage(res.message || '🎉 Estudo salvo e publicado com sucesso!', 'success');
        this.loadCourses();

        // Update selectedCourseId if it was newly created
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

