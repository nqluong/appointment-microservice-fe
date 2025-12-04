import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

declare var $: any;

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.css'
})
export class PatientAppointments implements OnInit, AfterViewInit, OnDestroy {
  pendingAppointments: Appointment[] = [];
  confirmedAppointments: Appointment[] = [];
  cancelledAppointments: Appointment[] = [];
  completedAppointments: Appointment[] = [];
  
  loading = {
    pending: false,
    confirmed: false,
    cancelled: false,
    completed: false
  };

  currentUserId: string | null = null;
  private destroy$ = new Subject<void>();

  // Computed property for upcoming appointments (pending + confirmed)
  get upcomingAppointments(): Appointment[] {
    return [...this.pendingAppointments, ...this.confirmedAppointments]
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Khởi tạo trang lịch hẹn bệnh nhân');
    
    // Lấy ID người dùng hiện tại
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user?.userId) {
        this.currentUserId = user.userId;
        console.log('Đã lấy userId:', this.currentUserId);
        this.loadAllAppointments();
      } else {
        console.warn('Chưa đăng nhập hoặc không có userId');
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializePlugins();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyPlugins();
  }

  private loadAllAppointments(): void {
    if (!this.currentUserId) return;

    console.log('Bắt đầu tải tất cả lịch hẹn');
    this.loadPendingAppointments();
    this.loadConfirmedAppointments();
    this.loadCancelledAppointments();
    this.loadCompletedAppointments();
  }

  private loadPendingAppointments(): void {
    if (!this.currentUserId) return;

    this.loading.pending = true;
    console.log('Đang tải lịch hẹn chờ xác nhận');
    
    this.appointmentService
      .getUserAppointments(this.currentUserId, ['PENDING'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pendingAppointments = response.content;
          this.loading.pending = false;
          console.log(`Đã tải ${response.content.length} lịch hẹn chờ xác nhận`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch hẹn chờ xác nhận:', err);
          this.loading.pending = false;
          this.cdr.detectChanges();
        }
      });
  }

  private loadConfirmedAppointments(): void {
    if (!this.currentUserId) return;

    this.loading.confirmed = true;
    console.log('Đang tải lịch hẹn đã xác nhận');
    
    this.appointmentService
      .getUserAppointments(this.currentUserId, ['CONFIRMED'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.confirmedAppointments = response.content;
          this.loading.confirmed = false;
          console.log(`Đã tải ${response.content.length} lịch hẹn đã xác nhận`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch hẹn đã xác nhận:', err);
          this.loading.confirmed = false;
          this.cdr.detectChanges();
        }
      });
  }

  private loadCancelledAppointments(): void {
    if (!this.currentUserId) return;

    this.loading.cancelled = true;
    console.log('Đang tải lịch hẹn đã hủy');
    
    this.appointmentService
      .getUserAppointments(this.currentUserId, ['CANCELLED'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cancelledAppointments = response.content;
          this.loading.cancelled = false;
          console.log(`Đã tải ${response.content.length} lịch hẹn đã hủy`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch hẹn đã hủy:', err);
          this.loading.cancelled = false;
          this.cdr.detectChanges();
        }
      });
  }

  private loadCompletedAppointments(): void {
    if (!this.currentUserId) return;

    this.loading.completed = true;
    console.log('Đang tải lịch hẹn đã hoàn thành');
    
    this.appointmentService
      .getUserAppointments(this.currentUserId, ['COMPLETED'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.completedAppointments = response.content;
          this.loading.completed = false;
          console.log(`Đã tải ${response.content.length} lịch hẹn đã hoàn thành`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch hẹn đã hoàn thành:', err);
          this.loading.completed = false;
          this.cdr.detectChanges();
        }
      });
  }

  getStatusText(status: AppointmentStatus): string {
    const statusMap: Record<AppointmentStatus, string> = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: AppointmentStatus): string {
    const classMap: Record<AppointmentStatus, string> = {
      'PENDING': 'badge-warning',
      'CONFIRMED': 'badge-success',
      'COMPLETED': 'badge-info',
      'CANCELLED': 'badge-danger'
    };
    return classMap[status] || '';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // HH:MM
  }

  private initializePlugins(): void {
    if (typeof $ === 'undefined') return;

    setTimeout(() => {
      // Initialize date range picker
      if ($('.bookingrange').length > 0) {
        $('.bookingrange').daterangepicker({
          locale: { format: 'DD/MM/YYYY' }
        });
      }

      // Initialize dropdown filters
      if ($('#table-filter').length > 0) {
        $('#table-filter').on('click', function() {
          $('.filter-dropdown-menu').toggle();
        });
      }

      // Close dropdown when clicking outside
      $(document).on('click', function(e: any) {
        if (!$(e.target).closest('.form-sorts').length) {
          $('.filter-dropdown-menu').hide();
        }
      });
    }, 100);
  }

  private destroyPlugins(): void {
    if (typeof $ === 'undefined') return;

    // Destroy date range picker
    if ($('.bookingrange').length > 0 && $('.bookingrange').data('daterangepicker')) {
      $('.bookingrange').data('daterangepicker').remove();
    }

    // Remove event listeners
    $('#table-filter').off('click');
    $(document).off('click');
  }
}
