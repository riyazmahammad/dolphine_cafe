import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonStorageService {
  private readonly baseUrl = '/assets/data/';
  
  // Cache subjects for real-time updates
  private loginDataSubject = new BehaviorSubject<any>(null);
  private signupDataSubject = new BehaviorSubject<any>(null);
  private productsDataSubject = new BehaviorSubject<any>(null);
  private ordersDataSubject = new BehaviorSubject<any>(null);

  public loginData$ = this.loginDataSubject.asObservable();
  public signupData$ = this.signupDataSubject.asObservable();
  public productsData$ = this.productsDataSubject.asObservable();
  public ordersData$ = this.ordersDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeData();
  }

  private initializeData(): void {
    // Load all JSON files on service initialization
    this.loadLoginData().subscribe();
    this.loadSignupData().subscribe();
    this.loadProductsData().subscribe();
    this.loadOrdersData().subscribe();
  }

  // Login Data Operations
  loadLoginData(): Observable<any> {
    return this.http.get(`${this.baseUrl}login.json`).pipe(
      tap(data => this.loginDataSubject.next(data)),
      catchError(error => {
        console.error('Error loading login data:', error);
        return throwError(() => error);
      })
    );
  }

  saveLoginData(data: any): Observable<any> {
    // In a real environment, this would make a POST/PUT request to save the file
    // For demo purposes, we'll simulate the save and update the subject
    return new Observable(observer => {
      setTimeout(() => {
        this.loginDataSubject.next(data);
        observer.next({ success: true, message: 'Login data saved successfully' });
        observer.complete();
      }, 300);
    });
  }

  // Signup Data Operations
  loadSignupData(): Observable<any> {
    return this.http.get(`${this.baseUrl}signup.json`).pipe(
      tap(data => this.signupDataSubject.next(data)),
      catchError(error => {
        console.error('Error loading signup data:', error);
        return throwError(() => error);
      })
    );
  }

  saveSignupData(data: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        this.signupDataSubject.next(data);
        observer.next({ success: true, message: 'Signup data saved successfully' });
        observer.complete();
      }, 300);
    });
  }

  // Products Data Operations
  loadProductsData(): Observable<any> {
    return this.http.get(`${this.baseUrl}products.json`).pipe(
      tap(data => this.productsDataSubject.next(data)),
      catchError(error => {
        console.error('Error loading products data:', error);
        return throwError(() => error);
      })
    );
  }

  saveProductsData(data: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        this.productsDataSubject.next(data);
        observer.next({ success: true, message: 'Products data saved successfully' });
        observer.complete();
      }, 300);
    });
  }

  // Orders Data Operations
  loadOrdersData(): Observable<any> {
    return this.http.get(`${this.baseUrl}orders.json`).pipe(
      tap(data => this.ordersDataSubject.next(data)),
      catchError(error => {
        console.error('Error loading orders data:', error);
        return throwError(() => error);
      })
    );
  }

  saveOrdersData(data: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        this.ordersDataSubject.next(data);
        observer.next({ success: true, message: 'Orders data saved successfully' });
        observer.complete();
      }, 300);
    });
  }

  // Utility Methods
  getCurrentLoginData(): any {
    return this.loginDataSubject.value;
  }

  getCurrentSignupData(): any {
    return this.signupDataSubject.value;
  }

  getCurrentProductsData(): any {
    return this.productsDataSubject.value;
  }

  getCurrentOrdersData(): any {
    return this.ordersDataSubject.value;
  }

  // Simulate network delay for realistic UX
  private simulateDelay(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(null);
        observer.complete();
      }, Math.random() * 500 + 200);
    });
  }
}