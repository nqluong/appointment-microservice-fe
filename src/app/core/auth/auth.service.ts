import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {ApiResponse, LoginRequest, RegisterRequest, LoginData, UserInfo, RefreshTokenRequest, RefreshTokenData } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    
  private readonly API_URL = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private refreshTokenTimeout?: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (typeof window !== 'undefined') {
      this.currentUserSubject.next(this.getUserInfo());
      this.startRefreshTokenTimer();
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
    this.stopRefreshTokenTimer();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  refreshToken(): Observable<ApiResponse<RefreshTokenData>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<RefreshTokenData>>(
      `${this.API_URL}/auth/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateTokens(response.data);
        }
      })
    );
  }

  private updateTokens(data: RefreshTokenData): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      this.startRefreshTokenTimer();
    }
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
      this.startRefreshTokenTimer();
    }
  }

  private startRefreshTokenTimer(): void {
    const token = this.getToken();
    if (!token) return;

    const jwtToken = JSON.parse(atob(token.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000); 
    if (timeout > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => {
            console.log('Token refreshed successfully');
          },
          error: (err) => {
            console.error('Failed to refresh token:', err);
            this.logout();
          }
        });
      }, timeout);
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
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