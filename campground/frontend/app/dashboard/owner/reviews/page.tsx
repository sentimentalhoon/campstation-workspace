/**
 * OWNER 고객 리뷰 관리 페이지
 */

"use client";

import { OwnerDashboardNav } from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/ui/useToast";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { ownerApi } from "@/lib/api/owner";
import { ROUTES } from "@/lib/constants";
import type { Review } from "@/types";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function OwnerReviewsPage() {
  // ============================================================
  // 1. Hooks
  // ============================================================
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 2. Event Handlers
  // ============================================================
  const handleBack = () => {
    router.push(ROUTES.DASHBOARD.OWNER);
  };

  const handleReply = (reviewId: number) => {
    // TODO: 답글 작성 모달 또는 페이지
    toast.info(`리뷰 ${reviewId}에 답글 작성 기능은 준비 중입니다`);
  };

  // ============================================================
  // 3. Computed Values
  // ============================================================
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ============================================================
  // 4. Effects
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 내 캠핑장의 모든 리뷰를 한 번에 가져오기
        const reviewsRes = await ownerApi.getMyReviews({
          page: 0,
          size: 100,
        });
        setReviews(reviewsRes.content || []);
      } catch (err) {
        console.error("데이터 로드 실패:", err);

        // ✅ ApiError 클래스를 활용한 명확한 에러 처리
        if (err instanceof ApiError) {
          if (err.is(404)) {
            setError("리뷰를 찾을 수 없습니다");
          } else if (err.is(403)) {
            setError("리뷰를 조회할 권한이 없습니다");
          } else if (err.isServerError()) {
            setError(
              `서버 오류가 발생했습니다 (${err.status}). 잠시 후 다시 시도해주세요.`
            );
          } else if (err.isValidationError()) {
            setError("요청 데이터가 올바르지 않습니다");
          } else {
            setError(err.data.message || "리뷰를 불러오는데 실패했습니다");
          }
        } else if (err instanceof NetworkError) {
          setError("네트워크 연결을 확인해주세요");
        } else {
          setError("알 수 없는 오류가 발생했습니다");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // 5. Render
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>

          <div className="rounded-lg bg-red-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              데이터 로드 실패
            </h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <div className="text-sm text-gray-500">
              <p className="mb-2">백엔드 서버 확인이 필요합니다:</p>
              <ul className="list-inside list-disc text-left">
                <li>백엔드 서버가 실행 중인지 확인</li>
                <li>API 엔드포인트가 구현되었는지 확인</li>
                <li>서버 로그를 확인하여 500 에러 원인 파악</li>
              </ul>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-6">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-orange-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            고객 리뷰
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            고객 리뷰를 확인하고 응답하세요.
          </p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* 평균 평점 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-yellow-400 to-yellow-500 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-100">평균 평점</p>
                <p className="text-3xl font-bold text-white">
                  {averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* 총 리뷰 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-100">총 리뷰</p>
                <p className="text-3xl font-bold text-white">
                  {reviews.length}
                </p>
              </div>
              <MessageSquare className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* 답글 작성 */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-green-500 to-green-600 p-5 shadow-md transition-all hover:shadow-xl active:scale-95">
            <div className="absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-white opacity-10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-100">답글 작성</p>
                <p className="text-2xl font-bold text-white">준비 중</p>
              </div>
              <MessageSquare className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
            </div>
          </div>
        </div>

        {/* 리뷰 목록 */}
        <div className="rounded-2xl bg-white shadow-md">
          <div className="border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-bold text-gray-900">리뷰 목록</h2>
            <p className="mt-1 text-xs text-gray-500">총 {reviews.length}개</p>
          </div>

          {reviews.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-yellow-100 to-orange-100">
                <MessageSquare className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                아직 리뷰가 없습니다
              </h3>
              <p className="text-sm text-gray-500">
                고객들이 남긴 리뷰가 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="px-4 py-5 transition-all hover:bg-linear-to-r hover:from-yellow-50 hover:to-transparent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* 작성자 및 평점 */}
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-gray-900">
                          {review.userName}
                        </p>
                        <div className="flex items-center gap-1 rounded-full bg-linear-to-r from-yellow-400 to-orange-400 px-2.5 py-1 shadow-sm">
                          <Star className="h-3.5 w-3.5 fill-white text-white" />
                          <span className="text-xs font-bold text-white">
                            {review.rating}.0
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>

                      {/* 캠핑장 정보 */}
                      <p className="mt-1 text-xs font-medium text-gray-600">
                        {review.campgroundName}
                      </p>

                      {/* 리뷰 내용 */}
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {review.comment}
                      </p>

                      {/* 별점 표시 */}
                      <div className="mt-2 flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* 오너 답글 - 향후 추가 예정 */}
                      {/* {review.ownerReply && (...)} */}
                    </div>

                    {/* 답글 버튼 - 향후 추가 예정 */}
                    <div className="shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        className="rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
                      >
                        <MessageSquare className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">답글</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}

export default withOwnerAuth(OwnerReviewsPage);
