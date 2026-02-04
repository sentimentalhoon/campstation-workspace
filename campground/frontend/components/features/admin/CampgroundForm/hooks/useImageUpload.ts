/**
 * useImageUpload Hook
 * React 19+ optimistic updates with image optimization
 */

import { APP_CONFIG } from "@/lib/constants/config";
import { validateFileUpload } from "@/lib/security/validation";
import {
  formatCompressionRatio,
  formatFileSize,
  optimizeImages,
} from "@/lib/utils/imageOptimizer";
import { useCallback, useState, useTransition } from "react";

interface ImageFile {
  file: File;
  preview: string;
  originalSize: number;
  optimizedSize: number;
}

interface OptimizationProgress {
  current: number;
  total: number;
  compressionRatio?: number;
}

export function useImageUpload(
  existingImages: string[],
  onUpdate: (images: string[]) => void
) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress>({
    current: 0,
    total: 0,
  });
  const [isPending, startTransition] = useTransition();

  const totalImages = existingImages.length + imageFiles.length;
  const MAX_IMAGES = 50;

  const addImages = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);

      // Validate file types using validation.ts
      for (const file of files) {
        const validation = validateFileUpload(file, {
          allowedTypes: APP_CONFIG.ALLOWED_IMAGE_TYPES as unknown as string[],
          maxSize: APP_CONFIG.MAX_IMAGE_SIZE,
        });

        if (!validation.isValid) {
          alert(validation.message);
          return;
        }
      }

      // Check max limit
      const remainingSlots = MAX_IMAGES - totalImages;
      if (files.length > remainingSlots) {
        alert(
          `이미지는 최대 ${MAX_IMAGES}개까지 업로드할 수 있습니다 (현재 ${remainingSlots}개 추가 가능)`
        );
        return;
      }

      try {
        setIsOptimizing(true);
        setProgress({
          current: 0,
          total: files.length,
        });

        // Optimize images
        const optimizedResults = await optimizeImages(
          files,
          "campground",
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
        const newImageFiles: ImageFile[] = optimizedResults.map((result) => ({
          file: result.file,
          preview: URL.createObjectURL(result.file),
          originalSize: result.originalSize,
          optimizedSize: result.compressedSize,
        }));

        // Calculate savings
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

        startTransition(() => {
          setImageFiles((prev) => [...prev, ...newImageFiles]);
        });
      } catch (error) {
        console.error("Image optimization failed:", error);
        alert("이미지 최적화에 실패했습니다");
      } finally {
        setIsOptimizing(false);
      }
    },
    [totalImages]
  );

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

  const removeExistingImage = useCallback(
    (index: number) => {
      const newImages = [...existingImages];
      newImages.splice(index, 1);
      onUpdate(newImages);
    },
    [existingImages, onUpdate]
  );

  return {
    imageFiles,
    isOptimizing,
    progress,
    isPending,
    totalImages,
    canAddMore: totalImages < MAX_IMAGES && !isOptimizing,
    addImages,
    removeNewImage,
    removeExistingImage,
  };
}
