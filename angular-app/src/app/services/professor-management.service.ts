import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PublicProfessorProfile, PublicOffering, ShowcaseLeadResponse, ShowcaseMetricSummary } from './public-showcase.service';

export interface UpdateProfessorShowcase {
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
  publicVisibility: boolean;
}

export interface SaveOffering {
  title: string;
  description: string;
  subject: string;
  price?: number | null;
  offeringType: number; // 0=Course, 1=PrivateClass, 2=Ebook, 3=Mentoring
  format: number; // 0=Online, 1=InPerson, 2=Hybrid
  locationCity?: string;
  locationState?: string;
  ctaType: number; // 0=WhatsApp, 1=Scheduling, 2=ExternalCheckout, 3=PlatformCourse
  ctaUrl?: string;
  ctaWhatsappMessage?: string;
  coverImageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  courseStudyPlanId?: string;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessorManagementService {
  private apiUrl = `${environment.apiUrl}/professor`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // Vitrine (Showcase)
  // ==========================================

  getMyShowcase(): Observable<PublicProfessorProfile> {
    return this.http.get<PublicProfessorProfile>(`${this.apiUrl}/showcase`);
  }

  updateMyShowcase(dto: UpdateProfessorShowcase): Observable<PublicProfessorProfile> {
    return this.http.put<PublicProfessorProfile>(`${this.apiUrl}/showcase`, dto);
  }

  checkSlugAvailability(slug: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/showcase/check-slug?slug=${encodeURIComponent(slug)}`);
  }

  // ==========================================
  // Ofertas de Conteúdo (Offerings)
  // ==========================================

  getMyOfferings(): Observable<PublicOffering[]> {
    return this.http.get<PublicOffering[]>(`${this.apiUrl}/offerings`);
  }

  createOffering(dto: SaveOffering): Observable<PublicOffering> {
    return this.http.post<PublicOffering>(`${this.apiUrl}/offerings`, dto);
  }

  updateOffering(id: string, dto: SaveOffering): Observable<PublicOffering> {
    return this.http.put<PublicOffering>(`${this.apiUrl}/offerings/${id}`, dto);
  }

  deleteOffering(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/offerings/${id}`);
  }

  toggleOfferingActive(id: string): Observable<{ isActive: boolean }> {
    return this.http.patch<{ isActive: boolean }>(`${this.apiUrl}/offerings/${id}/toggle-active`, {});
  }

  reorderOfferings(orderedIds: string[]): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/offerings/reorder`, { orderedIds });
  }

  // ==========================================
  // Métricas e Leads
  // ==========================================

  getMyMetrics(): Observable<ShowcaseMetricSummary> {
    return this.http.get<ShowcaseMetricSummary>(`${this.apiUrl}/metrics`);
  }

  getMyLeads(): Observable<ShowcaseLeadResponse[]> {
    return this.http.get<ShowcaseLeadResponse[]>(`${this.apiUrl}/leads`);
  }

  updateLeadStatus(leadId: string, status: number): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/leads/${leadId}/status`, { status });
  }

  // ==========================================
  // Dashboard Geral & Assinatura da Plataforma
  // ==========================================

  getPlatformDashboard(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/invites/dashboard`);
  }
}
