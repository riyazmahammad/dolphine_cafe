import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.username, this.password).subscribe({
      next: ({ user }) => {
        this.loading = false;
        // Redirect by role
        if (user.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/employee/menu']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = (err?.error?.message) || err?.message || 'Login failed';
        console.error('Login error:', err);
      }
    });
  }
}
