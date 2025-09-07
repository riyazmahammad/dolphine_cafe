import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, AuthResponse, LoginRequest, SignupRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://3.149.27.197:8080/dolphine/user/signin';

  constructor(private http: HttpClient) {}

  /**
   * 🔐 Login - Connects to real backend API
   */
  authenticateUser(email: string, password: string): Observable<AuthResponse> {
    const loginPayload = { email, password };

    return this.http.post<any>(`${this.apiUrl}/signin`, loginPayload).pipe(
      map(response => {
        if (response.result) {
          const user: User = {
            email: response.data.email,
            username: response.data.username,
            role: response.role
          };

          return {
            token: response.token,
            user
          };
        } else {
          throw new Error('Login failed');
        }
      })
    );
  }

  /**
   * 📝 Signup (You may update this later for your backend)
   */
  createUser(signupRequest: SignupRequest): Observable<{ message: string }> {
    // For now, just simulate signup success
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'Signup simulated (connect to real API here)' });
        observer.complete();
      }, 500);
    });
  }

  /**
   * 🔁 OTP Verification (optional - placeholder)
   */
  verifyOTP(email: string, otp: string): Observable<AuthResponse> {
    // Simulate OTP verification
    return new Observable(observer => {
      setTimeout(() => {
        const user: User = {
          email,
          username: 'Simulated User',
          role: 'EMPLOYEE'
        };
        observer.next({ token: 'dummy-token', user });
        observer.complete();
      }, 500);
    });
  }

  /**
   * 🔁 Resend OTP (optional - placeholder)
   */
  resendOTP(email: string): Observable<{ message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'OTP resent (simulated)' });
        observer.complete();
      }, 500);
    });
  }

  /**
   * 🔐 Forgot password (optional - placeholder)
   */
  initiatePasswordReset(email: string): Observable<{ message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'Password reset initiated (simulated)' });
        observer.complete();
      }, 500);
    });
  }

  /**
   * 🔐 Reset password (optional - placeholder)
   */
  resetPassword(email: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'Password reset successful (simulated)' });
        observer.complete();
      }, 500);
    });
  }
}
