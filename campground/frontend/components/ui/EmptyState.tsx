/**
 * EmptyState Component
 * 데이터가 없을 때 표시하는 빈 상태 컴포넌트
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="예약 내역이 없습니다"
 *   description="아직 예약한 캠핑장이 없습니다."
 *   action={<Button>캠핑장 찾기</Button>}
 * />
 * ```
 */

import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * EmptyState 컴포넌트 Props
 */
type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  /** 아이콘 (기본: Inbox) */
  icon?: ReactNode;
  /** 제목 */
  title: string;
  /** 설명 */
  description?: string;
  /** 액션 버튼 */
  action?: ReactNode;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 배경 스타일 */
  variant?: "default" | "card" | "bordered";
};

/**
 * size별 스타일 맵
 */
const sizeStyles = {
  sm: {
    container: "py-6",
    icon: "h-10 w-10",
    title: "text-base",
    description: "text-sm",
  },
  md: {
    container: "py-8",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "py-12",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
  },
};

/**
 * variant별 스타일 맵
 */
const variantStyles = {
  default: "bg-transparent",
  card: "rounded-lg bg-white",
  bordered: "rounded-lg border border-neutral-200 bg-white",
};

/**
 * EmptyState 컴포넌트
 *
 * @description 데이터가 없는 빈 상태를 일관되게 표시합니다.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  variant = "default",
  className,
  ...props
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variantStyles[variant],
        styles.container,
        className
      )}
      {...props}
    >
      {/* 아이콘 */}
      <div className={cn("mb-4 text-gray-300", styles.icon)}>
        {icon || <Inbox className="h-full w-full" />}
      </div>

      {/* 제목 */}
      <h3 className={cn("font-semibold text-gray-900", styles.title)}>
        {title}
      </h3>

      {/* 설명 */}
      {description && (
        <p className={cn("mt-2 text-gray-500", styles.description)}>
          {description}
        </p>
      )}

      {/* 액션 */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
