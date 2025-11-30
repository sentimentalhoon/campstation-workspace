"use client";

import { logError } from "@/lib/errors/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Error Boundary Props
 */
type ErrorBoundaryProps = {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 에러 발생 시 표시할 폴백 UI */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

/**
 * Error Boundary State
 */
type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Error Boundary
 *
 * React 컴포넌트 트리에서 발생하는 에러를 잡아내어
 * 앱 전체가 크래시되는 것을 방지합니다.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>오류가 발생했습니다</h1>
 *       <button onClick={reset}>다시 시도</button>
 *     </div>
 *   )}
 *   onError={(error, errorInfo) => {
 *     console.error("Error caught:", error, errorInfo);
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @see docs/technical/UX-IMPROVEMENTS.md - Phase 2: 에러 바운더리
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * 에러 발생 시 state 업데이트
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 에러 정보 로깅
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 통합 에러 로깅 시스템 사용
    logError(error, {
      location: "ErrorBoundary",
      componentStack: errorInfo.componentStack,
    });

    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);
  }

  /**
   * 에러 상태 초기화 (재시도)
   */
  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // 기본 fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 text-6xl">😵</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              앗, 문제가 발생했어요
            </h1>
            <p className="mb-6 text-gray-600">
              일시적인 오류가 발생했습니다.
              <br />
              잠시 후 다시 시도해주세요.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={this.reset}
                className="bg-primary hover:bg-primary-hover rounded-lg px-6 py-3 font-semibold text-white transition"
              >
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                홈으로 이동
              </button>
            </div>

            {/* 개발 환경에서만 에러 상세 정보 표시 */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  에러 상세 정보 (개발 모드)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-800">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
