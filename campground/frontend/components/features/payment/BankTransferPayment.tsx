"use client";

import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BankTransferPaymentProps {
  orderId: string;
  orderName: string;
  amount: number;
  customerName: string;
  reservationId?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function BankTransferPayment({
  orderId,
  orderName,
  amount,
  customerName,
  reservationId,
  onComplete: _onComplete, // eslint-disable-line @typescript-eslint/no-unused-vars
  onCancel,
}: BankTransferPaymentProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  // 입금 계좌 정보 (실제 운영 시 환경 변수나 백엔드에서 가져오기)
  const bankInfo = {
    bankName: "국민은행",
    accountNumber: "123-456-789012",
    accountHolder: "캠프스테이션",
  };

  // 입금 기한 (현재 시간 + 1일)
  const depositDeadline = new Date();
  depositDeadline.setDate(depositDeadline.getDate() + 1);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bankInfo.accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("계좌번호 복사 실패:", err);
      alert("계좌번호 복사에 실패했습니다.");
    }
  };

  const handleConfirmTransfer = () => {
    // 입금 대기 페이지로 이동
    const params = new URLSearchParams({
      orderId,
      amount: amount.toString(),
      bankName: bankInfo.bankName,
      accountNumber: bankInfo.accountNumber,
      accountHolder: bankInfo.accountHolder,
      deadline: depositDeadline.toISOString(),
    });

    if (reservationId) {
      params.append("reservationId", reservationId.toString());
    }

    router.push(`${ROUTES.PAYMENT.TRANSFER_PENDING}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">🏦</span>
          <h3 className="font-semibold text-blue-900">계좌이체 안내</h3>
        </div>
        <p className="text-sm text-blue-700">
          아래 계좌로 입금하시면 확인 후 예약이 확정됩니다.
        </p>
      </div>

      {/* 결제 금액 */}
      <div className="rounded-lg border-2 border-blue-500 bg-white p-4">
        <div className="mb-2 text-sm text-gray-600">입금하실 금액</div>
        <div className="text-3xl font-bold text-blue-600">
          {amount.toLocaleString()}원
        </div>
        <div className="mt-2 text-xs text-gray-500">
          ※ 정확한 금액을 입금해주세요
        </div>
      </div>

      {/* 입금 계좌 정보 */}
      <div className="space-y-3 rounded-lg bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900">입금 계좌</h4>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">은행명</span>
            <span className="font-medium text-gray-900">
              {bankInfo.bankName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">예금주</span>
            <span className="font-medium text-gray-900">
              {bankInfo.accountHolder}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">계좌번호</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-900">
                {bankInfo.accountNumber}
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

      {/* 입금자명 안내 */}
      <div className="space-y-2 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h4 className="font-semibold text-yellow-900">입금자명 확인</h4>
        </div>
        <p className="text-sm text-yellow-800">
          입금자명: <strong className="font-bold">{customerName}</strong>
        </p>
        <p className="text-xs text-yellow-700">
          예약자명과 입금자명이 다를 경우 확인이 지연될 수 있습니다.
        </p>
      </div>

      {/* 입금 기한 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">입금 기한</span>
          <span className="font-semibold text-red-600">
            {depositDeadline.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          ※ 입금 기한 내에 입금하지 않으면 자동으로 취소됩니다.
        </p>
      </div>

      {/* 주문 정보 */}
      <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">주문번호</span>
          <span className="font-medium text-gray-900">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">상품명</span>
          <span className="font-medium text-gray-900">{orderName}</span>
        </div>
      </div>

      {/* 안내사항 */}
      <div className="space-y-2 text-xs text-gray-600">
        <p className="font-medium text-gray-900">안내사항</p>
        <ul className="list-inside list-disc space-y-1">
          <li>입금 확인은 영업일 기준 1~2시간 정도 소요됩니다.</li>
          <li>입금 기한 내에 입금하지 않으면 예약이 자동 취소됩니다.</li>
          <li>부분 입금 시 환불 처리되며, 예약이 취소됩니다.</li>
          <li>입금 후 예약 내역에서 입금 상태를 확인할 수 있습니다.</li>
        </ul>
      </div>

      {/* 버튼 */}
      <div className="space-y-3">
        <Button
          variant="primary"
          fullWidth
          onClick={handleConfirmTransfer}
          className="bg-blue-600 hover:bg-blue-700"
        >
          입금 확인
        </Button>
        {onCancel && (
          <Button variant="ghost" fullWidth onClick={onCancel}>
            취소
          </Button>
        )}
      </div>
    </div>
  );
}
