import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../components/header/header';
import { Footer } from '../components/footer/footer';
import { HeroBanner } from '../components/hero-banner/hero-banner';
import { DoctorsSection } from '../components/doctors-section/doctors-section';
import { ClinicFeatures } from '../components/clinic-features/clinic-features';
import { ClinicSpecialties } from '../components/clinic-specialties/clinic-specialties';
import { BlogSection } from '../components/blog-section/blog-section';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    Header,
    Footer,
    HeroBanner,
    DoctorsSection,
    ClinicFeatures,
    ClinicSpecialties,
    BlogSection
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}