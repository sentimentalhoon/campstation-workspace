/**
 * OAuth2 관련 타입 정의
 */

import type { User } from "./domain";

/**
 * OAuth2 제공자
 */
export type OAuthProvider = "kakao" | "naver";

/**
 * OAuth2 인증 응답
 */
export type OAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

/**
 * OAuth2 에러 응답
 */
export type OAuthError = {
  error: string;
  error_description?: string;
};
