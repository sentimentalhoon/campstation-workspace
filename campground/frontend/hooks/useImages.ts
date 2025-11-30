/**
 * 이미지 업로드 관련 React Query 훅
 *
 * @see lib/api/images.ts
 * @see docs/sprints/sprint-4.md - Task 2
 */

import { imageApi, type ImageUploadType } from "@/lib/api";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

/**
 * 단일 이미지 업로드 mutation 훅 (썸네일 자동 생성)
 *
 * @example
 * ```tsx
 * const uploadImage = useUploadImage();
 *
 * const handleUpload = async (file: File) => {
 *   const result = await uploadImage.mutateAsync({ file, type: "banner" });
 *   // result: { thumbnailUrl, thumbnailPath, originalUrl, originalPath }
 * };
 * ```
 */
export function useUploadImage(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof imageApi.upload>>,
      Error,
      { file: File; type: ImageUploadType }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ file, type }) => imageApi.upload(file, type),
    ...options,
  });
}

/**
 * 여러 이미지 일괄 업로드 mutation 훅 (썸네일 자동 생성)
 *
 * @example
 * ```tsx
 * const uploadImages = useUploadMultipleImages();
 *
 * const handleUpload = async (files: File[]) => {
 *   const results = await uploadImages.mutateAsync({ files, type: "review" });
 *   // results: [{ thumbnailUrl, thumbnailPath, originalUrl, originalPath }, ...]
 * };
 * ```
 */
export function useUploadMultipleImages(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof imageApi.uploadMultiple>>,
      Error,
      { files: File[]; type: ImageUploadType }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ files, type }) => imageApi.uploadMultiple(files, type),
    ...options,
  });
}

/**
 * 이미지 삭제 mutation 훅
 *
 * @example
 * ```tsx
 * const deleteImages = useDeleteImages();
 *
 * const handleDelete = (paths: string[]) => {
 *   deleteImages.mutate(paths, {
 *     onSuccess: () => console.log("Images deleted"),
 *   });
 * };
 * ```
 */
export function useDeleteImages(
  options?: Omit<UseMutationOptions<void, Error, string[]>, "mutationFn">
) {
  return useMutation({
    mutationFn: (filePaths: string[]) => imageApi.delete(filePaths),
    ...options,
  });
}

/**
 * 리뷰 이미지 여러 개 업로드 (썸네일 자동 생성)
 *
 * @example
 * ```tsx
 * const uploadImages = useUploadReviewImages();
 *
 * const handleUpload = async (files: File[]) => {
 *   const imagePairs = await uploadImages.mutateAsync(files);
 *   // imagePairs: [{ thumbnailUrl, thumbnailPath, originalUrl, originalPath }, ...]
 * };
 * ```
 */
export function useUploadReviewImages(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof imageApi.uploadMultiple>>,
      Error,
      File[]
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (files: File[]) => imageApi.uploadMultiple(files, "review"),
    ...options,
  });
}

/**
 * 캠핑장 이미지 여러 개 업로드 (썸네일 자동 생성)
 *
 * @example
 * ```tsx
 * const uploadImages = useUploadCampgroundImages();
 *
 * const handleUpload = async (files: File[]) => {
 *   const imagePairs = await uploadImages.mutateAsync(files);
 *   // imagePairs: [{ thumbnailUrl, thumbnailPath, originalUrl, originalPath }, ...]
 * };
 * ```
 */
export function useUploadCampgroundImages(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof imageApi.uploadMultiple>>,
      Error,
      File[]
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (files: File[]) => imageApi.uploadMultiple(files, "campground"),
    ...options,
  });
}

/**
 * 프로필 이미지 업로드 (썸네일 자동 생성)
 * 단일 파일만 업로드
 *
 * @example
 * ```tsx
 * const uploadProfileImage = useUploadProfileImage();
 *
 * const handleUpload = async (file: File) => {
 *   const result = await uploadProfileImage.mutateAsync(file);
 *   // result: { thumbnailUrl, thumbnailPath, originalUrl, originalPath }
 * };
 * ```
 */
export function useUploadProfileImage(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof imageApi.upload>>,
      Error,
      File
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (file: File) => imageApi.upload(file, "profile"),
    ...options,
  });
}
