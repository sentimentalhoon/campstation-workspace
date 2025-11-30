/**
 * 계좌이체 입금 대기 페이지
 * 계좌이체 선택 후 입금 안내 및 대기 화면
 */

"use client";

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/ui/useToast";
import { ROUTES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function TransferPendingContent() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const bankName = searchParams.get("bankName");
  const accountNumber = searchParams.get("accountNumber");
  const accountHolder = searchParams.get("accountHolder");
  const deadline = searchParams.get("deadline");
  const reservationId = searchParams.get("reservationId");

  // 남은 시간 계산
  useEffect(() => {
    if (!deadline) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        setTimeLeft("입금 기한 만료");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const handleCopyAccount = async () => {
    if (!accountNumber) return;

    try {
      await navigator.clipboard.writeText(accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("계좌번호 복사 실패:", err);
      toast.error("계좌번호 복사에 실패했습니다");
    }
  };

  if (!orderId || !amount || !bankName || !accountNumber || !accountHolder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center">
          <div className="text-6xl">❌</div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-neutral-900">
              잘못된 접근입니다
            </h1>
            <p className="text-neutral-600">올바른 결제 정보가 없습니다.</p>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
          >
            캠핑장 둘러보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <h1 className="text-xl font-bold text-neutral-900">입금 대기 중</h1>
          <p className="mt-2 text-sm text-neutral-600">
            아래 계좌로 입금해주시면 확인 후 예약이 확정됩니다.
          </p>
        </div>

        {/* 남은 시간 */}
        {timeLeft && (
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <div className="text-sm text-red-600">입금 기한까지 남은 시간</div>
            <div className="mt-1 text-2xl font-bold text-red-700">
              {timeLeft}
            </div>
          </div>
        )}

        {/* 입금 금액 */}
        <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 text-center">
          <div className="text-sm text-blue-700">입금하실 금액</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {Number(amount).toLocaleString()}원
          </div>
          <div className="mt-2 text-xs text-blue-600">
            ※ 정확한 금액을 입금해주세요
          </div>
        </div>

        {/* 계좌 정보 */}
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">입금 계좌</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">은행명</span>
              <span className="font-medium text-gray-900">{bankName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">예금주</span>
              <span className="font-medium text-gray-900">{accountHolder}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">계좌번호</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900">
                  {accountNumber}
                </span>
                <button
                  onClick={handleCopyAccount}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {isCopied ? "복사됨 ✓" : "복사"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 정보 */}
        <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">주문번호</span>
            <span className="font-medium text-gray-900">{orderId}</span>
          </div>
          {deadline && (
            <div className="flex justify-between">
              <span className="text-gray-600">입금 기한</span>
              <span className="font-medium text-red-600">
                {new Date(deadline).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* 안내 사항 */}
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <h4 className="font-semibold text-yellow-900">안내사항</h4>
          </div>
          <ul className="space-y-1 text-xs text-yellow-800">
            <li>• 입금 확인은 영업일 기준 1~2시간 정도 소요됩니다.</li>
            <li>• 입금 기한 내에 입금하지 않으면 예약이 자동 취소됩니다.</li>
            <li>• 입금 후 예약 내역에서 입금 상태를 확인할 수 있습니다.</li>
            <li>
              • 예약자명과 입금자명이 다를 경우 확인이 지연될 수 있습니다.
            </li>
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(ROUTES.RESERVATIONS.LIST)}
          >
            예약 내역 확인
          </Button>
          {reservationId && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() =>
                router.push(ROUTES.RESERVATIONS.DETAIL(Number(reservationId)))
              }
            >
              예약 상세 보기
            </Button>
          )}
        </div>

        {/* 고객센터 안내 */}
        <div className="border-t pt-4 text-center text-xs text-gray-500">
          <p>입금 관련 문의사항이 있으신가요?</p>
          <p className="mt-1">
            고객센터: <span className="font-medium">1588-0000</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TransferPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <TransferPendingContent />
    </Suspense>
  );
}
