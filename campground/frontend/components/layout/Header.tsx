/**
 * Header Component
 * 모바일 전용 헤더 (최대 640px)
 */

"use client";

import { useAuth } from "@/contexts";
import { ROUTES } from "@/lib/constants";
import { isAdmin, isOwner } from "@/lib/utils/permissions";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const Header = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-100 w-full bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-[640px] items-center justify-between px-4">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-primary text-2xl font-bold">Camp</span>
              <span className="text-foreground text-2xl font-bold">
                Station
              </span>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    {user?.thumbnailUrl ? (
                      <div className="border-primary relative h-10 w-10 overflow-hidden rounded-full border-2">
                        <Image
                          src={user.thumbnailUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="border-primary flex h-10 w-10 items-center justify-center rounded-full border-2 bg-neutral-100">
                        <span className="text-primary text-lg font-bold">
                          {user?.name?.[0] || "U"}
                        </span>
                      </div>
                    )}
                  </button>
                ) : (
                  <Link href={ROUTES.AUTH.LOGIN}>
                    <button className="border-primary text-primary hover:bg-primary rounded-md border px-4 py-2 text-sm font-semibold transition-colors hover:text-white">
                      로그인
                    </button>
                  </Link>
                )}
              </>
            )}

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="메뉴"
            >
              {isMenuOpen ? (
                <X className="text-foreground h-6 w-6" />
              ) : (
                <Menu className="text-foreground h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 z-150 h-full w-80 bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  {user?.thumbnailUrl ? (
                    <div className="border-primary relative h-12 w-12 overflow-hidden rounded-full border-2">
                      <Image
                        src={user.thumbnailUrl}
                        alt={user.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="border-primary flex h-12 w-12 items-center justify-center rounded-full border-2 bg-neutral-100">
                      <span className="text-primary text-xl font-bold">
                        {user?.name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    {isAuthenticated ? (
                      <>
                        <p className="text-foreground font-semibold">
                          {user?.name || "사용자"}님
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {isAdmin(user?.role)
                            ? "관리자"
                            : isOwner(user?.role)
                              ? "사업자"
                              : "회원"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground font-semibold">
                          로그인이 필요합니다.
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Welcome to CampStation
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-muted rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Tabs */}
              <div className="grid grid-cols-4 border-b text-center text-xs">
                <button className="border-primary text-primary border-b-2 py-3 font-medium">
                  Q·Point
                </button>
                <button className="text-muted-foreground py-3">
                  업적적립금
                </button>
                <button className="text-muted-foreground py-3">쿠폰</button>
                <button className="text-muted-foreground py-3">행운룰렛</button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {/* 역할별 대시보드 */}
                  {isAdmin(user?.role) && (
                    <Link
                      href={ROUTES.DASHBOARD.ADMIN}
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:bg-muted flex items-center gap-3 rounded-lg bg-orange-50 p-3 transition-colors"
                    >
                      <span className="text-xl">👑</span>
                      <span className="font-medium text-orange-600">
                        관리자 대시보드
                      </span>
                    </Link>
                  )}
                  {isOwner(user?.role) && (
                    <Link
                      href={ROUTES.DASHBOARD.OWNER}
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:bg-muted flex items-center gap-3 rounded-lg bg-blue-50 p-3 transition-colors"
                    >
                      <span className="text-xl">🏢</span>
                      <span className="font-medium text-blue-600">
                        사업자 대시보드
                      </span>
                    </Link>
                  )}

                  <Link
                    href={ROUTES.DASHBOARD.USER}
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <span className="text-xl">📅</span>
                    <span className="font-medium">예약</span>
                  </Link>
                  <Link
                    href={ROUTES.CAMPGROUNDS.LIST}
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <span className="text-xl">🛒</span>
                    <span className="font-medium">쇼핑</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <span className="text-xl">🎁</span>
                    <span className="font-medium">기획전</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <span className="text-xl">😊</span>
                    <span className="font-medium">이벤트</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="font-medium">캠톡</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="font-medium">비회원예약조회</span>
                  </Link>
                </nav>

                {/* Footer Links */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-4">
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-center text-sm"
                  >
                    공지사항
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-center text-sm"
                  >
                    자주묻는질문
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-center text-sm"
                  >
                    제휴문의
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-center text-sm"
                  >
                    상담원연결
                  </Link>
                </div>

                <p className="text-destructive mt-4 text-center text-xs">
                  상담시간 : 평일 9:30~18:00 (점심시간 12:30~13:30)
                </p>
              </div>

              {/* Bottom Buttons */}
              <div className="border-t p-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="border-primary text-primary hover:bg-primary w-full rounded-lg border py-3 text-sm font-semibold transition-colors hover:text-white"
                  >
                    로그아웃
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={ROUTES.AUTH.LOGIN}
                      onClick={() => setIsMenuOpen(false)}
                      className="border-primary text-primary hover:bg-primary flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-colors hover:text-white"
                    >
                      <span>➡️</span>
                      로그인
                    </Link>
                    <Link
                      href={ROUTES.AUTH.REGISTER}
                      onClick={() => setIsMenuOpen(false)}
                      className="border-primary text-primary hover:bg-primary flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-colors hover:text-white"
                    >
                      <span>👤</span>
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
