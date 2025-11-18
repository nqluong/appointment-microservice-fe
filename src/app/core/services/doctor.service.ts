import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Doctor, DoctorResponse } from '../models/doctor.model';

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
    console.log('DoctorService: Making request to:', url);
    return this.http.get<DoctorResponse>(url);
  }
}
