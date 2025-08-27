import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent implements OnInit {
  otpForm!: FormGroup;
  loading = false;
  resending = false;
  errorMessage = '';
  successMessage = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.otpForm.valid && this.email) {
      this.loading = true;
      this.errorMessage = '';

      const otpRequest = {
        email: this.email,
        otp: this.otpForm.value.otp
      };

      this.authService.verifyOtp(otpRequest).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Account verified successfully!';
          
          setTimeout(() => {
            const user = response.user;
            if (user.role === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/employee/menu']);
            }
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
        }
      });
    }
  }

  resendOtp(): void {
    if (this.email) {
      this.resending = true;
      this.errorMessage = '';

      this.authService.resendOtp(this.email).subscribe({
        next: (response) => {
          this.resending = false;
          this.successMessage = response.message;
        },
        error: (error) => {
          this.resending = false;
          this.errorMessage = error.error?.message || 'Failed to resend OTP.';
        }
      });
    }
  }

  get otp() { return this.otpForm.get('otp'); }
}