/**
 * 비밀번호 변경 Mutation Hook
 *
 * @see docs/sprints/sprint-3.md
 */

"use client";

import { userApi } from "@/lib/api/users";
import type { ChangePasswordRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

/**
 * 비밀번호 변경 Mutation Hook
 *
 * @example
 * ```tsx
 * const changePassword = useChangePassword();
 *
 * const handleSubmit = (data) => {
 *   changePassword.mutate(data, {
 *     onSuccess: () => {
 *       alert('비밀번호가 변경되었습니다.');
 *       router.push('/dashboard/user');
 *     },
 *     onError: (error) => {
 *       alert('비밀번호 변경에 실패했습니다: ' + error.message);
 *     },
 *   });
 * };
 * ```
 */
export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
  });
}
