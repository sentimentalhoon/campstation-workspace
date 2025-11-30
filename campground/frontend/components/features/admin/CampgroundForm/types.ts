/**
 * CampgroundForm 타입 정의
 */

import type {
  CampgroundCertification,
  CampgroundOperationType,
} from "@/types/domain";

export type CampgroundFormData = {
  // 기본 정보
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;

  // 위치 정보
  latitude: number;
  longitude: number;

  // 운영 정보
  checkInTime: string;
  checkOutTime: string;

  // 사업자 정보
  businessOwnerName?: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  tourismBusinessNumber: string;

  // 카테고리 (운영 주체 및 인증/등급)
  operationType?: CampgroundOperationType;
  certification?: CampgroundCertification;

  // 이미지
  images: string[]; // 기존 이미지 URL 목록

  // ADMIN 전용
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
};

export type CampgroundFormProps = {
  initialData?: CampgroundFormData;
  onSubmit: (data: CampgroundFormData, imageFiles: File[]) => Promise<void>;
  isAdmin?: boolean;
  isLoading?: boolean;
};

export type CampgroundFormErrors = Partial<
  Record<keyof CampgroundFormData, string>
>;
