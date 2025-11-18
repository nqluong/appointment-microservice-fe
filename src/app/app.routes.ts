import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { Login } from './pages/auth/login/login';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashbroad } from './pages/admin/dashbroad/dashbroad';
import { provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { Register } from './pages/auth/register/register';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout
    // loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout)
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
