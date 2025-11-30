/**
 * 필터 관련 상수
 * 캠핑장 검색 및 필터링에 사용되는 옵션들
 */

import type { Amenity, SiteType } from "@/types/domain";

/**
 * 가격대 필터 옵션
 */
export const PRICE_RANGES = [
  { min: 0, max: 50000, label: "5만원 이하" },
  { min: 50000, max: 100000, label: "5만원 ~ 10만원" },
  { min: 100000, max: 150000, label: "10만원 ~ 15만원" },
  { min: 150000, max: 999999, label: "15만원 이상" },
] as const;

/**
 * 인원 수 필터 옵션
 */
export const CAPACITY_OPTIONS = [
  { value: 2, label: "2인" },
  { value: 4, label: "4인" },
  { value: 6, label: "6인" },
  { value: 8, label: "8인 이상" },
] as const;

/**
 * 지역 필터 옵션 (한국 주요 캠핑 지역)
 */
export const REGION_OPTIONS = [
  { value: "서울", label: "서울" },
  { value: "경기", label: "경기" },
  { value: "인천", label: "인천" },
  { value: "강원", label: "강원" },
  { value: "충북", label: "충북" },
  { value: "충남", label: "충남" },
  { value: "대전", label: "대전" },
  { value: "세종", label: "세종" },
  { value: "전북", label: "전북" },
  { value: "전남", label: "전남" },
  { value: "광주", label: "광주" },
  { value: "경북", label: "경북" },
  { value: "경남", label: "경남" },
  { value: "대구", label: "대구" },
  { value: "울산", label: "울산" },
  { value: "부산", label: "부산" },
  { value: "제주", label: "제주" },
] as const;

/**
 * 편의시설 카테고리별 그룹핑
 * 필터 UI에서 카테고리별로 표시하기 위한 구조
 */
export const AMENITY_CATEGORIES = {
  BASIC: {
    label: "기본 시설",
    amenities: [
      "ELECTRICITY",
      "WATER",
      "WIFI",
      "PARKING",
      "VEHICLE_ACCESS",
    ] as Amenity[],
  },
  HYGIENE: {
    label: "위생 시설",
    amenities: ["TOILET", "SHOWER", "SINK", "LAUNDRY"] as Amenity[],
  },
  COOKING: {
    label: "취사 시설",
    amenities: [
      "BBQ",
      "FIRE_PIT",
      "KITCHEN",
      "REFRIGERATOR",
      "FIREWOOD",
    ] as Amenity[],
  },
  COMFORT: {
    label: "냉난방",
    amenities: ["HEATING", "AIR_CONDITIONING"] as Amenity[],
  },
  LEISURE: {
    label: "레저 시설",
    amenities: ["POOL", "GYM", "PLAYGROUND"] as Amenity[],
  },
  FACILITIES: {
    label: "부대 시설",
    amenities: ["STORE", "RESTAURANT"] as Amenity[],
  },
  SAFETY: {
    label: "안전/보안",
    amenities: [
      "SECURITY",
      "CCTV",
      "FIRST_AID",
      "FIRE_EXTINGUISHER",
    ] as Amenity[],
  },
  EXTRAS: {
    label: "기타",
    amenities: ["PET_FRIENDLY", "GENERATOR", "TENT", "BEDDING"] as Amenity[],
  },
} as const;

/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = [
  { value: "createdAt", label: "최신순" },
  { value: "rating", label: "평점순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name", label: "이름순" },
] as const;

/**
 * 사이트 타입 필터 옵션
 */
export const SITE_TYPE_FILTER_OPTIONS: { value: SiteType; label: string }[] = [
  { value: "TENT", label: "텐트 사이트" },
  { value: "RV", label: "RV 사이트" },
  { value: "CARAVAN", label: "카라반 사이트" },
  { value: "GLAMPING", label: "글램핑" },
  { value: "AUTO_CAMPING", label: "오토캠핑" },
  { value: "CABIN", label: "캠핑 카빈" },
  { value: "PENSION", label: "펜션" },
  { value: "CONTAINER", label: "컨테이너" },
  { value: "DECK_CAMPING", label: "데크 캠핑" },
  { value: "GROUP_SITE", label: "단체 사이트" },
  { value: "PRIVATE_SITE", label: "독립형 사이트" },
  { value: "LAKESIDE", label: "호숫가 사이트" },
  { value: "DOG_FRIENDLY", label: "반려동물 동반 사이트" },
];

/**
 * 테마별 필터 옵션 (시즌/분위기)
 */
export const THEME_OPTIONS = [
  { value: "family", label: "가족 캠핑", emoji: "👨‍👩‍👧‍👦" },
  { value: "solo", label: "솔로 캠핑", emoji: "🏕️" },
  { value: "couple", label: "커플 캠핑", emoji: "💑" },
  { value: "pet", label: "반려동물 동반", emoji: "🐕" },
  { value: "beach", label: "해변가", emoji: "🏖️" },
  { value: "mountain", label: "산/계곡", emoji: "⛰️" },
  { value: "lake", label: "호수/강", emoji: "🌊" },
  { value: "forest", label: "숲속", emoji: "🌲" },
] as const;

/**
 * 시설 등급 필터 옵션
 */
export const FACILITY_GRADE_OPTIONS = [
  { value: "luxury", label: "럭셔리", description: "최고급 편의시설" },
  { value: "premium", label: "프리미엄", description: "고급 편의시설" },
  { value: "standard", label: "스탠다드", description: "기본 편의시설" },
  { value: "basic", label: "베이직", description: "최소 편의시설" },
] as const;

/**
 * 거리 필터 옵션 (위치 기반 검색 시 사용)
 */
export const DISTANCE_OPTIONS = [
  { value: 5, label: "5km 이내" },
  { value: 10, label: "10km 이내" },
  { value: 30, label: "30km 이내" },
  { value: 50, label: "50km 이내" },
  { value: 100, label: "100km 이내" },
] as const;

/**
 * 체크인/체크아웃 시간 옵션
 */
export const CHECKIN_TIME_OPTIONS = [
  { value: "anytime", label: "언제든지" },
  { value: "early", label: "얼리체크인 가능" },
  { value: "standard", label: "14:00 이후" },
] as const;

/**
 * 예약 가능 여부 필터
 */
export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "available", label: "예약 가능" },
  { value: "weekend", label: "주말 예약 가능" },
  { value: "weekday", label: "평일 예약 가능" },
] as const;

/**
 * 캠핑장 운영 주체 옵션
 */
export const OPERATION_TYPE_OPTIONS = [
  { value: "DIRECT" as const, label: "직영", description: "플랫폼 직접 운영", emoji: "🏢" },
  { value: "PARTNER" as const, label: "제휴", description: "제휴 파트너 운영", emoji: "🤝" },
  { value: "PRIVATE" as const, label: "개인", description: "개인 사업자 운영", emoji: "👤" },
  { value: "FRANCHISE" as const, label: "프랜차이즈", description: "프랜차이즈 체인", emoji: "🏪" },
] as const;

/**
 * 캠핑장 인증/등급 옵션
 */
export const CERTIFICATION_OPTIONS = [
  { value: "PREMIUM" as const, label: "프리미엄", description: "플랫폼 인증 프리미엄", emoji: "⭐", color: "#FFD700" },
  { value: "CERTIFIED" as const, label: "공식 인증", description: "정부/공사 공식 인증", emoji: "✓", color: "#4169E1" },
  { value: "STANDARD" as const, label: "일반", description: "일반 캠핑장", emoji: "📍", color: "#808080" },
  { value: "NEW" as const, label: "신규", description: "신규 등록", emoji: "🆕", color: "#32CD32" },
] as const;

/**
 * 운영 주체 라벨 맵핑
 */
export const OPERATION_TYPE_LABELS = {
  DIRECT: "직영",
  PARTNER: "제휴",
  PRIVATE: "개인",
  FRANCHISE: "프랜차이즈",
} as const;

/**
 * 인증/등급 라벨 맵핑
 */
export const CERTIFICATION_LABELS = {
  PREMIUM: "프리미엄",
  CERTIFIED: "공식 인증",
  STANDARD: "일반",
  NEW: "신규",
} as const;

/**
 * 운영 주체 이모지 맵핑
 */
export const OPERATION_TYPE_EMOJIS = {
  DIRECT: "🏢",
  PARTNER: "🤝",
  PRIVATE: "👤",
  FRANCHISE: "🏪",
} as const;

/**
 * 인증/등급 이모지 맵핑
 */
export const CERTIFICATION_EMOJIS = {
  PREMIUM: "⭐",
  CERTIFIED: "✓",
  STANDARD: "📍",
  NEW: "🆕",
} as const;

/**
 * 인증/등급 색상 맵핑
 */
export const CERTIFICATION_COLORS = {
  PREMIUM: "#FFD700",
  CERTIFIED: "#4169E1",
  STANDARD: "#808080",
  NEW: "#32CD32",
} as const;
