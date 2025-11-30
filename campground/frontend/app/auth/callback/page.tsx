/**
 * OAuth2 콜백 페이지
 * 백엔드 Spring Security OAuth2 처리 후 리다이렉트되는 페이지
 * 토큰은 HttpOnly 쿠키로 이미 설정되어 있음
 */

"use client";

import { useAuth } from "@/contexts";
import { oauthApi } from "@/lib/api/oauth";
import { ROUTES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터 확인
        const success = searchParams.get("success");
        const errorParam = searchParams.get("error");

        // 에러 체크
        if (errorParam) {
          throw new Error(`로그인 실패: ${errorParam}`);
        }

        // 성공 체크
        if (success !== "true") {
          throw new Error("로그인에 실패했습니다");
        }

        // 백엔드에서 이미 JWT 토큰을 HttpOnly 쿠키로 설정했음
        // 사용자 정보 조회
        const user = await oauthApi.getUserProfile();

        // 사용자 정보 저장 (AuthContext)
        setUser(user);

        // 이전 페이지 or 홈으로 리다이렉트
        const redirectTo =
          sessionStorage.getItem("redirectAfterLogin") || ROUTES.HOME;
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectTo);
      } catch (err) {
        console.error("OAuth 콜백 처리 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "로그인에 실패했습니다. 다시 시도해주세요."
        );
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-6xl">❌</div>
            <h1 className="text-2xl font-bold text-red-600">로그인 실패</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-white active:opacity-80"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">로그인 처리 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
