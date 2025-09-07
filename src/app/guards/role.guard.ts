import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowed = route.data['roles'] as string[] | undefined;
    const role = this.auth.getUserRole();

    if (role && allowed?.includes(role)) {
      return true;
    }

    // Smart redirect by role, else to login
    if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else if (role === 'EMPLOYEE') this.router.navigate(['/employee/menu']);
    else this.router.navigate(['/auth/login']);

    return false;
  }
}
