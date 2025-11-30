/**
 * PromotionBanner Component
 * Main page banner carousel with auto-play
 * React 19+ with Embla Carousel + API Integration
 */

"use client";

import { BannerCarousel } from "@/components/common/BannerCarousel";
import { useBannerClick, useBannerView, useBanners } from "@/hooks";
import { useEffect } from "react";

export function PromotionBanner() {
  // 활성 배너 조회
  const { data: banners, isLoading } = useBanners({
    type: "PROMOTION",
    size: 5,
  });

  // View/Click tracking mutations
  const { mutate: trackView } = useBannerView();
  const { mutate: trackClick } = useBannerClick();

  // 배너가 로드되면 조회수 카운트
  useEffect(() => {
    if (banners && banners.length > 0) {
      banners.forEach((banner) => {
        trackView(banner.id);
      });
    }
  }, [banners, trackView]);

  // 로딩 중이거나 배너가 없으면 표시 안 함
  if (isLoading || !banners || banners.length === 0) {
    return null;
  }

  // Banner 타입을 BannerCarousel의 형식으로 변환
  const carouselBanners = banners.map((banner) => ({
    id: banner.id.toString(),
    image: banner.image.originalUrl,
    alt: banner.title,
    href: banner.linkUrl,
    onClick: () => {
      // 배너 클릭 시 클릭수 카운트
      trackClick(banner.id);
    },
  }));

  return (
    <section className="container-mobile py-2">
      <BannerCarousel banners={carouselBanners} autoPlayDelay={5000} />
    </section>
  );
}
