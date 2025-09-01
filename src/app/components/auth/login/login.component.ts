import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DeploymentService } from '../../../services/deployment.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private deploymentService: DeploymentService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          const user = response.user;
          
          // Use deployment service for subdomain routing
          const redirectUrl = this.deploymentService.getRedirectUrl(user.role);
          
          if (redirectUrl.startsWith('http')) {
            window.location.href = redirectUrl;
          } else {
            if (user.role === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/employee/menu']);
            }
          }
        },
        error: (error) => {
          this.loading = false;
          if (error.message === 'Account is not active. Please verify your email first.') {
            this.errorMessage = 'Please verify your email address first.';
            setTimeout(() => {
              this.router.navigate(['/auth/verify-otp'], { 
                queryParams: { email: this.loginForm.value.email, purpose: 'signup' } 
              });
            }, 2000);
          } else {
            this.errorMessage = error.message || 'Login failed. Please try again.';
          }
            this.errorMessage = 'Please verify your email address first.';
            setTimeout(() => {
              this.router.navigate(['/auth/verify-otp'], { 
                queryParams: { email: this.loginForm.value.email, purpose: 'signup' } 
              });
            }, 2000);
          } else {
            this.errorMessage = error.message || 'Login failed. Please try again.';
          }
        }
      });
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}