/**
 * useImageUpload Hook
 *
 * Reusable image upload hook with optimization support.
 * Based on the campground image upload implementation.
 *
 * Features:
 * - Single or multiple image uploads
 * - Image optimization (compression/resize)
 * - Progress tracking
 * - Existing + new image management
 * - Validation
 *
 * @example
 * ```tsx
 * const imageUpload = useImageUpload({
 *   maxImages: 5,
 *   existingImages: ['url1', 'url2'],
 *   onExistingImagesChange: setExistingImages,
 *   enableOptimization: true,
 *   imageType: 'announcement'
 * });
 *
 * <ImageUploadComponent {...imageUpload} />
 * ```
 */

import { APP_CONFIG } from "@/lib/constants/config";
import { validateFileUpload } from "@/lib/security/validation";
import {
  formatCompressionRatio,
  formatFileSize,
  optimizeImages,
} from "@/lib/utils/imageOptimizer";
import { useCallback, useState, useTransition } from "react";

export interface ImageFile {
  file: File;
  preview: string;
  originalSize: number;
  optimizedSize: number;
}

export interface OptimizationProgress {
  current: number;
  total: number;
  compressionRatio?: number;
}

export interface UseImageUploadOptions {
  /**
   * Maximum number of images allowed
   * @default 10
   */
  maxImages?: number;

  /**
   * Existing image URLs
   * @default []
   */
  existingImages?: string[];

  /**
   * Callback when existing images change
   */
  onExistingImagesChange?: (images: string[]) => void;

  /**
   * Enable image optimization (compression/resize)
   * @default true
   */
  enableOptimization?: boolean;

  /**
   * Image type for optimization (affects quality/size settings)
   * @default 'campground'
   */
  imageType?: "campground" | "announcement" | "banner" | "review" | "profile";

  /**
   * Allowed image types
   * @default APP_CONFIG.ALLOWED_IMAGE_TYPES
   */
  allowedTypes?: string[];

  /**
   * Maximum file size in bytes
   * @default APP_CONFIG.MAX_IMAGE_SIZE
   */
  maxSize?: number;

  /**
   * Callback when images are added
   */
  onImagesAdded?: (files: ImageFile[]) => void;

  /**
   * Callback when optimization fails
   */
  onOptimizationError?: (error: Error) => void;
}

export function useImageUpload({
  maxImages = 10,
  existingImages = [],
  onExistingImagesChange,
  enableOptimization = true,
  imageType = "campground",
  allowedTypes = APP_CONFIG.ALLOWED_IMAGE_TYPES as unknown as string[],
  maxSize = APP_CONFIG.MAX_IMAGE_SIZE,
  onImagesAdded,
  onOptimizationError,
}: UseImageUploadOptions = {}) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress>({
    current: 0,
    total: 0,
  });
  const [isPending, startTransition] = useTransition();

  const totalImages = existingImages.length + imageFiles.length;

  /**
   * Add new images with optional optimization
   */
  const addImages = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);

      // Validate file types
      for (const file of files) {
        const validation = validateFileUpload(file, {
          allowedTypes,
          maxSize,
        });

        if (!validation.isValid) {
          alert(validation.message);
          return;
        }
      }

      // Check max limit
      const remainingSlots = maxImages - totalImages;
      if (files.length > remainingSlots) {
        alert(
          `이미지는 최대 ${maxImages}개까지 업로드할 수 있습니다 (현재 ${remainingSlots}개 추가 가능)`
        );
        return;
      }

      try {
        setIsOptimizing(true);
        setProgress({
          current: 0,
          total: files.length,
        });

        let newImageFiles: ImageFile[];

        if (enableOptimization) {
          // Optimize images
          const optimizedResults = await optimizeImages(
            files,
            imageType,
            (fileIndex) => {
              setProgress((prev) => ({
                current: fileIndex + 1,
                total: files.length,
                compressionRatio: prev.compressionRatio,
              }));
            }
          );

          // Calculate average compression ratio
          const avgCompressionRatio =
            optimizedResults.reduce((sum, r) => sum + r.compressionRatio, 0) /
            optimizedResults.length;

          setProgress((prev) => ({
            ...prev,
            compressionRatio: avgCompressionRatio,
          }));

          // Create ImageFile objects with previews
          newImageFiles = optimizedResults.map((result) => ({
            file: result.file,
            preview: URL.createObjectURL(result.file),
            originalSize: result.originalSize,
            optimizedSize: result.compressedSize,
          }));

          // Log savings
          const totalOriginal = optimizedResults.reduce(
            (sum, r) => sum + r.originalSize,
            0
          );
          const totalCompressed = optimizedResults.reduce(
            (sum, r) => sum + r.compressedSize,
            0
          );
          const saved = formatFileSize(totalOriginal - totalCompressed);

          if (avgCompressionRatio > 0.1) {
            console.log(
              `이미지 최적화 완료: ${saved} 절약 (${formatCompressionRatio(avgCompressionRatio)} 압축)`
            );
          }
        } else {
          // No optimization - just create previews
          newImageFiles = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            originalSize: file.size,
            optimizedSize: file.size,
          }));

          setProgress({
            current: files.length,
            total: files.length,
          });
        }

        startTransition(() => {
          setImageFiles((prev) => [...prev, ...newImageFiles]);
        });

        onImagesAdded?.(newImageFiles);
      } catch (error) {
        console.error("Image processing failed:", error);
        const errorMessage = enableOptimization
          ? "이미지 최적화에 실패했습니다"
          : "이미지 처리에 실패했습니다";
        alert(errorMessage);
        onOptimizationError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
      } finally {
        setIsOptimizing(false);
      }
    },
    [
      totalImages,
      maxImages,
      allowedTypes,
      maxSize,
      enableOptimization,
      imageType,
      onImagesAdded,
      onOptimizationError,
    ]
  );

  /**
   * Remove a new image by index
   */
  const removeNewImage = useCallback((index: number) => {
    startTransition(() => {
      setImageFiles((prev) => {
        // Revoke object URL to prevent memory leak
        if (prev[index]?.preview) {
          URL.revokeObjectURL(prev[index].preview);
        }
        return prev.filter((_, i) => i !== index);
      });
    });
  }, []);

  /**
   * Remove an existing image by index
   */
  const removeExistingImage = useCallback(
    (index: number) => {
      const newImages = [...existingImages];
      newImages.splice(index, 1);
      onExistingImagesChange?.(newImages);
    },
    [existingImages, onExistingImagesChange]
  );

  /**
   * Clear all new images
   */
  const clearNewImages = useCallback(() => {
    startTransition(() => {
      setImageFiles((prev) => {
        // Revoke all object URLs
        prev.forEach((img) => {
          if (img.preview) {
            URL.revokeObjectURL(img.preview);
          }
        });
        return [];
      });
    });
  }, []);

  /**
   * Get all image files (for upload)
   */
  const getFiles = useCallback(() => {
    return imageFiles.map((img) => img.file);
  }, [imageFiles]);

  return {
    // State
    imageFiles,
    existingImages,
    isOptimizing,
    progress,
    isPending,
    totalImages,
    canAddMore: totalImages < maxImages && !isOptimizing,

    // Actions
    addImages,
    removeNewImage,
    removeExistingImage,
    clearNewImages,
    getFiles,
  };
}
