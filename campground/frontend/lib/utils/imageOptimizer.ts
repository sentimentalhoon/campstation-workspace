/**
 * 이미지 최적화 유틸리티
 * browser-image-compression을 사용하여 클라이언트 측에서 이미지를 최적화합니다.
 */

import { logError } from "@/lib/errors/logger";
import imageCompression from "browser-image-compression";

/**
 * 이미지 최적화 결과
 */
export interface OptimizedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // 압축률 (0-1)
}

/**
 * 이미지 최적화 진행 상황 콜백
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Review 이미지 최적화
 * - 원본: 최대 1920x1080, 85% 품질, JPEG
 * - 목표: 최대 500KB
 */
export async function optimizeReviewImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<OptimizedImage> {
  const originalSize = file.size;

  const options = {
    maxSizeMB: 0.5, // 최대 500KB
    maxWidthOrHeight: 1920, // Full HD
    useWebWorker: true,
    fileType: "image/jpeg" as const, // WebP 대신 JPEG 사용 (서버 호환성)
    initialQuality: 0.85,
    onProgress: onProgress,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const compressedSize = compressedFile.size;

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: 1 - compressedSize / originalSize,
    };
  } catch (error) {
    logError(error, {
      location: "optimizeReviewImage",
      fileName: file.name,
    });
    // 최적화 실패 시 원본 반환
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }
}

/**
 * Campground 이미지 최적화
 * - 원본: 최대 1920x1080, 85% 품질, JPEG
 * - 목표: 최대 500KB
 */
export async function optimizeCampgroundImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<OptimizedImage> {
  const originalSize = file.size;

  const options = {
    maxSizeMB: 0.5, // 최대 500KB
    maxWidthOrHeight: 1920, // Full HD
    useWebWorker: true,
    fileType: "image/jpeg" as const, // WebP 대신 JPEG 사용 (서버 호환성)
    initialQuality: 0.85,
    onProgress: onProgress,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const compressedSize = compressedFile.size;

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: 1 - compressedSize / originalSize,
    };
  } catch (error) {
    logError(error, {
      location: "optimizeCampgroundImage",
      fileName: file.name,
    });
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }
}

/**
 * Profile 이미지 최적화
 * - 최대 512x512 (정사각형), 85% 품질, JPEG
 * - 목표: 최대 100KB
 */
export async function optimizeProfileImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<OptimizedImage> {
  const originalSize = file.size;

  const options = {
    maxSizeMB: 0.1, // 최대 100KB
    maxWidthOrHeight: 512,
    useWebWorker: true,
    fileType: "image/jpeg" as const, // WebP 대신 JPEG 사용 (서버 호환성)
    initialQuality: 0.85,
    onProgress: onProgress,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const compressedSize = compressedFile.size;

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: 1 - compressedSize / originalSize,
    };
  } catch (error) {
    logError(error, {
      location: "optimizeProfileImage",
      fileName: file.name,
    });
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }
}

/**
 * 여러 이미지 일괄 최적화
 */
export async function optimizeImages(
  files: File[],
  type: "review" | "campground" | "profile" | "banner" | "announcement" | "site",
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<OptimizedImage[]> {
  // 타입별로 적절한 최적화 함수 선택
  const optimizeFunction =
    type === "review" || type === "announcement"
      ? optimizeReviewImage
      : type === "campground" || type === "site" || type === "banner"
        ? optimizeCampgroundImage
        : optimizeProfileImage;

  const results: OptimizedImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    const result = await optimizeFunction(file, (progress) => {
      onProgress?.(i, progress);
    });
    results.push(result);
  }

  return results;
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * 압축률을 퍼센트로 변환
 */
export function formatCompressionRatio(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 파일 타입 검사
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "이미지 파일만 업로드 가능합니다." };
  }

  // 지원하는 이미지 형식
  const supportedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "JPG, PNG, WebP, GIF 형식만 지원합니다.",
    };
  }

  // 최대 파일 크기 (50MB - 원본)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `파일 크기는 ${formatFileSize(maxSize)} 이하여야 합니다.`,
    };
  }

  return { valid: true };
}
