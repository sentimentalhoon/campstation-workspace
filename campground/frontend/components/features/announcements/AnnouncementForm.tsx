"use client";

import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/common";
import { useImageUpload } from "@/hooks";
import { imageApi } from "@/lib/api/images";
import {
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_LABELS,
} from "@/lib/constants";
import type { Announcement, AnnouncementType, ImagePair } from "@/types";
import { useState } from "react";

type AnnouncementFormProps = {
  campgroundId: number;
  initialData?: Announcement;
  onSubmit: (data: {
    type: AnnouncementType;
    title: string;
    content: string;
    images?: ImagePair[];
    imageIdsToDelete?: number[];
    isPinned: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

/**
 * 공지사항 작성/수정 폼 컴포넌트
 *
 * @example
 * ```tsx
 * const createMutation = useCreateAnnouncement();
 *
 * <AnnouncementForm
 *   campgroundId={1}
 *   onSubmit={async (data) => {
 *     await createMutation.mutateAsync({
 *       campgroundId: 1,
 *       ...data
 *     });
 *   }}
 *   onCancel={() => setShowForm(false)}
 *   isSubmitting={createMutation.isPending}
 * />
 * ```
 */
export function AnnouncementForm({
  campgroundId: _campgroundId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AnnouncementFormProps) {
  const [type, setType] = useState<AnnouncementType>(
    initialData?.type || "NOTICE"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [isUploading, setIsUploading] = useState(false);

  // Convert ImagePair to thumbnail URLs for existing images
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialData?.images?.map((img) => img.thumbnailUrl) || []
  );

  // Image upload hook with optimization
  const imageUpload = useImageUpload({
    maxImages: 5,
    existingImages: existingImageUrls,
    onExistingImagesChange: setExistingImageUrls,
    enableOptimization: true,
    imageType: "announcement",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Calculate deleted image IDs
      const deletedImageIds: number[] = [];
      if (initialData?.images) {
        for (const originalImage of initialData.images) {
          // If thumbnail URL is not in existingImageUrls, it was deleted
          if (!existingImageUrls.includes(originalImage.thumbnailUrl)) {
            if (originalImage.id) {
              deletedImageIds.push(originalImage.id);
            }
          }
        }
      }

      // 2. Upload new images
      let newImagePairs: ImagePair[] = [];
      const newFiles = imageUpload.getFiles();

      if (newFiles.length > 0) {
        const uploadResults = await imageApi.uploadMultiple(
          newFiles,
          "announcement"
        );
        newImagePairs = uploadResults.map((result) => ({
          thumbnailUrl: result.thumbnailUrl,
          originalUrl: result.originalUrl,
        }));
      }

      // 3. Submit (only send new images, backend keeps existing ones)
      await onSubmit({
        type,
        title: title.trim(),
        content: content.trim(),
        images: newImagePairs.length > 0 ? newImagePairs : undefined,
        imageIdsToDelete: deletedImageIds.length > 0 ? deletedImageIds : undefined,
        isPinned,
      });

      // Cleanup
      imageUpload.clearNewImages();
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("공지사항 저장에 실패했습니다");
    } finally {
      setIsUploading(false);
    }
  };

  const types: AnnouncementType[] = ["NOTICE", "EVENT", "FACILITY", "URGENT"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          공지 타입
        </label>
        <div className="grid grid-cols-2 gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
                type === t
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-primary"
              }`}
            >
              <span>{ANNOUNCEMENT_TYPE_ICONS[t]}</span>
              <span>{ANNOUNCEMENT_TYPE_LABELS[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-neutral-700"
        >
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지사항 제목을 입력하세요"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          maxLength={100}
          required
        />
        <p className="mt-1 text-xs text-neutral-500">{title.length}/100</p>
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-medium text-neutral-700"
        >
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="공지사항 내용을 입력하세요"
          rows={8}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          maxLength={2000}
          required
        />
        <p className="mt-1 text-xs text-neutral-500">{content.length}/2000</p>
      </div>

      {/* Pin Option */}
      <div className="flex items-center gap-2">
        <input
          id="isPinned"
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20"
        />
        <label htmlFor="isPinned" className="text-sm text-neutral-700">
          상단 고정
        </label>
      </div>

      {/* Image Upload with Optimization */}
      <ImageUpload
        {...imageUpload}
        label="이미지"
        helpText="최대 5개, 각 5MB 이하 (JPEG, PNG, WebP) - 자동 최적화 적용"
        maxImages={5}
        disabled={isSubmitting || isUploading}
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting || isUploading}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting || isUploading}
          disabled={
            isSubmitting || isUploading || !title.trim() || !content.trim()
          }
          className="flex-1"
        >
          {isUploading
            ? "이미지 업로드 중..."
            : initialData
              ? "수정"
              : "등록"}
        </Button>
      </div>
    </form>
  );
}
