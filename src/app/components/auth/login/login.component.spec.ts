import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with validators', () => {
    component.ngOnInit();
    
    expect(component.loginForm.get('email')?.hasError('required')).toBeTruthy();
    expect(component.loginForm.get('password')?.hasError('required')).toBeTruthy();
  });

  it('should navigate to admin dashboard for admin users', () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'admin@test.com', name: 'Admin', role: 'ADMIN' as const },
      message: 'Login successful'
    };
    
    authService.login.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.loginForm.patchValue({
      email: 'admin@test.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should navigate to employee menu for employee users', () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 2, email: 'employee@test.com', name: 'Employee', role: 'EMPLOYEE' as const },
      message: 'Login successful'
    };
    
    authService.login.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.loginForm.patchValue({
      email: 'employee@test.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/employee/menu']);
  });

  it('should display error message on login failure', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => errorResponse));
    
    component.ngOnInit();
    component.loginForm.patchValue({
      email: 'test@test.com',
      password: 'wrongpassword'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.loading).toBeFalsy();
  });
});