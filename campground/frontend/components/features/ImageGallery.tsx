"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type ImageGalleryProps = {
  images: string[];
  aspectRatio?: "4/3" | "16/9" | "square";
  className?: string;
};

/**
 * ImageGallery 컴포넌트
 *
 * 스와이프 가능한 이미지 갤러리
 * - Embla Carousel 사용
 * - 이미지 인디케이터 (1/5)
 * - 터치/드래그 지원
 * - Next.js Image 최적화
 *
 * @see docs/specifications/07-COMPONENTS-SPEC.md
 */
export default function ImageGallery({
  images,
  aspectRatio = "4/3",
  className = "",
}: ImageGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Embla API 초기화 및 이벤트 리스너 등록
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // 이미지가 없을 경우
  if (!images || images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 ${className}`}
      >
        <p className="text-sm text-neutral-400">이미지가 없습니다</p>
      </div>
    );
  }

  // Aspect ratio 클래스
  const aspectRatioClass = {
    "4/3": "aspect-[4/3]",
    "16/9": "aspect-video",
    square: "aspect-square",
  }[aspectRatio];

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative min-w-0 flex-[0_0_100%] ${aspectRatioClass}`}
            >
              <Image
                src={imageErrors[index] ? "/images/fallback-image.svg" : image}
                alt={`캠핑장 이미지 ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0} // 첫 이미지만 우선 로딩
                unoptimized={!imageErrors[index]}
                onError={() =>
                  setImageErrors((prev) => ({ ...prev, [index]: true }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Indicator */}
      {images.length > 1 && (
        <div className="absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white">
          {selectedIndex + 1} / {images.length}
        </div>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && images.length <= 5 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === selectedIndex ? "w-6 bg-white" : "bg-white/50"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
