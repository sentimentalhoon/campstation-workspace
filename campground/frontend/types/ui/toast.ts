/**
 * Toast 알림 타입 정의
 */

/**
 * Toast variant (알림 유형)
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

/**
 * 개별 Toast 아이템
 */
export type ToastItem = {
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
export type ToastContextValue = {
  /** 현재 활성화된 Toast 목록 */
  toasts: ToastItem[];
  /** Toast 추가 */
  addToast: (toast: Omit<ToastItem, "id">) => void;
  /** Toast 제거 */
  removeToast: (id: string) => void;
  /** 성공 Toast 표시 */
  success: (message: string, duration?: number) => void;
  /** 에러 Toast 표시 */
  error: (message: string, duration?: number) => void;
  /** 경고 Toast 표시 */
  warning: (message: string, duration?: number) => void;
  /** 정보 Toast 표시 */
  info: (message: string, duration?: number) => void;
};
