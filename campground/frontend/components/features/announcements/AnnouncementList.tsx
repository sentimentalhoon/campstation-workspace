"use client";

import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import type { Announcement, AnnouncementType } from "@/types";
import { useState } from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { AnnouncementTypeFilter } from "./AnnouncementTypeFilter";

type AnnouncementListProps = {
  campgroundId: number;
  onAnnouncementClick?: (announcement: Announcement) => void;
  showActions?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
};

/**
 * 공지사항 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <AnnouncementList
 *   campgroundId={1}
 *   onAnnouncementClick={(announcement) => {
 *     router.push(`/announcements/${announcement.id}`);
 *   }}
 *   showActions={canEdit}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function AnnouncementList({
  campgroundId,
  onAnnouncementClick,
  showActions = false,
  onEdit,
  onDelete,
}: AnnouncementListProps) {
  const [selectedType, setSelectedType] = useState<AnnouncementType | "ALL">(
    "ALL"
  );

  // Fetch announcements
  const { data, isLoading, error } = useAnnouncements({
    campgroundId,
    type: selectedType === "ALL" ? undefined : selectedType,
    page: 0,
    size: 50,
    sortBy: "isPinned", // 고정 공지사항 우선
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        message={error.message || "공지사항을 불러올 수 없습니다"}
      />
    );
  }

  // Separate pinned and regular announcements
  const pinnedAnnouncements = data?.filter((a) => a.isPinned) || [];
  const regularAnnouncements = data?.filter((a) => !a.isPinned) || [];
  const hasAnnouncements = data && data.length > 0;

  return (
    <div className="space-y-4">
      {/* Type Filter - 항상 표시 */}
      <AnnouncementTypeFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Empty state - 데이터가 없을 때만 표시 */}
      {!hasAnnouncements ? (
        <div className="py-12 text-center">
          <p className="text-neutral-500">등록된 공지사항이 없습니다</p>
        </div>
      ) : (
        <>
          {/* Announcements */}
          <div className="space-y-3">
            {/* Pinned Announcements */}
            {pinnedAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onClick={() => onAnnouncementClick?.(announcement)}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

            {/* Regular Announcements */}
            {regularAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onClick={() => onAnnouncementClick?.(announcement)}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Count Info */}
          <div className="text-center text-sm text-neutral-500">
            총 {data.length}개의 공지사항
          </div>
        </>
      )}
    </div>
  );
}
