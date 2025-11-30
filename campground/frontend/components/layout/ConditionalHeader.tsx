/**
 * 조건부 헤더 렌더링 컴포넌트
 * 메인 페이지("/")에서만 헤더 표시
 */

"use client";

import { Header } from "@/components/layout";
import { usePathname } from "next/navigation";

export function ConditionalHeader() {
  const pathname = usePathname();

  // 메인 페이지("/")에서만 헤더 표시
  if (pathname !== "/") {
    return null;
  }

  return <Header />;
}
