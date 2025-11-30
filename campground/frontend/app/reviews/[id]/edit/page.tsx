/**
 * 리뷰 수정 페이지
 *
 * @route /reviews/[id]/edit
 * @auth Required
 */

"use client";

import { StarRating } from "@/components/features/reviews";
import { ImageUpload } from "@/components/common";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription, Button } from "@/components/ui";
import { Textarea } from "@/components/ui/Textarea";
import {
  useImageUpload,
  useUpdateReview,
  useUploadReviewImages,
} from "@/hooks";
import { reviewApi } from "@/lib/api";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type ExistingImage = {
  thumbnailUrl: string;
  originalUrl: string;
  id?: number; // ID 기반 삭제를 위해 추가
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditReviewPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const reviewId = Number(id);

  // 기존 리뷰 로드
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", reviewId],
    queryFn: () => reviewApi.getById(reviewId),
  });

  const review = data;

  // 폼 상태 - review가 없으면 기본값 사용
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [originalImages, setOriginalImages] = useState<ExistingImage[]>([]);
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Image upload hook with optimization
  const imageUpload = useImageUpload({
    maxImages: 5,
    existingImages: existingImageUrls,
    onExistingImagesChange: (newUrls) => {
      setExistingImageUrls(newUrls);

      // Track deleted images by comparing URLs
      const deletedImages = originalImages.filter(
        (img) => !newUrls.includes(img.thumbnailUrl)
      );
      setDeletedImageIds(deletedImages.map((img) => img.id!).filter(Boolean));
    },
    enableOptimization: true,
    imageType: "review",
  });

  const updateReview = useUpdateReview();
  const uploadImages = useUploadReviewImages();

  // review 데이터가 로드되면 폼 상태 초기화 (한 번만)
  if (review && !isInitialized) {
    setRating(review.rating);
    setComment(review.comment);
    if (review.images && review.images.length > 0) {
      // 이미지에 ID 추가 (인덱스를 ID로 사용)
      const imagesWithId = review.images.map((img, idx) => ({
        ...img,
        id: idx + 1,
      }));
      setOriginalImages(imagesWithId);
      setExistingImageUrls(imagesWithId.map((img) => img.thumbnailUrl));
    }
    setIsInitialized(true);
  }

  /**
   * 리뷰 수정 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (rating < 1 || rating > 5) {
      setError("별점을 선택해주세요.");
      return;
    }
    if (comment.trim().length < APP_CONFIG.MIN_REVIEW_LENGTH) {
      setError(
        `리뷰 내용은 최소 ${APP_CONFIG.MIN_REVIEW_LENGTH}자 이상 입력해주세요.`
      );
      return;
    }
    if (comment.trim().length > 2000) {
      setError("리뷰 내용은 2000자를 초과할 수 없습니다.");
      return;
    }

    try {
      setError("");

      // 1. 새 이미지 업로드 (썸네일 자동 생성)
      let newImagePairs: { thumbnailUrl: string; originalUrl: string }[] = [];
      const newFiles = imageUpload.getFiles();

      if (newFiles.length > 0) {
        try {
          newImagePairs = await uploadImages.mutateAsync(newFiles);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          return;
        }
      }

      // 2. 리뷰 수정 (ID 기반 삭제 + 새 이미지 추가)
      await updateReview.mutateAsync({
        reviewId,
        data: {
          rating,
          comment: comment.trim(),
          images: newImagePairs.length > 0 ? newImagePairs : undefined,
          imageIdsToDelete:
            deletedImageIds.length > 0 ? deletedImageIds : undefined,
        },
      });

      // 성공 시 내 리뷰 목록으로 이동
      router.push(ROUTES.DASHBOARD.REVIEWS);
    } catch (err) {
      setError("리뷰 수정에 실패했습니다. 다시 시도해주세요.");
      console.error("리뷰 수정 실패:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-14">
        <PageHeader title="리뷰 수정" showBack onBack={() => router.back()} />
        <div className="container mx-auto max-w-2xl px-4 pt-20 pb-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">리뷰를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-14">
        <PageHeader title="리뷰 수정" showBack onBack={() => router.back()} />
        <div className="container mx-auto max-w-2xl px-4 pt-20 pb-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">리뷰를 찾을 수 없습니다.</p>
            <Button
              onClick={() => router.push(ROUTES.DASHBOARD.REVIEWS)}
              className="mt-4"
            >
              내 리뷰 목록으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-14">
      <PageHeader title="리뷰 수정" showBack onBack={() => router.back()} />

      <div className="container mx-auto max-w-2xl px-4 pt-20 pb-6">
        {/* 캠핑장 정보 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-500">캠핑장</p>
          <p className="mt-1 text-lg font-semibold">{review.campgroundName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 별점 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            별점 <span className="text-red-500">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} size="lg" showLabel />
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            리뷰 내용 <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`캠핑장에 대한 솔직한 후기를 남겨주세요. (최소 ${APP_CONFIG.MIN_REVIEW_LENGTH}자)`}
            rows={6}
          />
          <p className="mt-1 text-right text-sm text-gray-500">
            {comment.length}/2000
          </p>
        </div>

        {/* 이미지 업로드 with Optimization */}
        <ImageUpload
          {...imageUpload}
          label="사진 첨부 (선택)"
          helpText="최대 5개, 각 5MB 이하 (JPEG, PNG, WebP) - 자동 최적화 적용"
          maxImages={5}
          disabled={updateReview.isPending}
        />

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={updateReview.isPending}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={updateReview.isPending}
            className="flex-1"
          >
            {updateReview.isPending ? "수정 중..." : "수정 완료"}
          </Button>
        </div>
        </form>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}
