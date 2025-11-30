/**
 * SiteManager Component (Refactored)
 * React 19+ optimized site management
 */

"use client";

import { Button } from "@/components/ui/Button";
import { useImageUpload } from "@/hooks";
import { Site } from "@/types/domain";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { SiteCard } from "./components/SiteCard";
import { SiteFormModal } from "./components/SiteFormModal";
import { useSiteForm } from "./hooks/useSiteForm";
import { SiteManagerProps } from "./types";

export function SiteManager({
  sites,
  onSiteAdd,
  onSiteUpdate,
  onSiteDelete,
  isLoading = false,
}: SiteManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Custom hooks
  const {
    formData,
    errors,
    isPending,
    updateField,
    toggleAmenity,
    validate,
    reset,
  } = useSiteForm(editingSite);

  // Image upload hook with optimization (max 5 for sites)
  const imageUpload = useImageUpload({
    maxImages: 5,
    existingImages,
    onExistingImagesChange: setExistingImages,
    enableOptimization: true,
    imageType: "campground",
  });

  const handleOpenForm = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      // Set existing images from site
      setExistingImages(site.thumbnailUrls || []);
    } else {
      setEditingSite(null);
      setExistingImages([]);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSite(null);
    reset();
    imageUpload.clearNewImages();
    setExistingImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Get new image files
      const files = imageUpload.getFiles();
      const dataWithFiles = { ...formData, imageFiles: files };

      if (editingSite) {
        await onSiteUpdate(editingSite.id, dataWithFiles);
      } else {
        await onSiteAdd(dataWithFiles);
      }
      handleCloseForm();
    } catch (error) {
      console.error("사이트 저장 실패:", error);
    }
  };

  const handleDelete = async (siteId: number) => {
    if (confirm("정말 이 구역을 삭제하시겠습니까?")) {
      try {
        await onSiteDelete(siteId);
      } catch (error) {
        console.error("사이트 삭제 실패:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">구역 관리</h2>
          <p className="mt-1 text-sm text-gray-500">총 {sites.length}개 구역</p>
        </div>
        <Button onClick={() => handleOpenForm()} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          구역 추가
        </Button>
      </div>

      {/* Site List */}
      {sites.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            등록된 구역이 없습니다
          </h3>
          <p className="mb-6 text-gray-500">첫 번째 구역을 추가해보세요.</p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            구역 추가
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <SiteFormModal
        isOpen={isFormOpen}
        isEditing={!!editingSite}
        formData={formData}
        errors={errors}
        imageUpload={imageUpload}
        isLoading={isLoading || isPending}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onFieldChange={updateField}
        onAmenityToggle={toggleAmenity}
      />
    </div>
  );
}
