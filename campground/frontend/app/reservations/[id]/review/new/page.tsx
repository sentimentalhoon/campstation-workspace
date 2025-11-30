/**
 * 리뷰 작성 페이지
 *
 * @route /reservations/[id]/review/new
 * @auth Required
 */

"use client";

import { StarRating } from "@/components/features/reviews";
import { ImageUpload } from "@/components/common";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Alert,
  AlertDescription,
  Button,
  ErrorMessage,
  LoadingSpinner,
} from "@/components/ui";
import { Textarea } from "@/components/ui/Textarea";
import {
  useCreateReview,
  useImageUpload,
  useReservationDetail,
  useUploadReviewImages,
} from "@/hooks";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function NewReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = Number(params.id);

  // 예약 상세 정보 조회 (campgroundId 가져오기 위함)
  const {
    data: reservationData,
    isLoading: isLoadingReservation,
    error: reservationError,
  } = useReservationDetail(reservationId);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload hook with optimization
  const imageUpload = useImageUpload({
    maxImages: 5,
    enableOptimization: true,
    imageType: "review",
  });

  const createReview = useCreateReview();
  const uploadImages = useUploadReviewImages();

  /**
   * 리뷰 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 이미 제출 중이면 무시 (중복 제출 방지)
    if (isSubmitting) {
      return;
    }

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
      setIsSubmitting(true);
      setError("");

      // 1. 이미지 업로드 (썸네일 자동 생성)
      let imagePaths: { thumbnailUrl: string; originalUrl: string }[] = [];
      const files = imageUpload.getFiles();

      if (files.length > 0) {
        try {
          imagePaths = await uploadImages.mutateAsync(files);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          setIsSubmitting(false);
          return;
        }
      }

      // 2. 예약 상세에서 campgroundId 가져오기
      const campgroundId = reservationData?.campgroundId;
      if (!campgroundId) {
        setError("캠핑장 정보를 찾을 수 없습니다.");
        setIsSubmitting(false);
        return;
      }

      // 3. 리뷰 생성
      await createReview.mutateAsync({
        campgroundId,
        reservationId,
        rating,
        comment: comment.trim(),
        images: imagePaths.length > 0 ? imagePaths : undefined,
      });

      // 성공 시 예약 상세 페이지로 이동
      router.push(ROUTES.RESERVATIONS.DETAIL(reservationId));
    } catch (err) {
      setError("리뷰 작성에 실패했습니다. 다시 시도해주세요.");
      console.error("리뷰 작성 실패:", err);
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (isLoadingReservation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (reservationError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <ErrorMessage
          title="예약 정보를 불러올 수 없습니다"
          message={reservationError.message}
        />
      </div>
    );
  }

  // 예약 데이터 없음
  if (!reservationData) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <ErrorMessage
          title="예약 정보를 찾을 수 없습니다"
          message="존재하지 않는 예약입니다."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-14">
      <PageHeader title="리뷰 작성" showBack onBack={() => router.back()} />

      <div className="container mx-auto max-w-2xl px-4 pt-20 pb-6">
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
          disabled={isSubmitting}
        />

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "작성 중..." : "리뷰 작성"}
          </Button>
        </div>
        </form>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}
