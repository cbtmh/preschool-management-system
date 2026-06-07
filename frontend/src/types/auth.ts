// Auth Types
export type Role = "ADMIN" | "TEACHER" | "PARENT";

export interface AuthResponse {
  token: string;
  userId: number;
  username: string; // Used as Phone Number
  role: Role;
  requiresPasswordChange: boolean;
}

export interface MeResponse {
  userId: number;
  username: string;
  role: Role;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any | null; // Null for ADMIN, or TeacherDto/ParentDto for others
  requiresPasswordChange: boolean;
}

// Request Payloads
export interface LoginRequest {
  username: string; // Phone number, @NotBlank
  password: string; // @NotBlank
}

export interface ChangePasswordRequest {
  oldPassword: string; // @NotBlank
  newPassword: string; // @NotBlank
}
