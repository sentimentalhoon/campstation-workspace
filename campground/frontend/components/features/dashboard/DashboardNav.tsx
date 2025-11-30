/**
 * DashboardNav - 유저 대시보드 탭 네비게이션
 *
 * 대시보드 내 모든 섹션 간 빠른 이동을 위한 탭 네비게이션
 * - 홈, 프로필, 리뷰, 찜 섹션
 * - 현재 활성 탭 하이라이트
 * - 모바일 최적화 (가로 스크롤)
 */

"use client";

import { ROUTES } from "@/lib/constants";
import { Heart, Home, Star, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "home",
    label: "홈",
    href: ROUTES.DASHBOARD.USER,
    icon: Home,
  },
  {
    id: "profile",
    label: "프로필",
    href: ROUTES.DASHBOARD.PROFILE,
    icon: User,
  },
  {
    id: "reviews",
    label: "리뷰",
    href: ROUTES.DASHBOARD.REVIEWS,
    icon: Star,
  },
  {
    id: "favorites",
    label: "찜",
    href: ROUTES.DASHBOARD.FAVORITES,
    icon: Heart,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD.USER) {
      // 메인 페이지는 정확히 일치할 때만 활성화
      return pathname === href;
    }
    // 서브 페이지는 경로가 시작할 때 활성화
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="sticky z-40 border-b border-neutral-200 bg-white"
      aria-label="대시보드 네비게이션"
    >
      <div className="mx-auto max-w-[640px]">
        <div className="scrollbar-hide flex overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex min-w-20 flex-1 flex-col items-center gap-1 border-b-2 px-4 py-3 transition-colors ${
                  active
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
