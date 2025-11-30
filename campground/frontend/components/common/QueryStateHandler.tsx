/**
 * QueryStateHandler Component
 * React Query의 로딩/에러/빈 상태를 일관되게 처리하는 래퍼 컴포넌트
 *
 * @example
 * ```tsx
 * <QueryStateHandler
 *   isLoading={isLoading}
 *   error={error}
 *   isEmpty={data?.content.length === 0}
 *   emptyMessage="데이터가 없습니다"
 *   emptyIcon="📭"
 * >
 *   <YourContent data={data} />
 * </QueryStateHandler>
 * ```
 */

import { ErrorMessage, LoadingSpinner } from "@/components/ui";
import type { ReactNode } from "react";

type QueryStateHandlerProps = {
  // 로딩 상태
  isLoading?: boolean;
  loadingText?: string;

  // 에러 상태
  error?: Error | null;
  errorTitle?: string;
  onRetry?: () => void;

  // 빈 상태
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;

  // 컨텐츠
  children: ReactNode;

  // 레이아웃
  fullScreen?: boolean;
  className?: string;
};

export function QueryStateHandler({
  isLoading,
  loadingText,
  error,
  errorTitle,
  onRetry,
  isEmpty,
  emptyTitle = "데이터가 없습니다",
  emptyMessage,
  emptyIcon,
  emptyAction,
  children,
  fullScreen = false,
  className,
}: QueryStateHandlerProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen={fullScreen}
        text={loadingText}
        className={className}
      />
    );
  }

  // 에러 상태
  if (error) {
    return (
      <ErrorMessage
        title={errorTitle}
        message={error.message}
        fullScreen={fullScreen}
        retry={onRetry}
        className={className}
      />
    );
  }

  // 빈 상태
  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon={emptyIcon}
        action={emptyAction}
        fullScreen={fullScreen}
        className={className}
      />
    );
  }

  // 정상 상태 - 컨텐츠 렌더링
  return <>{children}</>;
}

/**
 * EmptyState Component
 * 데이터가 없을 때 표시되는 컴포넌트
 */
type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  fullScreen?: boolean;
  className?: string;
};

function EmptyState({
  title,
  message,
  icon = "📭",
  action,
  fullScreen,
  className,
}: EmptyStateProps) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 text-center ${className || ""}`}
      role="status"
      aria-live="polite"
    >
      {/* 아이콘 */}
      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full text-4xl">
        {icon}
      </div>

      {/* 제목 & 메시지 */}
      <div className="space-y-2">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        {message && (
          <p className="text-muted-foreground max-w-md text-sm">{message}</p>
        )}
      </div>

      {/* 액션 버튼 */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
