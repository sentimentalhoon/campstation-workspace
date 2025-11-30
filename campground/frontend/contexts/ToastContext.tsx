"use client";

import type { ToastVariant } from "@/components/ui/Toast";
import { Toast } from "@/components/ui/Toast";
import { createContext, useCallback, useState } from "react";

/**
 * 개별 Toast 아이템
 */
type ToastItem = {
  /** Toast 고유 ID */
  id: string;
  /** 알림 유형 */
  variant: ToastVariant;
  /** 알림 메시지 */
  message: string;
  /** 표시 시간 (ms, 기본 3000) */
  duration?: number;
};

/**
 * Toast 컨텍스트 값
 */
type ToastContextValue = {
  /** 성공 Toast 표시 */
  success: (message: string, duration?: number) => void;
  /** 에러 Toast 표시 */
  error: (message: string, duration?: number) => void;
  /** 경고 Toast 표시 */
  warning: (message: string, duration?: number) => void;
  /** 정보 Toast 표시 */
  info: (message: string, duration?: number) => void;
};

/**
 * Toast Context
 */
export const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast Provider Props
 */
type ToastProviderProps = {
  children: React.ReactNode;
  /** 최대 동시 표시 Toast 수 (기본: 3) */
  maxToasts?: number;
};

/**
 * Toast Provider
 *
 * 전역 Toast 알림을 관리합니다.
 * 최대 3개까지 동시에 표시하며, Queue로 관리합니다.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 * ```
 *
 * @see docs/technical/UX-IMPROVEMENTS.md - Phase 1: Toast 알림 시스템
 */
export function ToastProvider({ children, maxToasts = 3 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /**
   * Toast 추가
   */
  const addToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setToasts((prev) => {
        const newToasts = [...prev, { ...toast, id }];
        // 최대 개수 초과 시 가장 오래된 Toast 제거
        return newToasts.slice(-maxToasts);
      });
    },
    [maxToasts]
  );

  /**
   * Toast 제거
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * 성공 Toast
   */
  const success = useCallback(
    (message: string, duration?: number) => {
      addToast({ variant: "success", message, duration });
    },
    [addToast]
  );

  /**
   * 에러 Toast
   */
  const error = useCallback(
    (message: string, duration?: number) => {
      addToast({ variant: "error", message, duration });
    },
    [addToast]
  );

  /**
   * 경고 Toast
   */
  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast({ variant: "warning", message, duration });
    },
    [addToast]
  );

  /**
   * 정보 Toast
   */
  const info = useCallback(
    (message: string, duration?: number) => {
      addToast({ variant: "info", message, duration });
    },
    [addToast]
  );

  const value: ToastContextValue = {
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast 렌더링 (하단부터 쌓임) */}
      <div className="fixed right-0 bottom-20 left-0 z-50 flex flex-col gap-2 px-4">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(-${index * 8}px)`,
              zIndex: 50 + index,
            }}
          >
            <Toast
              id={toast.id}
              variant={toast.variant}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
