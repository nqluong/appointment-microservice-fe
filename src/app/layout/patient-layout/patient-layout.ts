import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PatientSidebar } from '../../pages/patient/patient-sidebar/patient-sidebar';
import { Footer } from "../components/footer/footer";
import { Header } from "../components/header/header";

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PatientSidebar, Footer, Header],
  templateUrl: './patient-layout.html',
  styleUrl: './patient-layout.css'
})
export class PatientLayout {}
