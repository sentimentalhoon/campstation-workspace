/**
 * 권한 체크 유틸리티 함수
 */

import type { User, UserRole } from "@/types/domain";

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasRole(
  userRole: UserRole | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  // ADMIN은 모든 권한을 가짐
  if (userRole === "ADMIN") return true;

  // 정확히 일치하는 권한 확인
  return userRole === requiredRole;
}

/**
 * 사용자가 여러 권한 중 하나를 가지고 있는지 확인
 */
export function hasAnyRole(
  userRole: UserRole | undefined,
  requiredRoles: UserRole[]
): boolean {
  if (!userRole) return false;

  // ADMIN은 모든 권한을 가짐
  if (userRole === "ADMIN") return true;

  // 하나라도 일치하는 권한이 있는지 확인
  return requiredRoles.includes(userRole);
}

/**
 * OWNER 권한 확인 (OWNER 또는 ADMIN)
 */
export function isOwner(userRole: UserRole | undefined): boolean {
  return hasAnyRole(userRole, ["OWNER", "ADMIN"]);
}

/**
 * ADMIN 권한 확인
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "ADMIN";
}

/**
 * 인증된 사용자인지 확인
 */
export function isAuthenticated(userRole: UserRole | undefined): boolean {
  return !!userRole;
}

/**
 * User 객체를 받아서 권한 체크
 */
export function canAccessOwnerDashboard(user: User | null): boolean {
  return user ? isOwner(user.role) : false;
}

/**
 * User 객체를 받아서 관리자 권한 체크
 */
export function canAccessAdminDashboard(user: User | null): boolean {
  return user ? isAdmin(user.role) : false;
}

/**
 * 특정 캠핑장의 소유자인지 확인
 */
export function isCampgroundOwner(
  user: User | null,
  campgroundOwnerId: number
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true; // 관리자는 모든 캠핑장 수정 가능
  return user.role === "OWNER" && user.id === campgroundOwnerId;
}
