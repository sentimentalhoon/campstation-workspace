/**
 * Alert Component
 * 사용자에게 중요한 정보를 전달하는 알림 컴포넌트
 *
 * @example
 * ```tsx
 * <Alert variant="error">
 *   <AlertTitle>오류</AlertTitle>
 *   <AlertDescription>작업을 완료할 수 없습니다.</AlertDescription>
 * </Alert>
 * ```
 */

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Alert variant 타입
 */
export type AlertVariant = "default" | "info" | "success" | "warning" | "error";

/**
 * Alert 컴포넌트 Props
 */
type AlertProps = HTMLAttributes<HTMLDivElement> & {
  /** Alert 내용 */
  children: ReactNode;
  /** Alert 유형 (기본: default) */
  variant?: AlertVariant;
  /** 닫기 버튼 표시 여부 */
  dismissible?: boolean;
  /** 닫기 버튼 클릭 핸들러 */
  onDismiss?: () => void;
  /** 아이콘 표시 여부 (기본: true) */
  showIcon?: boolean;
};

/**
 * variant별 스타일 맵
 */
const variantStyles: Record<AlertVariant, string> = {
  default: "bg-gray-50 border-gray-200 text-gray-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
  success: "bg-green-50 border-green-200 text-green-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  error: "bg-red-50 border-red-200 text-red-900",
};

/**
 * variant별 아이콘 색상 맵
 */
const iconColorStyles: Record<AlertVariant, string> = {
  default: "text-gray-600",
  info: "text-blue-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

/**
 * variant별 아이콘 컴포넌트 맵
 */
const iconComponents: Record<AlertVariant, typeof Info> = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

/**
 * Alert 컴포넌트
 *
 * @description 사용자에게 중요한 정보, 경고, 오류 등을 전달합니다.
 */
export function Alert({
  children,
  variant = "default",
  dismissible = false,
  onDismiss,
  showIcon = true,
  className,
  ...props
}: AlertProps) {
  const Icon = iconComponents[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative rounded-lg border p-4",
        "flex gap-3",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn("h-5 w-5 shrink-0", iconColorStyles[variant])}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 space-y-1">{children}</div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "shrink-0 rounded-md p-1",
            "transition-colors hover:bg-black/5",
            iconColorStyles[variant]
          )}
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * AlertTitle 컴포넌트 Props
 */
type AlertTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

/**
 * AlertTitle 컴포넌트
 *
 * @description Alert의 제목을 표시합니다.
 */
export function AlertTitle({ children, className, ...props }: AlertTitleProps) {
  return (
    <h5
      className={cn("leading-none font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  );
}

/**
 * AlertDescription 컴포넌트 Props
 */
type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

/**
 * AlertDescription 컴포넌트
 *
 * @description Alert의 상세 내용을 표시합니다.
 */
export function AlertDescription({
  children,
  className,
  ...props
}: AlertDescriptionProps) {
  return (
    <div
      className={cn("text-sm leading-relaxed opacity-90", className)}
      {...props}
    >
      {children}
    </div>
  );
}
