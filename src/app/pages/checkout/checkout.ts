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
  patientName = '';
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
          this.patientName = `${profile.firstName} ${profile.lastName}`;
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

    if (!this.patientName || !this.phone || !this.email) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Check payment method
    if (this.paymentMethod === 'credit-card') {
      alert('Phương thức thanh toán bằng thẻ tín dụng đang trong quá trình bảo trì. Vui lòng chọn phương thức VNPay.');
      return;
    }

    if (!this.doctor || !this.slot) {
      alert('Thông tin đặt lịch không hợp lệ');
      return;
    }

    // Get user info if logged in (optional)
    const userInfo = this.authService.getUserInfo();
    const patientId = userInfo?.userId || undefined;

    this.createAppointment(patientId);
  }

  private createAppointment(patientId?: string): void {
    if (!this.doctor || !this.slot) return;

    this.isSubmitting = true;
    this.error = null;

    const request: CreateAppointmentRequest = {
      doctorId: this.doctor.userId,
      slotId: this.slot.slotId,
      patientId: patientId,
      patientPhone: this.phone,
      patientEmail: this.email,
      patientName: this.patientName.trim(),
      notes: this.notes || ''
    };

    this.appointmentService.createAppointment(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          
          if (response.paymentUrl) {
            if (typeof window !== 'undefined') {
              const appointmentInfo = {
                appointmentId: response.appointmentId,
                doctorName: response.doctorName,
                appointmentDate: response.appointmentDate,
                appointmentTime: `${this.formatTime(response.startTime)} - ${this.formatTime(response.endTime)}`
              };
              localStorage.setItem('pendingAppointment', JSON.stringify(appointmentInfo));
            }

            if (response.paymentUrl.startsWith('http://') || response.paymentUrl.startsWith('https://')) {
              // Fire-and-forget: Confirm payment before redirect
              this.confirmPaymentBeforeRedirect(response.paymentId, response.paymentUrl);
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

  private confirmPaymentBeforeRedirect(paymentId: string, paymentUrl: string): void {
    // Call confirm payment API asynchronously
    this.appointmentService.confirmPayment(paymentId).subscribe({
      next: () => {
        console.log('Xác nhận thanh toán, chuyển tới VNPAY');
      },
      error: (err) => {
        console.error('Xác nhận thanh toán thất bại: ', err);
        // Continue redirect even if confirmation fails
      }
    });

    // Redirect immediately without waiting for API response
    // Small delay to ensure API call is sent
    setTimeout(() => {
      window.location.href = paymentUrl;
    }, 100);
  }
}
