"use client";

import { announcementApi } from "@/lib/api/announcements";
import type {
  Announcement,
  AnnouncementSearchParams,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * 캠핑장 공지사항 목록 조회 Hook
 *
 * @param params - 검색 파라미터 (campgroundId 필수)
 * @returns React Query result with announcements list
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAnnouncements({
 *   campgroundId: 1,
 *   type: "NOTICE",
 *   page: 0,
 *   size: 10
 * });
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error.message} />;
 *
 * return (
 *   <div>
 *     {data?.map(announcement => (
 *       <AnnouncementCard key={announcement.id} announcement={announcement} />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @see docs/technical/04-API-GUIDE.md
 */
export function useAnnouncements(params: AnnouncementSearchParams) {
  return useQuery<Announcement[]>({
    queryKey: ["announcements", params],
    queryFn: () => announcementApi.getAll(params),
    enabled: !!params.campgroundId,
    staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

/**
 * 공지사항 상세 조회 Hook
 *
 * @param id - 공지사항 ID
 * @returns React Query result with announcement detail
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAnnouncement(1);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!data) return null;
 *
 * return <AnnouncementDetail announcement={data} />;
 * ```
 */
export function useAnnouncement(id: number) {
  return useQuery<Announcement>({
    queryKey: ["announcement", id],
    queryFn: () => announcementApi.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * 공지사항 생성 Mutation Hook
 *
 * @returns Mutation object with create function
 *
 * @example
 * ```tsx
 * const createMutation = useCreateAnnouncement();
 *
 * const handleCreate = async () => {
 *   try {
 *     const newAnnouncement = await createMutation.mutateAsync({
 *       campgroundId: 1,
 *       type: "NOTICE",
 *       title: "공지사항 제목",
 *       content: "공지사항 내용",
 *       isPinned: false
 *     });
 *     console.log("Created:", newAnnouncement);
 *   } catch (error) {
 *     console.error("Failed:", error);
 *   }
 * };
 * ```
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementDto) => announcementApi.create(data),
    onSuccess: (_, variables) => {
      // 해당 캠핑장의 공지사항 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["announcements", { campgroundId: variables.campgroundId }],
      });
    },
  });
}

/**
 * 공지사항 수정 Mutation Hook
 *
 * @returns Mutation object with update function
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateAnnouncement();
 *
 * const handleUpdate = async (id: number) => {
 *   await updateMutation.mutateAsync({
 *     id,
 *     data: {
 *       title: "수정된 제목",
 *       isPinned: true
 *     }
 *   });
 * };
 * ```
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAnnouncementDto }) =>
      announcementApi.update(id, data),
    onSuccess: (updatedAnnouncement) => {
      // 특정 공지사항 캐시 업데이트
      queryClient.setQueryData(
        ["announcement", updatedAnnouncement.id],
        updatedAnnouncement
      );

      // 해당 캠핑장의 공지사항 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: [
          "announcements",
          { campgroundId: updatedAnnouncement.campgroundId },
        ],
      });
    },
  });
}

/**
 * 공지사항 삭제 Mutation Hook
 *
 * @returns Mutation object with delete function
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteAnnouncement();
 *
 * const handleDelete = async (id: number, campgroundId: number) => {
 *   if (confirm("정말 삭제하시겠습니까?")) {
 *     await deleteMutation.mutateAsync({ id, campgroundId });
 *   }
 * };
 * ```
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; campgroundId: number }) =>
      announcementApi.delete(id),
    onSuccess: (_, variables) => {
      // 특정 공지사항 캐시 제거
      queryClient.removeQueries({
        queryKey: ["announcement", variables.id],
      });

      // 해당 캠핑장의 공지사항 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["announcements", { campgroundId: variables.campgroundId }],
      });
    },
  });
}

/**
 * 공지사항 조회수 증가 Mutation Hook
 *
 * @returns Mutation object with increment view count function
 *
 * @example
 * ```tsx
 * const viewMutation = useIncrementAnnouncementViewCount();
 *
 * useEffect(() => {
 *   viewMutation.mutate(announcementId);
 * }, [announcementId]);
 * ```
 */
export function useIncrementAnnouncementViewCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => announcementApi.incrementViewCount(id),
    onSuccess: (updatedAnnouncement) => {
      // 특정 공지사항 캐시 업데이트
      queryClient.setQueryData(
        ["announcement", updatedAnnouncement.id],
        updatedAnnouncement
      );

      // 목록 캐시도 업데이트 (조회수 반영)
      queryClient.invalidateQueries({
        queryKey: [
          "announcements",
          { campgroundId: updatedAnnouncement.campgroundId },
        ],
      });
    },
  });
}
