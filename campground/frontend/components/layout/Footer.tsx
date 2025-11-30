/**
 * Footer Component
 * 모바일 전용 푸터 (최대 640px)
 */

import { ROUTES } from "@/lib/constants";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-background border-t">
      <div className="mx-auto max-w-[640px] px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* About */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold">CampStation</h3>
            <p className="text-muted-foreground text-sm">
              전국 최고의 캠핑장을 예약하고 자연과 함께하는 특별한 경험을
              만들어보세요.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">둘러보기</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href={ROUTES.CAMPGROUNDS.LIST}
                    className="text-muted-foreground active:text-primary"
                  >
                    캠핑장 찾기
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.MAP}
                    className="text-muted-foreground active:text-primary"
                  >
                    지도로 보기
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.RESERVATIONS.LIST}
                    className="text-muted-foreground active:text-primary"
                  >
                    예약 관리
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">고객지원</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground active:text-primary"
                  >
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground active:text-primary"
                  >
                    이용약관
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground active:text-primary"
                  >
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">연락처</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>이메일: support@campstation.com</li>
              <li>전화: 1588-0000</li>
              <li>운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="border-border border-t pt-6">
            <p className="text-muted-foreground text-center text-xs">
              © {currentYear} CampStation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
