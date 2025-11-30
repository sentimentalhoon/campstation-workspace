/**
 * ImageUpload Component
 *
 * Reusable image upload component with optimization support.
 * Based on the campground image upload implementation.
 *
 * Features:
 * - Single or multiple image uploads
 * - Image optimization with progress indicator
 * - Existing + new image management
 * - Responsive grid layout
 * - Accessible controls
 *
 * @example
 * ```tsx
 * // Multiple images with optimization
 * const [existingImages, setExistingImages] = useState<string[]>([]);
 * const imageUpload = useImageUpload({
 *   maxImages: 5,
 *   existingImages,
 *   onExistingImagesChange: setExistingImages,
 *   enableOptimization: true,
 *   imageType: 'announcement'
 * });
 *
 * <ImageUpload
 *   {...imageUpload}
 *   label="공지사항 이미지"
 *   helpText="최대 5개, 각 5MB 이하"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Single image without optimization
 * const imageUpload = useImageUpload({
 *   maxImages: 1,
 *   enableOptimization: false,
 *   imageType: 'banner'
 * });
 *
 * <ImageUpload
 *   {...imageUpload}
 *   label="배너 이미지"
 *   variant="single"
 * />
 * ```
 */

"use client";

import Image from "next/image";
import {
  ImageFile,
  OptimizationProgress,
} from "@/hooks/common/useImageUpload";

export interface ImageUploadProps {
  // From useImageUpload hook
  imageFiles: ImageFile[];
  existingImages: string[];
  isOptimizing: boolean;
  progress: OptimizationProgress;
  totalImages: number;
  canAddMore: boolean;
  addImages: (files: FileList | null) => Promise<void>;
  removeNewImage: (index: number) => void;
  removeExistingImage: (index: number) => void;

  // Component props
  /**
   * Label for the upload section
   * @default "이미지"
   */
  label?: string;

  /**
   * Help text displayed below the upload button
   */
  helpText?: string;

  /**
   * Maximum number of images
   * @default 10
   */
  maxImages?: number;

  /**
   * Layout variant
   * - 'grid': Multiple images in grid (default)
   * - 'single': Single image display
   * @default 'grid'
   */
  variant?: "grid" | "single";

  /**
   * Show optimization info
   * @default true
   */
  showOptimizationInfo?: boolean;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Disable the upload
   */
  disabled?: boolean;

  /**
   * Accepted file types for input
   * @default "image/jpeg,image/png,image/webp"
   */
  accept?: string;
}

export function ImageUpload({
  imageFiles,
  existingImages,
  isOptimizing,
  progress,
  totalImages,
  canAddMore,
  addImages,
  removeNewImage,
  removeExistingImage,
  label = "이미지",
  helpText,
  maxImages = 10,
  variant = "grid",
  showOptimizationInfo = true,
  className = "",
  disabled = false,
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addImages(e.target.files);
    // Reset input to allow re-selecting the same file
    e.target.value = "";
  };

  const isSingle = variant === "single";
  const gridCols = isSingle
    ? "grid-cols-1"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label} ({totalImages}/{maxImages})
        </label>
        <input
          type="file"
          accept={accept}
          multiple={!isSingle}
          onChange={handleFileChange}
          disabled={!canAddMore || isOptimizing || disabled}
          className="block w-full rounded-lg border border-gray-300 p-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      </div>

      {/* Optimization Progress */}
      {isOptimizing && showOptimizationInfo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              이미지 최적화 중...
            </span>
            <span className="text-sm text-blue-700">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-blue-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
          {progress.compressionRatio && (
            <p className="mt-2 text-xs text-blue-700">
              압축률: {progress.compressionRatio.toFixed(1)}%
            </p>
          )}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            기존 이미지 ({existingImages.length})
          </h4>
          <div className={`grid gap-4 ${gridCols}`}>
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="group relative">
                <div
                  className={`relative overflow-hidden rounded-lg border-2 border-gray-200 ${
                    isSingle ? "aspect-[2/1]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`기존 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes={
                      isSingle
                        ? "100vw"
                        : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    }
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  disabled={disabled}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="삭제"
                  aria-label={`기존 이미지 ${index + 1} 삭제`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images */}
      {imageFiles.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            새 이미지 ({imageFiles.length})
          </h4>
          <div className={`grid gap-4 ${gridCols}`}>
            {imageFiles.map((file, index) => (
              <div key={`new-${index}`} className="group relative">
                <div
                  className={`relative overflow-hidden rounded-lg border-2 border-green-200 ${
                    isSingle ? "aspect-[2/1]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={file.preview}
                    alt={`새 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes={
                      isSingle
                        ? "100vw"
                        : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    }
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  disabled={disabled}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="삭제"
                  aria-label={`새 이미지 ${index + 1} 삭제`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {showOptimizationInfo &&
                  file.originalSize &&
                  file.optimizedSize &&
                  file.originalSize !== file.optimizedSize && (
                    <div className="mt-1 text-xs text-gray-500">
                      {(file.originalSize / 1024).toFixed(0)}KB →{" "}
                      {(file.optimizedSize / 1024).toFixed(0)}KB
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
