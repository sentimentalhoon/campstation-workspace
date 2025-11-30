/**
 * 마이페이지 - 사용자 대시보드
 *
 * @see docs/sprints/sprint-3.md - Task 4
 */

"use client";

import { QueryStateHandler } from "@/components/common";
import { DashboardNav } from "@/components/features/dashboard";
import { useMyReviews, useReservations, useUserProfile } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const { data: reservations, isLoading: isLoadingReservations } =
    useReservations({ page: 0, size: 3 });
  const { data: reviews, isLoading: isLoadingReviews } = useMyReviews({
    page: 0,
    size: 3,
  });

  const user = userProfile;
  const recentReservations = reservations?.content ?? [];
  const recentReviews = reviews?.content ?? [];

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Dashboard Navigation */}
      <DashboardNav />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 프로필 섹션 */}
        <section className="mb-8 rounded-lg border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">마이페이지</h1>
            <Link
              href={ROUTES.DASHBOARD.PROFILE}
              className="text-primary-600 text-sm hover:underline"
            >
              프로필 수정
            </Link>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-sm text-neutral-600">이름</span>
              <p className="font-medium text-neutral-900">{user?.name}</p>
            </div>
            <div>
              <span className="text-sm text-neutral-600">이메일</span>
              <p className="font-medium text-neutral-900">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-neutral-600">전화번호</span>
              <p className="font-medium text-neutral-900">
                {user?.phone || "-"}
              </p>
            </div>
          </div>
        </section>

        {/* 최근 예약 섹션 */}
        <section className="mb-8" aria-labelledby="recent-reservations-title">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="recent-reservations-title"
              className="text-xl font-bold text-neutral-900"
            >
              최근 예약
            </h2>
            <Link
              href={ROUTES.RESERVATIONS.LIST}
              className="text-primary-600 text-sm hover:underline"
            >
              전체보기
            </Link>
          </div>

          <QueryStateHandler
            isLoading={isLoadingReservations}
            isEmpty={recentReservations.length === 0}
            emptyMessage="예약 내역이 없습니다."
          >
            <div className="space-y-4" role="list" aria-label="최근 예약 목록">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
                  onClick={() =>
                    router.push(ROUTES.RESERVATIONS.DETAIL(reservation.id))
                  }
                  role="listitem"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-neutral-900">
                      {reservation.campgroundName}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        reservation.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : reservation.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {reservation.status === "CONFIRMED"
                        ? "예약확정"
                        : reservation.status === "CANCELLED"
                          ? "취소됨"
                          : "대기중"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {formatDate(reservation.checkInDate)} ~{" "}
                    {formatDate(reservation.checkOutDate)}
                  </p>
                  <p className="text-primary-600 mt-2 font-medium">
                    {formatPrice(reservation.totalAmount)}원
                  </p>
                </div>
              ))}
            </div>
          </QueryStateHandler>
        </section>

        {/* 최근 리뷰 섹션 */}
        <section className="mb-8" aria-labelledby="recent-reviews-title">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="recent-reviews-title"
              className="text-xl font-bold text-neutral-900"
            >
              최근 리뷰
            </h2>
            <Link
              href={ROUTES.DASHBOARD.REVIEWS}
              className="text-primary-600 text-sm hover:underline"
            >
              전체보기
            </Link>
          </div>

          <QueryStateHandler
            isLoading={isLoadingReviews}
            isEmpty={recentReviews.length === 0}
            emptyMessage="작성한 리뷰가 없습니다."
          >
            <div className="space-y-4" role="list" aria-label="최근 리뷰 목록">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                  role="listitem"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-neutral-900">
                      {review.campgroundName}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-neutral-600">
                    {review.comment}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </QueryStateHandler>
        </section>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}
