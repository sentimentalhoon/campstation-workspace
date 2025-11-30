/**
 * StatsCard 컴포넌트
 *
 * 통계 정보를 표시하는 카드
 * - 제목, 값, 아이콘
 * - 전월 대비 증감률 표시 (선택)
 * - 클릭 이벤트 (선택)
 *
 * @see docs/admin-implementation-guide.md
 */

"use client";

import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number | string;
  change?: number; // 전월 대비 증감률 (%)
  icon?: LucideIcon;
  onClick?: () => void;
  loading?: boolean;
};

/**
 * StatsCard 컴포넌트
 *
 * @param title - 카드 제목
 * @param value - 표시할 값
 * @param change - 증감률 (%, 선택)
 * @param icon - 아이콘 (선택)
 * @param onClick - 클릭 이벤트 (선택)
 * @param loading - 로딩 상태
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="총 예약"
 *   value={125}
 *   change={15.3}
 *   icon={Calendar}
 * />
 * ```
 */
export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  onClick,
  loading = false,
}: StatsCardProps) {
  const isClickable = !!onClick;
  const isPositive = change !== undefined && change >= 0;

  // 숫자 포맷팅
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border bg-white p-6 shadow-sm transition-all ${
        isClickable ? "hover:border-primary cursor-pointer hover:shadow-md" : ""
      } ${loading ? "animate-pulse" : ""}`}
    >
      {/* 헤더: 제목 + 아이콘 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
        {Icon && (
          <div className="bg-primary/10 rounded-full p-2">
            <Icon size={20} className="text-primary" />
          </div>
        )}
      </div>

      {/* 값 */}
      <div className="mb-2">
        {loading ? (
          <div className="h-8 w-24 rounded bg-neutral-200" />
        ) : (
          <p className="text-3xl font-bold text-neutral-900">
            {formattedValue}
          </p>
        )}
      </div>

      {/* 증감률 */}
      {change !== undefined && !loading && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <span className="text-green-600">↑</span>
          ) : (
            <span className="text-red-600">↓</span>
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-neutral-500">전월 대비</span>
        </div>
      )}
    </div>
  );
}
