/**
 * 예약 내역 페이지
 * 로그인 사용자: 예약 목록 표시
 * 비로그인 사용자: 비회원 예약 조회 + 로그인 유도
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - 예약 내역
 */

"use client";

import { QueryStateHandler } from "@/components/common";
import {
  GuestReservationLookup,
  ReservationCard,
} from "@/components/features/reservation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts";
import { useReservations } from "@/hooks/useReservations";
import { ROUTES } from "@/lib/constants";
import type { ReservationStatus } from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TabType = "upcoming" | "completed" | "cancelled";

const TABS: Array<{
  key: TabType;
  label: string;
  status: ReservationStatus[];
}> = [
  { key: "upcoming", label: "예정", status: ["CONFIRMED", "PENDING"] },
  { key: "completed", label: "완료", status: ["COMPLETED"] },
  { key: "cancelled", label: "취소", status: ["CANCELLED"] },
];

export default function ReservationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  // API 훅 연동 (로그인한 경우만 데이터 로드, 에러는 무시)
  const { data, isLoading, error } = useReservations();

  const reservations = data?.content || [];

  const filteredReservations = reservations.filter((reservation) => {
    const tab = TABS.find((t) => t.key === activeTab);
    return tab?.status.includes(reservation.status);
  });

  // 예약 상세로 이동하면서 캐시에 데이터 저장
  const handleReservationClick = (reservation: (typeof reservations)[0]) => {
    // React Query 캐시에 개별 예약 데이터 저장
    queryClient.setQueryData(["reservation", reservation.id], reservation);
    router.push(ROUTES.RESERVATIONS.DETAIL(reservation.id));
  };

  // 비로그인 사용자 UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pb-14">
        {/* Header - 56px */}
        <PageHeader title="예약 조회" />

        {/* Content */}
        <main className="space-y-6 px-4 py-6">
          {/* 비회원 예약 조회 */}
          <GuestReservationLookup />

          {/* 로그인 유도 */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="mb-2 text-base font-semibold text-neutral-900">
              회원이신가요?
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              로그인하시면 모든 예약 내역을 한 번에 확인할 수 있습니다
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              >
                로그인
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => router.push(ROUTES.AUTH.REGISTER)}
              >
                회원가입
              </Button>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-semibold text-blue-900">
                  예약번호를 찾을 수 없나요?
                </h4>
                <p className="text-xs text-blue-700">
                  예약 완료 시 발송된 이메일에서 예약번호를 확인하실 수
                  있습니다. 이메일을 찾을 수 없다면 고객센터(1234-5678)로
                  문의해주세요.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Tab Nav - 56px */}
      </div>
    );
  }

  // 로그인 사용자 UI
  return (
    <div className="min-h-screen pb-14">
      {/* Header - 56px */}
      <PageHeader title="내 예약" />

      {/* Tabs - 44px */}
      <div className="sticky top-14 z-10 border-b border-neutral-200 bg-white">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-primary border-primary border-b-2"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-6">
        <QueryStateHandler
          isLoading={isLoading}
          error={error}
          isEmpty={filteredReservations.length === 0}
          emptyIcon="📋"
          emptyMessage="예약 내역이 없습니다"
          emptyAction={
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
            >
              캠핑장 찾기
            </Button>
          }
        >
          <div className="space-y-4" role="list" aria-label="예약 목록">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onClick={() => handleReservationClick(reservation)}
              />
            ))}
          </div>
        </QueryStateHandler>
      </main>

      {/* Bottom Tab Nav - 56px */}
    </div>
  );
}
