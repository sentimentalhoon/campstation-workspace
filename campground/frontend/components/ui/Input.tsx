/**
 * Input Component
 * 재사용 가능한 기본 입력 필드 컴포넌트
 */

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

/**
 * Input 컴포넌트의 Props 타입
 */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** 입력 필드 레이블 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 입력 필드 크기 */
  inputSize?: InputSize;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
};

/**
 * Input 컴포넌트
 *
 * @description 레이블, 에러 메시지, 도움말을 지원하는 입력 필드 컴포넌트
 *
 * @param {InputProps} props - 입력 필드 속성
 * @param {string} [props.label] - 레이블 텍스트
 * @param {string} [props.error] - 에러 메시지 (표시 시 빨간색 테두리)
 * @param {string} [props.helperText] - 도움말 텍스트
 * @param {InputSize} [props.inputSize="md"] - 크기 (sm, md, lg)
 * @param {boolean} [props.fullWidth=false] - 전체 너비 사용 여부
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Input label="이메일" type="email" placeholder="example@email.com" />
 *
 * // 에러 표시
 * <Input label="비밀번호" type="password" error="비밀번호가 일치하지 않습니다" />
 *
 * // 도움말 포함
 * <Input
 *   label="사용자명"
 *   helperText="4-20자의 영문, 숫자만 가능합니다"
 * />
 *
 * // ref 사용
 * const inputRef = useRef<HTMLInputElement>(null);
 * <Input ref={inputRef} label="이름" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputSize = "md",
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-foreground text-sm font-medium"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            "border-input bg-background text-foreground rounded-lg border px-3",
            "placeholder:text-muted-foreground",
            "transition-colors",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",

            // Error state
            error && "border-error focus-visible:ring-error",

            // Size styles
            sizeStyles[inputSize],

            // Full width
            fullWidth && "w-full",

            className
          )}
          {...props}
        />

        {(error || helperText) && (
          <p
            className={cn(
              "text-sm",
              error ? "text-error" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 text-sm",
  md: "h-10 text-base",
  lg: "h-11 text-lg",
};
