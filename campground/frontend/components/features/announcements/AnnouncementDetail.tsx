"use client";

import { Image } from "@/components/ui/Image";
import {
  ANNOUNCEMENT_TYPE_COLORS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_LABELS,
} from "@/lib/constants";
import type { Announcement } from "@/types";
import { format } from "date-fns";
import { Eye, Pin, X } from "lucide-react";

type AnnouncementDetailProps = {
  announcement: Announcement;
  onClose: () => void;
};

/**
 * 공지사항 상세 모달 컴포넌트
 *
 * @example
 * ```tsx
 * {selectedAnnouncement && (
 *   <AnnouncementDetail
 *     announcement={selectedAnnouncement}
 *     onClose={() => setSelectedAnnouncement(null)}
 *   />
 * )}
 * ```
 */
export function AnnouncementDetail({
  announcement,
  onClose,
}: AnnouncementDetailProps) {
  const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type];
  const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type];
  const typeLabel = ANNOUNCEMENT_TYPE_LABELS[announcement.type];

  return (
    <div
      className="fixed inset-0 z-102 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* 모달 컨테이너 */}
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-neutral-600 shadow-md transition hover:bg-white hover:text-neutral-900"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b border-neutral-200 p-6">
          <div className="mb-3 flex items-center gap-2">
            {/* Type Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full ${typeColor.bg} ${typeColor.text} border ${typeColor.border} px-3 py-1 text-sm font-semibold`}
            >
              <span>{typeIcon}</span>
              <span>{typeLabel}</span>
            </span>

            {/* Pinned Badge */}
            {announcement.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                <Pin className="h-4 w-4" />
                <span>고정</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-3 text-2xl font-bold text-neutral-900">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>{announcement.authorName}</span>
            <span>
              {format(new Date(announcement.createdAt), "yyyy.MM.dd HH:mm")}
            </span>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{announcement.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Images */}
          {announcement.images && announcement.images.length > 0 && (
            <div className="mb-6 space-y-3">
              {announcement.images.map((image, index) => (
                <div
                  key={image.id || index}
                  className="overflow-hidden rounded-lg"
                >
                  <Image
                    src={image.originalUrl}
                    alt={`공지사항 이미지 ${index + 1}`}
                    width={800}
                    height={600}
                    objectFit="contain"
                    rounded="lg"
                    className="w-full"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content Text */}
          <div className="leading-relaxed whitespace-pre-wrap text-neutral-700">
            {announcement.content}
          </div>
        </div>
      </div>
    </div>
  );
}
