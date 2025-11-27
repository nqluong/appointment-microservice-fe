import { ChangeDetectorRef, Component, NgZone, OnInit, ApplicationRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../../../core/auth/auth.models';
import { log } from 'console';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private returnUrl: string = '/';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm();
  }

   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [true]
    });
  }

   get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.performLogin();
  }

  private performLogin(): void {
    this.isLoading = true;
    this.clearMessages();

    const credentials: LoginRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value
    };

    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleSuccess(response.message);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message || 'Đăng nhập thành công!';
    this.cdr.markForCheck();

    setTimeout(() => {
      window.location.href = this.returnUrl;
    }, 1000);
  }

  private handleError(error: any): void {

    // Kiểm tra nếu error có response từ backend
    if (error.error && typeof error.error === 'object') {
      const backendError = error.error;
      this.isLoading = false;
      this.errorMessage = backendError.message || 'Có lỗi xảy ra, vui lòng thử lại!';
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      this.appRef.tick();
      return;
    }

    // Kiểm tra nếu error có status và error.error
    if (error.status && error.error) {
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          if (parsedError.message) {
            this.isLoading = false;
            this.errorMessage = parsedError.message;
            this.cdr.markForCheck();
            return;
          }
        } catch (e) {
          console.log("Không thể parse error.error:", error.error);
        }
      }
    }

    // Fallback error mapping cho HTTP status codes
    const errorMap: Record<number, string> = {
      401: 'Tên đăng nhập hoặc mật khẩu không đúng!',
      403: 'Tài khoản đã bị khóa!',
      0: 'Không thể kết nối đến server!'
    };

    this.isLoading = false;
    this.errorMessage = errorMap[error.status] || 
                        error.message || 
                        'Có lỗi xảy ra, vui lòng thử lại!';
    this.cdr.markForCheck();
  }

  // UI Helpers
  togglePasswordVisibility(): void {
    const input = document.querySelector('.pass-input') as HTMLInputElement;
    const icon = document.querySelector('.toggle-password');
    
    if (input && icon) {
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('feather-eye-off');
      icon.classList.toggle('feather-eye');
    }
  }

  onInputChange(): void {
    this.clearMessages();
  }

  private markAllAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
