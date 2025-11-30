/**
 * 이미지 업로더 컴포넌트
 *
 * @see docs/sprints/sprint-3.md - Task 11
 * @see docs/technical/03-COMPONENT-PATTERNS.md - UI Components
 */

"use client";

import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/lib/constants/config";
import { validateFileUpload } from "@/lib/security/validation";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type ImageFile = {
  file: File;
  preview: string;
};

type ImageUploaderProps = {
  /**
   * 현재 선택된 이미지 파일들
   */
  images: ImageFile[];

  /**
   * 이미지 변경 콜백
   */
  onChange: (images: ImageFile[]) => void;

  /**
   * 최대 업로드 가능 이미지 수
   */
  maxImages?: number;

  /**
   * 최대 파일 크기 (MB)
   */
  maxSizeMB?: number;

  /**
   * 허용 파일 타입
   */
  acceptedTypes?: string[];
};

/**
 * ImageUploader 컴포넌트
 *
 * 최대 5장까지 이미지를 업로드하고 미리보기를 표시합니다.
 *
 * @example
 * ```tsx
 * const [images, setImages] = useState<ImageFile[]>([]);
 *
 * <ImageUploader
 *   images={images}
 *   onChange={setImages}
 *   maxImages={5}
 * />
 * ```
 */
export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  maxSizeMB = APP_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024),
  acceptedTypes = APP_CONFIG.ALLOWED_IMAGE_TYPES as unknown as string[],
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);

    // 이미 최대 개수에 도달했는지 확인
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`최대 ${maxImages}장까지만 업로드할 수 있습니다.`);
      return;
    }

    const newImages: ImageFile[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];

      // 파일이 없으면 건너뛰기
      if (!file) continue;

      // validation.ts를 사용한 파일 검증
      const validation = validateFileUpload(file, {
        allowedTypes: acceptedTypes,
        maxSize: maxSizeBytes,
      });

      if (!validation.isValid) {
        setError(validation.message);
        continue;
      }

      // 미리보기 URL 생성
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const imageToRemove = images[index];
    if (!imageToRemove) return;

    // 미리보기 URL 메모리 해제
    URL.revokeObjectURL(imageToRemove.preview);

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    setError(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-2">
      {/* 업로드 버튼 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={!canAddMore}
          className="w-full"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          이미지 추가 ({images.length}/{maxImages})
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 도움말 */}
      <p className="text-xs text-neutral-500">
        JPG, PNG, WEBP · 최대 {maxSizeMB}MB · 최대 {maxImages}장
      </p>

      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
            >
              <Image
                src={image.preview}
                alt={`업로드 이미지 ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
                unoptimized // blob URL은 최적화 불가
              />

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                aria-label="이미지 삭제"
              >
                <X className="h-4 w-4" />
              </button>

              {/* 순서 표시 */}
              <div className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Clean up 함수 export (컴포넌트 unmount 시 사용)
export function cleanupImagePreviews(images: ImageFile[]) {
  images.forEach((image) => {
    URL.revokeObjectURL(image.preview);
  });
}
