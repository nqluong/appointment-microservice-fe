import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { Login } from './pages/auth/login/login';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { PatientLayout } from './layout/patient-layout/patient-layout';
import { Register } from './pages/auth/register/register';
import { DoctorProfile } from './pages/doctor-profile/doctor-profile';
import { Home } from './pages/home/home';
import { Booking } from './pages/booking/booking';
import { Checkout } from './pages/checkout/checkout';
import { BookingSuccess } from './pages/booking-success/booking-success';
import { InvoiceView } from './pages/invoice-view/invoice-view';
import { PatientAppointments } from './pages/patient/patient-appointments/patient-appointments';
import { DetailAppointments } from './pages/patient/detail-appointments/detail-appointments';
import { SpecialtyDetail } from './pages/specialty-detail/specialty-detail';
import { Doctor } from './pages/admin/doctor/doctor';
import { Dashbroad } from './pages/admin/dashbroad/dashbroad';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Home,
        pathMatch: 'full'
      },
      {
        path: 'doctor-profile/:id',
        component: DoctorProfile
      },
      {
        path: 'booking',
        component: Booking
      },
      {
        path: 'checkout',
        component: Checkout
      },
      {
        path: 'booking-success',
        component: BookingSuccess
      },
      {
        path: 'invoice/:id',
        component: InvoiceView
      },
      {
        path: 'specialties/:id',
        component: SpecialtyDetail
      }
    ]
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    // canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Dashbroad,
        pathMatch: 'full'
      },
      {
        path: 'doctor',
        component: Doctor
      }
    ]
  },
  {
    path: 'patient',
    component: PatientLayout,
    children: [
      {
        path: 'appointments',
        component: PatientAppointments
      },
      {
        path: 'appointments/:id',
        component: DetailAppointments
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
