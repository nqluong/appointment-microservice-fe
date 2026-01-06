import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserProfile } from '../../../core/models/user-profile.model';

@Component({
  selector: 'app-patient-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-sidebar.html',
  styleUrl: './patient-sidebar.css',
})
export class PatientSidebar implements OnInit, OnDestroy {
  currentUser: any = null;
  userProfile: UserProfile | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      if (user?.userId) {
        this.loadUserProfile(user.userId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(userId: string): void {
    this.loading = true;
    this.userProfileService.getUserProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.loading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải profile:', err);
          this.loading = false;
        }
      });
  }

  getPatientId(): string {
    return this.currentUser?.userId?.substring(0, 8).toUpperCase() || 'N/A';
  }

  getPatientName(): string {
    if (this.userProfile) {
      return this.userProfileService.getFullName(this.userProfile);
    }
    return this.currentUser?.fullName || 'Patient';
  }

  getPatientAvatar(): string {
    return this.userProfile?.avatarUrl || this.currentUser?.avatar || 'assets/img/doctors-dashboard/profile-06.jpg';
  }
}
