import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentService, AppointmentDetail } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail-appointments.html',
  styleUrl: './detail-appointments.css',
})
export class DetailAppointments implements OnInit {
  appointment: AppointmentDetail | null = null ;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.loadAppointmentDetail(appointmentId);
    }
  }

  private loadAppointmentDetail(appointmentId: string): void {
    console.log('Đang tải chi tiết lịch hẹn:', appointmentId);
    this.loading = true;
    
    this.appointmentService.getAppointmentDetail(appointmentId).subscribe({
      next: (detail) => {
        this.appointment = detail;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Không thể tải thông tin lịch hẹn';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }
}
