import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CheckoutResponse {
  transactionId: string;
  courseTitle: string;
  amount: number;
  platformFee: number;
  professorRevenue: number;
  paymentMethod: string;
  pixQrCodeCode: string;
  pixQrCodeImageUrl: string;
  status: string;
  expiresAt: string;
}

export interface TransactionHistory {
  id: string;
  courseTitle: string;
  buyerName: string;
  amount: number;
  professorRevenue: number;
  status: string;
  date: string;
}

export interface ProfessorBalance {
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  salesCount: number;
  pixKey?: string;
  transactions: TransactionHistory[];
}

export interface BillingCheckoutResponse {
  invoiceUrl: string;
  subscriptionId: string;
  asaasSubscriptionId: string;
  planType: string;
  price: number;
  status: string;
}

export interface P2pPixCheckoutRequest {
  courseId: string;
  offeringId?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface P2pPixCheckoutResponse {
  accessRequestId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  amountFormatted: string;
  professorName: string;
  professorPixKey: string;
  professorWhatsApp?: string;
  pixPayload: string;
  whatsAppUrl: string;
  status: string;
}

export interface AccessRequestStatusResponse {
  id: string;
  status: string;
  isApproved: boolean;
  courseId: string;
  courseTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private billingUrl = `${environment.apiUrl}/billing`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createP2pPixCheckout(data: P2pPixCheckoutRequest): Observable<P2pPixCheckoutResponse> {
    const token = this.authService.token();
    const headers = token ? this.getAuthHeaders() : new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<P2pPixCheckoutResponse>(
      `${this.apiUrl}/p2p-pix-checkout`,
      data,
      { headers }
    );
  }

  getAccessRequestStatus(requestId: string): Observable<AccessRequestStatusResponse> {
    return this.http.get<AccessRequestStatusResponse>(
      `${environment.apiUrl}/accessrequests/${requestId}/status`
    );
  }

  createCheckout(courseId: string, paymentMethod: string = 'PIX'): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.apiUrl}/checkout`,
      { courseId, paymentMethod },
      { headers: this.getAuthHeaders() }
    );
  }

  confirmSimulatedPayment(transactionId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/confirm-simulated-payment/${transactionId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  getProfessorBalance(): Observable<ProfessorBalance> {
    return this.http.get<ProfessorBalance>(
      `${this.apiUrl}/professor-balance`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((err) => {
        console.warn('[PaymentService] Erro ao buscar saldo do professor, aplicando fallback:', err);
        const fallback: ProfessorBalance = {
          totalRevenue: 0,
          availableBalance: 0,
          pendingBalance: 0,
          salesCount: 0,
          pixKey: '',
          transactions: []
        };
        return of(fallback);
      })
    );
  }

  updatePixKey(pixKey: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/update-pix-key`,
      JSON.stringify(pixKey),
      { headers: this.getAuthHeaders() }
    );
  }

  createSubscriptionCheckout(planType: number): Observable<BillingCheckoutResponse> {
    return this.http.post<BillingCheckoutResponse>(
      `${this.billingUrl}/checkout`,
      { planType },
      { headers: this.getAuthHeaders() }
    );
  }
}
