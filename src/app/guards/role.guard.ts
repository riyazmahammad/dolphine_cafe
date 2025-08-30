import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DeploymentService } from '../services/deployment.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private deploymentService: DeploymentService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && requiredRoles.includes(currentUser.role)) {
      // Check if user should access this portal based on subdomain
      if (!this.deploymentService.shouldShowPortal(currentUser.role)) {
        const redirectUrl = this.deploymentService.getRedirectUrl(currentUser.role);
        if (redirectUrl.startsWith('http')) {
          window.location.href = redirectUrl;
        } else {
          this.router.navigate([redirectUrl]);
        }
        return false;
      }
      return true;
    }
    
    // Redirect based on user role
    if (currentUser?.role === 'ADMIN') {
      const redirectUrl = this.deploymentService.getRedirectUrl('ADMIN');
      if (redirectUrl.startsWith('http')) {
        window.location.href = redirectUrl;
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    } else if (currentUser?.role === 'EMPLOYEE') {
      const redirectUrl = this.deploymentService.getRedirectUrl('EMPLOYEE');
      if (redirectUrl.startsWith('http')) {
        window.location.href = redirectUrl;
      } else {
        this.router.navigate(['/employee/menu']);
      }
    } else {
      this.router.navigate(['/auth/login']);
    }
    
    return false;
  }
}