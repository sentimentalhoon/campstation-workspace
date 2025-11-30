/**
 * 캠핑장 조회수 통계 컴포넌트
 *
 * Owner Dashboard에서 캠핑장별 조회수 통계를 표시합니다.
 */

"use client";

import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCampgroundStats } from "@/hooks/useCampgroundStats";
import { Eye, TrendingUp, Users } from "lucide-react";

type CampgroundViewStatsProps = {
  campgroundId: number;
  campgroundName: string;
  period?: number; // 기간 (일 단위, 기본값: 30)
};

/**
 * 캠핑장 조회수 통계 카드
 *
 * @example
 * ```tsx
 * <CampgroundViewStats
 *   campgroundId={1}
 *   campgroundName="아름다운 캠핑장"
 *   period={30}
 * />
 * ```
 */
export function CampgroundViewStats({
  campgroundId,
  campgroundName,
  period = 30,
}: CampgroundViewStatsProps) {
  const { data: stats, isLoading, error } = useCampgroundStats(campgroundId, {
    days: period,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <ErrorMessage message="통계를 불러올 수 없습니다" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{campgroundName}</h3>
        <p className="mt-1 text-sm text-gray-500">
          최근 {period}일 조회수 통계
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 총 방문자 */}
        <div className="group relative overflow-hidden rounded-xl bg-blue-50 p-4 transition-all hover:bg-blue-100">
          <div className="absolute top-0 right-0 h-12 w-12 translate-x-4 -translate-y-4 rounded-full bg-blue-100 transition-transform group-hover:scale-110"></div>
          <Eye className="relative mb-2 h-6 w-6 text-blue-600" />
          <p className="relative text-xs font-medium text-blue-800">방문자</p>
          <p className="relative text-2xl font-bold text-blue-900">
            {stats.totalUniqueVisitors.toLocaleString()}
          </p>
        </div>

        {/* 총 조회수 */}
        <div className="group relative overflow-hidden rounded-xl bg-purple-50 p-4 transition-all hover:bg-purple-100">
          <div className="absolute top-0 right-0 h-12 w-12 translate-x-4 -translate-y-4 rounded-full bg-purple-100 transition-transform group-hover:scale-110"></div>
          <Users className="relative mb-2 h-6 w-6 text-purple-600" />
          <p className="relative text-xs font-medium text-purple-800">조회수</p>
          <p className="relative text-2xl font-bold text-purple-900">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>

        {/* 전환율 */}
        <div className="group relative overflow-hidden rounded-xl bg-green-50 p-4 transition-all hover:bg-green-100">
          <div className="absolute top-0 right-0 h-12 w-12 translate-x-4 -translate-y-4 rounded-full bg-green-100 transition-transform group-hover:scale-110"></div>
          <TrendingUp className="relative mb-2 h-6 w-6 text-green-600" />
          <p className="relative text-xs font-medium text-green-800">전환율</p>
          <p className="relative text-2xl font-bold text-green-900">
            {stats.conversionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-xs text-gray-600">일평균 방문자</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {stats.avgDailyVisitors.toLocaleString()}명
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">평균 체류 시간</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {Math.floor(stats.avgViewDuration / 60)}분{" "}
            {stats.avgViewDuration % 60}초
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 간단한 조회수 배지 (캠핑장 카드용)
 */
export function ViewCountBadge({ viewCount }: { viewCount: number }) {
  return (
    <div className="flex items-center gap-1 text-gray-600">
      <Eye className="h-4 w-4" />
      <span className="text-sm font-medium">{viewCount.toLocaleString()}</span>
    </div>
  );
}
