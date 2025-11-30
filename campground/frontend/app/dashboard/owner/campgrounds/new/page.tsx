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
import { useUploadCampgroundImages } from "@/hooks/useImages";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

function NewCampgroundPage() {
  const router = useRouter();
  const toast = useToast();
  const createCampground = useCreateCampground();
  const uploadImages = useUploadCampgroundImages();

  const handleSubmit = async (data: CampgroundFormData, imageFiles: File[]) => {
    try {
      // 1단계: 이미지 업로드
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const imagePairs = await uploadImages.mutateAsync(imageFiles);
        imageUrls = imagePairs.map((pair) => pair.originalUrl);
      }

      // 2단계: 캠핑장 생성 (JSON 요청)
      await createCampground.mutateAsync({
        name: data.name,
        description: data.description || "",
        address: data.address,
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        imageUrls,
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
      });

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
          toast.error("캠핑장 등록에 실패했습니다. 다시 시도해주세요");
        }
      } else if (error instanceof NetworkError) {
        toast.error("네트워크 연결을 확인해주세요");
      } else {
        console.error("캠핑장 등록 실패:", error);
        toast.error("캠핑장 등록에 실패했습니다. 다시 시도해주세요");
      }
    }
  };

  const isLoading = createCampground.isPending || uploadImages.isPending;

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
