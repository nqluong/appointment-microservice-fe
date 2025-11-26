import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Doctor, DoctorResponse, DoctorDetail } from '../models/doctor.model';

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

  getDoctorDetail(userId: string): Observable<DoctorDetail> {
    const url = `${this.API_URL}/doctor-slots/public/doctor/${userId}`;
    return this.http.get<DoctorDetail>(url);
  }
}
