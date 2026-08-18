import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
    return this.http.get<PublicProfessorProfile>(`${this.apiUrl}/professors/${slug}`);
  }

  exploreCourses(search?: string, category?: string): Observable<PublicCourse[]> {
    let url = `${this.apiUrl}/explore?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;

    return this.http.get<PublicCourse[]>(url);
  }

  getPublicCourseDetails(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/courses/${courseId}`);
  }
}
