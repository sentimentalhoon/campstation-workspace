/**
 * OWNER 예약 상세 관리 페이지
 * 일반 사용자 페이지와 달리 관리 기능 추가
 */

"use client";

import { withOwnerAuth } from "@/components/hoc";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/ui/useToast";
import { ownerApi } from "@/lib/api/owner";
import { paymentApi } from "@/lib/api/payments";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import type { Reservation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  QrCode,
  User,
  Users,
  XCircle,
} from "lucide-react";
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
      <div className="h-[300px] w-[300px] animate-pulse rounded-lg bg-gray-200" />
    ),
  }
);

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function OwnerReservationDetailPage({ params }: PageProps) {
  const router = useRouter();
  const toast = useToast();
  const { id } = use(params);
  const reservationId = Number(id);

  // Owner 전용 API 사용
  const {
    data: reservation,
    isLoading,
    error,
  } = useQuery<Reservation>({
    queryKey: ["owner", "reservation", reservationId],
    queryFn: () => ownerApi.getReservation(reservationId),
    enabled: !!reservationId,
    staleTime: 0, // 항상 최신 데이터
  });
  const [timeLeft, setTimeLeft] = useState<string>("");

  // 30분 타이머 (PENDING 상태일 때)
  useEffect(() => {
    if (!reservation?.payment || reservation.payment.status !== "PENDING") {
      return;
    }

    const paymentCreatedAt = new Date(reservation.payment.createdAt);
    const expiryTime = new Date(paymentCreatedAt.getTime() + 30 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = expiryTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("만료됨");
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation]);

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD.OWNER_RESERVATIONS);
  };

  const handleApprovePayment = async () => {
    if (!reservation?.payment) return;

    if (!confirm("입금을 확인하고 결제를 승인하시겠습니까?")) return;

    try {
      await paymentApi.confirmDeposit(reservation.payment.id);
      toast.success("결제가 승인되었습니다");
      window.location.reload();
    } catch (error) {
      console.error("결제 승인 실패:", error);
      toast.error("결제 승인에 실패했습니다");
    }
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;

    const reason = prompt("예약 취소 사유를 입력해주세요:");
    if (!reason) return;

    if (!confirm("정말 이 예약을 취소하시겠습니까?")) return;

    try {
      await ownerApi.updateReservationStatus(reservation.id, "CANCELLED");
      toast.success("예약이 취소되었습니다");
      router.push(ROUTES.DASHBOARD.OWNER_RESERVATIONS);
    } catch (error) {
      console.error("예약 취소 실패:", error);
      toast.error("예약 취소에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold">예약을 찾을 수 없습니다</h2>
          <p className="mb-4 text-gray-600">
            존재하지 않거나 접근 권한이 없는 예약입니다.
          </p>
          <Button onClick={handleBack}>목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  // 디버깅: 결제 상태 확인
  console.log("=== Reservation Debug ===");
  console.log("Full Reservation:", JSON.stringify(reservation, null, 2));
  console.log("Payment:", reservation.payment);
  console.log("Payment Status:", reservation.payment?.status);
  console.log("Payment Status Type:", typeof reservation.payment?.status);
  console.log("========================");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                예약 상세 관리
              </h1>
              <p className="mt-2 text-gray-600">예약 번호: #{reservation.id}</p>
            </div>

            {/* 예약 상태 배지 */}
            <div className="flex gap-2">
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  reservation.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : reservation.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : reservation.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {reservation.status === "PENDING"
                  ? "대기중"
                  : reservation.status === "CONFIRMED"
                    ? "확정"
                    : reservation.status === "COMPLETED"
                      ? "완료"
                      : "취소"}
              </span>

              {reservation.payment && (
                <span
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    reservation.payment.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : reservation.payment.status === "PENDING"
                        ? "bg-orange-100 text-orange-800"
                        : reservation.payment.status ===
                            "CONFIRMATION_REQUESTED"
                          ? "bg-sky-100 text-sky-800"
                          : reservation.payment.status === "FAILED"
                            ? "bg-rose-100 text-rose-800"
                            : reservation.payment.status === "REFUNDED"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {reservation.payment.status === "COMPLETED"
                    ? "💳 결제완료"
                    : reservation.payment.status === "PENDING"
                      ? "⏳ 결제대기"
                      : reservation.payment.status === "CONFIRMATION_REQUESTED"
                        ? "📝 입금확인요청"
                        : reservation.payment.status === "FAILED"
                          ? "❌ 결제실패"
                          : reservation.payment.status === "REFUNDED"
                            ? "💰 환불완료"
                            : "❓ 알 수 없음"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 타이머 (결제 대기 중일 때) */}
        {reservation.payment?.status === "PENDING" && timeLeft && (
          <div className="mb-6 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">결제 대기 중</h3>
                <p className="text-sm text-orange-700">
                  남은 시간:{" "}
                  <span className="font-mono text-lg">{timeLeft}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 관리자 액션 버튼 */}
        {reservation.payment?.status === "CONFIRMATION_REQUESTED" && (
          <div className="mb-6 rounded-lg border-2 border-sky-200 bg-sky-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-sky-600" />
                <div>
                  <h3 className="font-semibold text-sky-900">
                    입금 확인 요청됨
                  </h3>
                  <p className="text-sm text-sky-700">
                    고객이 입금을 완료했습니다. 확인 후 승인해주세요.
                  </p>
                  {reservation.payment.depositorName && (
                    <p className="mt-1 text-sm text-sky-700">
                      입금자명:{" "}
                      <span className="font-semibold">
                        {reservation.payment.depositorName}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleApprovePayment}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                입금 확인 완료
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* 캠핑장 정보 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
              <MapPin className="mr-2 h-5 w-5 text-blue-600" />
              캠핑장 정보
            </h2>
            <div className="space-y-3 text-gray-600">
              <div>
                <p className="text-sm text-gray-500">캠핑장</p>
                <p className="font-semibold text-gray-900">
                  {reservation.campgroundName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">사이트</p>
                <p className="font-semibold text-gray-900">
                  {reservation.siteNumber}번
                </p>
              </div>
            </div>
          </div>

          {/* 예약자 정보 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              예약자 정보
            </h2>
            <div className="space-y-3 text-gray-600">
              <div>
                <p className="text-sm text-gray-500">예약자</p>
                <p className="font-semibold text-gray-900">
                  {reservation.userName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">인원</p>
                <p className="flex items-center font-semibold text-gray-900">
                  <Users className="mr-1 h-4 w-4" />
                  {reservation.numberOfGuests}명
                </p>
              </div>
            </div>
          </div>

          {/* 체크인/체크아웃 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              일정
            </h2>
            <div className="space-y-3 text-gray-600">
              <div>
                <p className="text-sm text-gray-500">체크인</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(reservation.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">체크아웃</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(reservation.checkOutDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">숙박 일수</p>
                <p className="font-semibold text-gray-900">
                  {reservation.numberOfNights}박
                </p>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              결제 정보
            </h2>
            <div className="space-y-3 text-gray-600">
              <div>
                <p className="text-sm text-gray-500">결제 금액</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₩{reservation.totalAmount.toLocaleString()}
                </p>
              </div>
              {reservation.payment && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">결제 방법</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.payment.paymentMethod === "CARD"
                        ? "카드 결제"
                        : reservation.payment.paymentMethod === "BANK_TRANSFER"
                          ? "계좌이체"
                          : "간편결제"}
                    </p>
                  </div>
                  {reservation.payment.depositorName && (
                    <div>
                      <p className="text-sm text-gray-500">입금자명</p>
                      <p className="font-semibold text-gray-900">
                        {reservation.payment.depositorName}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">결제 일시</p>
                    <p className="font-semibold text-gray-900">
                      {formatDateTime(reservation.payment.createdAt)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 특별 요청사항 */}
        {reservation.specialRequests && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              특별 요청사항
            </h2>
            <p className="whitespace-pre-wrap text-gray-600">
              {reservation.specialRequests}
            </p>
          </div>
        )}

        {/* QR 코드 */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <QrCode className="mr-2 h-5 w-5 text-blue-600" />
            예약 확인 QR 코드
          </h2>
          <div className="flex flex-col items-center">
            {reservation && (
              <QRCode
                value={reservation.id.toString()}
                size={300}
                showLabel={false}
              />
            )}
            <p className="mt-4 text-sm text-gray-500">
              체크인 시 이 QR 코드를 제시해주세요
            </p>
          </div>
        </div>

        {/* 관리 액션 버튼 */}
        {reservation.status !== "CANCELLED" && (
          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleCancelReservation}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              예약 취소
            </Button>
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-20" />
      </div>
    </div>
  );
}

export default withOwnerAuth(OwnerReservationDetailPage);
