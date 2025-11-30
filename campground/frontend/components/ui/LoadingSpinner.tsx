/**
 * LoadingSpinner Component
 * 로딩 상태를 표시하는 스피너 컴포넌트
 */

import { cn } from "@/lib/utils";

type LoadingSpinnerSize = "sm" | "md" | "lg" | "xl";

type LoadingSpinnerProps = {
  size?: LoadingSpinnerSize;
  className?: string;
  fullScreen?: boolean;
  text?: string;
};

export const LoadingSpinner = ({
  size = "md",
  className,
  fullScreen = false,
  text,
}: LoadingSpinnerProps) => {
  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || "로딩 중"}
    >
      <svg
        className={cn("text-primary animate-spin", sizeStyles[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

const sizeStyles: Record<LoadingSpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};
