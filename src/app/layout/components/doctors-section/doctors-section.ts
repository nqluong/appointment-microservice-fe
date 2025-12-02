import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Doctor } from '../../../core/models/doctor.model';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctors-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctors-section.html',
  styleUrl: './doctors-section.css'
})
export class DoctorsSection implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getPublicDoctors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.doctors = response.content;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading doctors:', err);
          this.error = 'Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.';
          this.loading = false;
          
          // Fallback: Load mock data for testing UI
          this.loadMockDoctors();
          this.cdr.detectChanges();
        }
      });
  }

  private loadMockDoctors(): void {
    // Mock data for testing UI when backend is not available
    this.doctors = [
      {
        userId: '1',
        fullName: 'Dr. John Doe',
        specialization: 'Cardiology',
        experience: 10,
        consultationFee: 500000,
        gender: 'MALE',
        email: 'john@example.com',
        phoneNumber: '0123456789',
        address: 'Hanoi',
        avatarFilePath: 'assets/img/doctors/doctor-thumb-02.jpg'
      },
      {
        userId: '2',
        fullName: 'Dr. Jane Smith',
        specialization: 'Dermatology',
        experience: 8,
        consultationFee: 400000,
        gender: 'FEMALE',
        email: 'jane@example.com',
        phoneNumber: '0987654321',
        address: 'Ho Chi Minh',
        avatarFilePath: 'assets/img/doctors/doctor-thumb-02.jpg'
      }
    ];
    this.error = 'Đang sử dụng dữ liệu mẫu (Backend chưa kết nối)';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getGenderDisplay(gender: string): string {
    return gender === 'MALE' ? 'Nam' : 'Nữ';
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/img/doctors/doctor-thumb-02.jpg';
  }
}
