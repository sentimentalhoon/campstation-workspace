/**
 * 배너 관리 Hooks (관리자 전용)
 * ADMIN 권한이 필요한 배너 CRUD 작업
 */

"use client";

import { bannersApi } from "@/lib/api/banners";
import type { PageResponse } from "@/types";
import type {
  Banner,
  BannerSearchParams,
  BannerStats,
  CreateBannerDto,
  UpdateBannerDto,
  UpdateBannerOrderDto,
} from "@/types/domain";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

// ============================================================
// Query Hooks (조회)
// ============================================================

/**
 * 모든 배너 목록 조회 (페이지네이션)
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerManagementPage() {
 *   const [params, setParams] = useState<BannerSearchParams>({
 *     page: 0,
 *     size: 20,
 *     sort: 'displayOrder',
 *     direction: 'asc'
 *   });
 *
 *   const { data, isLoading } = useAdminBanners(params);
 *
 *   return (
 *     <BannerTable
 *       banners={data?.content}
 *       totalPages={data?.totalPages}
 *     />
 *   );
 * }
 * ```
 */
export function useAdminBanners(
  params?: BannerSearchParams,
  options?: Omit<UseQueryOptions<PageResponse<Banner>>, "queryKey" | "queryFn">
) {
  return useQuery<PageResponse<Banner>>({
    queryKey: ["admin", "banners", params],
    queryFn: () => bannersApi.getAll(params),
    staleTime: 1000 * 60 * 2, // 2분
    ...options,
  });
}

/**
 * 배너 상세 조회
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerEditPage({ params }: { params: { id: string } }) {
 *   const { data: banner, isLoading } = useAdminBanner(Number(params.id));
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return <BannerForm initialData={banner} />;
 * }
 * ```
 */
export function useAdminBanner(
  bannerId: number,
  options?: Omit<UseQueryOptions<Banner>, "queryKey" | "queryFn">
) {
  return useQuery<Banner>({
    queryKey: ["admin", "banners", bannerId],
    queryFn: () => bannersApi.getById(bannerId),
    enabled: !!bannerId,
    staleTime: 1000 * 60 * 5, // 5분
    ...options,
  });
}

/**
 * 배너 통계 조회
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerDashboard() {
 *   const { data: stats } = useBannerStats();
 *
 *   return (
 *     <div>
 *       <p>전체 배너: {stats?.totalBanners}</p>
 *       <p>활성 배너: {stats?.activeBanners}</p>
 *       <p>평균 CTR: {stats?.averageCtr}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBannerStats(
  options?: Omit<UseQueryOptions<BannerStats>, "queryKey" | "queryFn">
) {
  return useQuery<BannerStats>({
    queryKey: ["admin", "banners", "stats"],
    queryFn: () => bannersApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5분
    ...options,
  });
}

// ============================================================
// Mutation Hooks (생성/수정/삭제)
// ============================================================

/**
 * 배너 생성 Mutation
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerCreateForm() {
 *   const { mutate: createBanner, isPending } = useCreateBanner();
 *
 *   const handleSubmit = (data: CreateBannerDto) => {
 *     createBanner(data);
 *   };
 *
 *   return <BannerForm onSubmit={handleSubmit} isSubmitting={isPending} />;
 * }
 * ```
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBannerDto) => bannersApi.create(dto),
    onSuccess: () => {
      // 배너 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners", "active"] });

      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["admin", "banners", "stats"],
      });
    },
  });
}

/**
 * 배너 수정 Mutation
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerEditForm({ bannerId }: { bannerId: number }) {
 *   const { mutate: updateBanner, isPending } = useUpdateBanner();
 *
 *   const handleSubmit = (data: UpdateBannerDto) => {
 *     updateBanner({ bannerId, dto: data });
 *   };
 *
 *   return <BannerForm onSubmit={handleSubmit} isSubmitting={isPending} />;
 * }
 * ```
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bannerId,
      dto,
    }: {
      bannerId: number;
      dto: UpdateBannerDto;
    }) => bannersApi.update(bannerId, dto),
    onSuccess: (updatedBanner, { bannerId }) => {
      // 해당 배너 캐시 업데이트
      queryClient.setQueryData<Banner>(
        ["admin", "banners", bannerId],
        updatedBanner
      );

      // 배너 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners", "active"] });
    },
  });
}

/**
 * 배너 삭제 Mutation
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerDeleteButton({ bannerId, bannerTitle }: Props) {
 *   const { mutate: deleteBanner, isPending } = useDeleteBanner();
 *
 *   const handleDelete = () => {
 *     if (confirm('정말 삭제하시겠습니까?')) {
 *       deleteBanner(bannerId);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isPending}>
 *       삭제
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId: number) => bannersApi.delete(bannerId),
    onSuccess: (_, bannerId) => {
      // 해당 배너 캐시 제거
      queryClient.removeQueries({ queryKey: ["admin", "banners", bannerId] });

      // 배너 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners", "active"] });

      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["admin", "banners", "stats"],
      });
    },
  });
}

/**
 * 배너 순서 변경 Mutation
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerList({ banners }: { banners: Banner[] }) {
 *   const { mutate: updateOrder } = useUpdateBannerOrder();
 *
 *   const handleDragEnd = (result: DropResult) => {
 *     const newOrder = reorderBanners(banners, result);
 *     const updates = newOrder.map((banner, index) => ({
 *       bannerId: banner.id,
 *       displayOrder: index + 1
 *     }));
 *
 *     updateOrder(updates);
 *   };
 *
 *   return <DragDropContext onDragEnd={handleDragEnd}>...</DragDropContext>;
 * }
 * ```
 */
export function useUpdateBannerOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orders: UpdateBannerOrderDto) =>
      bannersApi.updateOrder(orders),
    onMutate: async (orders) => {
      // Optimistic update: 순서 변경 즉시 반영
      await queryClient.cancelQueries({ queryKey: ["admin", "banners"] });

      const previousBanners = queryClient.getQueryData<PageResponse<Banner>>([
        "admin",
        "banners",
      ]);

      if (previousBanners) {
        const updatedContent = previousBanners.content
          .map((banner) => {
            const newOrder = orders.find((o) => o.bannerId === banner.id);
            return newOrder
              ? { ...banner, displayOrder: newOrder.displayOrder }
              : banner;
          })
          .sort((a, b) => a.displayOrder - b.displayOrder);

        queryClient.setQueryData<PageResponse<Banner>>(["admin", "banners"], {
          ...previousBanners,
          content: updatedContent,
        });
      }

      return { previousBanners };
    },
    onSuccess: () => {
      // 배너 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners", "active"] });
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousBanners) {
        queryClient.setQueryData(["admin", "banners"], context.previousBanners);
      }
    },
  });
}

/**
 * 배너 상태 변경 Mutation (활성화/비활성화)
 * ADMIN 권한 필요
 *
 * @example
 * ```tsx
 * function BannerStatusToggle({ banner }: { banner: Banner }) {
 *   const { mutate: updateStatus, isPending } = useUpdateBannerStatus();
 *
 *   const handleToggle = () => {
 *     const newStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
 *     updateStatus({ bannerId: banner.id, status: newStatus });
 *   };
 *
 *   return (
 *     <Switch
 *       checked={banner.status === 'ACTIVE'}
 *       onCheckedChange={handleToggle}
 *       disabled={isPending}
 *     />
 *   );
 * }
 * ```
 */
export function useUpdateBannerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bannerId,
      status,
    }: {
      bannerId: number;
      status: "ACTIVE" | "INACTIVE" | "SCHEDULED";
    }) => bannersApi.updateStatus(bannerId, status),
    onSuccess: (updatedBanner, { bannerId }) => {
      // 해당 배너 캐시 업데이트
      queryClient.setQueryData<Banner>(
        ["admin", "banners", bannerId],
        updatedBanner
      );

      // 배너 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners", "active"] });

      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["admin", "banners", "stats"],
      });
    },
  });
}
