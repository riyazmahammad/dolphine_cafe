import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { DataService } from '../../../services/data.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const dataSpy = jasmine.createSpyObj('DataService', ['resetPassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      queryParams: of({ email: 'test@test.com', otp: '123456' })
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule],
      providers: [
        { provide: DataService, useValue: dataSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with email and OTP from query params', () => {
    component.ngOnInit();
    
    expect(component.email).toBe('test@test.com');
    expect(component.otp).toBe('123456');
  });

  it('should validate password matching', () => {
    component.ngOnInit();
    
    component.resetPasswordForm.patchValue({
      password: 'password123',
      confirmPassword: 'differentpassword'
    });
    
    expect(component.resetPasswordForm.get('confirmPassword')?.hasError('mismatch')).toBeTruthy();
  });

  it('should reset password successfully', () => {
    const mockResponse = { message: 'Password reset successfully!' };
    dataService.resetPassword.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.resetPasswordForm.patchValue({
      password: 'newpassword123',
      confirmPassword: 'newpassword123'
    });
    
    component.onSubmit();
    
    expect(dataService.resetPassword).toHaveBeenCalledWith('test@test.com', '123456', 'newpassword123');
  });

  it('should handle reset password error', () => {
    dataService.resetPassword.and.returnValue(
      throwError(() => ({ message: 'Invalid or expired reset request' }))
    );
    
    component.ngOnInit();
    component.resetPasswordForm.patchValue({
      password: 'newpassword123',
      confirmPassword: 'newpassword123'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Invalid or expired reset request');
    expect(component.loading).toBeFalsy();
  });
});