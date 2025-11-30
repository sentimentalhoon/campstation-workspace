/**
 * OwnerCampgroundDetailNav - 오너의 개별 캠핑장 관리 탭 네비게이션
 *
 * 특정 캠핑장의 상세 관리 섹션 간 빠른 이동을 위한 탭 네비게이션
 * - 개요 (편집), 사이트 관리, 예약 관리, 가격 설정
 * - 현재 활성 탭 하이라이트
 * - 모바일 최적화 (가로 스크롤)
 */

"use client";

import { ROUTES } from "@/lib/constants";
import { Calendar, DollarSign, Settings, Tent } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type OwnerCampgroundDetailNavItem = {
  id: string;
  label: string;
  href: (campgroundId: number) => string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: OwnerCampgroundDetailNavItem[] = [
  {
    id: "edit",
    label: "수정",
    href: (id) => ROUTES.DASHBOARD.OWNER_CAMPGROUND_EDIT(id),
    icon: Settings,
  },
  {
    id: "sites",
    label: "사이트",
    href: (id) => ROUTES.DASHBOARD.OWNER_CAMPGROUND_SITES(id),
    icon: Tent,
  },
  {
    id: "reservations",
    label: "예약",
    href: (id) => ROUTES.DASHBOARD.OWNER_CAMPGROUND_RESERVATIONS(id),
    icon: Calendar,
  },
  {
    id: "pricing",
    label: "요금제",
    href: (id) => ROUTES.DASHBOARD.OWNER_CAMPGROUND_SITES_PRICING(id),
    icon: DollarSign,
  },
];

type Props = {
  campgroundId: number;
};

export function OwnerCampgroundDetailNav({ campgroundId }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // 정확한 경로 또는 시작하는 경로로 활성화
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <nav
      className="sticky z-30 border-b border-neutral-200 bg-white"
      aria-label="캠핑장 관리 네비게이션"
    >
      <div className="mx-auto max-w-[640px]">
        <div className="scrollbar-hide flex overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = item.href(campgroundId);
            const active = isActive(href);

            return (
              <Link
                key={item.id}
                href={href}
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
