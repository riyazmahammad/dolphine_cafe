import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ForgotPasswordComponent } from './forgot-password.component';
import { DataService } from '../../../services/data.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const dataSpy = jasmine.createSpyObj('DataService', ['initiatePasswordReset']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule],
      providers: [
        { provide: DataService, useValue: dataSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with email validator', () => {
    component.ngOnInit();
    
    expect(component.forgotPasswordForm.get('email')?.hasError('required')).toBeTruthy();
  });

  it('should initiate password reset successfully', () => {
    const mockResponse = { message: 'Reset code sent successfully' };
    dataService.initiatePasswordReset.and.returnValue(of(mockResponse));
    
    component.ngOnInit();
    component.forgotPasswordForm.patchValue({ email: 'test@test.com' });
    
    component.onSubmit();
    
    expect(dataService.initiatePasswordReset).toHaveBeenCalledWith('test@test.com');
  });

  it('should handle error when user not found', () => {
    dataService.initiatePasswordReset.and.returnValue(
      throwError(() => ({ message: 'No account found with this email address' }))
    );
    
    component.ngOnInit();
    component.forgotPasswordForm.patchValue({ email: 'nonexistent@test.com' });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('No account found with this email address');
    expect(component.loading).toBeFalsy();
  });
});