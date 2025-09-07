export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}
