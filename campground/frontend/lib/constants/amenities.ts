/**
 * Amenity (편의시설) 및 Site Type (사이트 타입) 관련 상수
 */

import type { SiteType } from "@/types/domain";

/**
 * Site Type 한글 레이블
 */
export const SITE_TYPE_LABELS: Record<SiteType, string> = {
  TENT: "텐트 사이트",
  RV: "RV 사이트",
  CARAVAN: "카라반 사이트",
  GLAMPING: "글램핑",
  AUTO_CAMPING: "오토캠핑",
  CABIN: "캠핑 카빈",
  PENSION: "펜션",
  CONTAINER: "컨테이너",
  DECK_CAMPING: "데크 캠핑",
  GROUP_SITE: "단체 사이트",
  PRIVATE_SITE: "독립형 사이트",
  LAKESIDE: "호숫가 사이트",
  DOG_FRIENDLY: "반려동물 동반 사이트",
};

/**
 * Site Status 한글 레이블
 */
export const SITE_STATUS_LABELS = {
  AVAILABLE: "이용 가능",
  UNAVAILABLE: "이용 불가",
  MAINTENANCE: "정비 중",
} as const;

export const AMENITY_LABELS: Record<string, string> = {
  // 기본 인프라 (0-7)
  ELECTRICITY: "전기",
  WATER: "상수도",
  SEWER: "하수도",
  WIFI: "와이파이",
  INTERNET: "유선 인터넷",
  PHONE: "전화",

  // 위생 시설 (8-15)
  TOILET: "화장실",
  SHOWER: "샤워실",
  SINK: "개수대",
  LAUNDRY: "세탁실",
  WASHING_MACHINE: "세탁기",
  DRYER: "건조기",

  // 취사 시설 (16-23)
  BBQ: "바베큐 시설",
  FIRE_PIT: "화로대",
  KITCHEN: "공용 주방",
  MICROWAVE: "전자레인지",
  REFRIGERATOR: "냉장고",
  COOKING_UTENSILS: "취사도구",
  FIREWOOD: "장작 제공",

  // 냉난방 (24-27)
  HEATING: "난방",
  AIR_CONDITIONING: "에어컨",

  // 숙박 편의 (28-35)
  TENT: "텐트 대여",
  BEDDING: "침구류",
  TV: "TV",

  // 접근성 (36-39)
  VEHICLE_ACCESS: "차량 진입",
  PARKING: "주차장",

  // 안전/보안 (40-43)
  SECURITY: "보안 시설",
  CCTV: "CCTV",
  FIRST_AID: "구급상자",
  FIRE_EXTINGUISHER: "소화기",

  // 부대시설 (44-51)
  STORE: "매점",
  RESTAURANT: "식당",
  PLAYGROUND: "놀이터",

  // 레저 시설 (52-59)
  POOL: "수영장",
  GYM: "헬스장",

  // 기타 (60-63)
  PET_FRIENDLY: "반려동물 동반",
  GENERATOR: "발전기",
};

/**
 * Amenity 아이콘 매핑 (이모지)
 */
export const AMENITY_ICONS: Record<string, string> = {
  // 기본 인프라 (0-7)
  ELECTRICITY: "⚡",
  WATER: "💧",
  SEWER: "🚰",
  WIFI: "📶",
  INTERNET: "🌐",
  PHONE: "📞",

  // 위생 시설 (8-15)
  TOILET: "🚻",
  SHOWER: "🚿",
  SINK: "🚰",
  LAUNDRY: "🧺",
  WASHING_MACHINE: "🧺",
  DRYER: "🌀",

  // 취사 시설 (16-23)
  BBQ: "🍖",
  FIRE_PIT: "🔥",
  KITCHEN: "👨‍🍳",
  MICROWAVE: "📻",
  REFRIGERATOR: "🧊",
  COOKING_UTENSILS: "🍴",
  FIREWOOD: "🪵",

  // 냉난방 (24-27)
  HEATING: "🔥",
  AIR_CONDITIONING: "❄️",

  // 숙박 편의 (28-35)
  TENT: "⛺",
  BEDDING: "🛏️",
  TV: "📺",

  // 접근성 (36-39)
  VEHICLE_ACCESS: "🚗",
  PARKING: "🅿️",

  // 안전/보안 (40-43)
  SECURITY: "🔒",
  CCTV: "📹",
  FIRST_AID: "🩹",
  FIRE_EXTINGUISHER: "🧯",

  // 부대시설 (44-51)
  STORE: "🏪",
  RESTAURANT: "🍽️",
  PLAYGROUND: "🎠",

  // 레저 시설 (52-59)
  POOL: "🏊",
  GYM: "🏋️",

  // 기타 (60-63)
  PET_FRIENDLY: "🐕",
  GENERATOR: "🔌",
};
