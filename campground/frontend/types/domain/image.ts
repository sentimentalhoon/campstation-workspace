/**
 * 이미지 쌍 타입 (원본 + 썸네일)
 * 모든 이미지 업로드/응답에 공통으로 사용
 */
export type ImagePair = {
  id?: number; // 기존 이미지인 경우에만 존재
  thumbnailUrl: string;
  originalUrl: string;
};

/**
 * 표시 순서가 있는 이미지 쌍
 */
export type ImagePairWithOrder = ImagePair & {
  id?: number;
  displayOrder: number;
};
