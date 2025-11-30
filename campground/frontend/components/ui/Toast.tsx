/**
 * Toast 알림 컴포넌트
 *
 * 사용자에게 비침투적 알림을 표시합니다.
 * ToastContext와 함께 사용하여 전역 알림 시스템을 구성합니다.
 *
 * @see docs/technical/UX-IMPROVEMENTS.md - Phase 1: Toast 알림 시스템
 * @see docs/sprints/sprint-5.md - P2-2: 찜하기 토스트 알림
 */

"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Toast variant (알림 유형)
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

/**
 * Toast 컴포넌트 Props
 */
type ToastProps = {
  /** Toast 고유 ID */
  id: string;
  /** 알림 메시지 */
  message: string;
  /** 알림 유형 (기본: info) */
  variant?: ToastVariant;
  /** 표시 시간 (ms, 기본: 3000) */
  duration?: number;
  /** Toast 닫기 콜백 */
  onClose: () => void;
};

/**
 * Toast 알림 컴포넌트
 *
 * 화면 하단에 나타나는 알림 메시지입니다.
 * 자동으로 사라지며, 수동으로 닫을 수도 있습니다.
 *
 * @example
 * ```tsx
 * <Toast
 *   id="toast-1"
 *   message="찜 목록에 추가되었습니다"
 *   variant="success"
 *   duration={3000}
 *   onClose={() => removeToast("toast-1")}
 * />
 * ```
 */
export function Toast({
  message,
  variant = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 후 제거
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed right-4 bottom-20 left-4 z-50 mx-auto max-w-[640px] transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-lg ${variantStyles[variant]}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">
            {variantIcons[variant]}
          </span>
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Variant별 스타일
 */
const variantStyles: Record<ToastVariant, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-yellow-600 text-white",
  info: "bg-neutral-800 text-white",
};

/**
 * Variant별 아이콘
 */
const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};
