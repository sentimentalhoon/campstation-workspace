/**
 * 캠핑장 수정 페이지
 */

"use client";

import {
  CampgroundForm,
  CampgroundFormData,
} from "@/components/features/admin/CampgroundForm";
import {
  OwnerDashboardNav,
  OwnerCampgroundDetailNav,
} from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { LoadingSpinner } from "@/components/ui";
import {
  useCampgroundDetail,
  useUpdateCampground,
  useUploadCampgroundImages,
} from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function EditCampgroundPage({ params }: PageProps) {
  const router = useRouter();
  const toast = useToast();
  const { id } = use(params);
  const campgroundId = Number(id);

  const { data: campground, isLoading: isFetching } =
    useCampgroundDetail(campgroundId);
  const updateCampground = useUpdateCampground();
  const uploadImages = useUploadCampgroundImages();

  const [initialData, setInitialData] = useState<
    CampgroundFormData | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 캠핑장 데이터를 폼 데이터로 변환
  useEffect(() => {
    if (campground) {
      const formData: CampgroundFormData = {
        name: campground.name,
        description: campground.description || "",
        address: campground.address,
        phone: campground.phone || "",
        email: campground.email || "",
        latitude: campground.latitude,
        longitude: campground.longitude,
        checkInTime: campground.checkInTime || "14:00",
        checkOutTime: campground.checkOutTime || "11:00",
        businessName: campground.businessName || "",
        businessAddress: campground.businessAddress || "",
        businessEmail: campground.businessEmail || "",
        businessRegistrationNumber: campground.businessRegistrationNumber || "",
        tourismBusinessNumber: campground.tourismBusinessNumber || "",
        operationType: campground.operationType,
        certification: campground.certification,
        images: campground.originalImageUrls || [],
      };
      setInitialData(formData);
    }
  }, [campground]);

  const handleSubmit = async (data: CampgroundFormData, imageFiles: File[]) => {
    setIsSubmitting(true);

    try {
      // 1. 새 이미지 업로드
      let newImagePaths: {
        thumbnailUrl: string;
        originalUrl: string;
      }[] = [];

      if (imageFiles.length > 0) {
        try {
          const uploadResults = await uploadImages.mutateAsync(imageFiles);
          newImagePaths = uploadResults.map((result) => ({
            thumbnailUrl: result.thumbnailUrl,
            originalUrl: result.originalUrl,
          }));
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("이미지 업로드에 실패했습니다. 다시 시도해주세요");
          return;
        }
      }

      // 2. 기존 이미지와 새 이미지 결합
      // 기존 이미지: originalImageUrls와 thumbnailUrls를 쌍으로 매칭
      const existingImages: { thumbnailUrl: string; originalUrl: string }[] =
        [];
      if (campground?.thumbnailUrls && campground?.originalImageUrls) {
        const length = Math.min(
          campground.thumbnailUrls.length,
          campground.originalImageUrls.length
        );
        for (let i = 0; i < length; i++) {
          const thumbnailUrl = campground.thumbnailUrls[i];
          const originalUrl = campground.originalImageUrls[i];
          if (thumbnailUrl && originalUrl) {
            existingImages.push({
              thumbnailUrl,
              originalUrl,
            });
          }
        }
      }

      const allImages = [...existingImages, ...newImagePaths];

      // 3. imageUrls는 [thumbnail1, original1, thumbnail2, original2, ...] 형식으로 전송
      const imageUrls: string[] = [];
      allImages.forEach((img) => {
        imageUrls.push(img.thumbnailUrl);
        imageUrls.push(img.originalUrl);
      });

      // 4. 캠핑장 수정 요청
      await updateCampground.mutateAsync({
        id: campgroundId,
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          latitude: data.latitude,
          longitude: data.longitude,
          checkInTime: data.checkInTime,
          checkOutTime: data.checkOutTime,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          businessEmail: data.businessEmail,
          businessRegistrationNumber: data.businessRegistrationNumber,
          tourismBusinessNumber: data.tourismBusinessNumber,
          operationType: data.operationType,
          certification: data.certification,
          imageUrls,
        },
      });

      // 성공 시 대시보드로 이동
      toast.success("캠핑장 정보가 수정되었습니다");
      router.push(ROUTES.DASHBOARD.OWNER);
    } catch (error) {
      console.error("캠핑장 수정 실패:", error);
      toast.error("캠핑장 수정에 실패했습니다. 다시 시도해주세요");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching || !initialData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">캠핑장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      {/* Campground Detail Navigation */}
      <OwnerCampgroundDetailNav campgroundId={campgroundId} />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">캠핑장 수정</h1>
          <p className="mt-2 text-gray-600">
            캠핑장 정보를 수정하세요. 수정된 내용은 즉시 반영됩니다.
          </p>
        </div>

        {/* 폼 */}
        <CampgroundForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>

      {/* Bottom Navigation 여백 */}
      <div className="h-20" />
    </div>
  );
}

export default withOwnerAuth(EditCampgroundPage);
