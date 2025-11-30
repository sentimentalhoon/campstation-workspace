/**
 * 비회원 예약 상세 페이지
 * 예약번호와 비밀번호로 조회한 예약 상세 정보 표시
 */

"use client";

import { QueryStateHandler } from "@/components/common";
import { QRCode } from "@/components/features/reservation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/ui/useToast";
import { ROUTES } from "@/lib/constants";
import type { Reservation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "결제 대기", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "예약 확정", color: "bg-green-100 text-green-800" },
  COMPLETED: { label: "이용 완료", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "예약 취소", color: "bg-red-100 text-red-800" },
};

export default function GuestReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const reservationNumber = searchParams.get("number");
  const password = searchParams.get("password");
  const [showQR, setShowQR] = useState(false);

  // 파라미터 검증
  useEffect(() => {
    if (!reservationNumber || !password) {
      toast.error("잘못된 접근입니다");
      router.push(ROUTES.RESERVATIONS.LIST);
    }
  }, [reservationNumber, password, router, toast]);

  // 예약 상세 조회
  const {
    data: reservation,
    isLoading,
    error,
  } = useQuery<Reservation>({
    queryKey: ["reservation", "guest", id, reservationNumber, password],
    queryFn: async () => {
      const response = await fetch(
        `/api/reservations/guest?reservationNumber=${encodeURIComponent(reservationNumber!)}&password=${encodeURIComponent(password!)}`
      );

      if (!response.ok) {
        throw new Error("예약 정보를 불러올 수 없습니다");
      }

      return response.json();
    },
    enabled: !!reservationNumber && !!password,
    staleTime: 30 * 1000, // 30초
  });

  const handleCancelReservation = async () => {
    if (!reservation) return;

    if (!confirm("정말로 예약을 취소하시겠습니까?")) return;

    try {
      const response = await fetch(
        `/api/reservations/${reservation.id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationNumber,
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("예약 취소에 실패했습니다");
      }

      toast.success("예약이 취소되었습니다");
      router.push(ROUTES.RESERVATIONS.LIST);
    } catch (error) {
      console.error("예약 취소 실패:", error);
      toast.error("예약 취소 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="min-h-screen pb-14">
      <PageHeader title="예약 상세" />

      <main className="px-4 py-6">
        <QueryStateHandler
          isLoading={isLoading}
          error={error}
          isEmpty={!reservation}
          emptyMessage="예약 정보를 찾을 수 없습니다"
        >
          {reservation && (
            <div className="space-y-6">
              {/* 예약 상태 */}
              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">예약 정보</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      STATUS_LABELS[reservation.status]?.color ||
                      "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {STATUS_LABELS[reservation.status]?.label ||
                      reservation.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">예약번호</span>
                    <span className="font-medium">{reservationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">예약자명</span>
                    <span className="font-medium">{reservation.userName}</span>
                  </div>
                </div>
              </div>

              {/* 캠핑장 정보 */}
              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-4 text-base font-semibold">캠핑장 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">캠핑장</span>
                    <span className="font-medium">
                      {reservation.campgroundName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">사이트</span>
                    <span className="font-medium">
                      {reservation.siteNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">체크인</span>
                    <span className="font-medium">
                      {format(
                        new Date(reservation.checkInDate),
                        "yyyy년 M월 d일 (E) 15:00",
                        { locale: ko }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">체크아웃</span>
                    <span className="font-medium">
                      {format(
                        new Date(reservation.checkOutDate),
                        "yyyy년 M월 d일 (E) 11:00",
                        { locale: ko }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">숙박일</span>
                    <span className="font-medium">
                      {reservation.numberOfNights}박
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">인원</span>
                    <span className="font-medium">
                      {reservation.numberOfGuests}명
                    </span>
                  </div>
                </div>
              </div>

              {/* 결제 정보 */}
              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-4 text-base font-semibold">결제 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">결제 금액</span>
                    <span className="text-primary text-lg font-semibold">
                      {reservation.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  {reservation.payment && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">결제 방법</span>
                        <span>{reservation.payment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">결제 상태</span>
                        <span>{reservation.payment.status}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* QR 코드 */}
              {reservation.status === "CONFIRMED" && (
                <div className="rounded-lg border border-neutral-200 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold">입장 QR 코드</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQR(!showQR)}
                    >
                      {showQR ? "숨기기" : "보기"}
                    </Button>
                  </div>
                  {showQR && (
                    <div className="flex justify-center">
                      <QRCode value={reservation.id.toString()} />
                    </div>
                  )}
                </div>
              )}

              {/* 취소 버튼 */}
              {reservation.status === "CONFIRMED" && (
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleCancelReservation}
                >
                  예약 취소
                </Button>
              )}

              {/* 안내 사항 */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-blue-900">
                  📌 안내사항
                </h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• 체크인 시 예약자 본인 확인이 필요합니다</li>
                  <li>• 예약 취소는 체크인 3일 전까지 가능합니다</li>
                  <li>• 환불 규정은 캠핑장 정책을 따릅니다</li>
                </ul>
              </div>
            </div>
          )}
        </QueryStateHandler>
      </main>
    </div>
  );
}
