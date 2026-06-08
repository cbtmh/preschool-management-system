export interface LoginRequest {
  username: string; // Phone number
  password: string;
}

export interface AuthData {
  token: string;
  role: 'TEACHER' | 'PARENT' | 'ADMIN';
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface ParentProfile {
  parentId: number;
  fullName: string;
  address: string;
  children: any[];
}

export interface MeResponse {
  userId: number;
  username: string;
  role: string;
  profile: ParentProfile | any;
  requiresPasswordChange: boolean;
}
