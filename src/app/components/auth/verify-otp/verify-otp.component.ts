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
  email = '';
  purpose: 'signup' | 'reset' = 'signup';
  loading = false;
  resending = false;
  errorMessage = '';
  successMessage = '';
  countdown = 0;
  countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.purpose = params['purpose'] || 'signup';
      
      if (!this.email) {
        this.router.navigate(['/auth/login']);
        return;
      }
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown(): void {
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const otpRequest = {
        email: this.email,
        otp: this.otpForm.value.otp
      };

      this.authService.verifyOtp(otpRequest).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message;
          
          if (this.purpose === 'signup') {
            setTimeout(() => {
              const user = response.user;
              if (user.role === 'ADMIN') {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/employee/menu']);
              }
            }, 1500);
          } else {
            // For password reset, navigate to reset password form
            setTimeout(() => {
              this.router.navigate(['/auth/reset-password'], { 
                queryParams: { email: this.email, otp: this.otpForm.value.otp } 
              });
            }, 1500);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'OTP verification failed. Please try again.';
        }
      });
    }
  }

  resendOtp(): void {
    if (this.countdown > 0) return;
    
    this.resending = true;
    this.errorMessage = '';

    this.authService.resendOtp(this.email).subscribe({
      next: (response) => {
        this.resending = false;
        this.successMessage = response.message;
        this.startCountdown();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.resending = false;
        this.errorMessage = error.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }

  goBack(): void {
    if (this.purpose === 'signup') {
      this.router.navigate(['/auth/signup']);
    } else {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  get otp() { return this.otpForm.get('otp'); }
}