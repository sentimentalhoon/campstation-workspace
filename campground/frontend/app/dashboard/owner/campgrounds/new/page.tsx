/**
 * 캠핑장 등록 페이지
 */

"use client";

import {
  CampgroundForm,
  CampgroundFormData,
} from "@/components/features/admin/CampgroundForm";
import { OwnerDashboardNav } from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { useToast } from "@/hooks/ui/useToast";
import { useCreateCampground } from "@/hooks/useCreateCampground";
import { useUpdateCampground } from "@/hooks/useUpdateCampground";
import { useUploadCampgroundImages } from "@/hooks/useImages";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

function NewCampgroundPage() {
  const router = useRouter();
  const toast = useToast();
  const createCampground = useCreateCampground();
  const updateCampground = useUpdateCampground();
  const uploadImages = useUploadCampgroundImages();

  const handleSubmit = async (data: CampgroundFormData, imageFiles: File[]) => {
    try {
      // 1단계: 캠핑장 텍스트 정보 먼저 생성 (이미지 없이)
      // 이렇게 하면 유효성 검사 실패 시 이미지가 업로드되지 않음
      const newCampground = await createCampground.mutateAsync({
        name: data.name,
        description: data.description || "",
        address: data.address,
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        imageUrls: [], // 초기에는 빈 이미지 리스트
        latitude: data.latitude,
        longitude: data.longitude,
        checkInTime: data.checkInTime || "",
        checkOutTime: data.checkOutTime || "",
        businessOwnerName: data.businessOwnerName || "",
        businessName: data.businessName || "",
        businessAddress: data.businessAddress || "",
        businessEmail: data.businessEmail || "",
        businessRegistrationNumber: data.businessRegistrationNumber || "",
        tourismBusinessNumber: data.tourismBusinessNumber || "",
        operationType: data.operationType || "PARTNER",
        certification: data.certification || "NEW",
      });

      // 2단계: 이미지 업로드 (캠핑장이 성공적으로 생성된 경우에만 실행)
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          const imagePairs = await uploadImages.mutateAsync(imageFiles);
          imageUrls = imagePairs.map((pair) => pair.originalUrl);

          // 3단계: 이미지 정보 업데이트
          if (imageUrls.length > 0) {
            await updateCampground.mutateAsync({
              id: newCampground.id,
              data: {
                name: data.name,
                description: data.description || "",
                address: data.address,
                phone: data.phone || "",
                email: data.email || "",
                website: data.website || "",
                latitude: data.latitude,
                longitude: data.longitude,
                checkInTime: data.checkInTime || "",
                checkOutTime: data.checkOutTime || "",
                businessOwnerName: data.businessOwnerName || "",
                businessName: data.businessName || "",
                businessAddress: data.businessAddress || "",
                businessEmail: data.businessEmail || "",
                businessRegistrationNumber: data.businessRegistrationNumber || "",
                tourismBusinessNumber: data.tourismBusinessNumber || "",
                operationType: data.operationType || "PARTNER",
                certification: data.certification || "NEW",
                
                imageUrls: imageUrls,
                imagesToDelete: []
              }
            });
          }
        } catch (uploadError) {
          console.error("이미지 업로드 실패:", uploadError);
          toast.error("캠핑장은 생성되었으나 이미지 업로드에 실패했습니다. 수정 페이지에서 이미지를 다시 등록해주세요.");
          // 이미지는 실패했지만 캠핑장은 생성되었으므로 이동은 시킴
        }
      }

      // 성공 시 대시보드로 이동
      toast.success(
        "캠핑장이 등록되었습니다. 관리자 승인 후 운영이 시작됩니다"
      );
      router.push(ROUTES.DASHBOARD.OWNER);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          toast.error("입력한 정보를 다시 확인해주세요");
        } else if (error.status === 403) {
          toast.error("캠핑장 등록 권한이 없습니다");
        } else if (error.status >= 500) {
          toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
        } else {
          toast.error("캠핑장 등록에 실패했습니다. 다시 시도해주세요 (" + error.message + ")");
        }
      } else if (error instanceof NetworkError) {
        toast.error("네트워크 연결을 확인해주세요");
      } else {
        console.error("캠핑장 등록 실패:", error);
        toast.error("캠핑장 등록에 실패했습니다. 다시 시도해주세요");
      }
    }
  };

  const isLoading = createCampground.isPending || uploadImages.isPending || updateCampground.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">캠핑장 등록</h1>
          <p className="mt-2 text-gray-600">
            새로운 캠핑장 정보를 입력해주세요. 관리자 승인 후 운영이 시작됩니다.
          </p>
        </div>

        {/* 폼 */}
        <CampgroundForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Bottom Navigation 여백 */}
      <div className="h-20" />
    </div>
  );
}

export default withOwnerAuth(NewCampgroundPage);
