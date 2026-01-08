import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor as DoctorModel, DoctorResponse } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-doctor',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './doctor.html',
  styleUrl: './doctor.css',
})
export class Doctor implements OnInit {
  doctors: DoctorModel[] = [];
  loading = false;
  error: string | null = null;
  Math = Math;
  selectedDoctors = new Set<string>();
  showScheduleModal = false;
  scheduleStartDate: string = '';
  scheduleEndDate: string = '';
  isGeneratingSlots = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.doctorService
      .getPublicDoctorsWithPagination(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: DoctorResponse) => {
          this.doctors = response.content;
          this.currentPage = response.page;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
          console.log('Doctors loaded:', this.doctors);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadDoctors();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  toggleDoctorSelection(doctorId: string): void {
    if (this.selectedDoctors.has(doctorId)) {
      this.selectedDoctors.delete(doctorId);
    } else {
      this.selectedDoctors.add(doctorId);
    }
  }

  isDoctorSelected(doctorId: string): boolean {
    return this.selectedDoctors.has(doctorId);
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.doctors.forEach(doctor => this.selectedDoctors.add(doctor.userId));
    } else {
      this.selectedDoctors.clear();
    }
  }

  isAllSelected(): boolean {
    return this.doctors.length > 0 && this.doctors.every(doctor => this.selectedDoctors.has(doctor.userId));
  }

  renderScheduleForSelected(): void {
    console.log('Selected doctors:', Array.from(this.selectedDoctors));
    // Set default dates (today and 7 days from now)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    this.scheduleStartDate = this.formatDateForInput(today);
    this.scheduleEndDate = this.formatDateForInput(nextWeek);
    this.showScheduleModal = true;
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.scheduleStartDate = '';
    this.scheduleEndDate = '';
  }

  confirmScheduleRender(): void {
    if (!this.scheduleStartDate || !this.scheduleEndDate) {
      alert('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    if (new Date(this.scheduleStartDate) > new Date(this.scheduleEndDate)) {
      alert('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }

    if (this.selectedDoctors.size === 0) {
      alert('Vui lòng chọn ít nhất một bác sĩ');
      return;
    }

    this.isGeneratingSlots = true;

    const request = {
      doctorIds: Array.from(this.selectedDoctors),
      startDate: this.scheduleStartDate,
      endDate: this.scheduleEndDate
    };

    this.doctorService.generateBulkSlots(request).subscribe({
      next: (response) => {
        this.isGeneratingSlots = false;        
        // Show success message
        const successMsg = `Tạo lịch thành công!\n\n` +
          `Từ ${response.startDate} đến ${response.endDate}\n` +
          `Tổng số bác sĩ: ${response.totalDoctors}\n` +
          `Thành công: ${response.successfulGenerations}\n` +
          `Thất bại: ${response.failedGenerations}\n` +
          `Tổng slot tạo: ${response.totalSlotsGenerated}\n\n` +
          `${response.message}`;
        
        alert(successMsg);
        
        // Log detailed results
        if (response.failedGenerations > 0) {
          console.warn('Failed generations:', response.results.filter(r => !r.success));
        }
        
        this.closeScheduleModal();
        this.selectedDoctors.clear();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isGeneratingSlots = false;
        console.error('Error generating slots:', err);
        
        const errorMsg = err.error?.message || 'Không thể tạo lịch. Vui lòng thử lại sau.';
        alert(`Lỗi: ${errorMsg}`);
        this.cdr.detectChanges();
      }
    });
  }
}
