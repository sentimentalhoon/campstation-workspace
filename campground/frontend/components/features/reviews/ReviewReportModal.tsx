/**
 * 리뷰 신고 모달 컴포넌트
 *
 * @see docs/sprints/sprint-5.md - P2-3: 리뷰 신고 기능
 */

"use client";

import { Button } from "@/components/ui";
import { useReportReview } from "@/hooks";
import { sanitizeText } from "@/lib/security/sanitize";
import { X } from "lucide-react";
import { useState } from "react";

type ReviewReportModalProps = {
  /**
   * 리뷰 ID
   */
  reviewId: number;

  /**
   * 모달 닫기 콜백
   */
  onClose: () => void;
};

const REPORT_REASONS = [
  { value: "SPAM", label: "스팸 또는 광고" },
  { value: "INAPPROPRIATE", label: "부적절한 내용" },
  { value: "OFFENSIVE", label: "욕설 또는 비방" },
  { value: "FALSE_INFO", label: "허위 정보" },
  { value: "OTHER", label: "기타" },
];

/**
 * ReviewReportModal 컴포넌트
 *
 * 리뷰를 신고할 수 있는 모달입니다.
 *
 * @example
 * ```tsx
 * <ReviewReportModal
 *   reviewId={123}
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */
export function ReviewReportModal({
  reviewId,
  onClose,
}: ReviewReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reportReview = useReportReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedReason) {
      setError("신고 사유를 선택해주세요.");
      return;
    }

    const sanitizedCustomReason = sanitizeText(customReason.trim());

    if (selectedReason === "OTHER" && !sanitizedCustomReason) {
      setError("기타 사유를 입력해주세요.");
      return;
    }

    try {
      const reason =
        selectedReason === "OTHER" ? sanitizedCustomReason : selectedReason;
      await reportReview.mutateAsync({ reviewId, reason });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError("신고에 실패했습니다. 다시 시도해주세요.");
      console.error("리뷰 신고 실패:", err);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="text-center">
            <div className="mb-4 text-4xl">✓</div>
            <p className="text-lg font-medium">신고가 접수되었습니다</p>
            <p className="mt-2 text-sm text-gray-600">
              검토 후 적절한 조치를 취하겠습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">리뷰 신고</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <span className="text-sm">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "OTHER" && (
            <div className="mb-4">
              <label
                htmlFor="customReason"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                상세 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="신고 사유를 자세히 입력해주세요."
                rows={4}
                className="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:outline-none"
              />
            </div>
          )}

          <div className="mb-4 text-xs text-gray-500">
            허위 신고 시 서비스 이용에 제한이 있을 수 있습니다.
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={reportReview.isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={reportReview.isPending}
              className="flex-1"
            >
              {reportReview.isPending ? "신고 중..." : "신고하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
