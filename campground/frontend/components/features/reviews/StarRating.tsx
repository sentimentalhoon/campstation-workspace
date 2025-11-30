/**
 * 별점 입력/표시 컴포넌트
 *
 * @see docs/sprints/sprint-3.md - Task 10
 * @see docs/technical/03-COMPONENT-PATTERNS.md - UI Components
 */

"use client";

import { Star } from "lucide-react";
import { useState } from "react";

type StarRatingProps = {
  /**
   * 현재 별점 (1-5)
   */
  value: number;

  /**
   * 별점 변경 콜백
   */
  onChange?: (rating: number) => void;

  /**
   * 읽기 전용 모드 (입력 불가)
   */
  readOnly?: boolean;

  /**
   * 별 크기
   */
  size?: "sm" | "md" | "lg";

  /**
   * 별점 표시 텍스트 표시 여부
   */
  showLabel?: boolean;

  /**
   * 커스텀 클래스
   */
  className?: string;
};

const SIZE_STYLES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

/**
 * StarRating 컴포넌트
 *
 * 1-5점 사이의 별점을 입력하거나 표시합니다.
 *
 * @example
 * ```tsx
 * // 입력 모드
 * <StarRating value={rating} onChange={setRating} />
 *
 * // 읽기 전용 모드
 * <StarRating value={4.5} readOnly />
 *
 * // 크기 및 레이블 커스터마이징
 * <StarRating value={rating} onChange={setRating} size="lg" showLabel />
 * ```
 */
export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showLabel = false,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readOnly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating ?? value;
  const sizeClass = SIZE_STYLES[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = rating <= displayRating;
          const isHalfFilled =
            !Number.isInteger(displayRating) &&
            rating === Math.ceil(displayRating);

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={readOnly}
              className={`transition-colors ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} ${isFilled ? "text-yellow-500" : "text-neutral-300"} `}
              aria-label={`${rating}점`}
            >
              {isHalfFilled ? (
                <div className="relative">
                  <Star className={`${sizeClass} text-neutral-300`} />
                  <Star
                    className={`${sizeClass} absolute top-0 left-0 text-yellow-500`}
                    style={{
                      clipPath: "inset(0 50% 0 0)",
                    }}
                    fill="currentColor"
                  />
                </div>
              ) : (
                <Star
                  className={sizeClass}
                  fill={isFilled ? "currentColor" : "none"}
                  strokeWidth={isFilled ? 0 : 2}
                />
              )}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="ml-1 text-sm font-medium text-neutral-700">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
