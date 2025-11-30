/**
 * MapPicker 컴포넌트
 * 지도에서 위치를 클릭하여 주소와 좌표를 선택
 */

"use client";

import { Button } from "@/components/ui/Button";
import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MapPickerProps = {
  onSelect: (address: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
};

export function MapPicker({
  onSelect,
  initialLat = 37.5665,
  initialLng = 126.978,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [marker, setMarker] = useState<naver.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 네이버 맵 스크립트 로드
  useEffect(() => {
    if (!isOpen || isMapLoaded) return;

    // 이미 로드되어 있는지 확인
    if (typeof window !== "undefined" && window.naver?.maps) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시에도 스크립트는 유지 (재사용을 위해)
    };
  }, [isOpen, isMapLoaded]);

  // 지도 초기화
  useEffect(() => {
    if (!isOpen || !mapRef.current || map || !isMapLoaded) return;

    const newMap = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(initialLat, initialLng),
      zoom: 15,
    });

    // 지도 클릭 이벤트
    naver.maps.Event.addListener(
      newMap,
      "click",
      async (e: naver.maps.PointerEvent) => {
        const lat = e.coord.y;
        const lng = e.coord.x;

        // 마커 표시
        if (marker) {
          marker.setPosition(new naver.maps.LatLng(lat, lng));
        } else {
          const newMarker = new naver.maps.Marker({
            position: new naver.maps.LatLng(lat, lng),
            map: newMap,
          });
          setMarker(newMarker);
        }

        // Reverse Geocoding으로 주소 가져오기
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/naver/reverse-geocode?lat=${lat}&lng=${lng}`
          );
          const data = await response.json();

          let address = "";
          if (data.results && data.results.length > 0) {
            // 도로명 주소 우선 (roadaddr)
            const roadAddrResult = data.results.find(
              (r: { name: string }) => r.name === "roadaddr"
            );
            if (roadAddrResult?.region && roadAddrResult?.land?.name) {
              const region = roadAddrResult.region;
              const land = roadAddrResult.land;
              address = `${region.area1.name} ${region.area2.name} ${region.area3.name} ${land.name}`;
              if (land.number1) {
                address += ` ${land.number1}`;
                if (land.number2) {
                  address += `-${land.number2}`;
                }
              }
            } else {
              // 도로명 주소 없으면 지번 주소 사용 (addr)
              const addrResult = data.results.find((r: { name: string }) => r.name === "addr");
              if (addrResult?.region) {
                const region = addrResult.region;
                const land = addrResult.land;
                address = `${region.area1.name} ${region.area2.name} ${region.area3.name}`;
                if (region.area4?.name) {
                  address += ` ${region.area4.name}`;
                }
                if (land?.number1) {
                  address += ` ${land.number1}`;
                  if (land.number2) {
                    address += `-${land.number2}`;
                  }
                }
              }
            }
          }

          setSelectedLocation({ lat, lng, address });
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setSelectedLocation({
            lat,
            lng,
            address: "주소를 가져올 수 없습니다",
          });
        } finally {
          setIsLoading(false);
        }
      }
    );

    setMap(newMap);
  }, [isOpen, initialLat, initialLng, map, marker, isMapLoaded]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(
        selectedLocation.address,
        selectedLocation.lat,
        selectedLocation.lng
      );
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedLocation(null);
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <MapPin className="h-4 w-4" />
        지도에서 선택
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative h-[80vh] w-[90vw] max-w-4xl rounded-lg bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">지도에서 위치 선택</h3>
          <button
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 지도 */}
        <div ref={mapRef} className="h-[calc(100%-160px)]" />

        {/* 선택된 위치 정보 */}
        <div className="border-t p-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">주소를 가져오는 중...</p>
          ) : selectedLocation ? (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">주소:</span>{" "}
                {selectedLocation.address}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">좌표:</span>{" "}
                {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              지도를 클릭하여 위치를 선택하세요
            </p>
          )}

          {/* 버튼 */}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedLocation || isLoading}
              className="flex-1"
            >
              선택 완료
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
