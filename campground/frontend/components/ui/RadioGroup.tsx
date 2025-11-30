/**
 * RadioGroup Component
 * 여러 옵션 중 하나를 선택하는 라디오 버튼 그룹
 *
 * @example
 * ```tsx
 * <RadioGroup value={payment} onChange={setPayment}>
 *   <RadioGroupItem value="card" label="신용카드" />
 *   <RadioGroupItem value="transfer" label="계좌이체" />
 * </RadioGroup>
 * ```
 */

"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  createContext,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useContext,
} from "react";

/**
 * RadioGroup Context 타입
 */
type RadioGroupContextValue = {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
};

/**
 * RadioGroup Context
 */
const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(
  undefined
);

/**
 * RadioGroup Hook
 */
function useRadioGroup() {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within RadioGroup");
  }
  return context;
}

/**
 * RadioGroup 컴포넌트 Props
 */
type RadioGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** 선택된 값 */
  value?: string;
  /** 값 변경 핸들러 */
  onChange?: (value: string) => void;
  /** input name 속성 */
  name?: string;
  /** 자식 요소 */
  children: ReactNode;
  /** 세로 정렬 여부 (기본: false) */
  vertical?: boolean;
};

/**
 * RadioGroup 컴포넌트
 *
 * @description 라디오 버튼 그룹의 컨테이너입니다.
 */
export function RadioGroup({
  value,
  onChange,
  name,
  children,
  vertical = false,
  className,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange, name }}>
      <div
        role="radiogroup"
        className={cn(
          "flex gap-3",
          vertical ? "flex-col" : "flex-row flex-wrap",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

/**
 * RadioGroupItem 컴포넌트 Props
 */
type RadioGroupItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  /** 라디오 버튼 값 */
  value: string;
  /** 라벨 텍스트 */
  label?: ReactNode;
  /** 설명 텍스트 */
  description?: string;
  /** 커스텀 스타일 적용 여부 */
  styled?: boolean;
};

/**
 * RadioGroupItem 컴포넌트
 *
 * @description 개별 라디오 버튼 아이템입니다.
 */
export function RadioGroupItem({
  value: itemValue,
  label,
  description,
  styled = true,
  disabled,
  className,
  ...props
}: RadioGroupItemProps) {
  const { value, onChange, name } = useRadioGroup();
  const isChecked = value === itemValue;

  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(itemValue);
    }
  };

  if (!styled) {
    // 기본 HTML 라디오 버튼 (스타일 없음)
    return (
      <label
        className={cn("flex cursor-pointer items-center gap-2", className)}
      >
        <input
          type="radio"
          name={name}
          value={itemValue}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }

  // 커스텀 스타일 라디오 버튼
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all",
        isChecked
          ? "border-primary bg-primary/5 ring-primary ring-2 ring-offset-2"
          : "hover:border-primary/50 border-neutral-200 bg-white",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={itemValue}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      {/* 커스텀 라디오 버튼 인디케이터 */}
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          isChecked
            ? "border-primary bg-primary"
            : "group-hover:border-primary/50 border-neutral-300 bg-white"
        )}
      >
        {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>

      {/* 라벨 및 설명 */}
      {(label || description) && (
        <div className="flex-1">
          {label && <div className="font-medium text-gray-900">{label}</div>}
          {description && (
            <div className="mt-1 text-sm text-gray-500">{description}</div>
          )}
        </div>
      )}
    </label>
  );
}
