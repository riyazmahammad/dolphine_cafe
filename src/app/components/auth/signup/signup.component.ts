import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, SignupRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['EMPLOYEE', [Validators.required]],
      department: [''],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-()]+$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const conf = group.get('confirmPassword')?.value;
    if (pass && conf && pass !== conf) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const ctrl = group.get('confirmPassword');
      if (ctrl?.hasError('mismatch')) ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    return null;
  }

  submit(): void {
    if (this.form.invalid) return;

    const { confirmPassword, ...raw } = this.form.value;
    const payload: SignupRequest = {
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role,
      department: raw.department || undefined,
      phone: raw.phone || undefined
    };

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.signup(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res?.message || 'Signup successful! You can now log in.';
        // Navigate soon after success
        setTimeout(() => this.router.navigate(['/auth/login']), 800);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Signup failed';
        console.error('Signup error:', err);
      }
    });
  }

  // convenience getters
  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }
  get role() { return this.form.get('role'); }
  get department() { return this.form.get('department'); }
  get phone() { return this.form.get('phone'); }
}
