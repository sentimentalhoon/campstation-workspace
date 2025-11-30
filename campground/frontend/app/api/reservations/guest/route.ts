/**
 * 비회원 예약 조회 API Route
 * GET /api/reservations/guest?reservationNumber=XXX&password=YYY
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reservationNumber = searchParams.get("reservationNumber");
    const password = searchParams.get("password");

    if (!reservationNumber || !password) {
      return NextResponse.json(
        { error: "예약번호와 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/guest?reservationNumber=${encodeURIComponent(reservationNumber)}&password=${encodeURIComponent(password)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "예약 조회에 실패했습니다" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("비회원 예약 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
