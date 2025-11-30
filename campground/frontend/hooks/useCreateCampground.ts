"use client";

import { campgroundApi } from "@/lib/api/campgrounds";
import type { Campground, CreateCampgroundRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 캠핑장 생성 Hook
 *
 * @returns React Query mutation for creating campground
 *
 * @example
 * ```tsx
 * const createCampground = useCreateCampground();
 *
 * const handleCreate = async () => {
 *   await createCampground.mutateAsync({
 *     name: "아름다운 캠핑장",
 *     address: "강원도 춘천시",
 *     description: "자연 속의 힐링"
 *   });
 * };
 * ```
 */
export function useCreateCampground() {
  const queryClient = useQueryClient();

  return useMutation<Campground, Error, CreateCampgroundRequest>({
    mutationFn: (data) => campgroundApi.create(data),
    onSuccess: () => {
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
