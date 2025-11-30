"use client";

import {
  ComparisonChart,
  DistributionChart,
  TrendChart,
} from "@/components/charts";
import { StatsCard } from "@/components/features/admin/StatsCard";
import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { useAdminStats } from "@/hooks";
import {
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

/**
 * ADMIN 대시보드
 * 전체 시스템 통계 및 최근 활동을 표시합니다.
 */
function AdminDashboardPage() {
  const { stats, activities, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">통계 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>통계를 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-gray-600">
            시스템 전체 현황을 확인하세요
          </p>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <AdminDashboardNav />

      <div className="space-y-6 p-4">
        {/* 사용자 통계 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">사용자 통계</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="전체 사용자"
              value={stats.users.total}
              icon={Users}
            />
            <StatsCard
              title="이번 달 신규"
              value={stats.users.newThisMonth}
              icon={TrendingUp}
            />
            <StatsCard
              title="캠핑장 사장님"
              value={stats.users.owners}
              icon={Store}
            />
            <StatsCard
              title="일반 회원"
              value={stats.users.members}
              icon={Users}
            />
          </div>
        </section>

        {/* 캠핑장 통계 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">캠핑장 통계</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="전체 캠핑장"
              value={stats.campgrounds.total}
              icon={Store}
            />
            <StatsCard
              title="승인 대기"
              value={stats.campgrounds.pending}
              icon={Clock}
            />
            <StatsCard
              title="승인 완료"
              value={stats.campgrounds.approved}
              icon={Store}
            />
            <StatsCard
              title="이번 달 신규"
              value={stats.campgrounds.newThisMonth}
              icon={TrendingUp}
            />
          </div>
        </section>

        {/* 예약 통계 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">예약 통계</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="전체 예약"
              value={stats.reservations.total}
              icon={Calendar}
            />
            <StatsCard
              title="이번 달 예약"
              value={stats.reservations.thisMonth}
              icon={TrendingUp}
            />
            <StatsCard
              title="확정된 예약"
              value={stats.reservations.confirmed}
              icon={Calendar}
            />
            <StatsCard
              title="취소된 예약"
              value={stats.reservations.cancelled}
              icon={Calendar}
            />
          </div>
        </section>

        {/* 매출 통계 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">매출 통계</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="전체 매출"
              value={`${(stats.revenue.total / 10000).toFixed(0)}만원`}
              icon={DollarSign}
            />
            <StatsCard
              title="이번 달"
              value={`${(stats.revenue.thisMonth / 10000).toFixed(0)}만원`}
              icon={TrendingUp}
            />
          </div>
        </section>

        {/* 신고 통계 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">신고 관리</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="전체 신고"
              value={stats.reports.total}
              icon={AlertTriangle}
            />
            <StatsCard
              title="처리 대기"
              value={stats.reports.pending}
              icon={Clock}
            />
          </div>
        </section>

        {/* 차트 섹션 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">통계 차트</h2>

          {/* 사용자 증가 추세 */}
          <TrendChart
            data={[
              { month: "6개월 전", value: 120 },
              { month: "5개월 전", value: 180 },
              { month: "4개월 전", value: 250 },
              { month: "3개월 전", value: 320 },
              { month: "2개월 전", value: 410 },
              { month: "1개월 전", value: 520 },
              { month: "이번 달", value: stats.users.total },
            ]}
            dataKey="value"
            xAxisKey="month"
            title="사용자 증가 추세 (최근 6개월)"
            color="#3b82f6"
            height={250}
          />

          {/* 매출 추세 */}
          <TrendChart
            data={[
              { month: "6개월 전", value: 1200000 },
              { month: "5개월 전", value: 1800000 },
              { month: "4개월 전", value: 2500000 },
              { month: "3개월 전", value: 3200000 },
              { month: "2개월 전", value: 4100000 },
              { month: "1개월 전", value: 5200000 },
              { month: "이번 달", value: stats.revenue.thisMonth },
            ]}
            dataKey="value"
            xAxisKey="month"
            title="매출 추세 (최근 6개월)"
            color="#10b981"
            height={250}
            valueFormatter={(value) => `${(value / 10000).toFixed(0)}만원`}
          />

          {/* 사용자 역할 분포 */}
          <DistributionChart
            data={[
              { name: "일반 회원", value: stats.users.members },
              { name: "캠핑장 사장님", value: stats.users.owners },
              { name: "관리자", value: stats.users.admins },
            ]}
            title="사용자 역할 분포"
            height={250}
          />

          {/* 예약 상태 분포 */}
          <DistributionChart
            data={[
              { name: "확정", value: stats.reservations.confirmed },
              { name: "취소", value: stats.reservations.cancelled },
              { name: "이번 달", value: stats.reservations.thisMonth },
            ]}
            title="예약 상태 분포"
            height={250}
          />

          {/* 캠핑장 승인 상태 */}
          <ComparisonChart
            data={[
              { name: "승인 완료", value: stats.campgrounds.approved },
              { name: "승인 대기", value: stats.campgrounds.pending },
              { name: "거부", value: stats.campgrounds.rejected },
            ]}
            dataKey="value"
            xAxisKey="name"
            title="캠핑장 승인 상태"
            color="#8b5cf6"
            height={250}
          />
        </section>

        {/* 최근 활동 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">최근 활동</h2>
          <div className="divide-y rounded-lg border bg-white">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Clock className="mx-auto mb-2 h-12 w-12 opacity-30" />
                <p>최근 활동이 없습니다</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userName}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 빠른 링크 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">빠른 이동</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/admin/campgrounds/pending"
              className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <Clock className="mb-2 h-6 w-6 text-orange-600" />
              <p className="font-medium">승인 대기</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.campgrounds.pending}개 대기 중
              </p>
            </Link>
            <Link
              href="/dashboard/admin/reports"
              className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <AlertTriangle className="mb-2 h-6 w-6 text-red-600" />
              <p className="font-medium">신고 처리</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.reports.pending}개 처리 대기
              </p>
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <Users className="mb-2 h-6 w-6 text-blue-600" />
              <p className="font-medium">사용자 관리</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.users.total}명 등록
              </p>
            </Link>
            <Link
              href="/dashboard/admin/campgrounds"
              className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <Store className="mb-2 h-6 w-6 text-green-600" />
              <p className="font-medium">캠핑장 관리</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.campgrounds.total}개 운영 중
              </p>
            </Link>
            <Link
              href="/dashboard/admin/reservations"
              className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <Calendar className="mb-2 h-6 w-6 text-purple-600" />
              <p className="font-medium">예약 관리</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.reservations.total}개 예약
              </p>
            </Link>
            <Link
              href="/dashboard/admin/banners"
              className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <ImageIcon className="mb-2 h-6 w-6 text-pink-600" />
              <p className="font-medium">배너 관리</p>
              <p className="mt-1 text-sm text-gray-600">메인 배너 설정</p>
            </Link>
          </div>
        </section>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}

/**
 * 활동 타입에 따른 아이콘 반환
 */
function getActivityIcon(type: string) {
  switch (type) {
    case "USER_REGISTERED":
      return <Users className="h-5 w-5 text-blue-600" />;
    case "CAMPGROUND_CREATED":
      return <Store className="h-5 w-5 text-green-600" />;
    case "RESERVATION_MADE":
      return <Calendar className="h-5 w-5 text-purple-600" />;
    case "REVIEW_POSTED":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case "REPORT_FILED":
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
}

/**
 * 타임스탬프 포맷팅
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString("ko-KR");
}

export default withAdminAuth(AdminDashboardPage);
