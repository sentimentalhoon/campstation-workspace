"use client";

import { AnnouncementSection } from "@/components/features/announcements";
import CampgroundBusinessInfo from "@/components/features/campground/CampgroundBusinessInfo";
import CampgroundDescription from "@/components/features/campground/CampgroundDescription";
import CampgroundFacilities from "@/components/features/campground/CampgroundFacilities";
import CampgroundHero from "@/components/features/campground/CampgroundHero";
import CampgroundInfoSection from "@/components/features/campground/CampgroundInfoSection";
import CampgroundMapSection from "@/components/features/campground/CampgroundMapSection";
import CampgroundQuickInfo from "@/components/features/campground/CampgroundQuickInfo";
import CampgroundRefundPolicy from "@/components/features/campground/CampgroundRefundPolicy";
import CampgroundReviewsSection from "@/components/features/campground/CampgroundReviewsSection";
import CampgroundSitesSection from "@/components/features/campground/CampgroundSitesSection";
import ReservationInfo from "@/components/features/campground/ReservationInfo";
import FavoriteButton from "@/components/features/FavoriteButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth, useLocation } from "@/contexts";
import { useCampgroundDetail } from "@/hooks/useCampgroundDetail";
import { useSites } from "@/hooks/useSites";
import { useViewTracker } from "@/hooks/useViewTracker";
import { reservationApi } from "@/lib/api";
import { AMENITY_LABELS, ROUTES } from "@/lib/constants";
import { isCampgroundOwner } from "@/lib/utils/permissions";
import type { Site } from "@/types";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * 캠핑장 상세 페이지
 *
 * 섹션별로 컴포넌트 분리하여 관리:
 * - CampgroundHero: 이미지 갤러리
 * - CampgroundInfoSection: 제목, 평점, 위치
 * - CampgroundQuickInfo: 체크인/아웃, 연락처
 * - CampgroundDescription: 소개
 * - CampgroundMapSection: 지도
 * - CampgroundFacilities: 편의시설
 * - AnnouncementSection: 공지사항
 * - CampgroundSitesSection: 사이트 목록
 * - CampgroundReviewsSection: 리뷰
 * - CampgroundBusinessInfo: 사업자 정보
 * - CampgroundRefundPolicy: 환불 정책
 *
 * @see docs/specifications/06-SCREEN-LAYOUTS.md
 * @see docs/specifications/03-PAGES.md
 */
export default function CampgroundDetailPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const campgroundId = parseInt(id, 10);
  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const [reservedDates, setReservedDates] = useState<
    Record<number, { checkInDate: string; checkOutDate: string }[]>
  >({});

  const { data, isLoading, error } = useCampgroundDetail(campgroundId);
  const campground = data; // API 클라이언트가 unwrap하므로 직접 Campground 객체

  // 조회수 추적 (페이지 방문 시 자동 기록)
  useViewTracker(campgroundId);

  // 사이트 목록 조회
  const {
    data: sitesData,
    isLoading: sitesLoading,
    error: sitesError,
  } = useSites(campgroundId);

  // 캠핑장의 모든 사이트 예약 날짜 조회 - 날짜 범위가 바뀔 때마다 다시 조회
  useEffect(() => {
    const fetchReservedDates = async () => {
      if (!dateRange) {
        return;
      }

      try {
        const data =
          await reservationApi.getCampgroundReservedDates(campgroundId);
        setReservedDates(data || {});
      } catch (error) {
        console.error("Failed to fetch reserved dates:", error);
        setReservedDates({});
      }
    };

    fetchReservedDates();
  }, [campgroundId, dateRange]); // dateRange 의존성 추가 - 날짜 바뀔 때마다 최신 예약 정보 조회

  // 수정 권한 체크: ADMIN이거나, OWNER이면서 자기 소유 캠핑장인 경우
  const canEdit = campground?.owner?.id
    ? isCampgroundOwner(user, campground.owner.id)
    : false;

  // 캠핑장의 amenities를 한글로 변환 (백엔드 API에서 이미 중복 제거된 상태로 제공)
  const facilities = campground?.amenities
    ? campground.amenities.map((amenity) => AMENITY_LABELS[amenity] || amenity)
    : [];

  // 각 사이트의 예약 가능 여부 확인 (숨기지 않고 상태만 체크)
  const getSiteAvailability = (site: Site): boolean => {
    if (!dateRange) return true; // 날짜 선택 안했으면 모든 사이트 예약 가능

    const siteReservations = reservedDates[site.id] || [];

    // 선택한 날짜를 00:00:00으로 정규화
    const selectedStart = new Date(dateRange.start);
    selectedStart.setHours(0, 0, 0, 0);
    const selectedEnd = new Date(dateRange.end);
    selectedEnd.setHours(0, 0, 0, 0);

    // 선택한 날짜 범위와 겹치는 예약이 있는지 확인
    const hasConflict = siteReservations.some((reservation) => {
      // 문자열 날짜를 Date 객체로 변환 (YYYY-MM-DD 형식)
      const reservedStart = new Date(reservation.checkInDate + "T00:00:00");
      const reservedEnd = new Date(reservation.checkOutDate + "T00:00:00");

      // 날짜 범위 겹침 체크
      // 체크아웃 날짜는 다음 예약의 체크인 날짜가 될 수 있음
      // 예: 예약A(11/26~11/27), 예약B(11/27~11/28) → 가능해야 함
      //
      // 겹침 조건:
      // - 선택한 체크인이 기존 예약의 체크아웃보다 이전이면서
      // - 선택한 체크아웃이 기존 예약의 체크인보다 이후인 경우
      //
      // 하지만 체크아웃 당일은 다음 예약의 체크인이 가능하므로
      // reservedEnd와 selectedStart가 같은 경우는 허용 (< 사용, <= 아님)
      const conflict =
        selectedStart < reservedEnd && selectedEnd > reservedStart;

      if (conflict) {
        console.log("날짜 충돌 발생:", {
          site: site.siteNumber,
          selected: {
            checkIn: selectedStart.toISOString().split("T")[0],
            checkOut: selectedEnd.toISOString().split("T")[0],
          },
          reserved: {
            checkIn: reservation.checkInDate,
            checkOut: reservation.checkOutDate,
          },
        });
      }

      return conflict;
    });

    return !hasConflict; // 충돌 없으면 예약 가능
  };

  // 예약 가능한 사이트 개수 계산
  const availableCount =
    sitesData?.content.filter((site: Site) => getSiteAvailability(site))
      .length || 0;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-4">
        <div className="mt-20">
          <ErrorMessage
            message={error.message || "캠핑장을 불러올 수 없습니다"}
          />
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!campground) {
    return (
      <div className="p-4">
        <div className="mt-20 text-center text-neutral-500">
          캠핑장을 찾을 수 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[120px]">
      {/* Header - 56px */}
      <PageHeader
        title={campground.name}
        showBack
        onBack={() => router.back()}
        rightAction={<FavoriteButton campgroundId={campgroundId} size="lg" />}
      />

      {/* Hero: Image Carousel */}
      <CampgroundHero images={campground.originalImageUrls} />

      {/* Info: Title Section */}
      <CampgroundInfoSection
        campground={{
          id: campground.id,
          name: campground.name,
          rating: campground.rating,
          reviewCount: campground.reviewCount,
          address: campground.address,
          latitude: campground.latitude,
          longitude: campground.longitude,
          operationType: campground.operationType,
          certification: campground.certification,
        }}
        currentLocation={currentLocation}
        canEdit={canEdit}
        onEdit={() =>
          router.push(ROUTES.DASHBOARD.OWNER_CAMPGROUND_EDIT(campgroundId))
        }
      />

      {/* Quick Info */}
      <CampgroundQuickInfo
        checkInTime={campground.checkInTime}
        checkOutTime={campground.checkOutTime}
        phone={campground.phone}
        address={campground.address}
      />

      {/* Description */}
      <CampgroundDescription description={campground.description} />

      {/* Map Section */}
      <CampgroundMapSection
        campground={{
          id: campground.id,
          name: campground.name,
          latitude: campground.latitude,
          longitude: campground.longitude,
          address: campground.address,
        }}
        sites={sitesData?.content || []}
      />

      {/* Facilities */}
      <CampgroundFacilities facilities={facilities} />

      {/* Announcements Section */}
      <AnnouncementSection campgroundId={campgroundId} canEdit={canEdit} />

      {/* Reservation Info - 예약 날짜 선택 */}
      <ReservationInfo
        onDateRangeChange={(range) => {
          setDateRange(range);
          console.log("Selected date range:", range);
        }}
      />

      {/* Sites Section */}
      <CampgroundSitesSection
        campgroundId={campgroundId}
        dateRange={dateRange}
        availableCount={availableCount}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        sitesData={sitesData}
        checkInTime={campground?.checkInTime}
        checkOutTime={campground?.checkOutTime}
        canEdit={canEdit}
        getSiteAvailability={getSiteAvailability}
        onSelectSite={(selectedSite) => {
          const params = new URLSearchParams({
            campgroundId: campgroundId.toString(),
            siteId: selectedSite.id.toString(),
          });
          if (dateRange) {
            params.append("checkIn", dateRange.start.toISOString());
            params.append("checkOut", dateRange.end.toISOString());
          }
          router.push(`${ROUTES.RESERVATIONS.NEW}?${params.toString()}`);
        }}
      />

      {/* Reviews Section */}
      <CampgroundReviewsSection
        campgroundId={campgroundId}
        campgroundName={campground.name}
        rating={campground.rating}
        reviewCount={campground.reviewCount}
      />

      {/* Business Information */}
      <CampgroundBusinessInfo campground={campground} />

      {/* Refund Policy */}
      <CampgroundRefundPolicy />

      {/* Sticky CTA Bar - 72px, Bottom Nav 위에 배치 */}
      <div className="fixed right-0 bottom-14 left-0 z-100 flex justify-center">
        <div className="w-full max-w-[640px] border-t border-neutral-200 bg-white px-4 py-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <div className="text-sm text-neutral-600">₩50,000</div>
              <div className="text-xs text-neutral-500">/ 박</div>
            </div>
            <Button
              size="lg"
              onClick={() =>
                router.push(
                  `${ROUTES.RESERVATIONS.NEW}?campgroundId=${campgroundId}`
                )
              }
              className="flex-1"
            >
              예약하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
