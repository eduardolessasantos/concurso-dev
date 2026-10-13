import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

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

export interface PublicOffering {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number | null;
  priceFormatted: string;
  offeringType: number;
  offeringTypeName: string;
  format: number;
  formatName: string;
  locationCity?: string;
  locationState?: string;
  ctaType: number;
  ctaTypeName: string;
  ctaUrl?: string;
  ctaWhatsappMessage?: string;
  coverImageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  courseStudyPlanId?: string;
}

export interface PublicProfessorProfile {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  headline: string;
  bio: string;
  customSlug: string;
  bannerImageUrl?: string;
  themeColor?: string;
  whatsAppNumber?: string;
  videoIntroUrl?: string;
  city?: string;
  state?: string;
  socialLinksJson?: string;
  publicCoursesCount: number;
  courses: PublicCourse[];
  offerings: PublicOffering[];
}

export interface ExploreItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number | null;
  priceFormatted: string;
  itemType: string;
  offeringType: string;
  format: string;
  city?: string;
  state?: string;
  coverImageUrl?: string;
  professorId: string;
  professorName: string;
  professorSlug: string;
  professorAvatar?: string;
  professorHeadline?: string;
  ctaType: string;
  ctaUrl?: string;
  ctaWhatsappMessage?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ExploreFilters {
  availableSubjects: string[];
  availableCities: string[];
  availableFormats: string[];
}

export interface ExploreQueryParams {
  search?: string;
  subject?: string;
  format?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface CreateShowcaseLead {
  professorId: string;
  contentOfferingId?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  termsAccepted: boolean;
}

export interface ShowcaseLeadResponse {
  id: string;
  professorId: string;
  contentOfferingId?: string;
  offeringTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface TrackClick {
  professorId: string;
  contentOfferingId?: string;
  ctaType: string;
}

export interface ShowcaseMetricSummary {
  professorId: string;
  totalPageViews: number;
  totalWhatsAppClicks: number;
  totalCtaClicks: number;
  totalLeads: number;
  dailyMetrics: {
    date: string;
    pageViews: number;
    whatsAppClicks: number;
    ctaClicks: number;
    leadsCount: number;
  }[];
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

  explore(params: ExploreQueryParams): Observable<PagedResult<ExploreItem>> {
    const queryParts: string[] = [];
    if (params.search?.trim()) queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
    if (params.subject?.trim() && params.subject !== 'Todos') queryParts.push(`subject=${encodeURIComponent(params.subject.trim())}`);
    if (params.format?.trim() && params.format !== 'Todos') queryParts.push(`format=${encodeURIComponent(params.format.trim())}`);
    if (params.city?.trim()) queryParts.push(`city=${encodeURIComponent(params.city.trim())}`);
    if (params.priceMin != null) queryParts.push(`priceMin=${params.priceMin}`);
    if (params.priceMax != null) queryParts.push(`priceMax=${params.priceMax}`);
    if (params.pageIndex != null) queryParts.push(`pageIndex=${params.pageIndex}`);
    if (params.pageSize != null) queryParts.push(`pageSize=${params.pageSize}`);

    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return this.http.get<PagedResult<ExploreItem>>(`${this.apiUrl}/explore${qs}`);
  }

  getFilters(): Observable<ExploreFilters> {
    return this.http.get<ExploreFilters>(`${this.apiUrl}/filters`);
  }

  exploreCourses(search?: string, category?: string): Observable<PublicCourse[]> {
    const params: string[] = [];
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    if (category && category !== 'Todos') params.push(`category=${encodeURIComponent(category.trim())}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    return this.http.get<any>(`${this.apiUrl}/explore${qs}`).pipe(
      catchError(() => {
        return this.http.get<any>(`${environment.apiUrl}/courses/explorar${qs}`);
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

  sendLead(lead: CreateShowcaseLead): Observable<ShowcaseLeadResponse> {
    return this.http.post<ShowcaseLeadResponse>(`${this.apiUrl}/leads`, lead);
  }

  trackClick(data: TrackClick): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/track-click`, data);
  }

  getProfessorLeads(professorId: string): Observable<ShowcaseLeadResponse[]> {
    return this.http.get<ShowcaseLeadResponse[]>(`${this.apiUrl}/professors/${professorId}/leads`);
  }

  getProfessorMetrics(professorId: string): Observable<ShowcaseMetricSummary> {
    return this.http.get<ShowcaseMetricSummary>(`${this.apiUrl}/professors/${professorId}/metrics`);
  }
}
