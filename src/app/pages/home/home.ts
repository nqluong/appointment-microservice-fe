import { Component } from '@angular/core';
import { HeroBanner } from '../../layout/components/hero-banner/hero-banner';
import { DoctorsSection } from '../../layout/components/doctors-section/doctors-section';
import { ClinicFeatures } from '../../layout/components/clinic-features/clinic-features';
import { ClinicSpecialties } from '../../layout/components/clinic-specialties/clinic-specialties';
import { BlogSection } from '../../layout/components/blog-section/blog-section';

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
  styleUrl: './home.css'
})
export class Home {

}
