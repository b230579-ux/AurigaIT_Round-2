import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Subscription, DashboardStats, BillResponse, PausePeriod, User } from '../models/tiffin.model';

@Injectable({
  providedIn: 'root'
})
export class TiffinService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard Stats
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  // Subscriptions
  getAllSubscriptions(status?: string): Observable<Subscription[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions`, { params });
  }

  getSubscription(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/subscriptions/${id}`);
  }

  getCustomerSubscriptions(customerId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions/customer/${customerId}`);
  }

  createSubscription(data: { customerId: number; planName: string; planPrice?: number }): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, data);
  }

  cancelSubscription(id: number): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.apiUrl}/subscriptions/${id}/cancel`, {});
  }

  // Pause & Resume
  pauseSubscription(subId: number, reason?: string): Observable<PausePeriod> {
    return this.http.post<PausePeriod>(`${this.apiUrl}/subscriptions/${subId}/pauses/pause`, { reason });
  }

  resumeSubscription(subId: number): Observable<PausePeriod> {
    return this.http.put<PausePeriod>(`${this.apiUrl}/subscriptions/${subId}/pauses/resume`, {});
  }

  getPauseHistory(subId: number): Observable<PausePeriod[]> {
    return this.http.get<PausePeriod[]>(`${this.apiUrl}/subscriptions/${subId}/pauses`);
  }

  // Customers & Phone Lookup
  searchByPhone(phone: string): Observable<User> {
    const params = new HttpParams().set('phone', phone.trim());
    return this.http.get<User>(`${this.apiUrl}/customers/search`, { params });
  }

  listCustomers(page = 0, size = 20, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<any>(`${this.apiUrl}/customers`, { params });
  }

  // Billing
  generateInvoices(month: number, year: number): Observable<BillResponse[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.post<BillResponse[]>(`${this.apiUrl}/billing/generate`, null, { params });
  }

  getInvoicesBySubscription(subId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/billing/subscription/${subId}`);
  }

  getInvoicesByCustomer(customerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/billing/customer/${customerId}`);
  }

  // Customer Portal Services
  getAvailableTiffinServices(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/tiffin-services`);
  }

  getMySubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions/my`);
  }

  getMyInvoices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/billing/my`);
  }

  // ── Twists: Clock & Outbox (Level 1) ──
  tickClock(date?: string): Observable<any> {
    const base = environment.apiUrl.replace(/\/api$/, '');
    return this.http.post<any>(`${base}/clock`, date ? { date } : {});
  }

  getOutbox(date?: string): Observable<any[]> {
    const base = environment.apiUrl.replace(/\/api$/, '');
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<any[]>(`${base}/outbox`, { params });
  }

  // ── Twists: Subscription Transfer (Level 2) ──
  transferSubscription(subId: number, payload: { targetPhone?: string; targetCustomerId?: number; transferDate?: string; reason?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subscriptions/${subId}/transfer`, payload);
  }

  // ── Twists: Messy Data Import (Level 3) ──
  importCustomers(records: any[]): Observable<any> {
    const base = environment.apiUrl.replace(/\/api$/, '');
    return this.http.post<any>(`${base}/import`, records);
  }
}
