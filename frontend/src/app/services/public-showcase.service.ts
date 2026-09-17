import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export interface PublicCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  coverImageUrl?: string;
  professorId: string;
  professorName: string;
  professorSlug: string;
  professorAvatar?: string;
  professorProfile?: {
    fullName?: string;
    headline?: string;
  };
  subjectsCount: number;
  enrollmentsCount?: number;
  createdAt: string;
}

export interface PublicProfessorProfile {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  headline: string;
  bio: string;
  customSlug: string;
  publicCoursesCount: number;
  courses: PublicCourse[];
}

@Injectable({
  providedIn: 'root'
})
export class PublicShowcaseService {
  private apiUrl = `${environment.apiUrl}/publicshowcase`;

  constructor(private http: HttpClient) {}

  getProfessorProfileBySlug(slug: string): Observable<PublicProfessorProfile> {
    return this.http.get<PublicProfessorProfile>(`${this.apiUrl}/professors/${slug}`).pipe(
      catchError(() => {
        return this.http.get<PublicProfessorProfile>(`${environment.apiUrl}/courses/public/${slug}`);
      })
    );
  }

  exploreCourses(search?: string, category?: string): Observable<PublicCourse[]> {
    const params: string[] = [];
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    if (category && category !== 'Todos') params.push(`category=${encodeURIComponent(category.trim())}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    return this.http.get<PublicCourse[]>(`${this.apiUrl}/explore${qs}`).pipe(
      catchError(() => {
        return this.http.get<PublicCourse[]>(`${environment.apiUrl}/courses/explorar${qs}`);
      })
    );
  }

  getPublicCourseDetails(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/courses/${courseId}`).pipe(
      catchError(() => {
        return this.http.get<any>(`${environment.apiUrl}/courses/public/${courseId}`);
      })
    );
  }
}
