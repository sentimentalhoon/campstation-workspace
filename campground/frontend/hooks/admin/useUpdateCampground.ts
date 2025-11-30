"use client";

import { campgroundApi } from "@/lib/api/campgrounds";
import type { Campground, UpdateCampgroundRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 캠핑장 수정 Hook
 *
 * @returns React Query mutation for updating campground
 *
 * @example
 * ```tsx
 * const updateCampground = useUpdateCampground();
 *
 * const handleUpdate = async () => {
 *   await updateCampground.mutateAsync({
 *     id: 1,
 *     data: { name: "새로운 캠핑장 이름" }
 *   });
 * };
 * ```
 */
export function useUpdateCampground() {
  const queryClient = useQueryClient();

  return useMutation<
    Campground,
    Error,
    { id: number; data: UpdateCampgroundRequest }
  >({
    mutationFn: ({ id, data }) => campgroundApi.update(id, data),
    onSuccess: (_data, variables) => {
      // 해당 캠핑장 상세 정보 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["campground", variables.id],
      });
      // 캠핑장 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["campgrounds"],
      });
      // Owner의 캠핑장 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["owner", "campgrounds"],
      });
    },
  });
}
