export interface User {
  id?: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department?: string;
  phone?: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}