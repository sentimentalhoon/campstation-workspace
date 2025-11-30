/**
 * 조건부 하단 네비게이션 렌더링 컴포넌트
 * 특정 페이지를 제외하고 네비게이션 표시
 */

"use client";

import { BottomNavigation } from "@/components/layout";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = [
  "/login",
  "/register",
  "/payment",
  "/payment/success",
  "/payment/fail",
];

export function ConditionalBottomNav() {
  const pathname = usePathname();

  // 제외된 경로인지 확인
  const isExcluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));

  // 제외된 경로면 네비게이션 숨김
  if (isExcluded) {
    return null;
  }

  return <BottomNavigation />;
}
