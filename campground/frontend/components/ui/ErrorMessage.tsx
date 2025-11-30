/**
 * ErrorMessage Component
 * 에러 메시지를 표시하는 컴포넌트
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ErrorMessageProps = {
  title?: string;
  message: string;
  className?: string;
  fullScreen?: boolean;
  retry?: () => void;
  children?: ReactNode;
};

export const ErrorMessage = ({
  title = "오류가 발생했습니다",
  message,
  className,
  fullScreen = false,
  retry,
  children,
}: ErrorMessageProps) => {
  const content = (
    <div
      className={cn(
        "border-error/20 bg-error/5 flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="bg-error/10 flex h-12 w-12 items-center justify-center rounded-full">
        <svg
          className="text-error h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>

      {retry && (
        <button
          onClick={retry}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          aria-label="에러 발생 후 다시 시도"
        >
          다시 시도
        </button>
      )}

      {children}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};
