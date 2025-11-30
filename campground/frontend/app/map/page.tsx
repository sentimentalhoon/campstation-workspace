/**
 * 지도 검색 페이지
 *
 * 네이버맵을 사용한 캠핑장 검색
 * - 현재 위치 버튼
 * - 지도 영역 기반 검색
 * - 마커 클릭 시 미리보기
 *
 * @see docs/sprints/sprint-5.md
 */

"use client";

import { CampgroundCard } from "@/components/features/campgrounds";
import { MapCampgroundCard } from "@/components/features/map/MapCampgroundCard";
import { NaverMap } from "@/components/features/map/NaverMap";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, LoadingSpinner } from "@/components/ui";
import { useLocation } from "@/contexts";
import { useCampgroundsByLocation } from "@/hooks";
import { Campground } from "@/types/domain";
import { List, Locate, Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ViewMode = "map" | "list";

export default function MapPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 서울 기본값
  const [selectedCampground, setSelectedCampground] =
    useState<Campground | null>(null);
  const [mapBounds, setMapBounds] = useState<{
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // LocationContext 사용
  const { currentLocation, getCurrentLocation } = useLocation();

  // 좌표 기반 캠핑장 조회
  const { data, isLoading } = useCampgroundsByLocation({
    lat: center.lat,
    lng: center.lng,
    radius: 10,
  });

  const allCampgrounds = data?.content || [];

  // 현재 지도 영역에 보이는 캠핑장만 필터링
  const visibleCampgrounds = mapBounds
    ? allCampgrounds.filter((campground) => {
        const lat = campground.latitude;
        const lng = campground.longitude;
        return (
          lat <= mapBounds.ne.lat &&
          lat >= mapBounds.sw.lat &&
          lng <= mapBounds.ne.lng &&
          lng >= mapBounds.sw.lng
        );
      })
    : allCampgrounds;

  // 페이지 로드 시 현재 위치 자동 가져오기
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // 현재 위치로 이동
  const handleCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setCenter(location);
    }
  };

  // 캠핑장 카드 클릭 시 지도 중심 이동
  const handleCampgroundClick = (campground: Campground) => {
    setCenter({
      lat: campground.latitude,
      lng: campground.longitude,
    });
    setSelectedCampground(campground);
  };

  // 마커 클릭 시 해당 카드로 스크롤
  const handleMarkerClick = (campground: Campground) => {
    // 해당 캠핑장이 visibleCampgrounds에 있는지 확인
    const index = visibleCampgrounds.findIndex((c) => c.id === campground.id);

    if (index !== -1 && scrollRef.current) {
      // 카드 위치로 스크롤
      const cardWidth = 280 + 12; // 카드 너비 + gap
      const scrollPosition = index * cardWidth;

      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      // 지도 중심도 이동
      setCenter({
        lat: campground.latitude,
        lng: campground.longitude,
      });
    }
  };

  // 스크롤 이벤트 핸들러 - 현재 보이는 카드의 캠핑장으로 지도 이동
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 280 + 12; // 카드 너비 + gap
    const currentIndex = Math.round(scrollLeft / cardWidth);

    if (visibleCampgrounds[currentIndex]) {
      const campground = visibleCampgrounds[currentIndex];
      setCenter({
        lat: campground.latitude,
        lng: campground.longitude,
      });
    }
  };

  // 마커 데이터 생성
  const markers = allCampgrounds.map((campground, index) => ({
    id: campground.id,
    position: {
      lat: campground.latitude,
      lng: campground.longitude,
    },
    title: campground.name,
    index: index,
    onClick: () => handleMarkerClick(campground),
  }));

  return (
    <div className="relative h-screen">
      {/* Header */}
      <PageHeader
        title="지도 검색"
        rightAction={
          <button
            onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
            className="flex items-center gap-1 text-sm"
          >
            {viewMode === "map" ? (
              <>
                <List size={20} />
                목록
              </>
            ) : (
              <>
                <Map size={20} />
                지도
              </>
            )}
          </button>
        }
      />

      {/* 지도 뷰 */}
      {viewMode === "map" && (
        <div className="relative h-[calc(100vh-56px-56px)]">
          {/* Header(56px) + Bottom Nav(56px) 제외 */}
          <NaverMap
            center={center}
            markers={markers}
            onBoundsChanged={setMapBounds}
          />

          {/* 현재 위치 버튼 */}
          <button
            onClick={handleCurrentLocation}
            className="absolute top-4 right-4 z-10 rounded-full bg-white p-3 shadow-lg hover:bg-neutral-50"
          >
            <Locate size={24} className="text-primary" />
          </button>

          {/* 하단 슬라이드 - 캠핑장 목록 */}
          {visibleCampgrounds.length > 0 && (
            <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/10 to-transparent pt-20 pb-4">
              <div className="px-4">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
                >
                  {visibleCampgrounds.map((campground) => {
                    // allCampgrounds에서 해당 캠핑장의 인덱스 찾기
                    const markerIndex = allCampgrounds.findIndex(
                      (c) => c.id === campground.id
                    );

                    return (
                      <div
                        key={campground.id}
                        className="w-[280px] shrink-0 snap-start"
                        onClick={() => handleCampgroundClick(campground)}
                      >
                        <div className="cursor-pointer rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl">
                          <MapCampgroundCard
                            campground={campground}
                            markerIndex={
                              markerIndex >= 0 ? markerIndex : undefined
                            }
                            currentLocation={currentLocation || undefined}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 선택된 캠핑장 상세 모달 */}
          {selectedCampground && (
            <>
              {/* 배경 오버레이 */}
              <div
                className="animate-fade-in fixed inset-0 z-40 bg-black/50"
                onClick={() => setSelectedCampground(null)}
              />

              {/* 상세 정보 모달 */}
              <div className="animate-slide-up fixed right-0 bottom-0 left-0 z-50">
                <div className="flex max-h-[80vh] flex-col rounded-t-2xl bg-white shadow-2xl">
                  {/* 드래그 인디케이터 */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="h-1 w-12 rounded-full bg-neutral-300" />
                  </div>

                  {/* 컨텐츠 */}
                  <div className="flex-1 overflow-y-auto px-4 pb-6">
                    <CampgroundCard campground={selectedCampground} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCampground(null)}
                      className="mt-4 w-full"
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 목록 뷰 */}
      {viewMode === "list" && (
        <div className="h-[calc(100vh-56px-120px)] overflow-y-auto p-4">
          {/* Header(56px) + Bottom Nav(56px) + 여유(64px) = 176px 제외 */}
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : allCampgrounds.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">🏕️</div>
                <p className="text-neutral-500">캠핑장이 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {allCampgrounds.map((campground) => (
                <CampgroundCard key={campground.id} campground={campground} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
