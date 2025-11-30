import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Naver Map credentials");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const coords = `${lng},${lat}`; // Naver API는 경도,위도 순서
    const url = `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?request=coordsToaddr&coords=${coords}&output=json&orders=legalcode%2Cadmcode%2Caddr%2Croadaddr`;

    const response = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Naver API error:", {
        status: response.status,
        statusText: response.statusText,
        url,
        data,
      });
      return NextResponse.json(
        {
          error: "Failed to fetch address from Naver API",
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
