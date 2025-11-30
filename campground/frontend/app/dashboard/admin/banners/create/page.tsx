"use client";

import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { ImageUpload } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateBanner, useImageUpload, useUploadImage } from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { ROUTES } from "@/lib/constants";
import { BannerType, CreateBannerDto } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 배너 생성 페이지
 */
function CreateBannerPage() {
  const router = useRouter();
  const toast = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<BannerType>("PROMOTION");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTarget, setLinkTarget] = useState<"_self" | "_blank">("_blank");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Image upload hook with optimization (single image)
  const imageUpload = useImageUpload({
    maxImages: 1,
    enableOptimization: true,
    imageType: "banner",
  });

  // Mutations
  const { mutate: createBanner, isPending: isCreating } = useCreateBanner();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim()) {
      toast.warning("배너 제목을 입력해주세요");
      return;
    }

    const files = imageUpload.getFiles();
    if (files.length === 0) {
      toast.warning("배너 이미지를 선택해주세요");
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("종료일은 시작일보다 이후여야 합니다");
      return;
    }

    try {
      // 1. 이미지 업로드 (썸네일 자동 생성)
      const uploadResult = await uploadImage({
        file: files[0]!,
        type: "banner",
      });

      // 2. 배너 생성
      const bannerData: CreateBannerDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        image: {
          thumbnailUrl: uploadResult.thumbnailUrl,
          originalUrl: uploadResult.originalUrl,
        },
        linkUrl: linkUrl.trim() || undefined,
        linkTarget,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: "INACTIVE", // 기본값: 비활성
      };

      createBanner(bannerData, {
        onSuccess: () => {
          router.push(ROUTES.DASHBOARD.ADMIN_BANNERS);
        },
        onError: (error) => {
          console.error("Banner creation error:", error);
          toast.error("배너 생성에 실패했습니다");
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("배너 생성 중 오류가 발생했습니다");
    }
  };

  const isSubmitting = imageUpload.isOptimizing || isUploading || isCreating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <AdminDashboardNav />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">배너 추가</h1>
          <p className="mt-1 text-sm text-gray-600">새 배너를 생성합니다</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>

          <div className="space-y-4">
            {/* 제목 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="배너 제목"
                required
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                설명
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="배너 설명 (선택사항)"
                rows={3}
              />
            </div>

            {/* 타입 */}
            <Select
              label="타입"
              value={type}
              onChange={(e) => setType(e.target.value as BannerType)}
              options={[
                { value: "PROMOTION", label: "프로모션" },
                { value: "EVENT", label: "이벤트" },
                { value: "ANNOUNCEMENT", label: "공지" },
                { value: "NOTICE", label: "안내" },
              ]}
              required
            />
          </div>
        </section>

        {/* 이미지 */}
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">
            배너 이미지 <span className="text-red-500">*</span>
          </h2>

          <ImageUpload
            {...imageUpload}
            label=""
            helpText="JPEG, PNG, WebP · 최대 5MB - 자동 최적화 적용"
            maxImages={1}
            variant="single"
            disabled={isSubmitting}
          />
        </section>

        {/* 링크 설정 */}
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">링크 설정</h2>

          <div className="space-y-4">
            {/* 링크 URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                링크 URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                배너 클릭 시 이동할 URL (선택사항)
              </p>
            </div>

            {/* 링크 열기 방식 */}
            {linkUrl && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  링크 열기 방식
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="_blank"
                      checked={linkTarget === "_blank"}
                      onChange={(e) =>
                        setLinkTarget(e.target.value as "_blank" | "_self")
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">새 창</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="_self"
                      checked={linkTarget === "_self"}
                      onChange={(e) =>
                        setLinkTarget(e.target.value as "_blank" | "_self")
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">현재 창</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 노출 기간 */}
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">노출 기간</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* 시작일 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                시작일
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 종료일 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                종료일
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            지정하지 않으면 무기한 노출됩니다
          </p>
        </section>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.DASHBOARD.ADMIN_BANNERS)}
            disabled={isSubmitting}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "생성 중..." : "생성하기"}
          </Button>
        </div>
        </form>

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>
    </div>
  );
}

export default withAdminAuth(CreateBannerPage);
