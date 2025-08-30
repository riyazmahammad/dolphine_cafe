import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { DeploymentService } from '../../../services/deployment.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;
  portalTitle = '';
  portalTheme = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private deploymentService: DeploymentService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.portalTitle = this.deploymentService.getPortalTitle();
    this.portalTheme = this.deploymentService.getPortalTheme();
    
    // Add theme class to body
    document.body.className = this.portalTheme;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get isEmployee(): boolean {
    return this.currentUser?.role === 'EMPLOYEE';
  }
}