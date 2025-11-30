"use client";

import { Image } from "@/components/ui/Image";
import {
  ANNOUNCEMENT_TYPE_COLORS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_LABELS,
} from "@/lib/constants";
import type { Announcement } from "@/types";
import { format } from "date-fns";
import { Eye, Pin } from "lucide-react";

type AnnouncementCardProps = {
  announcement: Announcement;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
};

/**
 * 공지사항 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <AnnouncementCard
 *   announcement={announcement}
 *   onClick={() => router.push(`/announcements/${announcement.id}`)}
 *   showActions={canEdit}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function AnnouncementCard({
  announcement,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type];
  const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type];
  const typeLabel = ANNOUNCEMENT_TYPE_LABELS[announcement.type];

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(announcement);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말 삭제하시겠습니까?")) {
      onDelete?.(announcement);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border ${typeColor.border} ${typeColor.bg} p-4 transition hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Type Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full ${typeColor.bg} ${typeColor.text} border ${typeColor.border} px-2 py-0.5 text-xs font-semibold`}
          >
            <span>{typeIcon}</span>
            <span>{typeLabel}</span>
          </span>

          {/* Pinned Badge */}
          {announcement.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
              <Pin className="h-3 w-3" />
              <span>고정</span>
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 font-semibold text-neutral-900">
        {announcement.title}
      </h3>

      {/* Images (최대 3개) */}
      {announcement.images && announcement.images.length > 0 && (
        <div className="mb-3 grid grid-cols-5 gap-2">
          {announcement.images.slice(0, 5).map((image, index) => (
            <div
              key={image.id || index}
              className="aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={image.thumbnailUrl}
                alt={`공지사항 이미지 ${index + 1}`}
                width={128}
                height={128}
                objectFit="cover"
                rounded="lg"
                className="h-full w-full"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* Content Preview */}
      <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
        {announcement.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          <span>{announcement.authorName}</span>
          <span>{format(new Date(announcement.createdAt), "yyyy.MM.dd")}</span>
        </div>

        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{announcement.viewCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
