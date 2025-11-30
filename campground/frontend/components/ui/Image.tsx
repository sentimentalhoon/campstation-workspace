/**
 * Image Component
 * Next.js Image 컴포넌트의 래퍼
 * 일관된 이미지 처리 및 최적화 제공
 *
 * @example
 * ```tsx
 * <Image
 *   src="/campground.jpg"
 *   alt="캠핑장"
 *   width={400}
 *   height={300}
 *   fallback="/placeholder.jpg"
 * />
 * ```
 */

"use client";

import { cn } from "@/lib/utils";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { useState } from "react";

/**
 * Image 컴포넌트 Props
 */
type ImageProps = Omit<NextImageProps, "onError"> & {
  /** 에러 시 표시할 폴백 이미지 */
  fallback?: string;
  /** 로딩 중 표시할 스켈레톤 배경색 */
  skeletonColor?: string;
  /** 이미지 비율 유지 (aspect-ratio) */
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  /** 이미지 객체 맞춤 */
  objectFit?: "contain" | "cover" | "fill" | "none";
  /** 둥근 모서리 */
  rounded?: "none" | "sm" | "md" | "lg" | "full";
};

/**
 * aspectRatio 스타일 맵
 */
const aspectRatioStyles = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
};

/**
 * rounded 스타일 맵
 */
const roundedStyles = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

/**
 * Image 컴포넌트
 *
 * @description Next.js Image를 래핑하여 에러 처리, 로딩 상태 등을 제공합니다.
 */
export function Image({
  src,
  alt,
  fallback = "/images/placeholder.jpg",
  skeletonColor = "bg-gray-200",
  aspectRatio = "auto",
  objectFit = "cover",
  rounded = "none",
  className,
  onLoad,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    onLoad?.(e);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    // fallback이 있을 때만 이미지 소스 변경
    // width/height가 없으면 에러 표시
    if (fallback && props.width && props.height) {
      setImgSrc(fallback);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatioStyles[aspectRatio],
        roundedStyles[rounded],
        className
      )}
    >
      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className={cn("absolute inset-0 animate-pulse", skeletonColor)} />
      )}

      {/* 이미지 */}
      <NextImage
        src={imgSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === "contain" && "object-contain",
          objectFit === "cover" && "object-cover",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none"
        )}
        style={{ width: "100%", height: "100%" }}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* 에러 상태 (폴백이 없을 때) */}
      {error && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">이미지 로드 실패</p>
          </div>
        </div>
      )}
    </div>
  );
}
