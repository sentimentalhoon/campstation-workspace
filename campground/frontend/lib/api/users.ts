/**
 * 사용자 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
} from "@/types";
import { get, put } from "./client";

export const userApi = {
  /**
   * 현재 사용자 프로필 조회
   */
  getProfile: () => get<User>(API_ENDPOINTS.USERS.PROFILE),

  /**
   * 프로필 업데이트
   */
  updateProfile: (data: UpdateProfileRequest) =>
    put<User>(API_ENDPOINTS.USERS.PROFILE, data),

  /**
   * 비밀번호 변경
   */
  changePassword: (data: ChangePasswordRequest) =>
    put<void>(API_ENDPOINTS.USERS.PASSWORD, data),
};
