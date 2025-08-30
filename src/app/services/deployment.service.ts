import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  
  constructor() {}

  getCurrentSubdomain(): string | null {
    if (typeof window === 'undefined') return null;
    
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2) {
      return parts[0];
    }
    
    return null;
  }

  getPortalType(): 'admin' | 'employee' | 'main' {
    const subdomain = this.getCurrentSubdomain();
    
    if (subdomain === environment.deployment.adminSubdomain) {
      return 'admin';
    } else if (subdomain === environment.deployment.employeeSubdomain) {
      return 'employee';
    }
    
    return 'main';
  }

  getRedirectUrl(userRole: 'ADMIN' | 'EMPLOYEE'): string {
    if (environment.deployment.type === 'subdomain') {
      const subdomain = userRole === 'ADMIN' ? 
        environment.deployment.adminSubdomain : 
        environment.deployment.employeeSubdomain;
      
      const protocol = window.location.protocol;
      const domain = environment.deployment.mainDomain;
      
      if (userRole === 'ADMIN') {
        return `${protocol}//${subdomain}.${domain}/admin/dashboard`;
      } else {
        return `${protocol}//${subdomain}.${domain}/employee/menu`;
      }
    }
    
    // Fallback to path-based routing
    return userRole === 'ADMIN' ? '/admin/dashboard' : '/employee/menu';
  }

  shouldShowPortal(requiredRole: 'ADMIN' | 'EMPLOYEE'): boolean {
    const portalType = this.getPortalType();
    
    if (portalType === 'main') {
      return true; // Main domain shows all portals
    }
    
    return (portalType === 'admin' && requiredRole === 'ADMIN') ||
           (portalType === 'employee' && requiredRole === 'EMPLOYEE');
  }

  getPortalTitle(): string {
    const portalType = this.getPortalType();
    
    switch (portalType) {
      case 'admin':
        return `${environment.appName} - Admin Portal`;
      case 'employee':
        return `${environment.appName} - Employee Portal`;
      default:
        return environment.appName;
    }
  }

  getPortalTheme(): string {
    const portalType = this.getPortalType();
    
    switch (portalType) {
      case 'admin':
        return 'admin-theme';
      case 'employee':
        return 'employee-theme';
      default:
        return 'default-theme';
    }
  }
}