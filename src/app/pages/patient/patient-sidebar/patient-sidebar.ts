import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
  selector: 'app-patient-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-sidebar.html',
  styleUrl: './patient-sidebar.css',
})
export class PatientSidebar implements OnInit {
 currentUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getPatientId(): string {
    return this.currentUser?.userId || 'N/A';
  }

  getPatientName(): string {
    return this.currentUser?.fullName || 'Patient';
  }

  getPatientAvatar(): string {
    return this.currentUser?.avatar || 'assets/img/doctors-dashboard/profile-06.jpg';
  }
}
