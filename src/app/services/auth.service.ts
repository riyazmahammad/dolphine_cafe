import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, OtpRequest, AuthResponse } from '../models/user.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private dataService: DataService) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.dataService.authenticateUser(loginRequest.email, loginRequest.password)
      .pipe(map(response => {
        this.setAuthData(response);
        return response;
      }));
  }

  signup(signupRequest: SignupRequest): Observable<{ message: string }> {
    return this.dataService.createUser(signupRequest);
  }

  verifyOtp(otpRequest: OtpRequest): Observable<AuthResponse> {
    // For local JSON, we'll simulate OTP verification by just logging in the user
    return this.dataService.authenticateUser(otpRequest.email, 'dummy_password')
      .pipe(map(response => {
        this.setAuthData(response);
        return response;
      }));
  }

  resendOtp(email: string): Observable<{ message: string }> {
    // Simulate OTP resend
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'OTP resent successfully' });
        observer.complete();
      }, 500);
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isEmployee(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'EMPLOYEE';
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(response.user);
  }
}