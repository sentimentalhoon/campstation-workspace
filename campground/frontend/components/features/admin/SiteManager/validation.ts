/**
 * SiteManager 유효성 검사
 */

import { SiteFormData, SiteFormErrors } from "./types";

export function validateSiteForm(data: Partial<SiteFormData>): SiteFormErrors {
  const errors: SiteFormErrors = {};

  // 필수 필드 검사
  if (!data.siteNumber?.trim()) {
    errors.siteNumber = "구역 번호를 입력해주세요.";
  }

  if (!data.siteType) {
    errors.siteType = "구역 타입을 선택해주세요.";
  }

  if (!data.capacity || data.capacity < 1) {
    errors.capacity = "수용 인원을 1명 이상 입력해주세요.";
  }

  if (!data.description?.trim()) {
    errors.description = "구역 설명을 입력해주세요.";
  }

  if (!data.basePrice || data.basePrice < 0) {
    errors.basePrice = "기본 가격을 0원 이상 입력해주세요.";
  }

  // 위치 정보 (선택)
  if (
    data.latitude !== undefined &&
    (data.latitude < -90 || data.latitude > 90)
  ) {
    errors.latitude = "올바른 위도를 입력해주세요.";
  }

  if (
    data.longitude !== undefined &&
    (data.longitude < -180 || data.longitude > 180)
  ) {
    errors.longitude = "올바른 경도를 입력해주세요.";
  }

  return errors;
}
