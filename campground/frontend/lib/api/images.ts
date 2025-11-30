/**
 * 이미지 업로드 API
 *
 * @see backend/src/main/java/com/campstation/camp/shared/controller/FileController.java
 * @see docs/sprints/sprint-4.md - Task 2
 */

import { API_ENDPOINTS } from "@/lib/constants";
import { apiClient, post } from "./client";

/**
 * 이미지 업로드 타입
 * - campground: 캠핑장 이미지
 * - site: 사이트 이미지
 * - review: 리뷰 이미지
 * - profile: 프로필 이미지
 * - banner: 배너 이미지
 * - announcement: 공지사항 이미지
 */
export type ImageUploadType =
  | "campground"
  | "site"
  | "review"
  | "profile"
  | "banner"
  | "announcement";

/**
 * 이미지 쌍 업로드 응답 (썸네일 자동 생성)
 */
export type ImagePairResponse = {
  thumbnailPath: string;
  thumbnailUrl: string;
  originalPath: string;
  originalUrl: string;
};

/**
 * 이미지 API
 */
export const imageApi = {
  /**
   * 단일 이미지 업로드 (썸네일 자동 생성)
   *
   * @param file - 업로드할 이미지 파일
   * @param type - 이미지 타입 (campground, site, review, profile, banner)
   * @returns 업로드된 이미지 쌍 정보 (thumbnail, original)
   */
  upload: async (
    file: File,
    type: ImageUploadType
  ): Promise<ImagePairResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await post<ImagePairResponse>(
      API_ENDPOINTS.FILES.UPLOAD,
      formData
    );

    return response;
  },

  /**
   * 여러 이미지 일괄 업로드 (썸네일 자동 생성)
   *
   * @param files - 업로드할 이미지 파일 배열
   * @param type - 이미지 타입 (campground, site, review, profile, banner)
   * @returns 업로드된 이미지 쌍 정보 배열
   */
  uploadMultiple: async (
    files: File[],
    type: ImageUploadType
  ): Promise<ImagePairResponse[]> => {
    const formData = new FormData();

    // 여러 파일을 'files'라는 이름으로 추가
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("type", type);

    const response = await post<ImagePairResponse[]>(
      API_ENDPOINTS.FILES.UPLOAD_MULTIPLE,
      formData
    );

    return response;
  },

  /**
   * 이미지 삭제
   *
   * @param filePaths - 삭제할 이미지 경로 배열
   */
  delete: async (filePaths: string[]): Promise<void> => {
    await apiClient(API_ENDPOINTS.FILES.DELETE, {
      method: "DELETE",
      body: { filePaths },
    });
  },
};
