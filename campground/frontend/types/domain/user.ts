/**
 * 사용자 도메인 타입
 */

export type UserRole = "MEMBER" | "OWNER" | "ADMIN";

export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  status: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
  originalUrl: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
  role?: "MEMBER" | "OWNER";
};

export type UpdateProfileData = {
  name?: string;
  phone?: string;
  thumbnailUrl?: string;
  originalUrl?: string;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};
