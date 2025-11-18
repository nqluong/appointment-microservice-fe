export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  userRoles: string[];
}

export interface UserInfo {
  userId: string;
  email: string;
  userRoles: string[];
}