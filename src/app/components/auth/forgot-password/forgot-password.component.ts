import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.forgotPasswordForm.value.email;

      this.dataService.initiatePasswordReset(email).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message;
          setTimeout(() => {
            this.router.navigate(['/auth/verify-otp'], { 
              queryParams: { email, purpose: 'reset' } 
            });
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to send reset code. Please try again.';
        }
      });
    }
  }

  get email() { return this.forgotPasswordForm.get('email'); }
}