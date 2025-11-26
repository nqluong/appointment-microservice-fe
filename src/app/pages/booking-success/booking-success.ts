import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const responseCode = params['vnp_ResponseCode'];
      
      // Try to get appointment info from query params first
      this.appointmentId = params['appointmentId'];
      this.doctorName = params['doctorName'];
      this.appointmentDate = params['date'];
      this.appointmentTime = params['time'];

      // If not in query params, try to get from localStorage (VNPay callback)
      if (!this.appointmentId && responseCode) {
        const savedInfo = localStorage.getItem('pendingAppointment');
        if (savedInfo) {
          try {
            const info = JSON.parse(savedInfo);
            this.appointmentId = info.appointmentId;
            this.doctorName = info.doctorName;
            this.appointmentDate = info.appointmentDate;
            this.appointmentTime = info.appointmentTime;
            // Clear after use
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
        // Direct access without payment (for testing or other flows)
        this.isSuccess = true;
      }

      this.loading = false;
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
