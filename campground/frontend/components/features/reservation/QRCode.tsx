/**
 * QRCode 컴포넌트
 * 예약 번호를 QR 코드로 표시
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - 예약 상세 페이지
 */

"use client";

import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

type QRCodeProps = {
  value: string; // 예약 번호 또는 QR 데이터
  size?: number; // QR 코드 크기
  className?: string;
  showLabel?: boolean; // 라벨 표시 여부
};

export function QRCode({
  value,
  size = 200,
  className,
  showLabel = true,
}: QRCodeProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* QR 코드 이미지 */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <QRCodeSVG
          value={value}
          size={size}
          level="H" // 높은 오류 수정 레벨
          includeMargin={false}
        />
      </div>

      {/* 설명 텍스트 */}
      {showLabel && (
        <p className="text-center text-sm text-neutral-600">
          이 QR코드를 입구에서 스캔해주세요
        </p>
      )}
    </div>
  );
}
