/**
 * API 에러 페이지
 * 500 Internal Server Error
 */

"use client";

import { ROUTES } from "@/lib/constants";
import Link from "next/link";

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <span className="text-4xl">💥</span>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          서버 오류가 발생했습니다
        </h1>
        <p className="mb-8 text-gray-600">
          일시적인 오류입니다. 잠시 후 다시 시도해주세요.
          <br />
          문제가 지속되면 고객센터로 문의하세요.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-opacity active:opacity-80"
          >
            새로고침
          </button>
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
