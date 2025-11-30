/**
 * Campground FormData 변환 유틸리티
 * CampgroundFormData를 백엔드 API에 전송하기 위한 FormData로 변환
 */

import type { CampgroundFormData } from "@/components/features/admin/CampgroundForm/types";

/**
 * CampgroundFormData를 FormData로 변환 (이미지 포함)
 * @param data - 폼 데이터
 * @param imageFiles - 새로 추가할 이미지 파일들
 * @returns FormData 객체
 */
export function convertCampgroundToFormData(
  data: CampgroundFormData,
  imageFiles: File[]
): FormData {
  const formData = new FormData();

  // 기본 정보
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("address", data.address);
  formData.append("phone", data.phone);
  formData.append("email", data.email);

  if (data.website) {
    formData.append("website", data.website);
  }

  // 위치 정보
  formData.append("latitude", data.latitude.toString());
  formData.append("longitude", data.longitude.toString());

  // 운영 정보
  formData.append("checkInTime", data.checkInTime);
  formData.append("checkOutTime", data.checkOutTime);

  // 사업자 정보
  formData.append("businessName", data.businessName);
  formData.append("businessAddress", data.businessAddress);
  formData.append("businessEmail", data.businessEmail);
  formData.append(
    "businessRegistrationNumber",
    data.businessRegistrationNumber
  );
  formData.append("tourismBusinessNumber", data.tourismBusinessNumber);

  if (data.businessOwnerName) {
    formData.append("businessOwnerName", data.businessOwnerName);
  }

  // ADMIN 전용 필드
  if (data.approvalStatus) {
    formData.append("approvalStatus", data.approvalStatus);
  }

  // 이미지 파일들
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
}
