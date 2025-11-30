/**
 * CampgroundForm 유효성 검사
 */

import { CampgroundFormData, CampgroundFormErrors } from "./types";

export function validateCampgroundForm(
  data: Partial<CampgroundFormData>
): CampgroundFormErrors {
  const errors: CampgroundFormErrors = {};

  // 필수 필드 검사
  if (!data.name?.trim()) {
    errors.name = "캠핑장 이름을 입력해주세요.";
  }

  if (!data.description?.trim()) {
    errors.description = "캠핑장 설명을 입력해주세요.";
  }

  if (!data.address?.trim()) {
    errors.address = "주소를 입력해주세요.";
  }

  if (!data.phone?.trim()) {
    errors.phone = "전화번호를 입력해주세요.";
  } else if (!/^[\d-]+$/.test(data.phone)) {
    errors.phone = "올바른 전화번호 형식이 아닙니다.";
  }

  if (!data.email?.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  // 위치 정보
  if (!data.latitude || data.latitude < -90 || data.latitude > 90) {
    errors.latitude = "올바른 위도를 입력해주세요.";
  }

  if (!data.longitude || data.longitude < -180 || data.longitude > 180) {
    errors.longitude = "올바른 경도를 입력해주세요.";
  }

  // 시간 정보
  if (!data.checkInTime?.trim()) {
    errors.checkInTime = "체크인 시간을 입력해주세요.";
  }

  if (!data.checkOutTime?.trim()) {
    errors.checkOutTime = "체크아웃 시간을 입력해주세요.";
  }

  // 사업자 정보
  if (!data.businessName?.trim()) {
    errors.businessName = "사업자명을 입력해주세요.";
  }

  if (!data.businessAddress?.trim()) {
    errors.businessAddress = "사업자 주소를 입력해주세요.";
  }

  if (!data.businessEmail?.trim()) {
    errors.businessEmail = "사업자 이메일을 입력해주세요.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.businessEmail)) {
    errors.businessEmail = "올바른 이메일 형식이 아닙니다.";
  }

  if (!data.businessRegistrationNumber?.trim()) {
    errors.businessRegistrationNumber = "사업자등록번호를 입력해주세요.";
  }

  if (!data.tourismBusinessNumber?.trim()) {
    errors.tourismBusinessNumber = "관광사업등록번호를 입력해주세요.";
  }

  return errors;
}
