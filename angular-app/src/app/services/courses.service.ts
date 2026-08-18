import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CourseResponseDto, CreateCourseDto, CourseStudyPlan } from '../models/course.model';
import { SaveStudioContentPayload, SaveStudioResponse } from './professor-studio.service';

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
      tap(course => {
        this.activeCourse.set(course);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.warn('[CoursesService] Erro ao buscar curso por ID:', err);
        this.isLoading.set(false);
        return of(null);
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
          subjectsCount: 1,
          enrollmentsCount: 0
        };
        this.saveCourseLocally(localCourse);
        this.myCourses.update(prev => [localCourse, ...prev]);
        return of({
          id: localCourse.id,
          professorId: localCourse.professorId,
          title: localCourse.title,
          description: localCourse.description,
          category: localCourse.category,
          price: localCourse.price,
          isPublic: localCourse.isPublic,
          subjects: []
        } as CourseStudyPlan);
      })
    );
  }

  deleteCourse(id: string): Observable<boolean> {
    this.removeCourseLocally(id);
    this.myCourses.update(prev => prev.filter(c => c.id !== id));
    return of(true);
  }

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
  }
}
