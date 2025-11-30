/**
 * API 에러 페이지
 * 401 Unauthorized - 인증 필요
 */

"use client";

import { ROUTES } from "@/lib/constants";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <span className="text-4xl">🔒</span>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          인증이 필요합니다
        </h1>
        <p className="mb-8 text-gray-600">
          로그인 후 이용하실 수 있는 페이지입니다.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-opacity active:opacity-80"
          >
            로그인하기
          </Link>
          <Link
            href={ROUTES.HOME}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-opacity active:opacity-80"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
