import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && requiredRoles.includes(currentUser.role)) {
      return true;
    }
    
    // Redirect based on user role
    if (currentUser?.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (currentUser?.role === 'EMPLOYEE') {
      this.router.navigate(['/employee/menu']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    
    return false;
  }
}