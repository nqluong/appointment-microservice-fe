import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DoctorDetail, TimeSlot } from '../../core/models/doctor.model';
import { DoctorService } from '../../core/services/doctor.service';

interface GroupedSlots {
  [date: string]: TimeSlot[];
}

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.css'
})
export class DoctorProfile implements OnInit, OnDestroy {
  doctor: DoctorDetail | null = null;
  loading = true;
  error: string | null = null;
  groupedSlots: GroupedSlots = {};
  availableDates: string[] = [];
  selectedSlot: TimeSlot | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const doctorId = params['id'];
        if (doctorId) {
          this.loadDoctorDetail(doctorId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDoctorDetail(userId: string): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getDoctorDetail(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doctor) => {
          this.doctor = doctor;
          this.groupSlotsByDate();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading doctor detail:', err);
          this.error = 'Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private groupSlotsByDate(): void {
    if (!this.doctor?.availableSlots) return;

    this.groupedSlots = this.doctor.availableSlots.reduce((acc, slot) => {
      if (!acc[slot.slotDate]) {
        acc[slot.slotDate] = [];
      }
      acc[slot.slotDate].push(slot);
      return acc;
    }, {} as GroupedSlots);

    this.availableDates = Object.keys(this.groupedSlots).sort();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('vi-VN', options);
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5);
  }

  getSlotsByDate(date: string): TimeSlot[] {
    return this.groupedSlots[date] || [];
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.isAvailable) {
      this.selectedSlot = slot;
      this.cdr.markForCheck();
    }
  }

  confirmBooking(): void {
    if (this.selectedSlot && this.doctor) {
      // Navigate to booking page with doctor and slot info
      this.router.navigate(['/booking'], {
        queryParams: {
          doctorId: this.doctor.userId,
          slotId: this.selectedSlot.slotId
        }
      });
    }
  }
}
