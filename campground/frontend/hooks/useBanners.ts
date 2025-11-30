/**
 * 배너 조회 Hooks (공개 API)
 * 메인 페이지에서 활성 배너를 조회하는데 사용
 */

"use client";

import {
  getActiveBanners,
  incrementBannerClick,
  incrementBannerView,
} from "@/lib/api/banners";
import type { Banner } from "@/types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * 활성 배너 목록 조회
 * status === ACTIVE이고 노출 기간 내의 배너만 반환
 *
 * @param params - 필터 옵션
 * @param params.type - 배너 타입 필터
 * @param params.size - 조회 개수 (기본 10개)
 *
 * @example
 * ```tsx
 * function PromotionBanner() {
 *   const { data: banners, isLoading } = useBanners();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return <BannerCarousel banners={banners} />;
 * }
 * ```
 */
export function useBanners(params?: { type?: string; size?: number }) {
  return useQuery<Banner[]>({
    queryKey: ["banners", "active", params],
    queryFn: () => getActiveBanners(params),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 배너 조회수 증가 Mutation
 * 배너가 화면에 노출될 때 호출
 *
 * @example
 * ```tsx
 * const { mutate: trackView } = useBannerView();
 *
 * useEffect(() => {
 *   if (bannerId) {
 *     trackView(bannerId);
 *   }
 * }, [bannerId]);
 * ```
 */
export function useBannerView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId: number) => incrementBannerView(bannerId),
    onSuccess: (data, bannerId) => {
      // Optimistic update: 캐시의 배너 조회수 즉시 업데이트
      queryClient.setQueryData<Banner[]>(["banners", "active"], (old) => {
        if (!old) return old;
        return old.map((banner) =>
          banner.id === bannerId
            ? { ...banner, viewCount: data.viewCount }
            : banner
        );
      });
    },
  });
}

/**
 * 배너 클릭수 증가 Mutation
 * 사용자가 배너를 클릭할 때 호출
 *
 * @example
 * ```tsx
 * const { mutate: trackClick } = useBannerClick();
 *
 * <a
 *   href={banner.linkUrl}
 *   onClick={() => trackClick(banner.id)}
 * >
 *   <Image src={banner.image.originalUrl} alt={banner.title} />
 * </a>
 * ```
 */
export function useBannerClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId: number) => incrementBannerClick(bannerId),
    onSuccess: (data, bannerId) => {
      // Optimistic update: 캐시의 배너 클릭수 즉시 업데이트
      queryClient.setQueryData<Banner[]>(["banners", "active"], (old) => {
        if (!old) return old;
        return old.map((banner) =>
          banner.id === bannerId
            ? { ...banner, clickCount: data.clickCount }
            : banner
        );
      });
    },
  });
}
