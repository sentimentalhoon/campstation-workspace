/**
 * 내 리뷰 관리 페이지
 *
 * @see docs/sprints/sprint-3.md - Task 8
 */

"use client";

import { QueryStateHandler } from "@/components/common";
import { DashboardNav } from "@/components/features/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Image } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useMyReviews } from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { reviewApi } from "@/lib/api/reviews";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MyReviewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useMyReviews({ page, size: 10 });

  const reviews = data?.content ?? [];
  const pagination = data;

  // 리뷰 삭제 Mutation
  const deleteReview = useMutation({
    mutationFn: (reviewId: number) => reviewApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "my"] });
      toast.success("리뷰가 삭제되었습니다");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          toast.error("리뷰를 찾을 수 없습니다");
        } else if (error.status === 403) {
          toast.error("리뷰 삭제 권한이 없습니다");
        } else if (error.status >= 500) {
          toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
        } else {
          toast.error(`리뷰 삭제에 실패했습니다: ${error.message}`);
        }
      } else if (error instanceof NetworkError) {
        toast.error("네트워크 연결을 확인해주세요");
      } else {
        toast.error(`리뷰 삭제에 실패했습니다: ${(error as Error).message}`);
      }
    },
  });

  // 리뷰 삭제 핸들러
  const handleDelete = (reviewId: number, campgroundName: string) => {
    if (
      confirm(
        `"${campgroundName}"에 작성한 리뷰를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      deleteReview.mutate(reviewId);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <PageHeader
        title="내 리뷰 관리"
        showBack
        onBack={() => router.back()}
        rightAction={
          <span className="text-sm text-neutral-600">
            {pagination?.totalElements || 0}개
          </span>
        }
      />

      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 리뷰 목록 */}
        <QueryStateHandler
        isLoading={isLoading}
        error={error}
        isEmpty={reviews.length === 0}
        emptyIcon="✍️"
        emptyTitle="작성한 리뷰가 없습니다"
        emptyMessage="체크아웃 후 캠핑장 리뷰를 작성해보세요."
        emptyAction={
          <Link href={ROUTES.RESERVATIONS.LIST}>
            <Button>예약 내역 보기</Button>
          </Link>
        }
      >
        <div className="space-y-3" role="list" aria-label="내 리뷰 목록">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6"
              role="listitem"
            >
              {/* 캠핑장 정보 */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-neutral-900">
                    {review.campgroundName}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatDate(review.createdAt)} 작성
                    {review.updatedAt !== review.createdAt &&
                      ` · ${formatDate(review.updatedAt)} 수정`}
                  </p>
                </div>

                {/* 별점 */}
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-lg text-yellow-500">★</span>
                  <span className="font-semibold">{review.rating}</span>
                  <span className="text-sm text-neutral-500">/ 5</span>
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="mb-3">
                <p className="text-sm text-neutral-700 sm:text-base">{review.comment}</p>
              </div>

              {/* 이미지 */}
              {review.images && review.images.length > 0 && (
                <div className="mb-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                    >
                      <Image
                        src={image.thumbnailUrl || image.originalUrl}
                        alt={`리뷰 이미지 ${index + 1}`}
                        width={96}
                        height={96}
                        fallback="/images/fallback-image.svg"
                        aspectRatio="square"
                        objectFit="cover"
                        rounded="lg"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex flex-wrap justify-end gap-2">
                <Link href={`/reviews/${review.id}/edit`}>
                  <Button variant="outline" size="sm">
                    수정
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(review.id, review.campgroundName)}
                  loading={deleteReview.isPending}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      </QueryStateHandler>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.first}
              onClick={() => setPage(page - 1)}
              className="w-full sm:w-auto"
            >
              이전
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-8 w-8 shrink-0 rounded text-sm ${
                    page === i
                      ? "bg-primary-600 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.last}
              onClick={() => setPage(page + 1)}
              className="w-full sm:w-auto"
            >
              다음
            </Button>
          </div>
        )}

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}
