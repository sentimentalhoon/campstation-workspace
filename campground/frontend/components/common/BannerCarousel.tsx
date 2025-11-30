/**
 * Banner Carousel Component
 * 메인 페이지 상단 프로모션/이벤트 배너 캐러셀
 *
 * Features:
 * - Embla Carousel (React 19+ compatible)
 * - Auto-play with pause on hover
 * - Touch/swipe support
 * - Dot indicators
 * - Next.js Image optimization
 *
 * @see https://www.embla-carousel.com/
 */

"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type BannerItem = {
  id: string;
  image: string;
  alt: string;
  href?: string;
};

type BannerCarouselProps = {
  banners: BannerItem[];
  autoPlayDelay?: number;
};

export function BannerCarousel({
  banners,
  autoPlayDelay = 5000,
}: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play
  useEffect(() => {
    if (!emblaApi || isHovered) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [emblaApi, autoPlayDelay, isHovered]);

  // Update selected index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Go to specific slide
  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (banners.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="relative min-w-0 flex-[0_0_100%]">
              {banner.href ? (
                <a href={banner.href} className="block">
                  <div className="relative aspect-2/1 w-full">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                      priority={selectedIndex === 0}
                      sizes="(max-width: 640px) 100vw, 640px"
                      unoptimized
                    />
                  </div>
                </a>
              ) : (
                <div className="relative aspect-2/1 w-full">
                  <Image
                    src={banner.image}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                    priority={selectedIndex === 0}
                    sizes="(max-width: 640px) 100vw, 640px"
                    unoptimized
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute right-4 bottom-4 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          {selectedIndex + 1} / {banners.length}
        </div>
      )}
    </div>
  );
}
