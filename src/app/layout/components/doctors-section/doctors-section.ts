import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Doctor } from '../../../core/models/doctor.model';
import { DoctorService } from '../../../core/services/doctor.service';

declare var $: any;
declare var AOS: any;
declare var Swiper: any;

@Component({
  selector: 'app-doctors-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctors-section.html',
  styleUrl: './doctors-section.css'
})
export class DoctorsSection implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCarousel();
  }

  private destroyCarousel(): void {
    if (typeof $ === 'undefined') return;
    
    try {
      if ($('.our-doctors.owl-carousel').length > 0 && $('.our-doctors.owl-carousel').hasClass('owl-loaded')) {
        $('.our-doctors.owl-carousel').trigger('destroy.owl.carousel').removeClass('owl-loaded');
      }
    } catch (e) {
      console.error('Error destroying doctors carousel:', e);
    }
  }

  private loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getPublicDoctors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.doctors = response.content;
          this.loading = false;
          this.cdr.detectChanges();
          
          // Re-initialize plugins after data is loaded
          this.initializeCarousel();
        },
        error: (err) => {
          console.error('Error loading doctors:', err);
          
          // Fallback: Load mock data for testing UI
          this.loading = false;
          this.error = null;
          
          this.cdr.detectChanges();
          this.initializeCarousel();
        }
      });
  }

  private initializeCarousel(): void {
    if (typeof $ === 'undefined') return;
    
    setTimeout(() => {
      // Destroy existing carousel if any
      if ($('.our-doctors.owl-carousel').hasClass('owl-loaded')) {
        $('.our-doctors.owl-carousel').trigger('destroy.owl.carousel').removeClass('owl-loaded');
      }

      // Initialize carousel for doctors section
      if ($('.our-doctors.owl-carousel').length > 0) {
        $('.our-doctors.owl-carousel').owlCarousel({
          loop: true,
          margin: 24,
          nav: true,
          dots: false,
          navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
          navContainer: '.slide-nav-2',
          responsive: {
            0: { items: 1 },
            768: { items: 2 },
            992: { items: 3 },
            1200: { items: 4 }
          }
        });
      }
    }, 300);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getGenderDisplay(gender: string): string {
    return gender === 'MALE' ? 'Nam' : 'Nữ';
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/img/doctors/doctor-thumb-02.jpg';
  }
}
