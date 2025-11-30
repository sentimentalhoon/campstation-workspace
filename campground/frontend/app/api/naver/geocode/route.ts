/**
 * 네이버 Geocoding API 프록시
 * 클라이언트에서 직접 호출하면 CORS 에러가 발생하므로 서버에서 호출
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "검색어가 필요합니다." },
      { status: 400 }
    );
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  console.log("=== 환경 변수 확인 ===");
  console.log("clientId:", clientId);
  console.log("clientSecret:", clientSecret);
  console.log("=====================");

  if (!clientId || !clientSecret) {
    console.error("네이버 맵 API 키가 설정되지 않았습니다.");
    console.error("clientId:", clientId ? "설정됨" : "없음");
    console.error("clientSecret:", clientSecret ? "설정됨" : "없음");
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  console.log("Geocoding API 요청:", query);

  try {
    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(
      query
    )}`;

    console.log("요청 URL:", url);

    const response = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
        Accept: "application/json",
      },
    });

    console.log("응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("네이버 API 에러 응답:", errorText);
      return NextResponse.json(
        { error: "네이버 API 호출 실패", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("응답 데이터:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      {
        error: "주소 검색 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
