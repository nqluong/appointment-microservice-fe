import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppointmentService, AppointmentDetail } from '../../core/services/appointment.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice-view.html',
  styleUrl: './invoice-view.css',
})
export class InvoiceView implements OnInit, OnDestroy {
  appointment: AppointmentDetail | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    const appointmentId = this.route.snapshot.paramMap.get('id');
    
    if (!appointmentId) {
      this.error = 'Không tìm thấy thông tin lịch hẹn';
      this.loading = false;
      return;
    }

    this.loadAppointmentDetail(appointmentId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAppointmentDetail(appointmentId: string): void {
    console.log('Loading appointment detail for ID:', appointmentId);
    
    this.appointmentService.getAppointmentDetail(appointmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          console.log('Appointment loaded successfully:', appointment);
          this.appointment = appointment;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading appointment:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          
          // Handle 401 Unauthorized
          if (err.status === 401) {
            this.router.navigate(['/auth/login'], {
              queryParams: { returnUrl: this.router.url }
            });
            return;
          }
          
          this.error = err.error?.message || 'Không thể tải thông tin lịch hẹn';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'CONFIRMED': 'badge-info',
      'COMPLETED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return classMap[status] || 'badge-secondary';
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    return timeStr.substring(0, 5);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDateTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  printInvoice(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
