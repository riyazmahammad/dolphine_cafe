import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type Role = 'ADMIN' | 'EMPLOYEE';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://3.149.27.197:8080/dolphine/user';
  private TOKEN_KEY = 'token';
  private ROLE_KEY = 'userRole';

  constructor(private http: HttpClient) {}

  /** ✅ Login API Integration */
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.apiUrl}/signin`, body).pipe(
      map((response: any) => {
        if (response && response.token) {
          this.setSession(response.token, response.role || 'EMPLOYEE');
        }
        return response;
      })
    );
  }

  /** ✅ Signup API Integration */
  signup(payload: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }

  /** ✅ Logout */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  /** ✅ Session Handling */
  setSession(token: string, role: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.ROLE_KEY, role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
