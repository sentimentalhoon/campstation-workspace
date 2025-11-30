/**
 * FavoriteButton 컴포넌트
 *
 * 캠핑장 찜하기 버튼 (하트 아이콘 토글)
 *
 * @see docs/sprints/sprint-4.md
 */

"use client";

import { Toast, ToastVariant } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useFavoriteStatus, useToggleFavorite } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FavoriteButtonProps = {
  campgroundId: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
};

/**
 * FavoriteButton 컴포넌트
 *
 * @param campgroundId - 캠핑장 ID
 * @param size - 버튼 크기 (기본: md)
 * @param showCount - 찜 개수 표시 여부 (기본: false)
 * @param className - 추가 CSS 클래스
 *
 * @example
 * ```tsx
 * <FavoriteButton campgroundId={1} size="lg" />
 * ```
 */
export default function FavoriteButton({
  campgroundId,
  size = "md",
  showCount = false,
  className = "",
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isOptimistic, setIsOptimistic] = useState(false);

  // 토스트 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastVariant>("success");

  // 찜 상태 조회
  const { data: isFavorite, isLoading } = useFavoriteStatus(campgroundId);

  // 찜하기 토글
  const toggleFavorite = useToggleFavorite();

  // 아이콘 크기
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  // 버튼 크기
  const buttonSize = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  }[size];

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 로그인 체크
    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }

    // 낙관적 업데이트 시작
    setIsOptimistic(true);

    toggleFavorite.mutate(
      { campgroundId },
      {
        onSuccess: () => {
          // 찜 상태에 따라 토스트 메시지 설정
          if (isFavorite) {
            setToastMessage("찜 목록에서 제거되었습니다");
            setToastType("info");
          } else {
            setToastMessage("찜 목록에 추가되었습니다");
            setToastType("success");
          }
          setShowToast(true);
        },
        onSettled: () => {
          setIsOptimistic(false);
        },
        onError: (error) => {
          console.error("찜하기 토글 실패:", error);
        },
      }
    );
  };

  // 로딩 중이거나 낙관적 업데이트 중
  const isProcessing = isLoading || isOptimistic || toggleFavorite.isPending;

  // 찜 상태 (낙관적 업데이트 반영)
  const isFilled = isOptimistic ? !isFavorite : isFavorite;

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isProcessing}
        className={`inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${buttonSize} ${className} `}
        aria-label={isFilled ? "찜하기 취소" : "찜하기"}
      >
        <Heart
          size={iconSize}
          className={`transition-colors duration-200 ${isFilled ? "fill-red-500 stroke-red-500" : "stroke-neutral-600"} ${isProcessing ? "animate-pulse" : ""} `}
        />

        {showCount && (
          <span className="ml-1 text-xs text-neutral-600">
            {/* TODO: 찜 개수 표시 */}
          </span>
        )}
      </button>

      {/* 토스트 알림 */}
      {showToast && (
        <Toast
          id="favorite-toast"
          message={toastMessage}
          variant={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
