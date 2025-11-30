/**
 * CampgroundForm Component (Refactored)
 * 캠핑장 등록/수정 폼 - React 19 + Next.js 16 최적화
 *
 * Architecture:
 * - Custom Hooks: useCampgroundForm, useImageUpload
 * - Compound Components: Section-based composition
 * - Performance: memo(), useTransition for non-blocking updates
 */

"use client";

import { Button } from "@/components/ui/Button";
import { AdminSection } from "./components/AdminSection";
import { BasicInfoSection } from "./components/BasicInfoSection";
import { BusinessInfoSection } from "./components/BusinessInfoSection";
import { CategorySection } from "./components/CategorySection";
import { ImageUploadSection } from "./components/ImageUploadSection";
import { LocationSection } from "./components/LocationSection";
import { OperationsSection } from "./components/OperationsSection";
import { useCampgroundForm } from "./hooks/useCampgroundForm";
import { useImageUpload } from "./hooks/useImageUpload";
import { CampgroundFormData, CampgroundFormProps } from "./types";

const initialFormData: CampgroundFormData = {
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  latitude: 0,
  longitude: 0,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  businessName: "",
  businessAddress: "",
  businessEmail: "",
  businessRegistrationNumber: "",
  tourismBusinessNumber: "",
  images: [],
};

export function CampgroundForm({
  initialData,
  onSubmit,
  isAdmin = false,
  isLoading = false,
}: CampgroundFormProps) {
  // Custom hooks for state management
  const {
    formData,
    errors,
    isPending,
    updateField,
    updateLocation,
    updateImages,
    validate,
    reset,
  } = useCampgroundForm(initialData || initialFormData);

  const {
    imageFiles,
    isOptimizing,
    progress,
    totalImages,
    canAddMore,
    addImages,
    removeNewImage,
    removeExistingImage,
  } = useImageUpload(formData.images, updateImages);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Extract File objects from ImageFile[]
      const files = imageFiles.map((f) => f.file);
      await onSubmit(formData, files);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  // Handle image removal
  const handleRemoveExisting = (index: number) => {
    removeExistingImage(index);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <BasicInfoSection
        name={formData.name}
        description={formData.description}
        errors={errors}
        onChange={updateField}
      />

      {/* Location */}
      <LocationSection
        address={formData.address}
        latitude={formData.latitude}
        longitude={formData.longitude}
        errors={errors}
        onLocationUpdate={updateLocation}
        onChange={updateField}
      />

      {/* Operations */}
      <OperationsSection
        phone={formData.phone}
        email={formData.email}
        checkInTime={formData.checkInTime}
        checkOutTime={formData.checkOutTime}
        errors={errors}
        onChange={updateField}
      />

      {/* Category (Operation Type & Certification) */}
      <CategorySection
        operationType={formData.operationType}
        certification={formData.certification}
        onUpdate={updateField}
      />

      {/* Business Information */}
      <BusinessInfoSection
        businessName={formData.businessName}
        businessAddress={formData.businessAddress}
        businessEmail={formData.businessEmail}
        businessRegistrationNumber={formData.businessRegistrationNumber}
        reportNumber={formData.tourismBusinessNumber}
        errors={errors}
        onChange={updateField}
      />

      {/* Images */}
      <ImageUploadSection
        imageFiles={imageFiles}
        existingImages={formData.images}
        isOptimizing={isOptimizing}
        progress={progress}
        totalImages={totalImages}
        canAddMore={canAddMore}
        onAddImages={addImages}
        onRemoveNew={removeNewImage}
        onRemoveExisting={handleRemoveExisting}
      />

      {/* Admin Section (conditional) */}
      {isAdmin && (
        <AdminSection
          approvalStatus={formData.approvalStatus || "PENDING"}
          onChange={updateField}
        />
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isPending || isOptimizing}
        >
          {isLoading || isPending ? "처리 중..." : "저장"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => reset()}
          disabled={isLoading || isPending}
        >
          초기화
        </Button>
      </div>
    </form>
  );
}
