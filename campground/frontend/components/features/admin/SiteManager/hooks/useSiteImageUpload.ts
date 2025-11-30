/**
 * useSiteImageUpload Hook
 * Image upload with optimization for site images (max 5)
 */

import {
  formatFileSize,
  optimizeImages,
  validateImageFile,
} from "@/lib/utils/imageOptimizer";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

interface SiteImageFile {
  file: File | null; // Allow null for existing images
  preview: string;
  originalSize: number;
  optimizedSize: number;
  imageId?: number; // Track existing image ID for deletion
}

interface OptimizationProgress {
  current: number;
  total: number;
  saved: string;
}

interface InitialImage {
  imageUrl: string;
  imageId?: number; // Add imageId to track which images to delete
}

// Helper to convert Site images to InitialImage format
export function convertSiteImagesToInitialImages(
  thumbnailUrls?: string[],
  imageIds?: number[]
): InitialImage[] | null {
  if (!thumbnailUrls || thumbnailUrls.length === 0) return null;

  // Use thumbnails for preview (they're optimized for display)
  return thumbnailUrls.map((url, index) => ({
    imageUrl: url,
    imageId: imageIds?.[index], // Include imageId if available
  }));
}

export function useSiteImageUpload(initialImages?: InitialImage[] | null) {
  const [imageFiles, setImageFiles] = useState<SiteImageFile[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]); // Track deleted image IDs
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress>({
    current: 0,
    total: 0,
    saved: "0 KB",
  });
  const [isPending, startTransition] = useTransition();

  // Track the last initialImages to detect changes
  const lastInitialImagesRef = useRef<InitialImage[] | null | undefined>(
    initialImages
  );

  const MAX_IMAGES = 5; // Sites have fewer images than campgrounds

  // Sync images when initialImages changes (for edit mode)
  useEffect(() => {
    if (lastInitialImagesRef.current !== initialImages) {
      lastInitialImagesRef.current = initialImages;

      if (initialImages && initialImages.length > 0) {
        // Convert existing images to SiteImageFile format
        // Note: For existing images, we don't have actual File objects
        // We'll use the preview URL and set sizes to 0
        const existingImages: SiteImageFile[] = initialImages.map((img) => ({
          file: null, // Existing images don't have File objects
          preview: img.imageUrl,
          originalSize: 0,
          optimizedSize: 0,
          imageId: img.imageId, // Track image ID for deletion
        }));

        startTransition(() => {
          setImageFiles(existingImages);
          setDeletedImageIds([]); // Reset deleted IDs when loading new images
        });
      } else {
        startTransition(() => {
          setImageFiles([]);
          setDeletedImageIds([]);
        });
      }
    }
  }, [initialImages]);

  const addImages = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);

      // Validate file types
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(validation.error || "유효하지 않은 파일입니다");
          return;
        }
      }

      // Check max limit
      const remainingSlots = MAX_IMAGES - imageFiles.length;
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
          saved: "0 KB",
        });

        // Optimize images
        const optimizedResults = await optimizeImages(
          files,
          "campground",
          (fileIndex) => {
            setProgress((prev) => ({
              ...prev,
              current: fileIndex + 1,
            }));
          }
        );

        // Create image file objects with previews
        const newImageFiles: SiteImageFile[] = optimizedResults.map(
          (result) => ({
            file: result.file,
            preview: URL.createObjectURL(result.file),
            originalSize: result.originalSize,
            optimizedSize: result.compressedSize,
          })
        );

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

        setProgress((prev) => ({
          ...prev,
          saved,
        }));

        startTransition(() => {
          setImageFiles((prev) => [...prev, ...newImageFiles]);
        });
      } catch (error) {
        console.error("Image optimization failed:", error);
        alert("이미지 최적화에 실패했습니다");
      } finally {
        setIsOptimizing(false);
        setTimeout(() => {
          setProgress({ current: 0, total: 0, saved: "0 KB" });
        }, 2000);
      }
    },
    [imageFiles.length]
  );

  const removeImage = useCallback((index: number) => {
    startTransition(() => {
      setImageFiles((prev) => {
        const removedImage = prev[index];

        // If this is an existing image (has imageId), track it for deletion
        if (removedImage?.imageId) {
          setDeletedImageIds((ids) => [...ids, removedImage.imageId!]);
        }

        // Revoke object URL to prevent memory leak
        if (removedImage?.preview && removedImage?.file) {
          URL.revokeObjectURL(removedImage.preview);
        }

        return prev.filter((_, i) => i !== index);
      });
    });
  }, []);

  const reset = useCallback(() => {
    // Revoke all object URLs (only for new uploads, not existing images)
    imageFiles.forEach((img) => {
      if (img.preview && img.file) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImageFiles([]);
    setDeletedImageIds([]);
    setProgress({ current: 0, total: 0, saved: "0 KB" });
  }, [imageFiles]);

  return {
    imageFiles,
    deletedImageIds, // Expose deleted image IDs
    isOptimizing,
    progress,
    isPending,
    canAddMore: imageFiles.length < MAX_IMAGES && !isOptimizing,
    addImages,
    removeImage,
    reset,
  };
}
