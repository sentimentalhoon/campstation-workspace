/**
 * API 에러 페이지
 * 403 Forbidden - 권한 없음
 */

"use client";

import { ROUTES } from "@/lib/constants";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <span className="text-4xl">⛔</span>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          접근 권한이 없습니다
        </h1>
        <p className="mb-8 text-gray-600">
          이 페이지에 접근할 권한이 없습니다.
          <br />
          관리자에게 문의하세요.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href={ROUTES.HOME}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-opacity active:opacity-80"
          >
            홈으로
          </Link>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-opacity active:opacity-80"
          >
            이전 페이지
          </button>
        </div>
      </div>
    </div>
  );
}
