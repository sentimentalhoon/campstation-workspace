"use client";

import { Button } from "@/components/ui/Button";
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useIncrementAnnouncementViewCount,
  useUpdateAnnouncement,
} from "@/hooks/useAnnouncements";
import type { Announcement, ImagePair } from "@/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { AnnouncementDetail } from "./AnnouncementDetail";
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementList } from "./AnnouncementList";

type AnnouncementSectionProps = {
  campgroundId: number;
  canEdit?: boolean;
};

/**
 * 캠핑장 공지사항 섹션 컴포넌트
 * 캠핑장 상세 페이지에 표시됨
 *
 * @example
 * ```tsx
 * <AnnouncementSection
 *   campgroundId={campgroundId}
 *   canEdit={isCampgroundOwner(user, campground?.owner?.id)}
 * />
 * ```
 */
export function AnnouncementSection({
  campgroundId,
  canEdit = false,
}: AnnouncementSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const viewMutation = useIncrementAnnouncementViewCount();

  const handleCreate = async (data: {
    type: "NOTICE" | "EVENT" | "FACILITY" | "URGENT";
    title: string;
    content: string;
    images?: ImagePair[];
    isPinned: boolean;
  }) => {
    await createMutation.mutateAsync({
      campgroundId,
      ...data,
    });
    setShowForm(false);
  };

  const handleUpdate = async (data: {
    type: "NOTICE" | "EVENT" | "FACILITY" | "URGENT";
    title: string;
    content: string;
    images?: ImagePair[];
    isPinned: boolean;
  }) => {
    if (!editingAnnouncement) return;

    await updateMutation.mutateAsync({
      id: editingAnnouncement.id,
      data,
    });
    setEditingAnnouncement(null);
  };

  const handleDelete = async (announcement: Announcement) => {
    await deleteMutation.mutateAsync({
      id: announcement.id,
      campgroundId,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(false);
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    // 상세 모달 표시
    setSelectedAnnouncement(announcement);
    // 조회수 증가
    viewMutation.mutate(announcement.id);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  return (
    <section className="border-t border-neutral-200 bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">공지사항</h2>
        {canEdit && !showForm && !editingAnnouncement && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            새 공지사항
          </Button>
        )}
      </div>

      {/* Form */}
      {(showForm || editingAnnouncement) && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">
              {editingAnnouncement ? "공지사항 수정" : "새 공지사항 작성"}
            </h3>
            <button
              onClick={handleCancelForm}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <AnnouncementForm
            campgroundId={campgroundId}
            initialData={editingAnnouncement || undefined}
            onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
            onCancel={handleCancelForm}
            isSubmitting={
              createMutation.isPending || updateMutation.isPending
            }
          />
        </div>
      )}

      {/* List */}
      {!showForm && !editingAnnouncement && (
        <AnnouncementList
          campgroundId={campgroundId}
          onAnnouncementClick={handleAnnouncementClick}
          showActions={canEdit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetail
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </section>
  );
}
