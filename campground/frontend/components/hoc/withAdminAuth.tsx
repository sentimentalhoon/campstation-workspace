/**
 * withAdminAuth HOC
 * ADMIN 권한이 필요한 페이지를 보호하는 고차 컴포넌트
 */

"use client";

import { useAuth } from "@/contexts";
import { useToast } from "@/hooks/ui/useToast";
import { ROUTES } from "@/lib/constants";
import { canAccessAdminDashboard } from "@/lib/utils/permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
      // 로딩 중이면 대기
      if (isLoading) return;

      // 로그인하지 않은 경우
      if (!user) {
        router.push(ROUTES.AUTH.LOGIN);
        return;
      }

      // ADMIN 권한이 아닌 경우
      if (!canAccessAdminDashboard(user)) {
        toast.error("관리자만 접근할 수 있습니다.");
        router.push(ROUTES.HOME);
        return;
      }
    }, [user, isLoading, router, toast]);

    // 로딩 중
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary-600 inline-block h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="mt-4 text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      );
    }

    // 권한 없음
    if (!canAccessAdminDashboard(user)) {
      return null;
    }

    // 권한 있음 - 컴포넌트 렌더링
    return <Component {...props} />;
  };
}
