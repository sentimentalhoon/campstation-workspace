/**
 * ImageUploadSection Component
 * 이미지 업로드 섹션
 */

import Image from "next/image";

import { FormSection } from "./FormSection";

interface ImageFile {
  preview: string;
  originalSize?: number;
  optimizedSize?: number;
}

interface ImageUploadSectionProps {
  imageFiles: ImageFile[];
  existingImages: string[];
  isOptimizing: boolean;
  progress: {
    current: number;
    total: number;
    compressionRatio?: number;
  };
  totalImages: number;
  canAddMore: boolean;
  onAddImages: (files: FileList | null) => Promise<void>;
  onRemoveNew: (index: number) => void;
  onRemoveExisting: (index: number) => void;
}

export function ImageUploadSection({
  imageFiles,
  existingImages,
  isOptimizing,
  progress,
  totalImages,
  canAddMore,
  onAddImages,
  onRemoveNew,
  onRemoveExisting,
}: ImageUploadSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddImages(e.target.files);
  };

  return (
    <FormSection title="이미지">
      {/* Upload Button */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          이미지 업로드 ({totalImages}/50)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={!canAddMore || isOptimizing}
          className="block w-full rounded-lg border border-gray-300 p-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          최대 50개, 각 5MB 이하 (JPEG, PNG, WebP)
        </p>
      </div>

      {/* Optimization Progress */}
      {isOptimizing && (
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                  <Image
                    src={url}
                    alt={`기존 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExisting(index)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  title="삭제"
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {imageFiles.map((file, index) => (
              <div key={`new-${index}`} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-green-200">
                  <Image
                    src={file.preview}
                    alt={`새 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveNew(index)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  title="삭제"
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
                {file.originalSize && file.optimizedSize && (
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
    </FormSection>
  );
}
