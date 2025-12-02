import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { Login } from './pages/auth/login/login';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashbroad } from './pages/admin/dashbroad/dashbroad';
import { provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { Register } from './pages/auth/register/register';
import { DoctorProfile } from './pages/doctor-profile/doctor-profile';
import { Home } from './pages/home/home';
import { Booking } from './pages/booking/booking';
import { Checkout } from './pages/checkout/checkout';
import { BookingSuccess } from './pages/booking-success/booking-success';
import { InvoiceView } from './pages/invoice-view/invoice-view';
import { PatientAppointments } from './pages/patient/patient-appointments/patient-appointments';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Home
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
        path: 'patient/appointments',
        component: PatientAppointments
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
  },
  {
    path: '**',
    redirectTo: ''
  }
];
