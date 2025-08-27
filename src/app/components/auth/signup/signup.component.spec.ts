import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SignupComponent } from './signup.component';
import { AuthService } from '../../../services/auth.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['signup']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with validators', () => {
    component.ngOnInit();
    
    expect(component.signupForm.get('name')?.hasError('required')).toBeTruthy();
    expect(component.signupForm.get('email')?.hasError('required')).toBeTruthy();
    expect(component.signupForm.get('password')?.hasError('required')).toBeTruthy();
  });

  it('should validate password matching', () => {
    component.ngOnInit();
    
    component.signupForm.patchValue({
      password: 'password123',
      confirmPassword: 'differentpassword'
    });
    
    expect(component.signupForm.get('confirmPassword')?.hasError('mismatch')).toBeTruthy();
  });

  it('should call signup service on form submission', () => {
    const mockResponse = { message: 'Signup successful' };
    authService.signup.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.signupForm.patchValue({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'EMPLOYEE'
    });
    
    component.onSubmit();
    
    expect(authService.signup).toHaveBeenCalled();
  });
});