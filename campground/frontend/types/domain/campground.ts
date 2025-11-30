/**
 * 캠핑장 도메인 타입
 */

export type Amenity =
  // 기본 인프라 (0-7)
  | "ELECTRICITY"
  | "WATER"
  | "SEWER"
  | "WIFI"
  | "INTERNET"
  | "PHONE"
  // 위생 시설 (8-15)
  | "TOILET"
  | "SHOWER"
  | "SINK"
  | "LAUNDRY"
  | "WASHING_MACHINE"
  | "DRYER"
  // 취사 시설 (16-23)
  | "BBQ"
  | "FIRE_PIT"
  | "KITCHEN"
  | "MICROWAVE"
  | "REFRIGERATOR"
  | "COOKING_UTENSILS"
  | "FIREWOOD"
  // 냉난방 (24-27)
  | "HEATING"
  | "AIR_CONDITIONING"
  // 숙박 편의 (28-35)
  | "TENT"
  | "BEDDING"
  | "TV"
  // 접근성 (36-39)
  | "VEHICLE_ACCESS"
  | "PARKING"
  // 안전/보안 (40-43)
  | "SECURITY"
  | "CCTV"
  | "FIRST_AID"
  | "FIRE_EXTINGUISHER"
  // 부대시설 (44-51)
  | "STORE"
  | "RESTAURANT"
  | "PLAYGROUND"
  // 레저 시설 (52-59)
  | "POOL"
  | "GYM"
  // 기타 (60-63)
  | "PET_FRIENDLY"
  | "GENERATOR";

export type SiteType =
  | "TENT" // 텐트 사이트
  | "RV" // RV 사이트
  | "CARAVAN" // 카라반 사이트
  | "GLAMPING" // 글램핑
  | "AUTO_CAMPING" // 오토캠핑
  | "CABIN" // 캠핑 카빈
  | "PENSION" // 펜션
  | "CONTAINER" // 컨테이너
  | "DECK_CAMPING" // 데크 캠핑
  | "GROUP_SITE" // 단체 사이트
  | "PRIVATE_SITE" // 독립형 사이트
  | "LAKESIDE" // 호숫가 사이트
  | "DOG_FRIENDLY"; // 반려동물 동반 사이트

export type CampgroundStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "CLOSED";

/**
 * 캠핑장 운영 주체 타입
 */
export type CampgroundOperationType =
  | "DIRECT" // 직영
  | "PARTNER" // 제휴
  | "PRIVATE" // 개인
  | "FRANCHISE"; // 프랜차이즈

/**
 * 캠핑장 인증/등급 타입
 */
export type CampgroundCertification =
  | "PREMIUM" // 프리미엄 (플랫폼 인증)
  | "CERTIFIED" // 공식 인증 (정부/공사)
  | "STANDARD" // 일반
  | "NEW"; // 신규 등록

export type CampgroundOwner = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  profileImage: string | null;
};

export type Campground = {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  thumbnailUrls: string[];
  originalImageUrls: string[];
  latitude: number;
  longitude: number;
  status: CampgroundStatus;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rating: number;
  reviewCount: number;
  favoriteCount: number;
  checkInTime: string;
  checkOutTime: string;
  businessOwnerName: string | null;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  tourismBusinessNumber: string;
  owner: CampgroundOwner;
  createdAt: string;
  updatedAt: string;
  amenities?: Amenity[]; // 캠핑장의 모든 사이트에서 수집한 편의시설 목록
  operationType?: CampgroundOperationType; // 운영 주체 (직영, 제휴, 개인, 프랜차이즈)
  certification?: CampgroundCertification; // 인증/등급 (프리미엄, 공식 인증, 일반, 신규)
};

export type Site = {
  id: number;
  siteNumber: string;
  siteType: SiteType;
  capacity: number;
  description: string;
  amenities: Amenity[];
  basePrice: number;
  latitude: number;
  longitude: number;
  status: string;
  campgroundId: number;
  thumbnailUrls: string[];
  originalImageUrls: string[];
  imageIds: number[]; // 이미지 ID 목록 (삭제 시 사용)
};

export type CampgroundSearchParams = {
  keyword?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
  page?: number;
  size?: number;
  sortBy?: "rating" | "price" | "name" | "createdAt";
  order?: "asc" | "desc";
  // 고급 필터 추가
  siteTypes?: SiteType[];
  amenities?: Amenity[];
  minCapacity?: number;
  maxCapacity?: number;
  // 카테고리 필터
  operationTypes?: CampgroundOperationType[];
  certifications?: CampgroundCertification[];
};

// 필터 옵션 정의
export type PriceRange = {
  min: number;
  max: number;
  label: string;
};

export type CapacityOption = {
  min: number;
  max?: number;
  label: string;
};

export type CreateCampgroundDto = {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  imageUrls: string[];
  checkInTime: string;
  checkOutTime: string;
  businessOwnerName?: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  tourismBusinessNumber: string;
  operationType?: CampgroundOperationType; // 운영 주체
  certification?: CampgroundCertification; // 인증/등급
};

export type UpdateCampgroundDto = Partial<CreateCampgroundDto>;
