/**
 * 에러 로깅 유틸리티
 *
 * 애플리케이션에서 발생하는 에러를 기록하고 추적합니다.
 * Next.js 15+ / React 19+ 최적화
 */

import { ApiError } from "@/lib/api/errors";

/**
 * 에러 컨텍스트 정보
 */
export type ErrorContext = {
  /** 에러 발생 위치 (컴포넌트명.메서드명) */
  location?: string;
  /** 사용자 ID */
  userId?: number | string;
  /** API 엔드포인트 */
  endpoint?: string;
  /** HTTP 상태 코드 */
  statusCode?: number;
  /** 추가 메타데이터 */
  [key: string]: unknown;
};

/**
 * 에러 로깅
 *
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트 정보
 *
 * @example
 * ```tsx
 * try {
 *   await fetchData();
 * } catch (error) {
 *   logError(error, {
 *     location: "MyComponent.fetchData",
 *     userId: user?.id,
 *   });
 * }
 * ```
 */
export function logError(error: Error | unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // ApiError 추가 정보 추출
  const apiErrorInfo =
    error instanceof ApiError
      ? {
          statusCode: error.status,
          apiMessage: error.data.message,
          validationErrors: error.data.errors,
        }
      : {};

  // 개발 환경: 콘솔 출력
  if (process.env.NODE_ENV === "development") {
    console.group("🔴 [Error]");
    console.error("Message:", errorMessage);
    if (errorStack) console.error("Stack:", errorStack);
    if (Object.keys(apiErrorInfo).length > 0) {
      console.error("API Error:", apiErrorInfo);
    }
    if (context) console.error("Context:", context);
    console.groupEnd();
    return;
  }

  // 프로덕션 환경: 외부 서비스 전송
  if (process.env.NODE_ENV === "production") {
    // TODO: Sentry, LogRocket 등 외부 에러 추적 서비스 연동
    console.error("[Error]", {
      message: errorMessage,
      stack: errorStack,
      ...apiErrorInfo,
      context,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }
}

/**
 * 경고 로깅
 *
 * @param message - 경고 메시지
 * @param context - 추가 컨텍스트 정보
 */
export function logWarning(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === "development") {
    console.group("⚠️ [Warning]");
    console.warn("Message:", message);
    if (context) console.warn("Context:", context);
    console.groupEnd();
    return;
  }

  // 프로덕션 환경
  console.warn("[Warning]", {
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 정보 로깅
 *
 * @param message - 정보 메시지
 * @param context - 추가 컨텍스트 정보
 */
export function logInfo(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === "development") {
    console.log("ℹ️ [Info]", message, context);
  }
}
