/**
 * 예약 상세 페이지
 * QR 코드 및 예약 상세 정보 표시
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - 예약 상세
 */

"use client";

import { PriceBreakdown } from "@/components/features/reservation";
import { PriceBreakdownDisplay } from "@/components/features/PriceBreakdownDisplay";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Button, LoadingSpinner } from "@/components/ui";
import { useToast } from "@/hooks/ui/useToast";
import { useCancelReservation } from "@/hooks/useCancelReservation";
import { useRequestDepositConfirmation } from "@/hooks/useRequestDepositConfirmation";
import { useReservationDetail } from "@/hooks/useReservationDetail";
import { ROUTES } from "@/lib/constants";
import {
  formatDateTime,
  formatDateWithDay,
  parseUTCToLocal,
} from "@/lib/utils/format";
import type { ReservationStatus } from "@/types/domain";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

// QR 코드는 무거운 라이브러리이므로 동적 임포트
const QRCode = dynamic(
  () =>
    import("@/components/features/reservation").then((mod) => ({
      default: mod.QRCode,
    })),
  {
    loading: () => (
      <div className="h-[180px] w-[180px] animate-pulse bg-gray-200" />
    ),
  }
);

type Props = {
  params: Promise<{ id: string }>;
};

// 상태별 Badge variant 매핑
function getStatusBadgeVariant(
  status: ReservationStatus
): "default" | "success" | "error" | "info" {
  switch (status) {
    case "CONFIRMED":
      return "info";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    case "PENDING":
    default:
      return "default";
  }
}

// 상태별 텍스트 매핑
function getStatusText(status: ReservationStatus): string {
  switch (status) {
    case "CONFIRMED":
      return "예약 확정";
    case "COMPLETED":
      return "이용 완료";
    case "CANCELLED":
      return "예약 취소";
    case "PENDING":
      return "결제 대기";
    default:
      return status;
  }
}

export default function ReservationDetailPage({ params }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { id: reservationIdStr } = use(params);
  const reservationId = parseInt(reservationIdStr);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // API 훅 연동
  const { data, isLoading, error } = useReservationDetail(reservationId);
  const cancelReservation = useCancelReservation();
  const requestDepositConfirmation = useRequestDepositConfirmation();

  // PENDING 상태일 때 남은 시간 계산 (30분 제한)
  useEffect(() => {
    if (!data || data.status !== "PENDING") return;

    const updateTimeLeft = () => {
      const createdAt = parseUTCToLocal(data.createdAt);
      const deadline = new Date(createdAt.getTime() + 30 * 60 * 1000); // 생성 시간 + 30분
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("입금 기한 만료");
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes}분 ${seconds}초`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [data]);

  // 예약 취소 핸들러
  const handleCancel = () => {
    if (!confirm("정말 예약을 취소하시겠습니까?")) {
      return;
    }

    cancelReservation.mutate(reservationId, {
      onSuccess: () => {
        toast.success("예약이 취소되었습니다");
        router.push(ROUTES.RESERVATIONS.LIST);
      },
      onError: (error) => {
        toast.error(`취소에 실패했습니다: ${error.message}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 처리
  if (error) {
    return (
      <div className="min-h-screen p-4">
        <PageHeader title="예약 상세" showBack onBack={() => router.back()} />
        <div className="mt-20 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <p className="text-neutral-600">예약 정보를 불러올 수 없습니다</p>
          <p className="mt-2 text-sm text-neutral-400">{error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!data) {
    return (
      <div className="min-h-screen p-4">
        <PageHeader title="예약 상세" showBack onBack={() => router.back()} />
        <div className="mt-20 text-center">
          <div className="mb-4 text-6xl">📋</div>
          <p className="text-neutral-600">예약 정보를 찾을 수 없습니다</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(ROUTES.RESERVATIONS.LIST)}
          >
            예약 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const reservation = data;

  // UTC → 로컬 시간 변환
  const checkInDate = parseUTCToLocal(reservation.checkInDate);
  const checkOutDate = parseUTCToLocal(reservation.checkOutDate);

  // 예약 번호
  const reservationNumber = `RSV-${reservation.id.toString().padStart(6, "0")}`;

  return (
    <div className="min-h-screen pb-8">
      {/* Header - 56px */}
      <PageHeader title="예약 상세" showBack onBack={() => router.back()} />

      <div className="mt-14 px-4 py-6">
        {/* Status Badge - 40px */}
        <div className="flex flex-col items-center gap-2 pb-6">
          <Badge
            variant={getStatusBadgeVariant(reservation.status)}
            className="text-base"
          >
            {getStatusText(reservation.status)}
          </Badge>
          {reservation.status === "PENDING" && timeLeft && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm">
              <span className="text-yellow-600">⏰</span>
              <span className="font-medium text-yellow-700">
                입금 기한: {timeLeft}
              </span>
            </div>
          )}
        </div>

        {/* QR Code Section - 240px */}
        <div className="mb-6">
          <QRCode value={reservationNumber} size={180} />
        </div>

        {/* Campground Info */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl">
              🏕️
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                {reservation.campgroundName}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                {reservation.siteNumber} 사이트
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                📍 강원도 춘천시 캠핑로 123
              </p>
              <div className="mt-2 flex gap-2">
                <a
                  href="tel:033-123-4567"
                  className="text-primary flex items-center gap-1 text-sm"
                >
                  <span>📞</span>
                  <span>033-123-4567</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-bold">예약 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">예약번호</span>
              <span className="font-mono font-medium">{reservationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">예약일</span>
              <span className="font-medium">
                {formatDateTime(reservation.createdAt)}
              </span>
            </div>
            <div className="my-2 border-t border-neutral-200 pt-2" />
            <div className="flex justify-between">
              <span className="text-neutral-600">체크인</span>
              <span className="font-medium">
                {formatDateWithDay(checkInDate)} 14:00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">체크아웃</span>
              <span className="font-medium">
                {formatDateWithDay(checkOutDate)} 11:00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">숙박일</span>
              <span className="font-medium">
                {reservation.numberOfNights}박 {reservation.numberOfNights + 1}
                일
              </span>
            </div>
            <div className="my-2 border-t border-neutral-200 pt-2" />
            <div className="flex justify-between">
              <span className="text-neutral-600">사이트</span>
              <span className="font-medium">{reservation.siteNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">인원</span>
              <span className="font-medium">
                {reservation.numberOfGuests}명
              </span>
            </div>
          </div>
        </div>

        {/* Guest Info */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-bold">예약자 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">이름</span>
              <span className="font-medium">{reservation.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">연락처</span>
              <span className="font-medium">010-1234-5678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">이메일</span>
              <span className="text-xs font-medium">user@example.com</span>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="mb-3 font-bold">요청사항</h3>
            <p className="text-sm whitespace-pre-wrap text-neutral-700">
              {reservation.specialRequests}
            </p>
          </div>
        )}

        {/* Payment Info */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-bold">결제 정보</h3>
          {(() => {
            const breakdown = reservation.priceBreakdown;
            const hasDailyBreakdown = breakdown?.dailyBreakdown && breakdown.dailyBreakdown.length > 0;
            const hasItems = breakdown?.items && breakdown.items.length > 0;

            // dailyBreakdown 또는 items가 있으면 상세 표시
            if (hasDailyBreakdown || hasItems) {
              return (
                <PriceBreakdownDisplay
                  breakdown={breakdown}
                  showTitle={false}
                />
              );
            } else {
              // Fallback: 간단한 가격 표시
              return (
                <PriceBreakdown
                  basePrice={reservation.totalAmount / reservation.numberOfNights}
                  nights={reservation.numberOfNights}
                />
              );
            }
          })()}
          <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">결제 수단</span>
              <span className="font-medium">
                {(() => {
                  const payment = reservation.payment;
                  if (!payment) return "미등록";

                  // 간편결제 정보가 있는 경우
                  if (payment.easyPayProvider) {
                    const providers: Record<string, string> = {
                      KAKAO_PAY: "카카오페이",
                      NAVER_PAY: "네이버페이",
                      TOSS_PAY: "토스페이",
                      PAYCO: "페이코",
                      SSG_PAY: "SSG페이",
                      SAMSUNG_PAY: "삼성페이",
                    };
                    return (
                      providers[payment.easyPayProvider] ||
                      payment.easyPayProvider
                    );
                  }

                  // Toss 결제 방식 정보가 있는 경우
                  if (payment.tossMethod) {
                    const methods: Record<string, string> = {
                      카드: "신용/체크카드",
                      가상계좌: "가상계좌",
                      계좌이체: "계좌이체",
                      휴대폰: "휴대폰 소액결제",
                      상품권: "상품권",
                      간편결제: "간편결제",
                    };
                    return methods[payment.tossMethod] || payment.tossMethod;
                  }

                  // 기본 paymentMethod로 표시
                  const methodMap: Record<string, string> = {
                    CARD: "신용카드",
                    BANK_TRANSFER: "계좌이체",
                    EASY_PAYMENT: "간편결제",
                  };
                  return (
                    methodMap[payment.paymentMethod] || payment.paymentMethod
                  );
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">결제일시</span>
              <span className="font-medium">
                {formatDateTime(reservation.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">결제 상태</span>
              <span
                className={`font-medium ${
                  reservation.payment?.status === "COMPLETED"
                    ? "text-green-600"
                    : reservation.payment?.status === "PENDING"
                      ? "text-yellow-600"
                      : reservation.payment?.status === "CONFIRMATION_REQUESTED"
                        ? "text-blue-600"
                        : reservation.payment?.status === "FAILED"
                          ? "text-red-600"
                          : reservation.payment?.status === "REFUNDED"
                            ? "text-gray-600"
                            : ""
                }`}
              >
                {reservation.payment?.status === "COMPLETED" && "결제완료"}
                {reservation.payment?.status === "PENDING" && "결제대기"}
                {reservation.payment?.status === "CONFIRMATION_REQUESTED" &&
                  "입금확인 요청됨"}
                {reservation.payment?.status === "FAILED" && "결제실패"}
                {reservation.payment?.status === "REFUNDED" && "환불완료"}
                {!reservation.payment?.status && "미등록"}
              </span>
            </div>
            {reservation.payment?.paymentMethod === "BANK_TRANSFER" &&
              reservation.payment?.depositorName && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">입금자명</span>
                  <span className="font-medium">
                    {reservation.payment.depositorName}
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <span>📋</span>
            <span>취소 및 환불 정책</span>
          </h3>
          <div className="space-y-2 text-sm text-neutral-700">
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>체크인 7일 전: 100% 환불</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>체크인 3-6일 전: 50% 환불</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>체크인 2일 전 이후: 환불 불가</span>
            </div>
            <div className="mt-3 border-t border-neutral-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">취소 가능 기한</span>
                <span className="font-medium text-red-600">
                  {(() => {
                    const cancelDeadline = new Date(checkInDate);
                    cancelDeadline.setDate(cancelDeadline.getDate() - 7);
                    cancelDeadline.setHours(23, 59, 59, 999);
                    return format(cancelDeadline, "M월 d일 23:59까지", {
                      locale: ko,
                    });
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <span>ℹ️</span>
            <span>이용 안내</span>
          </h3>
          <div className="space-y-2 text-sm text-neutral-700">
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>체크인 시 예약 확인 QR코드를 제시해 주세요</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>반려동물 동반 가능 (소형견만 가능)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>화기 사용 시 안전 수칙을 준수해 주세요</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>쓰레기는 분리수거함에 버려주세요</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>야간(22시~08시) 정숙시간을 지켜주세요</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const address = reservation.campgroundName;
                window.open(
                  `https://map.naver.com/v5/search/${encodeURIComponent(address)}`,
                  "_blank"
                );
              }}
            >
              🗺️ 길찾기
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = "tel:033-123-4567";
              }}
            >
              📞 전화걸기
            </Button>
          </div>
          {/* 계좌이체 - PENDING 상태: 입금 확인 요청 버튼 */}
          {reservation.status === "PENDING" &&
            reservation.payment?.paymentMethod === "BANK_TRANSFER" &&
            reservation.payment?.status === "PENDING" && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  if (!reservation.payment?.id) {
                    toast.error("결제 정보를 찾을 수 없습니다");
                    return;
                  }

                  // 입금자명 확인
                  const depositorName = reservation.payment?.depositorName;
                  if (!depositorName) {
                    toast.warning(
                      "입금자명이 등록되지 않았습니다. 예약 시 입금자명을 입력해주세요"
                    );
                    return;
                  }

                  if (
                    !confirm(
                      `입금자명: ${depositorName}\n\n입금을 완료하셨나요?\n입금 확인 요청을 캠핑장 관리자에게 전송합니다.`
                    )
                  ) {
                    return;
                  }
                  requestDepositConfirmation.mutate(reservation.payment.id, {
                    onSuccess: () => {
                      toast.success(
                        "입금 확인 요청이 전송되었습니다. 캠핑장 관리자가 확인 후 예약이 확정됩니다"
                      );
                    },
                    onError: (error) => {
                      toast.error(`요청 실패: ${error.message}`);
                    },
                  });
                }}
                disabled={requestDepositConfirmation.isPending}
              >
                {requestDepositConfirmation.isPending
                  ? "요청 중..."
                  : "💰 입금 확인 요청"}
              </Button>
            )}

          {/* 계좌이체 - CONFIRMATION_REQUESTED 상태: 대기 안내 */}
          {reservation.status === "PENDING" &&
            reservation.payment?.paymentMethod === "BANK_TRANSFER" &&
            reservation.payment?.status === "CONFIRMATION_REQUESTED" && (
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="mb-2 text-2xl">⏳</div>
                <p className="font-medium text-blue-900">
                  입금 확인 요청이 전송되었습니다
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  캠핑장 관리자가 입금을 확인하는 중입니다.
                  <br />
                  확인이 완료되면 예약이 자동으로 확정됩니다.
                </p>
              </div>
            )}

          {reservation.status === "CONFIRMED" && (
            <Button
              variant="outline"
              className="text-error border-error hover:bg-error/10 w-full"
              onClick={handleCancel}
              disabled={cancelReservation.isPending}
            >
              {cancelReservation.isPending ? "취소 처리 중..." : "예약 취소"}
            </Button>
          )}
          {reservation.status === "COMPLETED" && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() =>
                router.push(
                  `/campgrounds/${reservation.campgroundId}?showReviewForm=true`
                )
              }
            >
              ⭐ 리뷰 작성
            </Button>
          )}
        </div>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}
