/**
 * 리뷰 작성 모달
 * Owner/Admin이 테스트용으로 리뷰를 작성할 수 있는 모달
 */

"use client";

import { ImageUpload } from "@/components/common";
import { Button } from "@/components/ui";
import { Textarea } from "@/components/ui/Textarea";
import { useImageUpload } from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { useCreateReview } from "@/hooks/useCreateReview";
import { useUploadReviewImages } from "@/hooks/useImages";
import { APP_CONFIG } from "@/lib/constants/config";
import { sanitizeText } from "@/lib/security/sanitize";
import { Star, X } from "lucide-react";
import { useState } from "react";

type ReviewWriteModalProps = {
  campgroundId: number;
  campgroundName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ReviewWriteModal({
  campgroundId,
  campgroundName,
  isOpen,
  onClose,
}: ReviewWriteModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const createReviewMutation = useCreateReview();
  const uploadImagesMutation = useUploadReviewImages();

  // Image upload hook with optimization
  const imageUpload = useImageUpload({
    maxImages: 5,
    enableOptimization: true,
    imageType: "review",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이미 제출 중이면 무시 (중복 제출 방지)
    if (isSubmitting) {
      return;
    }

    const sanitizedComment = sanitizeText(comment.trim());

    if (sanitizedComment.length < APP_CONFIG.MIN_REVIEW_LENGTH) {
      toast.error(
        `리뷰는 최소 ${APP_CONFIG.MIN_REVIEW_LENGTH}자 이상 작성해주세요`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. 이미지 업로드 (썸네일 자동 생성)
      let imagePairs: { thumbnailUrl: string; originalUrl: string }[] = [];
      const files = imageUpload.getFiles();
      if (files.length > 0) {
        imagePairs = await uploadImagesMutation.mutateAsync(files);
      }

      // 2. 리뷰 작성
      await createReviewMutation.mutateAsync({
        campgroundId,
        // OWNER/ADMIN은 reservationId 없이도 작성 가능
        rating,
        comment: sanitizedComment,
        images: imagePairs,
      });

      toast.success("리뷰가 작성되었습니다");
      handleClose();
    } catch (error) {
      console.error("리뷰 작성 실패:", error);
      toast.error("리뷰 작성에 실패했습니다");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    imageUpload.clearNewImages();
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b p-4">
          <h2 className="text-foreground text-lg font-bold">리뷰 작성</h2>
          <button
            onClick={handleClose}
            className="hover:bg-muted rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - 스크롤 가능 영역 */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="space-y-6 overflow-y-auto p-6">
            {/* 캠핑장 이름 */}
            <div>
              <p className="text-muted-foreground text-sm">캠핑장</p>
              <p className="text-foreground font-semibold">{campgroundName}</p>
            </div>

            {/* 별점 */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                별점 <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-warning text-warning"
                          : "fill-muted text-muted"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-foreground ml-2 text-lg font-semibold">
                  {rating}.0
                </span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                리뷰 내용 <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="캠핑장에서의 경험을 자세히 작성해주세요 (최소 10자)"
                rows={5}
                required
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {comment.length} / 500자
              </p>
            </div>

            {/* 이미지 업로드 with Optimization */}
            <ImageUpload
              {...imageUpload}
              label="사진"
              helpText="최대 5개, 각 5MB 이하 (JPEG, PNG, WebP) - 자동 최적화 적용"
              maxImages={5}
              showOptimizationInfo
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 - 하단 고정 */}
          <div className="shrink-0 border-t p-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isSubmitting ||
                  imageUpload.isOptimizing ||
                  comment.trim().length < 10
                }
                className="flex-1"
              >
                {isSubmitting ? "작성 중..." : "리뷰 작성"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
