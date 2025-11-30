/**
 * 찜하기 관련 Hooks
 *
 * @see docs/specifications/05-STATE-MANAGEMENT.md
 * @see docs/sprints/sprint-4.md
 */

"use client";

import { useAuth } from "@/contexts";
import { favoriteApi } from "@/lib/api/favorites";
import type { Favorite, PageResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * 찜 목록 조회 Hook (페이징)
 *
 * @param params - 페이지 파라미터
 * @returns React Query result with favorites list
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useFavorites({ page: 0, size: 20 });
 * ```
 */
export function useFavorites(params?: { page?: number; size?: number }) {
  return useQuery<PageResponse<Favorite>, Error>({
    queryKey: ["favorites", params],
    queryFn: () => favoriteApi.getList(params),
    staleTime: 2 * 60 * 1000, // 2분 - 사용자가 직접 추가/삭제하므로 짧은 staleTime
    gcTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true, // 포커스 시 재검증 (변경 가능성 높음)
  });
}

/**
 * 찜 목록 전체 조회 Hook
 *
 * @returns React Query result with all favorites
 *
 * @example
 * ```tsx
 * const { data } = useAllFavorites();
 * ```
 */
export function useAllFavorites() {
  return useQuery<Favorite[], Error>({
    queryKey: ["favorites", "all"],
    queryFn: () => favoriteApi.getAll(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true, // 포커스 시 재검증
  });
}

/**
 * 찜 상태 확인 Hook
 *
 * @param campgroundId - 캠핑장 ID
 * @returns React Query result with favorite status
 *
 * @example
 * ```tsx
 * const { data: isFavorite } = useFavoriteStatus(campgroundId);
 * ```
 */
export function useFavoriteStatus(campgroundId: number) {
  const { isAuthenticated } = useAuth();

  return useQuery<boolean, Error>({
    queryKey: ["favorites", "status", campgroundId],
    queryFn: async () => {
      // ✅ API 클라이언트가 CommonResponse.data를 unwrap하므로 response는 직접 boolean
      const response = await favoriteApi.checkStatus(campgroundId);
      return response;
    },
    enabled: !!campgroundId && isAuthenticated, // 로그인 상태에서만 활성화
    staleTime: 1 * 60 * 1000, // 1분 - 낙관적 업데이트와 함께 사용, 빠른 동기화 필요
    gcTime: 3 * 60 * 1000, // 3분
    refetchOnWindowFocus: true, // 포커스 시 재검증 (실시간성 중요)
  });
}

/**
 * 찜하기 토글 Hook
 *
 * @description 낙관적 업데이트 적용
 * @returns React Query mutation for toggling favorite
 *
 * @example
 * ```tsx
 * const toggleFavorite = useToggleFavorite();
 *
 * const handleToggle = () => {
 *   toggleFavorite.mutate(
 *     { campgroundId: 1 },
 *     {
 *       onSuccess: () => console.log('Toggled!'),
 *     }
 *   );
 * };
 * ```
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { campgroundId: number }) =>
      favoriteApi.toggle({ campgroundId: data.campgroundId }),
    onMutate: async ({ campgroundId }) => {
      // 낙관적 업데이트를 위해 이전 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ["favorites", "status", campgroundId],
      });

      // 이전 상태 스냅샷
      const previousStatus = queryClient.getQueryData<boolean>([
        "favorites",
        "status",
        campgroundId,
      ]);

      // 낙관적 업데이트
      queryClient.setQueryData<boolean>(
        ["favorites", "status", campgroundId],
        (old) => !old
      );

      return { previousStatus };
    },
    onError: (_err, { campgroundId }, context) => {
      // 에러 시 롤백
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          ["favorites", "status", campgroundId],
          context.previousStatus
        );
      }
    },
    onSettled: (_data, _error, { campgroundId }) => {
      // 성공/실패 상관없이 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["favorites", "status", campgroundId],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/**
 * 찜 추가 Hook
 *
 * @returns React Query mutation for adding favorite
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campgroundId: number) => favoriteApi.add(campgroundId),
    onSuccess: (_data, campgroundId) => {
      queryClient.invalidateQueries({
        queryKey: ["favorites", "status", campgroundId],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/**
 * 찜 제거 Hook
 *
 * @returns React Query mutation for removing favorite
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campgroundId: number) => favoriteApi.remove(campgroundId),
    onSuccess: (_data, campgroundId) => {
      queryClient.invalidateQueries({
        queryKey: ["favorites", "status", campgroundId],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
