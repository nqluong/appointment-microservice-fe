import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { UserInfo } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  currentUser: UserInfo | null = null;
  isAuthenticated = false;
  showUserMenu = false;
  isPatientPage = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
      });

    // Check current route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects);
      });

    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }
  }

  private checkRoute(url: string): void {
    this.isPatientPage = url.includes('/patient/');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.handleClickOutside.bind(this));
    }
  }
  private handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu');
    
    if (!userMenu && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.email?.split('@')[0] || 'User';
  }

  isAdmin(): boolean {
    return this.currentUser?.userRoles?.includes('ADMIN') || false;
  }

  goToAdminPanel(): void {
    this.router.navigate(['/admin']);
    this.showUserMenu = false;
  }
}
