/**
 * 사이트 폼 유효성 검사
 */

import { SiteFormData, SiteFormErrors } from "./types";

export function validateSiteForm(data: SiteFormData): SiteFormErrors {
  const errors: SiteFormErrors = {};

  // 사이트 번호
  if (!data.siteNumber.trim()) {
    errors.siteNumber = "사이트 번호를 입력하세요.";
  }

  // 수용 인원
  if (!data.capacity || data.capacity < 1) {
    errors.capacity = "수용 인원은 1명 이상이어야 합니다.";
  }

  // 설명
  if (!data.description.trim()) {
    errors.description = "사이트 설명을 입력하세요.";
  }

  // 기본 가격
  if (!data.basePrice || data.basePrice < 0) {
    errors.basePrice = "기본 가격을 입력하세요.";
  }

  // 이미지 개수 제한
  if (data.imageFiles && data.imageFiles.length > 5) {
    errors.imageFiles = "이미지는 최대 5개까지 업로드할 수 있습니다.";
  }

  return errors;
}
