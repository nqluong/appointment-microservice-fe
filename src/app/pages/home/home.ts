import { ChangeDetectionStrategy, Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HeroBanner } from '../../layout/components/hero-banner/hero-banner';
import { DoctorsSection } from '../../layout/components/doctors-section/doctors-section';
import { ClinicFeatures } from '../../layout/components/clinic-features/clinic-features';
import { ClinicSpecialties } from '../../layout/components/clinic-specialties/clinic-specialties';
import { BlogSection } from '../../layout/components/blog-section/blog-section';

declare var $: any;
declare var AOS: any;
declare var Swiper: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroBanner,
    DoctorsSection,
    ClinicFeatures,
    ClinicSpecialties,
    BlogSection
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements AfterViewInit, OnDestroy {
  
  ngAfterViewInit(): void {
    this.initializePlugins();
  }

  ngOnDestroy(): void {
    this.destroyPlugins();
  }

  private initializePlugins(): void {
    if (typeof $ === 'undefined') return;

    setTimeout(() => {
      // Initialize Select2
      if ($('.select').length > 0) {
        $('.select').select2({
          minimumResultsForSearch: -1,
          width: '100%'
        });
      }

      // Initialize Clinics Carousel
      if ($('.clinics.owl-carousel').length > 0) {
        $('.clinics.owl-carousel').owlCarousel({
          loop: true,
          margin: 24,
          nav: true,
          dots: false,
          navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
          navContainer: '.slide-nav-1',
          responsive: {
            0: { items: 1 },
            768: { items: 2 },
            992: { items: 3 },
            1200: { items: 4 }
          }
        });
      }

      // Initialize Blogs Carousel
      if ($('.blogs.owl-carousel').length > 0) {
        $('.blogs.owl-carousel').owlCarousel({
          loop: true,
          margin: 24,
          nav: true,
          dots: false,
          navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
          navContainer: '.slide-nav-4',
          responsive: {
            0: { items: 1 },
            768: { items: 2 },
            992: { items: 3 }
          }
        });
      }

      // Initialize AOS (Animate On Scroll)
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 1200,
          easing: 'ease-in-out',
          once: true,
          mirror: false
        });
      }
    }, 200);
  }

  private destroyPlugins(): void {
    if (typeof $ === 'undefined') return;

    try {
      // Destroy Owl Carousels
      if ($('.clinics.owl-carousel').length > 0) {
        $('.clinics.owl-carousel').trigger('destroy.owl.carousel').removeClass('owl-loaded');
      }
      
      if ($('.blogs.owl-carousel').length > 0) {
        $('.blogs.owl-carousel').trigger('destroy.owl.carousel').removeClass('owl-loaded');
      }

      // Destroy Select2
      if ($('.select').length > 0) {
        $('.select').select2('destroy');
      }
    } catch (e) {
      console.error('Error destroying plugins:', e);
    }
  }
}
