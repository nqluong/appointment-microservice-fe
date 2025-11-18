import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Doctor } from '../../../core/models/doctor.model';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctors-section',
  standalone: true,
  imports: [CommonModule],
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
    this.cdr.markForCheck();

    this.doctorService.getPublicDoctors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.doctors = response.content;
          this.loading = false;
          console.log('Loaded doctors:', this.doctors.length, this.doctors);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading doctors:', err);
          this.error = 'Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
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
}
