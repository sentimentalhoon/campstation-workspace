/**
 * Site FormData 변환 유틸리티
 * SiteFormData를 백엔드 API에 전송하기 위한 FormData로 변환
 */

import type { SiteFormData } from "@/components/features/admin/SiteManager/types";

/**
 * SiteFormData를 FormData로 변환 (이미지 포함)
 * @param data - 폼 데이터
 * @param campgroundId - 캠핑장 ID (생성 시 필요)
 * @param deletedImageIds - 삭제할 이미지 ID 목록 (수정 시 선택)
 * @returns FormData 객체
 */
export function convertSiteToFormData(
  data: SiteFormData,
  campgroundId?: number,
  deletedImageIds?: number[]
): FormData {
  const formData = new FormData();

  // 캠핑장 ID (생성 시 필요)
  if (campgroundId !== undefined) {
    formData.append("campgroundId", campgroundId.toString());
  }

  // 기본 필드
  formData.append("siteNumber", data.siteNumber);
  formData.append("siteType", data.siteType);
  formData.append("capacity", data.capacity.toString());
  formData.append("description", data.description);
  formData.append("basePrice", data.basePrice.toString());
  formData.append("status", data.status);

  // 편의시설 (배열)
  data.amenities.forEach((amenity) => {
    formData.append("amenities", amenity);
  });

  // 위치 정보 (선택)
  if (data.latitude !== undefined && data.latitude !== null) {
    formData.append("latitude", data.latitude.toString());
  }
  if (data.longitude !== undefined && data.longitude !== null) {
    formData.append("longitude", data.longitude.toString());
  }

  // 이미지 파일들
  if (data.imageFiles && data.imageFiles.length > 0) {
    data.imageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });
  }

  // 삭제할 이미지 ID 목록 (수정 시)
  if (deletedImageIds && deletedImageIds.length > 0) {
    deletedImageIds.forEach((id) => {
      formData.append("deleteImageIds", id.toString());
    });
  }

  return formData;
}
