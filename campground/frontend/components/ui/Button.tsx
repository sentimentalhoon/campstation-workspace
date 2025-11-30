/**
 * Button Component
 * 재사용 가능한 기본 버튼 컴포넌트
 */

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

/**
 * Button 컴포넌트의 Props 타입
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 버튼 스타일 변형 */
  variant?: ButtonVariant;
  /** 버튼 크기 */
  size?: ButtonSize;
  /** 로딩 상태 (스피너 표시) */
  loading?: boolean;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 버튼 내용 */
  children: ReactNode;
};

/**
 * Button 컴포넌트
 *
 * @description 다양한 스타일과 크기를 지원하는 재사용 가능한 버튼 컴포넌트
 *
 * @param {ButtonProps} props - 버튼 속성
 * @param {ButtonVariant} [props.variant="primary"] - 버튼 스타일 (primary, secondary, danger, ghost, outline)
 * @param {ButtonSize} [props.size="md"] - 버튼 크기 (sm, md, lg)
 * @param {boolean} [props.loading=false] - 로딩 상태
 * @param {boolean} [props.fullWidth=false] - 전체 너비 사용 여부
 * @param {boolean} [props.disabled] - 비활성화 여부
 * @param {string} [props.className] - 추가 CSS 클래스
 * @param {ReactNode} props.children - 버튼 내용
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Button onClick={handleClick}>클릭</Button>
 *
 * // 스타일 변형
 * <Button variant="secondary" size="lg">큰 버튼</Button>
 *
 * // 로딩 상태
 * <Button loading={isSubmitting}>제출</Button>
 *
 * // 전체 너비
 * <Button fullWidth variant="primary">전체 너비 버튼</Button>
 * ```
 *
 * @see {@link https://github.com/sentimentalhoon/campstation-frontend/blob/main/docs/technical/03-COMPONENT-PATTERNS.md}
 */
export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",

        // Variant styles
        variantStyles[variant],

        // Size styles
        sizeStyles[size],

        // Full width
        fullWidth && "w-full",

        // Loading state
        loading && "cursor-wait",

        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size={size} />}
      {children}
    </button>
  );
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
  danger: "bg-error text-white hover:bg-error/90 active:bg-error/80",
  ghost: "bg-transparent hover:bg-accent/10 active:bg-accent/20",
  outline:
    "border-2 border-border bg-transparent hover:bg-accent/10 active:bg-accent/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-11 px-6 text-lg",
};

// Loading Spinner Component
const LoadingSpinner = ({ size }: { size: ButtonSize }) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <svg
      className={cn("animate-spin", sizeMap[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
  );
};
