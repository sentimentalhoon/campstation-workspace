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
 * const handleUpdate = async (id: number) => {
 *   await updateCampground.mutateAsync({
 *     id,
 *     data: {
 *       name: "수정된 캠핑장",
 *       // ...
 *     }
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
    onSuccess: (data) => {
      // 캠핑장 상세 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["campgrounds", data.id],
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
