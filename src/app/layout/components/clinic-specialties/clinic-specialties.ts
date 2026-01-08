import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { Specialty } from '../../../core/models/specialty.model';

declare var $: any;

@Component({
  selector: 'app-clinic-specialties',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clinic-specialties.html',
  styleUrl: './clinic-specialties.css'
})
export class ClinicSpecialties implements OnInit, AfterViewInit {
  specialties: Specialty[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private specialtyService: SpecialtyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSpecialties();
  }

  ngAfterViewInit(): void {
    // Initialize owl carousel after data is loaded
    setTimeout(() => {
      this.initializeCarousel();
    }, 500);
  }

  private loadSpecialties(): void {
    this.loading = true;
    
    this.specialtyService.getActiveSpecialties().subscribe({
      next: (data) => {

        
        this.specialties = data;
        this.loading = false;
        
        this.cdr.detectChanges();
        
        // Reinitialize carousel after data loads
        setTimeout(() => {
          this.initializeCarousel();
        }, 100);
      },
      error: (err) => {
        console.error('Lỗi khi tải specialties:', err);
        console.error('Error details:', err.message);
        console.error('Error status:', err.status);
        this.error = `Không thể tải danh sách chuyên khoa: ${err.message}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private initializeCarousel(): void {
    if (typeof $ === 'undefined') return;

    // Destroy existing carousel if any
    if ($('.clinics').hasClass('owl-loaded')) {
      $('.clinics').trigger('destroy.owl.carousel');
      $('.clinics').removeClass('owl-loaded owl-drag');
    }

    // Initialize carousel
    $('.clinics').owlCarousel({
      loop: true,
      margin: 24,
      nav: true,
      dots: false,
      navContainer: '.slide-nav-1',
      navText: ['<i class="isax isax-arrow-left-2"></i>', '<i class="isax isax-arrow-right-3"></i>'],
      responsive: {
        0: {
          items: 1
        },
        768: {
          items: 2
        },
        1024: {
          items: 3
        },
        1200: {
          items: 4
        }
      }
    });
  }

  getDoctorCount(specialty: Specialty): number {
    return specialty.doctors?.length || 0;
  }

  getSpecialtyIcon(specialtyName: string): string {
    const iconMap: { [key: string]: string } = {
      'Tim mạch': 'assets/img/category/4.png',
      'Nhi khoa': 'assets/img/category/6.png',
      'Thần kinh': 'assets/img/category/5.png',
      'Chỉnh hình': 'assets/img/category/2.png',
      'Tiết niệu': 'assets/img/category/1.png',
      'Răng hàm mặt': 'assets/img/category/3.png',
      'Nha khoa': 'assets/img/category/3.png',
      'Thú y': 'assets/img/category/7.png',
      'Tâm thần': 'assets/img/category/8.png',
      'Da liễu': 'assets/img/category/1.png',
      'Mắt': 'assets/img/category/2.png',
      'Tai mũi họng': 'assets/img/category/3.png',
      'Sản phụ khoa': 'assets/img/category/6.png'
    };

    // Tìm icon phù hợp dựa trên tên chuyên khoa
    for (const [key, value] of Object.entries(iconMap)) {
      if (specialtyName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Default icon nếu không tìm thấy
    return 'assets/img/category/1.png';
  }

  getSpecialtyIconSvg(specialtyName: string): string {
    const iconMap: { [key: string]: string } = {
      'Tim mạch': 'assets/img/category/category-03.svg',
      'Nhi khoa': 'assets/img/category/category-06.svg',
      'Thần kinh': 'assets/img/category/category-05.svg',
      'Chỉnh hình': 'assets/img/category/category-02.svg',
      'Tiết niệu': 'assets/img/category/category-01.svg',
      'Răng hàm mặt': 'assets/img/category/category-04.svg',
      'Nha khoa': 'assets/img/category/category-04.svg',
      'Thú y': 'assets/img/category/category-07.svg',
      'Tâm thần': 'assets/img/category/category-08.svg',
      'Da liễu': 'assets/img/category/category-01.svg',
      'Mắt': 'assets/img/category/category-02.svg',
      'Tai mũi họng': 'assets/img/category/category-03.svg',
      'Sản phụ khoa': 'assets/img/category/category-06.svg'
    };

    for (const [key, value] of Object.entries(iconMap)) {
      if (specialtyName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'assets/img/category/category-01.svg';
  }
}
