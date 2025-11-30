/**
 * 프로필 업데이트 Mutation Hook
 *
 * @see docs/sprints/sprint-3.md
 */

"use client";

import { userApi } from "@/lib/api/users";
import type { UpdateProfileRequest, User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 프로필 업데이트 Mutation Hook
 *
 * @example
 * ```tsx
 * const updateProfile = useUpdateProfile();
 *
 * const handleSubmit = (data) => {
 *   updateProfile.mutate(data, {
 *     onSuccess: () => {
 *       alert('프로필이 업데이트되었습니다.');
 *     },
 *   });
 * };
 * ```
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileRequest>({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),

    onSuccess: () => {
      // 사용자 프로필 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });

      // AuthContext의 user도 업데이트 필요
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
