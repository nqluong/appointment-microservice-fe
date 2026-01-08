import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Doctor, DoctorResponse, DoctorDetail } from '../models/doctor.model';
import { BulkSlotGenerationRequest, BulkSlotGenerationResponse } from '../models/slot-generation.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getPublicDoctors(): Observable<DoctorResponse> {
    const url = `${this.API_URL}/doctors/public`;
    return this.http.get<DoctorResponse>(url);
  }

  getPublicDoctorsWithPagination(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Observable<DoctorResponse> {
    const url = `${this.API_URL}/doctors/public`;
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };
    return this.http.get<DoctorResponse>(url, { params });
  }

  getDoctorDetail(userId: string): Observable<DoctorDetail> {
    const url = `${this.API_URL}/doctor-slots/public/doctor/${userId}`;
    return this.http.get<DoctorDetail>(url);
  }

  generateBulkSlots(request: BulkSlotGenerationRequest): Observable<BulkSlotGenerationResponse> {
    const url = `${this.API_URL}/schedules/slots/generate/bulk`;
    return this.http.post<BulkSlotGenerationResponse>(url, request);
  }
}
