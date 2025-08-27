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

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['verifyOtp', 'resendOtp']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    routeSpy.snapshot = { queryParams: { email: 'test@test.com' } };

    await TestBed.configureTestingModule({
      imports: [VerifyOtpComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyOtpComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with email from query params', () => {
    component.ngOnInit();
    expect(component.email).toBe('test@test.com');
  });

  it('should validate OTP format', () => {
    component.ngOnInit();
    
    const otpControl = component.otpForm.get('otp');
    otpControl?.setValue('123');
    expect(otpControl?.hasError('pattern')).toBeTruthy();
    
    otpControl?.setValue('123456');
    expect(otpControl?.hasError('pattern')).toBeFalsy();
  });

  it('should call verifyOtp service on form submission', () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'test@test.com', name: 'Test', role: 'EMPLOYEE' as const },
      message: 'Verified successfully'
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

  it('should call resendOtp service', () => {
    const mockResponse = { message: 'OTP resent successfully' };
    authService.resendOtp.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.resendOtp();
    
    expect(authService.resendOtp).toHaveBeenCalledWith('test@test.com');
  });
});