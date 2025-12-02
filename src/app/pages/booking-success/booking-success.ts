import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.css'
})
export class BookingSuccess implements OnInit {
  loading = true;
  isSuccess = false;
  appointmentId: string | null = null;
  doctorName: string | null = null;
  appointmentDate: string | null = null;
  appointmentTime: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const responseCode = params['vnp_ResponseCode'];
      const transactionNo = params['vnp_TxnRef'];
      
      this.appointmentId = params['appointmentId'];
      this.doctorName = params['doctorName'];
      this.appointmentDate = params['date'];
      this.appointmentTime = params['time'];

      if (!this.appointmentId && responseCode && typeof window !== 'undefined') {
        const savedInfo = localStorage.getItem('pendingAppointment');
        if (savedInfo) {
          try {
            const info = JSON.parse(savedInfo);
            this.appointmentId = info.appointmentId;
            this.doctorName = info.doctorName;
            this.appointmentDate = info.appointmentDate;
            this.appointmentTime = info.appointmentTime;
            localStorage.removeItem('pendingAppointment');
          } catch (e) {
            console.error('Error parsing appointment info:', e);
          }
        }
      }

      // Check payment status
      if (responseCode === '00') {
        this.isSuccess = true;
      } else if (responseCode) {
        this.isSuccess = false;
        this.errorMessage = this.getErrorMessage(responseCode);
      } else {
        this.isSuccess = true;
      }

      this.loading = false;
    });
  }

  private syncPaymentStatus(transactionId: string): void {
    // Call API asynchronously without waiting for response
    this.appointmentService.syncPaymentStatus(transactionId).subscribe({
      next: () => {
        console.log('Payment status synced successfully');
      },
      error: (err) => {
        console.error('Failed to sync payment status:', err);
        // Don't show error to user, just log it
      }
    });
  }

  private getErrorMessage(code: string): string {
    const errorMessages: { [key: string]: string } = {
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Mật khẩu xác thực giao dịch không đúng',
      '24': 'Giao dịch bị hủy',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch vượt quá số lần nhập sai mật khẩu',
      '99': 'Lỗi không xác định'
    };
    return errorMessages[code] || 'Thanh toán thất bại. Vui lòng thử lại.';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  viewInvoice(): void {
    if (this.appointmentId) {
      this.router.navigate(['/invoice', this.appointmentId]);
    }
  }

  retryBooking(): void {
    this.router.navigate(['/']);
  }
}
