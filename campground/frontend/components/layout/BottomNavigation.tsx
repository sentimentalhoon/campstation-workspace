/**
 * 하단 네비게이션 바 컴포넌트
 *
 * @see docs/sprints/sprint-3.md
 * @see docs/specifications/06-SCREEN-LAYOUTS.md - Bottom Tab Navigation
 * @see docs/specifications/07-COMPONENTS-SPEC.md - BottomTabNav
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { isAdmin, isOwner } from "@/lib/utils/permissions";
import {
  Calendar,
  Home,
  LayoutDashboard,
  Map,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TabItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 기본 탭
  const baseTabs: TabItem[] = [
    {
      id: "home",
      label: "홈",
      icon: Home,
      href: ROUTES.HOME,
    },
    {
      id: "search",
      label: "검색",
      icon: Search,
      href: ROUTES.CAMPGROUNDS.LIST,
    },
    {
      id: "reservations",
      label: "예약",
      icon: Calendar,
      href: ROUTES.RESERVATIONS.LIST,
    },
    {
      id: "map",
      label: "지도",
      icon: Map,
      href: ROUTES.MAP,
    },
  ];

  // 사용자 role에 따른 탭 구성
  const TABS: TabItem[] = [...baseTabs];

  // MY 탭은 항상 추가
  TABS.push({
    id: "my",
    label: "MY",
    icon: User,
    href: ROUTES.DASHBOARD.USER,
  });

  // ADMIN 또는 OWNER인 경우 추가 대시보드 탭 추가
  if (isAdmin(user?.role)) {
    TABS.push({
      id: "admin",
      label: "관리자",
      icon: LayoutDashboard,
      href: ROUTES.DASHBOARD.ADMIN,
    });
  } else if (isOwner(user?.role)) {
    TABS.push({
      id: "owner",
      label: "사업자",
      icon: LayoutDashboard,
      href: ROUTES.DASHBOARD.OWNER,
    });
  }

  const isActive = (href: string) => {
    if (href === ROUTES.HOME) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-border bg-background fixed right-0 bottom-0 left-0 z-50 flex h-14 justify-center border-t">
      <div className="flex w-full max-w-[640px]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                active
                  ? "text-primary"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
