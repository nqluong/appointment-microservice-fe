import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost:8080/api';
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${userId}/profiles/me`).pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  updateUserProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/${userId}/profiles/me`, profile).pipe(
      tap(updatedProfile => this.profileSubject.next(updatedProfile))
    );
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }

  getFullName(profile: UserProfile | null): string {
    if (!profile) return 'Patient';
    return `${profile.firstName} ${profile.lastName}`.trim();
  }
}
