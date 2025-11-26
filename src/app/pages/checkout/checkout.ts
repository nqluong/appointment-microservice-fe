import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DoctorService } from '../../core/services/doctor.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService, CreateAppointmentRequest } from '../../core/services/appointment.service';
import { DoctorDetail, TimeSlot, UserProfile } from '../../core/models/doctor.model';
import { log } from 'console';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {
  doctor: DoctorDetail | null = null;
  slot: TimeSlot | null = null;
  userProfile: UserProfile | null = null;
  loading = true;
  error: string | null = null;
  isSubmitting = false;
  
  // Form data
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  notes = '';
  paymentMethod = 'vnpay';
  acceptTerms = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private userService: UserService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.queryParams['doctorId'];
    const slotId = this.route.snapshot.queryParams['slotId'];

    if (!doctorId || !slotId) {
      this.error = 'Thông tin đặt lịch không hợp lệ';
      this.loading = false;
      return;
    }

    this.loadBookingData(doctorId, slotId);
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBookingData(doctorId: string, slotId: string): void {
    this.doctorService.getDoctorDetail(doctorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doctor) => {
          this.doctor = doctor;
          this.slot = doctor.availableSlots.find(s => s.slotId === slotId) || null;
          
          if (!this.slot) {
            this.error = 'Không tìm thấy thông tin khung giờ';
          }
          
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading doctor:', err);
          this.error = 'Không thể tải thông tin bác sĩ';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private loadUserProfile(): void {
    const userInfo = this.authService.getUserInfo();
    
    if (!userInfo || !userInfo.userId) {
      return;
    }

    this.userService.getUserProfile(userInfo.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.firstName = profile.firstName;
          this.lastName = profile.lastName;
          this.phone = profile.phone;
          this.email = userInfo.email || '';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading user profile:', err);
          // Don't show error, just let user fill manually
        }
      });
  }

  onSubmit(): void {
    if (!this.acceptTerms) {
      alert('Vui lòng đồng ý với điều khoản và điều kiện');
      return;
    }

    if (!this.firstName || !this.lastName || !this.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Check if user is logged in
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.userId) {
      alert('Vui lòng đăng nhập để đặt lịch');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (!this.doctor || !this.slot) {
      alert('Thông tin đặt lịch không hợp lệ');
      return;
    }

    this.createAppointment(userInfo.userId);
  }

  private createAppointment(patientId: string): void {
    if (!this.doctor || !this.slot) return;

    this.isSubmitting = true;
    this.error = null;

    const request: CreateAppointmentRequest = {
      doctorId: this.doctor.userId,
      slotId: this.slot.slotId,
      patientId: patientId,
      notes: this.notes || ''
    };

    this.appointmentService.createAppointment(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          
          if (response.paymentUrl) {
            // Save appointment info to localStorage before redirect
            const appointmentInfo = {
              appointmentId: response.appointmentId,
              doctorName: response.doctorName,
              appointmentDate: response.appointmentDate,
              appointmentTime: `${this.formatTime(response.startTime)} - ${this.formatTime(response.endTime)}`
            };
            localStorage.setItem('pendingAppointment', JSON.stringify(appointmentInfo));

            // Validate URL before redirect
            if (response.paymentUrl.startsWith('http://') || response.paymentUrl.startsWith('https://')) {
              window.location.href = response.paymentUrl;
            } else {
              console.error('Invalid payment URL:', response.paymentUrl);
              alert('URL thanh toán không hợp lệ');
              this.isSubmitting = false;
              this.cdr.markForCheck();
            }
          } else {
            alert('Đặt lịch thành công!');
            this.router.navigate(['/booking-success'], {
              queryParams: {
                appointmentId: response.appointmentId,
                doctorName: response.doctorName,
                date: response.appointmentDate,
                time: `${this.formatTime(response.startTime)} - ${this.formatTime(response.endTime)}`
              }
            });
          }
        },
        error: (err) => {
          console.error('Error creating appointment:', err);
          this.error = err.error?.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại sau.';
          this.isSubmitting = false;
          this.cdr.markForCheck();
          
          // Show error to user
          alert(this.error);
        }
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    return timeStr.substring(0, 5);
  }
}
