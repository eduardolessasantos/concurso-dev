import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SubjectsService } from '../../services/subjects.service';
import { AiGeneratorService, GeneratedFlashcard, GeneratedQuestion } from '../../services/ai-generator.service';
import { ProfessorStudioService, SaveStudioContentPayload } from '../../services/professor-studio.service';

@Component({
  selector: 'app-professor-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professor-studio.component.html',
  styleUrls: ['./professor-studio.component.scss']
})
export class ProfessorStudioComponent implements OnInit {
  public courseTitle = 'Plano Estratégico de Estudos - Tecnologia da Informação';
  public subjectName = 'Engenharia de Software';
  public topicTitle = 'Arquitetura de Microsserviços e APIs REST';
  public isPublic = true;
  public examBoard = 'Cebraspe';

  // AI Content State
  public generatedSummary = signal<string>('');
  public generatedFlashcards = signal<GeneratedFlashcard[]>([]);
  public generatedQuestions = signal<GeneratedQuestion[]>([]);

  // Schedule & Simulated Test Inputs
  public scheduleDay = 'Segunda-feira';
  public scheduleGoalMinutes = 90;
  public scheduleNotes = 'Revisar conceitos chave e responder flashcards.';

  public simulatedTitle = 'Simulado Inédito DataPrev TI';
  public simulatedTimeLimit = 60;

  // Credits & UI State
  public creditsRemaining = signal<number>(198);
  public creditsLimit = signal<number>(200);
  public isGeneratingSummary = false;
  public isGeneratingFlashcards = false;
  public isGeneratingQuestions = false;
  public isSaving = false;
  public statusMessage = signal<string | null>(null);

  constructor(
    public authService: AuthService,
    private aiService: AiGeneratorService,
    private subjectsService: SubjectsService,
    private studioService: ProfessorStudioService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Default initial demonstration values
  }

  onGenerateSummary(): void {
    if (!this.topicTitle.trim()) {
      this.statusMessage.set('Por favor, informe o título do tópico antes de gerar com IA.');
      return;
    }

    this.isGeneratingSummary = true;
    this.statusMessage.set(null);

    this.aiService.generateSummary(this.topicTitle, this.subjectName).subscribe({
      next: (res) => {
        this.isGeneratingSummary = false;
        this.generatedSummary.set(res.data);
        this.creditsRemaining.set(res.creditsRemaining);
        this.statusMessage.set('✨ Resumo didático gerado com sucesso!');
      },
      error: (err) => {
        this.isGeneratingSummary = false;
        this.statusMessage.set(err.error?.message || 'Erro ao gerar resumo.');
      }
    });
  }

  onGenerateFlashcards(): void {
    if (!this.topicTitle.trim()) {
      this.statusMessage.set('Por favor, informe o título do tópico.');
      return;
    }

    this.isGeneratingFlashcards = true;
    this.statusMessage.set(null);

    this.aiService.generateFlashcards(this.topicTitle, this.generatedSummary(), 5).subscribe({
      next: (res) => {
        this.isGeneratingFlashcards = false;
        this.generatedFlashcards.set(res.data);
        this.creditsRemaining.set(res.creditsRemaining);
        this.statusMessage.set(`✨ ${res.data.length} Flashcards gerados!`);
      },
      error: (err) => {
        this.isGeneratingFlashcards = false;
        this.statusMessage.set(err.error?.message || 'Erro ao gerar flashcards.');
      }
    });
  }

  onGenerateQuestions(): void {
    if (!this.topicTitle.trim()) {
      this.statusMessage.set('Por favor, informe o título do tópico.');
      return;
    }

    this.isGeneratingQuestions = true;
    this.statusMessage.set(null);

    this.aiService.generateQuestions(this.topicTitle, this.generatedSummary(), this.examBoard, 3).subscribe({
      next: (res) => {
        this.isGeneratingQuestions = false;
        this.generatedQuestions.set(res.data);
        this.creditsRemaining.set(res.creditsRemaining);
        this.statusMessage.set(`✨ ${res.data.length} Questões inéditas geradas!`);
      },
      error: (err) => {
        this.isGeneratingQuestions = false;
        this.statusMessage.set(err.error?.message || 'Erro ao gerar questões.');
      }
    });
  }

  onSaveToDatabase(): void {
    if (!this.subjectName.trim() || !this.topicTitle.trim()) {
      this.statusMessage.set('Por favor, informe o nome da disciplina e o título do tópico.');
      return;
    }

    this.isSaving = true;
    this.statusMessage.set('⏳ Salvando conteúdo cadastrado no banco MySQL...');

    const payload: SaveStudioContentPayload = {
      courseTitle: this.courseTitle,
      subjectName: this.subjectName,
      topicTitle: this.topicTitle,
      examBoard: this.examBoard,
      isPublic: this.isPublic,
      contentMarkdown: this.generatedSummary() || '### Conteúdo didático em elaboração pelo professor mentor.',
      flashcards: this.generatedFlashcards(),
      questions: this.generatedQuestions(),
      schedule: {
        dayOfWeek: this.scheduleDay,
        goalMinutes: this.scheduleGoalMinutes,
        notes: this.scheduleNotes
      },
      simulated: {
        title: this.simulatedTitle,
        timeLimitMinutes: this.simulatedTimeLimit
      }
    };

    this.studioService.saveStudioContent(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.statusMessage.set(res.message || '🎉 Sucesso! Conteúdo salvo no banco de dados MySQL.');
        if (res.courseId) {
          this.subjectsService.loadSubjectsForCourse(res.courseId).subscribe();
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.statusMessage.set(err.error?.message || 'Erro ao salvar conteúdo no banco de dados.');
      }
    });
  }
}


