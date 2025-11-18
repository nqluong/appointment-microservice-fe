import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterRequest } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.performRegister();
  }

  private performRegister(): void {
    this.isLoading = true;
    this.clearMessages();

    const userData: RegisterRequest = {
      fullName: this.f['fullName'].value,
      username: this.f['username'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.authService.register(userData)
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
    this.successMessage = message || 'Đăng ký thành công! Vui lòng đăng nhập.';

    // Redirect đến login page sau 2s
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  private handleError(error: any): void {
    console.log("Có lỗi xảy ra từ backend", error);

    // Kiểm tra nếu error có response từ backend
    if (error.error && typeof error.error === 'object') {
      const backendError = error.error;
      console.log("Backend error response:", backendError);
      
      // Set values và force change detection
      this.isLoading = false;
      this.errorMessage = backendError.message || 'Có lỗi xảy ra, vui lòng thử lại!';
      console.log("Set errorMessage to:", this.errorMessage);
      console.log("isLoading set to:", this.isLoading);
      
      // Force change detection với setTimeout
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
      return;
    }

    // Kiểm tra nếu error có status và error.error
    if (error.status && error.error) {
      console.log("HTTP error with response:", error.status, error.error);
      // Nếu error.error là string, có thể là JSON string
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          if (parsedError.message) {
            this.isLoading = false;
            this.errorMessage = parsedError.message;
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
            return;
          }
        } catch (e) {
          console.log("Không thể parse error.error:", error.error);
        }
      }
    }

    // Fallback error mapping cho HTTP status codes
    const errorMap: Record<number, string> = {
      400: 'Thông tin đăng ký không hợp lệ!',
      409: 'Tên đăng nhập hoặc email đã tồn tại!',
      0: 'Không thể kết nối đến server!'
    };

    this.isLoading = false;
    this.errorMessage = errorMap[error.status] || 
                        error.message || 
                        'Có lỗi xảy ra, vui lòng thử lại!';
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
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
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
