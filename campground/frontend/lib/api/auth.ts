/**
 * 인증 API
 *
 * @module lib/api/auth
 * @description 사용자 인증 관련 API (로그인, 회원가입, 로그아웃 등)
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type { JwtResponse, LoginRequest, RegisterRequest, User } from "@/types";
import { get, post } from "./client";

/**
 * 인증 관련 API
 */
export const authApi = {
  /**
   * 로그인
   *
   * @param credentials - 로그인 정보 (이메일, 비밀번호)
   * @returns JWT 토큰 및 사용자 정보
   * @throws {ApiError} 401 - 인증 실패, 400 - 잘못된 요청
   *
   * @example
   * ```ts
   * const result = await authApi.login({
   *   email: "user@example.com",
   *   password: "password123"
   * });
   * ```
   */
  login: (credentials: LoginRequest) =>
    post<JwtResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  /**
   * 회원가입
   *
   * @param data - 회원가입 정보 (이메일, 비밀번호, 이름, 전화번호, 역할)
   * @returns JWT 토큰 및 사용자 정보
   * @throws {ApiError} 409 - 이미 존재하는 이메일, 400 - 검증 실패
   *
   * @example
   * ```ts
   * const result = await authApi.register({
   *   email: "newuser@example.com",
   *   password: "password123",
   *   passwordConfirm: "password123",
   *   name: "홍길동",
   *   phone: "010-1234-5678",
   *   role: "MEMBER"
   * });
   * ```
   */
  register: (data: RegisterRequest) =>
    post<JwtResponse>(API_ENDPOINTS.AUTH.REGISTER, data),

  /**
   * 로그아웃
   *
   * @returns void
   * @description HttpOnly 쿠키의 JWT 토큰을 무효화합니다
   *
   * @example
   * ```ts
   * await authApi.logout();
   * ```
   */
  logout: () => post<void>(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * 토큰 갱신
   *
   * @returns 새로운 JWT 토큰
   * @throws {ApiError} 401 - 토큰 만료 또는 유효하지 않음
   * @description 만료되기 전에 토큰을 자동으로 갱신합니다
   *
   * @example
   * ```ts
   * const newToken = await authApi.refresh();
   * ```
   */
  refresh: () =>
    post<JwtResponse>(API_ENDPOINTS.AUTH.REFRESH, undefined, {
      skipAuthRefresh: true,
    }),

  /**
   * 현재 로그인한 사용자 정보 조회
   *
   * @returns 사용자 정보
   * @throws {ApiError} 401 - 인증되지 않음
   * @description HttpOnly 쿠키의 JWT 토큰을 기반으로 사용자 정보를 반환합니다
   *
   * @example
   * ```ts
   * const user = await authApi.me();
   * console.log(user.name, user.email);
   * ```
   */
  me: () => get<User>(API_ENDPOINTS.AUTH.ME, { skipAuthRefresh: true }),
};
