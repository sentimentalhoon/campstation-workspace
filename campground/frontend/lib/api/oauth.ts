/**
 * OAuth2 인증 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type { User } from "@/types";
import type { OAuthResponse } from "@/types/oauth";
import { get, post } from "./client";

/**
 * OAuth2 관련 API
 */
export const oauthApi = {
  /**
   * 카카오 로그인
   */
  loginWithKakao: (code: string) =>
    post<OAuthResponse>(API_ENDPOINTS.OAUTH.KAKAO, { code }),

  /**
   * 네이버 로그인
   */
  loginWithNaver: (code: string) =>
    post<OAuthResponse>(API_ENDPOINTS.OAUTH.NAVER, { code }),

  /**
   * 사용자 프로필 조회
   */
  getUserProfile: () => get<User>(API_ENDPOINTS.AUTH.ME),

  /**
   * 토큰 갱신
   */
  refreshToken: (refreshToken: string) =>
    post<{ accessToken: string }>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
};

/**
 * OAuth2 URL 생성 헬퍼
 * 백엔드 redirect_uri로 직접 이동 (Spring Security OAuth2가 자동 처리)
 */
export const oauthUtils = {
  /**
   * 카카오 OAuth2 URL 생성
   * 백엔드로 직접 OAuth 요청 → Spring Security가 자동 처리 → /auth/callback으로 리다이렉트
   */
  getKakaoAuthUrl: () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:8080";
    // 백엔드 OAuth2 엔드포인트로 직접 리다이렉트
    return `${apiUrl}/oauth2/authorization/kakao`;
  },

  /**
   * 네이버 OAuth2 URL 생성
   */
  getNaverAuthUrl: () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:8080";
    return `${apiUrl}/oauth2/authorization/naver`;
  },
};
