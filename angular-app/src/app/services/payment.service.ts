import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;


  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
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
    );
  }

  updatePixKey(pixKey: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/update-pix-key`,
      JSON.stringify(pixKey),
      { headers: this.getAuthHeaders() }
    );
  }
}
