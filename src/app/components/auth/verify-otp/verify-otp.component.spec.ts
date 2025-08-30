import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { VerifyOtpComponent } from './verify-otp.component';
import { AuthService } from '../../../services/auth.service';

describe('VerifyOtpComponent', () => {
  let component: VerifyOtpComponent;
  let fixture: ComponentFixture<VerifyOtpComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['verifyOtp', 'resendOtp']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      queryParams: of({ email: 'test@test.com', purpose: 'signup' })
    };

    await TestBed.configureTestingModule({
      imports: [VerifyOtpComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyOtpComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with email and purpose from query params', () => {
    component.ngOnInit();
    
    expect(component.email).toBe('test@test.com');
    expect(component.purpose).toBe('signup');
  });

  it('should verify OTP successfully', () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'test@test.com', name: 'Test User', role: 'EMPLOYEE' as const },
      message: 'Email verified successfully!'
    };
    
    authService.verifyOtp.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.otpForm.patchValue({ otp: '123456' });
    
    component.onSubmit();
    
    expect(authService.verifyOtp).toHaveBeenCalledWith({
      email: 'test@test.com',
      otp: '123456'
    });
  });

  it('should resend OTP', () => {
    const mockResponse = { message: 'OTP resent successfully' };
    authService.resendOtp.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.countdown = 0;
    
    component.resendOtp();
    
    expect(authService.resendOtp).toHaveBeenCalledWith('test@test.com');
  });

  it('should handle OTP verification error', () => {
    authService.verifyOtp.and.returnValue(throwError(() => ({ message: 'Invalid OTP' })));
    
    component.ngOnInit();
    component.otpForm.patchValue({ otp: '123456' });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Invalid OTP');
    expect(component.loading).toBeFalsy();
  });
});