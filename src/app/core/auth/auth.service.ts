import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {ApiResponse, LoginRequest, RegisterRequest, LoginData, UserInfo } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    
private readonly API_URL = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize user info only in browser environment
    if (typeof window !== 'undefined') {
      this.currentUserSubject.next(this.getUserInfo());
    }
  }

  
  login(credentials: LoginRequest): Observable<ApiResponse<LoginData>> {
    return this.http.post<ApiResponse<LoginData>>(
      `${this.API_URL}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.saveAuthData(response.data);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/auth/register`,
      userData
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.saveAuthData(response.data);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private saveAuthData(data: LoginData): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      const userInfo: UserInfo = {
        userId: data.userId,
        email: data.email,
        userRoles: data.userRoles
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      this.currentUserSubject.next(userInfo);
    }
  }

  getUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') return null;
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) return null;
    
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getUserInfo()?.userRoles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserInfo()?.userRoles || [];
    return roles.some(role => userRoles.includes(role));
  }
}