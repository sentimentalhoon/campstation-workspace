/**
 * SiteManager Component (Owner - Refactored)
 * React 19+ optimized site management for campground owners
 */

"use client";

import { Button } from "@/components/ui/Button";
import { useImageUpload } from "@/hooks";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { SiteCard } from "../../admin/SiteManager/components/SiteCard";
import { SiteFormModal } from "../../admin/SiteManager/components/SiteFormModal";
import { useSiteForm } from "../../admin/SiteManager/hooks/useSiteForm";
import { useSiteManager } from "./hooks/useSiteManager";
import { SiteManagerProps } from "./types";

export function SiteManager({ campgroundId }: SiteManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Owner-specific hook for API integration
  const {
    sites,
    isLoading,
    selectedSite,
    setSelectedSite,
    addSite,
    updateSite,
    deleteSite,
  } = useSiteManager(campgroundId);

  // Reuse Admin hooks for form management
  const {
    formData,
    errors,
    isPending,
    updateField,
    toggleAmenity,
    validate,
    reset,
  } = useSiteForm(selectedSite);

  // Image upload hook with optimization (max 5 for sites)
  const imageUpload = useImageUpload({
    maxImages: 5,
    existingImages,
    onExistingImagesChange: setExistingImages,
    enableOptimization: true,
    imageType: "campground",
  });

  // Open form handler - auto-open from URL or manual
  const handleOpenForm = (site?: (typeof sites)[0]) => {
    if (site) {
      setSelectedSite(site);
      // Set existing images from site
      setExistingImages(site.thumbnailUrls || []);
    } else {
      setSelectedSite(null);
      setExistingImages([]);
    }
    setIsFormOpen(true);
  };

  // Close form handler
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSite(null);
    reset();
    imageUpload.clearNewImages();
    setExistingImages([]);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Get new image files
      const files = imageUpload.getFiles();
      const dataWithFiles = {
        ...formData,
        imageFiles: files,
      };

      if (selectedSite) {
        await updateSite(selectedSite.id, dataWithFiles);
      } else {
        await addSite(dataWithFiles);
      }
      handleCloseForm();
    } catch (error) {
      console.error("사이트 저장 실패:", error);
      alert("사이트 저장에 실패했습니다.");
    }
  };

  // Delete handler
  const handleDelete = async (siteId: number) => {
    if (!confirm("정말 이 구역을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteSite(siteId);
    } catch (error) {
      console.error("사이트 삭제 실패:", error);
      alert("사이트 삭제에 실패했습니다.");
    }
  };

  // Auto-open form when selectedSite changes from URL
  if (selectedSite && !isFormOpen) {
    setIsFormOpen(true);
  }

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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="border-primary-200 border-t-primary-600 h-8 w-8 animate-spin rounded-full border-4"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sites.length === 0 && (
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
      )}

      {/* Site Grid */}
      {!isLoading && sites.length > 0 && (
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

      {/* Form Modal - Reuse Admin Component */}
      <SiteFormModal
        isOpen={isFormOpen}
        isEditing={!!selectedSite}
        formData={formData}
        errors={errors}
        imageUpload={imageUpload}
        isLoading={isPending}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onFieldChange={updateField}
        onAmenityToggle={toggleAmenity}
      />
    </div>
  );
}
