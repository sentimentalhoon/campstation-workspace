/**
 * Checkbox Component
 * 체크박스 UI 컴포넌트
 */

"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled,
  className,
  ...props
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 transition-all",
          checked
            ? "bg-primary border-primary"
            : "border-neutral-300 bg-white hover:border-neutral-400",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={handleChange}
      >
        {checked && (
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}
