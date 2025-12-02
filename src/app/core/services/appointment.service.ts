import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateAppointmentRequest {
  doctorId: string;
  slotId: string;
  patientId?: string;
  patientPhone: string;
  patientEmail: string;
  patientName: string;
  notes: string;
}

export interface AppointmentResponse {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorPhone: string;
  specialtyName: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationFee: number;
  status: string;
  notes: string;
  paymentUrl: string;
  paymentId: string;
}

export interface AppointmentDetail {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorPhone: string;
  specialtyName: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationFee: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  createAppointment(request: CreateAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.apiUrl}/appointments`, request);
  }

  getAppointmentDetail(appointmentId: string): Observable<AppointmentDetail> {
    return this.http.get<AppointmentDetail>(`${this.apiUrl}/appointments/${appointmentId}`);
  }

  syncPaymentStatus(transactionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/sync-status?transactionId=${transactionId}`, {});
  }

  confirmPayment(paymentId?: string, transactionId?: string): Observable<any> {
    const params: any = {};
    if (paymentId) params.paymentId = paymentId;
    if (transactionId) params.transactionId = transactionId;
    
    return this.http.post(`${this.apiUrl}/payments/confirm-payment`, null, { params });
  }
}
