"use client";

import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { Image } from "@/components/ui";
import { Textarea } from "@/components/ui/Textarea";
import {
  useApproveCampground,
  usePendingCampgrounds,
  useRejectCampground,
} from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import type { Campground } from "@/types";
import { AlertTriangle, Check, MapPin, X } from "lucide-react";
import { useState } from "react";

/**
 * 승인 대기 캠핑장 페이지
 */
function PendingCampgroundsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [selectedCampground, setSelectedCampground] =
    useState<Campground | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading, error } = usePendingCampgrounds({ page, size: 10 });
  const approveMutation = useApproveCampground();
  const rejectMutation = useRejectCampground();

  const handleApprove = async (campground: Campground) => {
    if (
      !confirm(
        `"${campground.name}" 캠핑장을 승인하시겠습니까?\n승인 후 일반 사용자에게 노출됩니다.`
      )
    ) {
      return;
    }

    try {
      await approveMutation.mutateAsync(campground.id);
      toast.success("캠핑장이 승인되었습니다");
    } catch (error) {
      toast.error("승인 처리 중 오류가 발생했습니다");
      console.error(error);
    }
  };

  const handleRejectClick = (campground: Campground) => {
    setSelectedCampground(campground);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedCampground) return;

    if (!rejectReason.trim()) {
      toast.warning("거부 사유를 입력해주세요");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        campgroundId: selectedCampground.id,
        reason: rejectReason,
      });
      toast.success("캠핑장이 거부되었습니다");
      setShowRejectModal(false);
      setSelectedCampground(null);
      setRejectReason("");
    } catch (error) {
      toast.error("거부 처리 중 오류가 발생했습니다");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">승인 대기 캠핑장 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
          <p>캠핑장 목록을 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const campgrounds = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <AdminDashboardNav />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">승인 대기 캠핑장</h1>
          <p className="mt-1 text-sm text-gray-600">
            총 {totalElements}개의 캠핑장이 승인을 기다리고 있습니다
          </p>
        </div>
        {campgrounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-16">
            <Check className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              승인 대기 중인 캠핑장이 없습니다
            </p>
            <p className="mt-2 text-sm text-gray-600">
              모든 캠핑장이 검토되었습니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campgrounds.map((campground) => (
              <div
                key={campground.id}
                className="overflow-hidden rounded-lg border bg-white shadow-sm"
              >
                {/* 캠핑장 이미지 */}
                {campground.thumbnailUrls &&
                  campground.thumbnailUrls.length > 0 &&
                  campground.thumbnailUrls[0] && (
                    <Image
                      src={campground.thumbnailUrls[0]}
                      alt={campground.name}
                      width={800}
                      height={192}
                      fallback="/images/fallback-image.svg"
                      aspectRatio="auto"
                      objectFit="cover"
                      rounded="none"
                      className="h-48 w-full bg-gray-200"
                    />
                  )}

                {/* 캠핑장 정보 */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {campground.name}
                  </h3>

                  {campground.address && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{campground.address}</span>
                    </div>
                  )}

                  {campground.description && (
                    <p className="mt-3 line-clamp-3 text-sm text-gray-700">
                      {campground.description}
                    </p>
                  )}

                  {/* 기본 정보 */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <div>
                      <span className="text-gray-600">등록일</span>
                      <p className="mt-1 font-medium">
                        {new Date(campground.createdAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">상태</span>
                      <p className="mt-1 font-medium text-orange-600">
                        승인 대기
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApprove(campground)}
                      disabled={approveMutation.isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
                    >
                      <Check className="h-5 w-5" />
                      승인
                    </button>
                    <button
                      onClick={() => handleRejectClick(campground)}
                      disabled={rejectMutation.isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-300"
                    >
                      <X className="h-5 w-5" />
                      거부
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>

      {/* 거부 사유 입력 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-bold">캠핑장 거부</h3>
            <p className="mt-2 text-sm text-gray-600">
              {selectedCampground?.name}
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                거부 사유 <span className="text-red-600">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="캠핑장 등록을 거부하는 이유를 입력해주세요"
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedCampground(null);
                  setRejectReason("");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:bg-gray-300"
              >
                {rejectMutation.isPending ? "처리 중..." : "거부 확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(PendingCampgroundsPage);
