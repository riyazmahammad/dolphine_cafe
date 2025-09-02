import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, OtpRequest, AuthResponse } from '../models/user.model';
import { DataService } from './data.service';
import { JsonStorageService } from './json-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private dataService: DataService,
    private jsonStorage: JsonStorageService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    // Check for active session from login.json
    this.jsonStorage.loadLoginData().subscribe(loginData => {
      const storedToken = sessionStorage.getItem('currentToken');
      const storedUserId = sessionStorage.getItem('currentUserId');
      
      if (storedToken && storedUserId) {
        const session = loginData.sessions[storedUserId];
        if (session && session.token === storedToken) {
          const user = loginData.users.find((u: any) => u.id === parseInt(storedUserId));
          if (user) {
            this.tokenSubject.next(storedToken);
            this.currentUserSubject.next(user);
          }
        }
      }
    });
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
    return this.dataService.verifyOTP(otpRequest.email, otpRequest.otp)
      .pipe(map(response => {
        this.setAuthData(response);
        return response;
      }));
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.dataService.resendOTP(email);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.dataService.initiatePasswordReset(email);
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return this.dataService.resetPassword(email, otp, newPassword);
  }

  verifyOtp(otpRequest: OtpRequest): Observable<AuthResponse> {
    return this.dataService.verifyOTP(otpRequest.email, otpRequest.otp)
      .pipe(map(response => {
        this.setAuthData(response);
        return response;
      }));
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.dataService.resendOTP(email);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.dataService.initiatePasswordReset(email);
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return this.dataService.resetPassword(email, otp, newPassword);
  }

  logout(): void {
    sessionStorage.removeItem('currentToken');
    sessionStorage.removeItem('currentUserId');
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
    sessionStorage.setItem('currentToken', response.token);
    sessionStorage.setItem('currentUserId', response.user.id!.toString());
    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(response.user);
  }
}