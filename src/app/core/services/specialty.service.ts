import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Specialty } from '../models/specialty.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getActiveSpecialties(): Observable<Specialty[]> {
    const url = `${this.apiUrl}/specialties/public/active`;
    console.log('Calling API:', url);
    return this.http.get<Specialty[]>(url);
  }

  getSpecialtyById(specialtyId: string): Observable<Specialty> {
    const url = `${this.apiUrl}/specialties/public/${specialtyId}`;
    console.log('Calling API:', url);
    return this.http.get<Specialty>(url);
  }
}
