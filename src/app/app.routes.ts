import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Authentication
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./components/auth/signup/signup.component').then(m => m.SignupComponent)
      }
    ]
  },

  // Admin
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./components/admin/menu-management/menu-management.component').then(m => m.MenuManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/admin/order-management/order-management.component').then(m => m.OrderManagementComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Employee
  {
    path: 'employee',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['EMPLOYEE'] },
    children: [
      {
        path: 'menu',
        loadComponent: () => import('./components/employee/menu-browse/menu-browse.component').then(m => m.MenuBrowseComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/employee/order-history/order-history.component').then(m => m.OrderHistoryComponent)
      },
      { path: '', redirectTo: 'menu', pathMatch: 'full' }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/auth/login' }
];
