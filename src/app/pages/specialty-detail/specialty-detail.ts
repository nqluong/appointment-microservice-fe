import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpecialtyService } from '../../core/services/specialty.service';
import { Specialty } from '../../core/models/specialty.model';
import { Doctor } from '../../core/models/doctor.model';

@Component({
  selector: 'app-specialty-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './specialty-detail.html',
  styleUrl: './specialty-detail.css'
})
export class SpecialtyDetail implements OnInit {
  specialty: Specialty | null = null;
  doctors: Doctor[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private specialtyService: SpecialtyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const specialtyId = this.route.snapshot.paramMap.get('id');
    if (specialtyId) {
      this.loadSpecialtyDetail(specialtyId);
    } else {
      this.error = 'Không tìm thấy ID chuyên khoa';
      this.loading = false;
    }
  }

  private loadSpecialtyDetail(specialtyId: string): void {
    this.loading = true;
    
    this.specialtyService.getSpecialtyById(specialtyId).subscribe({
      next: (data) => {
        this.specialty = data;
        this.doctors = data.doctors || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải specialty detail:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.error = `Không thể tải thông tin chuyên khoa: ${err.message}`;
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
}
