/**
 * NaverMap 컴포넌트
 *
 * 네이버맵 API를 사용한 지도 컴포넌트
 * - Script 동적 로드
 * - 마커 표시
 * - 현재 위치
 *
 * @see docs/sprints/sprint-5.md
 */

"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: Record<string, unknown>
        ) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: Record<string, unknown>) => unknown;
        Event: {
          addListener: (
            target: unknown,
            eventName: string,
            handler: () => void
          ) => void;
        };
        Position: {
          TOP_RIGHT: unknown;
        };
      };
    };
  }
}

type NaverMapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: {
    id: number;
    position: { lat: number; lng: number };
    title: string;
    type?: "campground" | "site"; // 마커 타입 추가
    index?: number; // 마커 번호 추가
    onClick?: () => void;
  }[];
  onBoundsChanged?: (bounds: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }) => void;
};

/**
 * NaverMap 컴포넌트
 *
 * @param center - 지도 중심 좌표
 * @param zoom - 지도 줌 레벨 (기본: 13)
 * @param markers - 마커 목록
 * @param onBoundsChanged - 지도 영역 변경 콜백
 */
export function NaverMap({
  center,
  zoom = 13,
  markers = [],
  onBoundsChanged,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<unknown>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<unknown[]>([]);
  const scriptLoadedRef = useRef(false);

  // 네이버맵 스크립트 로드
  useEffect(() => {
    // 이미 스크립트 로드 시도했으면 중복 방지
    if (scriptLoadedRef.current) {
      return;
    }
    scriptLoadedRef.current = true;

    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    console.log("🗺️ Naver Map Client ID:", clientId);
    console.log("🌐 Current URL:", window.location.href);

    if (!clientId) {
      console.error("네이버맵 클라이언트 ID가 설정되지 않았습니다.");
      return;
    }

    // 이미 로드되어 있는지 확인
    if (window.naver?.maps) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      console.log("✅ 네이버맵 스크립트 로드 성공");
      setIsLoaded(true);
    };
    script.onerror = (error) => {
      console.error("❌ 네이버맵 스크립트 로드 실패:", error);
    };
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const newMap = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: false,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: window.naver.maps.Position.TOP_LEFT,
      },
    });

    // 지도 영역 변경 이벤트
    if (onBoundsChanged) {
      window.naver.maps.Event.addListener(newMap, "idle", () => {
        const bounds = (
          newMap as {
            getBounds: () => {
              getNE: () => { lat: () => number; lng: () => number };
              getSW: () => { lat: () => number; lng: () => number };
            };
          }
        ).getBounds();
        const ne = bounds.getNE();
        const sw = bounds.getSW();

        onBoundsChanged({
          ne: { lat: ne.lat(), lng: ne.lng() },
          sw: { lat: sw.lat(), lng: sw.lng() },
        });
      });
    }

    setMap(newMap);
  }, [isLoaded, center.lat, center.lng, zoom, map, onBoundsChanged]);

  // 지도 중심 업데이트 - panTo로 부드럽게 이동
  useEffect(() => {
    if (!map) return;

    (map as { panTo: (center: unknown) => void }).panTo(
      new window.naver.maps.LatLng(center.lat, center.lng)
    );
  }, [map, center.lat, center.lng]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !window.naver) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) =>
      (marker as { setMap: (map: null) => void }).setMap(null)
    );
    markersRef.current = [];

    // 색상 팔레트
    const colors = [
      "#FF6B6B", // 빨강
      "#4ECDC4", // 청록
      "#45B7D1", // 파랑
      "#FFA07A", // 연어색
      "#98D8C8", // 민트
      "#F7DC6F", // 노랑
      "#BB8FCE", // 보라
      "#85C1E2", // 하늘색
      "#F8B195", // 복숭아
      "#C06C84", // 장미
    ];

    // 새 마커 생성
    markers.forEach((markerData, idx) => {
      // 마커 타입에 따라 아이콘 설정
      const markerOptions: {
        position: unknown;
        map: unknown;
        title: string;
        icon?: {
          content: string;
          size?: unknown;
          anchor?: unknown;
        };
      } = {
        position: new window.naver.maps.LatLng(
          markerData.position.lat,
          markerData.position.lng
        ),
        map,
        title: markerData.title,
      };

      // 사이트 마커는 파란색 원형 마커로 표시
      if (markerData.type === "site") {
        markerOptions.icon = {
          content: `
            <div style="
              width: 16px;
              height: 16px;
              background-color: #3B82F6;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          size: new window.naver.maps.Size(16, 16),
          anchor: new window.naver.maps.Point(8, 8),
        };
      } else {
        // 캠핑장 마커는 각각 다른 색상의 번호 마커
        const markerIndex =
          markerData.index !== undefined ? markerData.index : idx;
        const color = colors[markerIndex % colors.length];

        markerOptions.icon = {
          content: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background-color: ${color};
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s;
            ">${markerIndex + 1}</div>
          `,
          size: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 16),
        };
      }

      const marker = new window.naver.maps.Marker(markerOptions);

      if (markerData.onClick) {
        window.naver.maps.Event.addListener(marker, "click", () => {
          markerData.onClick?.();
        });
      }

      markersRef.current.push(marker);
    });
  }, [map, markers]);

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mb-2 text-2xl">🗺️</div>
          <p className="text-sm text-neutral-500">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-full w-full" />;
}
