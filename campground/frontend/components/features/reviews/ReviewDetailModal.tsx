/**
 * 리뷰 상세 모달 컴포넌트
 *
 * 리뷰의 전체 내용과 모든 이미지를 볼 수 있는 모달
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { reviewApi } from "@/lib/api/reviews";
import { sanitizeText } from "@/lib/security/sanitize";
import { isAdmin, isOwner } from "@/lib/utils/permissions";
import type { Review } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ReviewDetailModalProps = {
  review: Review;
  onClose: () => void;
};

export default function ReviewDetailModal({
  review,
  onClose,
}: ReviewDetailModalProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyComment, setReplyComment] = useState(
    review.ownerReply?.comment || ""
  );
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 운영자 또는 관리자인지 확인
  const isUserAdmin = isAdmin(user?.role);
  const isUserOwner = isOwner(user?.role);

  // OWNER인 경우 자기 캠핑장의 리뷰인지 확인
  const isOwnCampground = isUserOwner && user?.id === review.campgroundOwnerId;

  // 답글을 달 수 있는 권한: ADMIN이거나 자기 캠핑장의 OWNER
  const canReply = isUserAdmin || isOwnCampground;
  const hasReply = !!review.ownerReply;

  // 답글 작성 뮤테이션
  const createReplyMutation = useMutation({
    mutationFn: (comment: string) =>
      reviewApi.createReply(review.id, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setShowReplyForm(false);
      setReplyComment("");
    },
  });

  // 답글 수정 뮤테이션
  const updateReplyMutation = useMutation({
    mutationFn: (comment: string) =>
      reviewApi.updateReply(review.id, review.ownerReply!.id, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setIsEditing(false);
    },
  });

  // 답글 삭제 뮤테이션
  const deleteReplyMutation = useMutation({
    mutationFn: () => reviewApi.deleteReply(review.id, review.ownerReply!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setReplyComment("");
    },
  });

  const handleSubmitReply = () => {
    const sanitizedReply = sanitizeText(replyComment.trim());

    if (!sanitizedReply) return;

    if (isEditing && hasReply) {
      updateReplyMutation.mutate(sanitizedReply);
    } else {
      createReplyMutation.mutate(sanitizedReply);
    }
  };

  const handleDeleteReply = () => {
    if (confirm("답글을 삭제하시겠습니까?")) {
      deleteReplyMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-500" : "text-neutral-300"}
      >
        ★
      </span>
    ));
  };

  return (
    <div
      className="fixed inset-0 z-101 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <h2 className="text-lg font-semibold">방문후기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4">
          {/* 작성자 정보 */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-lg font-medium">
              {review.userName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{review.userName}</div>
              <div className="text-sm text-neutral-500">
                {formatDate(review.createdAt)}
              </div>
            </div>
            <div className="flex gap-0.5 text-xl">
              {renderStars(review.rating)}
            </div>
          </div>

          {/* 캠핑장 정보 */}
          <div className="mb-4 rounded-lg border p-3">
            <div className="font-medium">{review.campgroundName}</div>
            <div className="text-sm text-neutral-500">
              {formatDate(review.createdAt)} 방문
            </div>
          </div>

          {/* 이미지 갤러리 */}
          {review.images && review.images.length > 0 && (
            <div className="mb-4">
              {review.images.map((image, index) => (
                <div
                  key={index}
                  className="relative mb-3 w-full overflow-hidden rounded-lg"
                  style={{ aspectRatio: "4/3" }}
                >
                  <Image
                    src={
                      imageErrors[index]
                        ? "/images/fallback-image.svg"
                        : image.originalUrl
                    }
                    alt={`리뷰 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                    unoptimized={!imageErrors[index]}
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, [index]: true }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* 리뷰 내용 */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">
              {review.comment}
            </p>
          </div>

          {/* 운영자 답글 섹션 */}
          {(hasReply || canReply) && (
            <div className="mt-4 border-t pt-4">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-700">운영자 답글</h3>
              </div>

              {/* 기존 답글 표시 */}
              {hasReply && !isEditing && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {review.ownerReply!.comment}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    {formatDate(review.ownerReply!.createdAt)}
                  </div>
                  {canReply && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setReplyComment(review.ownerReply!.comment);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDeleteReply}
                        disabled={deleteReplyMutation.isPending}
                        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 답글 작성/수정 폼 */}
              {canReply && (showReplyForm || isEditing || !hasReply) && (
                <div className="space-y-2">
                  <textarea
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    placeholder="캠핑장 운영자로서 답글을 작성해주세요..."
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    {(isEditing || showReplyForm) && (
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setShowReplyForm(false);
                          setReplyComment(review.ownerReply?.comment || "");
                        }}
                        className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        취소
                      </button>
                    )}
                    <button
                      onClick={handleSubmitReply}
                      disabled={
                        !replyComment.trim() ||
                        createReplyMutation.isPending ||
                        updateReplyMutation.isPending
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isEditing ? "수정" : "등록"}
                    </button>
                  </div>
                </div>
              )}

              {/* 답글 작성 버튼 (답글이 없고 폼도 안 보일 때) */}
              {canReply && !hasReply && !showReplyForm && (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  답글 작성하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
