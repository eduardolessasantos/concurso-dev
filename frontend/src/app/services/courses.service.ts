import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CourseResponseDto,
  CreateCourseDto,
  CourseStudyPlan,
  StudySessionHierarchyDto,
  SubjectHierarchyDto,
  TopicHierarchyDto
} from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = environment.apiUrl;

  public myCourses = signal<CourseResponseDto[]>([]);
  public publicCourses = signal<CourseResponseDto[]>([]);
  public activeCourse = signal<CourseStudyPlan | null>(null);
  public isLoading = signal<boolean>(false);

  private readonly _mockCourses: CourseResponseDto[] = [
    {
      id: 'd9e030a2-2b36-4d0d-9b16-e41c41fb7420',
      professorId: 'prof-demo',
      professorName: 'Prof. Eduardo Lessa',
      title: 'Dataprev 2026 - Analista de Tecnologia da Informação',
      description: 'Plano Estratégico completo com disciplinas essenciais, teoria aprofundada, flashcards e questões comentadas no padrão da banca.',
      category: 'TI & Dados',
      price: 0,
      isPublic: true,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      subjectsCount: 7,
      enrollmentsCount: 142
    },
    {
      id: 'c8d030a1-1b25-3c0c-8a05-d30b30ea6310',
      professorId: 'prof-demo',
      professorName: 'Prof. Eduardo Lessa',
      title: 'Engenharia de Software & Arquitetura Cloud',
      description: 'Microsserviços, Design Patterns, DDD, Clean Architecture e Práticas de CI/CD para concursos de alto nível.',
      category: 'Desenvolvimento',
      price: 49.90,
      isPublic: true,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      subjectsCount: 4,
      enrollmentsCount: 89
    }
  ];

  constructor(private http: HttpClient) {}

  getPublicCourses(): Observable<CourseResponseDto[]> {
    this.isLoading.set(true);
    return this.http.get<CourseResponseDto[]>(`${this.apiUrl}/courses/public`).pipe(
      tap(courses => {
        const result = courses && courses.length > 0 ? courses : this._mockCourses;
        this.publicCourses.set(result);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.warn('[CoursesService] Erro ao carregar da API, ativando fallback local:', err);
        this.publicCourses.set(this._mockCourses);
        this.isLoading.set(false);
        return of(this._mockCourses);
      })
    );
  }

  getMyCourses(): Observable<CourseResponseDto[]> {
    this.isLoading.set(true);
    return this.http.get<CourseResponseDto[]>(`${this.apiUrl}/courses/my-courses`).pipe(
      tap(courses => {
        const stored = this.getLocalCustomCourses();
        const combined = [...courses, ...stored];
        const result = combined.length > 0 ? combined : this._mockCourses;
        this.myCourses.set(result);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.warn('[CoursesService] API offline/erro em my-courses, usando dados locais:', err);
        const stored = this.getLocalCustomCourses();
        const result = stored.length > 0 ? stored : this._mockCourses;
        this.myCourses.set(result);
        this.isLoading.set(false);
        return of(result);
      })
    );
  }

  getCourseById(id: string): Observable<CourseStudyPlan | null> {
    this.isLoading.set(true);
    return this.http.get<CourseStudyPlan>(`${this.apiUrl}/courses/${id}`).pipe(
      map(course => this.normalizeCourse(course)),
      tap(course => {
        this.activeCourse.set(course);
        this.saveLocalCoursePlan(course);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.warn('[CoursesService] Erro ao buscar curso por ID da API, checando local:', err);
        const local = this.getLocalCoursePlan(id);
        const normalized = local ? this.normalizeCourse(local) : null;
        this.activeCourse.set(normalized);
        this.isLoading.set(false);
        return of(normalized);
      })
    );
  }

  createCourse(dto: CreateCourseDto): Observable<CourseStudyPlan> {
    return this.http.post<CourseStudyPlan>(`${this.apiUrl}/courses`, dto).pipe(
      tap(course => {
        this.saveCourseLocally({
          id: course.id,
          professorId: course.professorId,
          professorName: 'Professor',
          title: course.title,
          description: course.description,
          category: course.category,
          price: course.price,
          isPublic: course.isPublic,
          status: 'PUBLISHED',
          createdAt: new Date().toISOString(),
          subjectsCount: course.subjects ? course.subjects.length : 0,
          enrollmentsCount: 0
        });
        this.getMyCourses().subscribe();
      }),
      catchError(err => {
        console.warn('[CoursesService] API offline, salvando curso no LocalStorage:', err);
        const localCourse: CourseResponseDto = {
          id: crypto.randomUUID ? crypto.randomUUID() : `course-${Date.now()}`,
          professorId: 'local-prof',
          professorName: 'Você (Professor)',
          title: dto.title,
          description: dto.description,
          category: dto.category,
          price: dto.price,
          isPublic: dto.isPublic,
          status: 'PUBLISHED',
          createdAt: new Date().toISOString(),
          subjectsCount: 0,
          enrollmentsCount: 0
        };
        this.saveCourseLocally(localCourse);
        this.myCourses.update(prev => [localCourse, ...prev]);
        const newPlan: CourseStudyPlan = {
          id: localCourse.id,
          professorId: localCourse.professorId,
          title: localCourse.title,
          description: localCourse.description,
          category: localCourse.category,
          price: localCourse.price,
          isPublic: localCourse.isPublic,
          studySessions: [],
          subjects: []
        };
        this.saveLocalCoursePlan(newPlan);
        return of(newPlan);
      })
    );
  }

  deleteCourse(id: string): Observable<boolean> {
    this.removeCourseLocally(id);
    this.myCourses.update(prev => prev.filter(c => c.id !== id));
    return of(true);
  }

  // --- HIERARCHICAL OPERATIONS (Modules / Subjects / Topics) ---

  addModule(courseId: string, moduleName: string): Observable<StudySessionHierarchyDto> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);

    return this.http.post<any>(`${this.apiUrl}/courses/${courseId}/modules`, { name: moduleName }).pipe(
      map(res => {
        const created: StudySessionHierarchyDto = {
          id: res.id || res.data?.id || `mod-${Date.now()}`,
          courseId: courseId,
          name: res.name || res.data?.name || moduleName,
          orderIndex: res.orderIndex || (plan?.studySessions?.length || 0) + 1,
          subjects: []
        };
        if (plan) {
          plan.studySessions = plan.studySessions || [];
          plan.studySessions.push(created);
          plan.modules = plan.studySessions;
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return created;
      }),
      catchError(err => {
        console.warn('[CoursesService] Erro ao adicionar módulo via API, salvando local:', err);
        const fallback: StudySessionHierarchyDto = {
          id: crypto.randomUUID ? crypto.randomUUID() : `mod-${Date.now()}`,
          courseId: courseId,
          name: moduleName,
          orderIndex: (plan?.studySessions?.length || 0) + 1,
          subjects: []
        };
        if (plan) {
          plan.studySessions = plan.studySessions || [];
          plan.studySessions.push(fallback);
          plan.modules = plan.studySessions;
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return of(fallback);
      })
    );
  }

  deleteModule(courseId: string, moduleId: string): Observable<boolean> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);

    return this.http.delete<any>(`${this.apiUrl}/courses/${courseId}/modules/${moduleId}`).pipe(
      map(() => {
        if (plan) {
          plan.studySessions = (plan.studySessions || []).filter(m => m.id !== moduleId);
          plan.modules = plan.studySessions;
          plan.subjects = (plan.subjects || []).filter(s => s.sessionId !== moduleId && s.moduleId !== moduleId);
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return true;
      }),
      catchError(() => {
        if (plan) {
          plan.studySessions = (plan.studySessions || []).filter(m => m.id !== moduleId);
          plan.modules = plan.studySessions;
          plan.subjects = (plan.subjects || []).filter(s => s.sessionId !== moduleId && s.moduleId !== moduleId);
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return of(true);
      })
    );
  }

  addSubject(
    courseId: string,
    moduleId: string,
    name: string,
    meta: string = '',
    description: string = ''
  ): Observable<SubjectHierarchyDto> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);
    const session = plan?.studySessions?.find(s => s.id === moduleId);

    const isValidGuid = (id?: string | null): boolean =>
      !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const validSessionId = isValidGuid(moduleId) ? moduleId : null;

    const payload = {
      courseId,
      sessionId: validSessionId,
      sessionName: session ? session.name : '',
      name,
      meta,
      description
    };

    return this.http.post<any>(`${this.apiUrl}/subjects`, payload).pipe(
      map(res => {
        const created: SubjectHierarchyDto = {
          id: res.id || res.data?.id || `subj-${Date.now()}`,
          courseId,
          moduleId,
          sessionId: moduleId,
          sessionName: session ? session.name : '',
          name,
          meta,
          description,
          orderIndex: res.orderIndex || (plan?.subjects?.length || 0) + 1,
          topics: []
        };
        if (plan) {
          plan.subjects = plan.subjects || [];
          plan.subjects.push(created);
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return created;
      }),
      catchError(err => {
        console.warn('[CoursesService] Erro ao criar disciplina na API, salvando local:', err);
        const fallback: SubjectHierarchyDto = {
          id: crypto.randomUUID ? crypto.randomUUID() : `subj-${Date.now()}`,
          courseId,
          moduleId,
          sessionId: moduleId,
          sessionName: session ? session.name : '',
          name,
          meta,
          description,
          orderIndex: (plan?.subjects?.length || 0) + 1,
          topics: []
        };
        if (plan) {
          plan.subjects = plan.subjects || [];
          plan.subjects.push(fallback);
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return of(fallback);
      })
    );
  }

  deleteSubject(courseId: string, subjectId: string): Observable<boolean> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);

    return this.http.delete<any>(`${this.apiUrl}/subjects/${subjectId}`).pipe(
      map(() => {
        if (plan) {
          plan.subjects = (plan.subjects || []).filter(s => s.id !== subjectId);
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return true;
      }),
      catchError(() => {
        if (plan) {
          plan.subjects = (plan.subjects || []).filter(s => s.id !== subjectId);
          this.saveLocalCoursePlan(plan);
          this.activeCourse.set({ ...plan });
        }
        return of(true);
      })
    );
  }

  updateSubject(courseId: string, updatedSubject: SubjectHierarchyDto): Observable<boolean> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);

    const isValidGuid = (id?: string | null): boolean =>
      !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const rawSessionId = updatedSubject.moduleId || updatedSubject.sessionId;
    const validSessionId = isValidGuid(rawSessionId) ? rawSessionId : null;

    const payload = {
      courseId,
      sessionId: validSessionId,
      sessionName: updatedSubject.sessionName || '',
      name: updatedSubject.name,
      meta: updatedSubject.meta,
      description: updatedSubject.description
    };

    return this.http.put<any>(`${this.apiUrl}/subjects/${updatedSubject.id}`, payload).pipe(
      map(() => {
        if (plan && plan.subjects) {
          const idx = plan.subjects.findIndex(s => s.id === updatedSubject.id);
          if (idx >= 0) {
            plan.subjects[idx] = { ...updatedSubject };
            this.saveLocalCoursePlan(plan);
            this.activeCourse.set({ ...plan });
          }
        }
        return true;
      }),
      catchError(() => {
        if (plan && plan.subjects) {
          const idx = plan.subjects.findIndex(s => s.id === updatedSubject.id);
          if (idx >= 0) {
            plan.subjects[idx] = { ...updatedSubject };
            this.saveLocalCoursePlan(plan);
            this.activeCourse.set({ ...plan });
          }
        }
        return of(true);
      })
    );
  }

  addTopic(
    courseId: string,
    subjectId: string,
    title: string,
    examBoard: string = 'Geral'
  ): Observable<TopicHierarchyDto> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);
    const subject = plan?.subjects?.find(s => s.id === subjectId);

    const payload = {
      subjectId,
      title,
      examBoard
    };

    return this.http.post<any>(`${this.apiUrl}/topics`, payload).pipe(
      map(res => {
        const created: TopicHierarchyDto = {
          id: res.id || res.data?.id || `top-${Date.now()}`,
          subjectId,
          title,
          examBoard,
          orderIndex: res.orderIndex || (subject?.topics?.length || 0) + 1,
          contentMarkdown: '',
          topicDetail: {
            title,
            summary: '',
            detail: '',
            peso: 'Média (⚖️ ⚖️ ⚖️)',
            examples: [],
            keyPoints: [],
            tips: [],
            usefulLinks: []
          },
          flashcards: [],
          questions: []
        };
        if (subject) {
          subject.topics = subject.topics || [];
          subject.topics.push(created);
          if (plan) {
            this.saveLocalCoursePlan(plan);
            this.activeCourse.set({ ...plan });
          }
        }
        return created;
      }),
      catchError(err => {
        console.warn('[CoursesService] Erro ao criar tópico na API, salvando local:', err);
        const fallback: TopicHierarchyDto = {
          id: crypto.randomUUID ? crypto.randomUUID() : `top-${Date.now()}`,
          subjectId,
          title,
          examBoard,
          orderIndex: (subject?.topics?.length || 0) + 1,
          contentMarkdown: '',
          topicDetail: {
            title,
            summary: '',
            detail: '',
            peso: 'Média (⚖️ ⚖️ ⚖️)',
            examples: [],
            keyPoints: [],
            tips: [],
            usefulLinks: []
          },
          flashcards: [],
          questions: []
        };
        if (subject) {
          subject.topics = subject.topics || [];
          subject.topics.push(fallback);
          if (plan) {
            this.saveLocalCoursePlan(plan);
            this.activeCourse.set({ ...plan });
          }
        }
        return of(fallback);
      })
    );
  }

  deleteTopic(courseId: string, subjectId: string, topicId: string): Observable<boolean> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);

    return this.http.delete<any>(`${this.apiUrl}/topics/${topicId}`).pipe(
      map(() => {
        const subject = plan?.subjects?.find(s => s.id === subjectId);
        if (subject && subject.topics) {
          subject.topics = subject.topics.filter(t => t.id !== topicId);
          if (plan) {
            this.saveLocalCoursePlan(plan);
            this.activeCourse.set({ ...plan });
          }
        }
        return true;
      }),
      catchError(() => {
        const subject = plan?.subjects?.find(s => s.id === subjectId);
        if (subject && subject.topics) {
          subject.topics = subject.topics.filter(t => t.id !== topicId);
          if (plan) {
            this.saveLocalCoursePlan(plan);
            this.activeCourse.set({ ...plan });
          }
        }
        return of(true);
      })
    );
  }

  updateTopic(courseId: string, subjectId: string, updatedTopic: TopicHierarchyDto): Observable<boolean> {
    const plan = this.activeCourse() || this.getLocalCoursePlan(courseId);

    const payload = {
      title: updatedTopic.title,
      examBoard: updatedTopic.examBoard,
      contentMarkdown: updatedTopic.contentMarkdown,
      topicContent: updatedTopic.topicDetail,
      flashcards: (updatedTopic.flashcards || []).map(f => ({
        frontText: f.frontText,
        backText: f.backText,
        difficultyLevel: f.difficulty || 'MEDIUM'
      })),
      questions: (updatedTopic.questions || []).map(q => ({
        statement: q.statement,
        options: q.options || [],
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        examBoard: q.examBoard || updatedTopic.examBoard
      }))
    };

    return this.http.put<any>(`${this.apiUrl}/topics/${updatedTopic.id}`, payload).pipe(
      map(() => {
        const subject = plan?.subjects?.find(s => s.id === subjectId);
        if (subject && subject.topics) {
          const idx = subject.topics.findIndex(t => t.id === updatedTopic.id);
          if (idx >= 0) {
            subject.topics[idx] = { ...updatedTopic };
            if (plan) {
              this.saveLocalCoursePlan(plan);
              this.activeCourse.set({ ...plan });
            }
          }
        }
        return true;
      }),
      catchError(() => {
        const subject = plan?.subjects?.find(s => s.id === subjectId);
        if (subject && subject.topics) {
          const idx = subject.topics.findIndex(t => t.id === updatedTopic.id);
          if (idx >= 0) {
            subject.topics[idx] = { ...updatedTopic };
            if (plan) {
              this.saveLocalCoursePlan(plan);
              this.activeCourse.set({ ...plan });
            }
          }
        }
        return of(true);
      })
    );
  }

  // --- NORMALIZATION HELPER ---

  public normalizeCourse(course: CourseStudyPlan): CourseStudyPlan {
    if (!course) return course;

    // 1. Synchronize modules and studySessions
    const rawModules: any[] = (course as any).modules || course.studySessions || [];
    const normalizedModules: StudySessionHierarchyDto[] = rawModules.map((m: any, idx: number) => ({
      id: m.id?.toString() || `mod-${idx + 1}`,
      courseId: course.id,
      name: m.name || `Módulo ${idx + 1}`,
      orderIndex: m.orderIndex || (idx + 1)
    }));

    course.modules = normalizedModules;
    course.studySessions = normalizedModules;
    course.subjects = course.subjects || [];

    // 2. Normalize subjects
    course.subjects.forEach(s => {
      s.moduleId = s.moduleId || s.sessionId || (s.module ? (s.module as any).id : undefined);
      s.sessionId = s.moduleId;
      if (s.module && !s.sessionName) {
        s.sessionName = (s.module as any).name;
      }
      if (!s.moduleId && s.sessionName) {
        const found = normalizedModules.find(m => m.name.toLowerCase() === s.sessionName!.toLowerCase());
        if (found) {
          s.moduleId = found.id;
          s.sessionId = found.id;
        }
      }

      // Normalize topics
      s.topics = s.topics || [];
      s.topics.forEach(t => {
        if (t.topicContent && !t.topicDetail) {
          t.topicDetail = {
            id: t.topicContent.id,
            topicId: t.id,
            title: t.topicContent.title || t.title,
            summary: t.topicContent.summary || '',
            detail: t.topicContent.detail || t.contentMarkdown || '',
            peso: t.topicContent.peso || '',
            examples: typeof t.topicContent.examplesJson === 'string' ? this.safeJson(t.topicContent.examplesJson, []) : (t.topicContent.examples || []),
            keyPoints: typeof t.topicContent.keyPointsJson === 'string' ? this.safeJson(t.topicContent.keyPointsJson, []) : (t.topicContent.keyPoints || []),
            tips: typeof t.topicContent.tipsJson === 'string' ? this.safeJson(t.topicContent.tipsJson, []) : (t.topicContent.tips || []),
            usefulLinks: typeof t.topicContent.usefulLinksJson === 'string' ? this.safeJson(t.topicContent.usefulLinksJson, []) : (t.topicContent.usefulLinks || [])
          };
        }
        if (!t.contentMarkdown && t.topicDetail?.detail) {
          t.contentMarkdown = t.topicDetail.detail;
        }
      });
    });

    // 3. Guarantee that subjects with NO module (previously created) appear in a category
    const orphanSubjects = course.subjects.filter(s => !s.moduleId && !s.sessionId);
    if (orphanSubjects.length > 0 || normalizedModules.length === 0) {
      if (normalizedModules.length === 0) {
        const defaultCategoryName = course.category && course.category !== 'Geral'
          ? course.category
          : 'Conhecimentos Específicos';

        const defaultMod: StudySessionHierarchyDto = {
          id: `mod-default-${course.id}`,
          courseId: course.id,
          name: defaultCategoryName,
          orderIndex: 1
        };
        normalizedModules.push(defaultMod);
        course.modules = normalizedModules;
        course.studySessions = normalizedModules;
      }

      orphanSubjects.forEach(s => {
        s.moduleId = normalizedModules[0].id;
        s.sessionId = normalizedModules[0].id;
        s.sessionName = normalizedModules[0].name;
      });
    }

    return course;
  }

  private safeJson(val: string, fallback: any): any {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  // --- LOCAL PERSISTENCE HELPERS ---

  private getLocalCustomCourses(): CourseResponseDto[] {
    try {
      const data = localStorage.getItem('teachertech_custom_courses');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveCourseLocally(course: CourseResponseDto): void {
    const list = this.getLocalCustomCourses();
    const existingIndex = list.findIndex(c => c.id === course.id);
    if (existingIndex >= 0) {
      list[existingIndex] = course;
    } else {
      list.unshift(course);
    }
    localStorage.setItem('teachertech_custom_courses', JSON.stringify(list));
  }

  private removeCourseLocally(id: string): void {
    const list = this.getLocalCustomCourses().filter(c => c.id !== id);
    localStorage.setItem('teachertech_custom_courses', JSON.stringify(list));
    localStorage.removeItem(`teachertech_plan_${id}`);
  }

  public getLocalCoursePlan(courseId: string): CourseStudyPlan | null {
    try {
      const cached = localStorage.getItem(`teachertech_plan_${courseId}`);
      if (cached) return JSON.parse(cached);
    } catch {}

    const mock = this._mockCourses.find(c => c.id === courseId) || this.getLocalCustomCourses().find(c => c.id === courseId);
    if (!mock) return null;

    const defaultPlan: CourseStudyPlan = {
      id: mock.id,
      professorId: mock.professorId,
      professorName: mock.professorName,
      title: mock.title,
      description: mock.description,
      category: mock.category,
      price: mock.price,
      isPublic: mock.isPublic,
      studySessions: [
        { id: `sess-esp-${mock.id}`, courseId: mock.id, name: 'Conhecimentos Específicos', orderIndex: 1 },
        { id: `sess-ger-${mock.id}`, courseId: mock.id, name: 'Conhecimentos Gerais', orderIndex: 2 }
      ],
      subjects: [
        {
          id: `subj-eng-${mock.id}`,
          courseId: mock.id,
          moduleId: `sess-esp-${mock.id}`,
          sessionId: `sess-esp-${mock.id}`,
          sessionName: 'Conhecimentos Específicos',
          name: 'Engenharia de Software',
          meta: '25% das específicas · peso 3',
          description: 'Arquitetura de microsserviços, Clean Code, Design Patterns e testes.',
          orderIndex: 1,
          topics: [
            {
              id: `top-micro-${mock.id}`,
              subjectId: `subj-eng-${mock.id}`,
              title: 'Arquitetura de Microsserviços e APIs REST',
              examBoard: 'Cebraspe',
              orderIndex: 1,
              contentMarkdown: 'Conceitos fundamentais de desacoplamento, contratos RESTful, resiliência e mensageria.',
              topicDetail: {
                title: 'Arquitetura de Microsserviços e APIs REST',
                summary: 'Microsserviços promovem independência de deploy e escalabilidade horizontal.',
                detail: 'O estilo arquitetural em microsserviços divide a aplicação em serviços independentes.',
                peso: 'Alta (⚖️ ⚖️ ⚖️ ⚖️)',
                keyPoints: ['Desacoplamento', 'Independência de deploy', 'APIs RESTful'],
                tips: ['Atenção para eventual consistency em provas do Cebraspe'],
                examples: []
              },
              flashcards: [
                { frontText: 'O que caracteriza a consistência eventual?', backText: 'O sistema converge para um estado consistente com o tempo, priorizando disponibilidade (Teorema CAP).', difficulty: 'MEDIUM' }
              ],
              questions: []
            }
          ]
        }
      ]
    };
    this.saveLocalCoursePlan(defaultPlan);
    return defaultPlan;
  }

  public saveLocalCoursePlan(plan: CourseStudyPlan): void {
    try {
      localStorage.setItem(`teachertech_plan_${plan.id}`, JSON.stringify(plan));
    } catch (e) {
      console.warn('Erro ao salvar plano no localStorage:', e);
    }
  }
}
