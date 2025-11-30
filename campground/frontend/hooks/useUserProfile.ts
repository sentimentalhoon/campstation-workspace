/**
 * 사용자 프로필 조회 Hook
 *
 * @see docs/sprints/sprint-3.md
 */

"use client";

import { userApi } from "@/lib/api/users";
import type { User } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 사용자 프로필 조회 Hook
 *
 * @returns React Query result with user profile
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useUserProfile();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h1>{data?.data.name}</h1>
 *     <p>{data?.data.email}</p>
 *   </div>
 * );
 * ```
 */
export function useUserProfile() {
  return useQuery<User>({
    queryKey: ["user", "profile"],
    queryFn: () => userApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
