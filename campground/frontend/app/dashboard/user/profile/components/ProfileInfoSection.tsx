/**
 * ProfileInfoSection Component
 * User profile information form section
 * React 19+ with React Compiler auto-optimization
 */

import { Image } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRef } from "react";

interface ProfileInfoSectionProps {
  email: string;
  name: string;
  phone: string;
  previewImage: string | null;
  isOptimizing: boolean;
  optimizationInfo: string | null;
  isUploading: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onImageSelect: (file: File) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ProfileInfoSection({
  email,
  name,
  phone,
  previewImage,
  isOptimizing,
  optimizationInfo,
  isUploading,
  onNameChange,
  onPhoneChange,
  onImageSelect,
  onSubmit,
  onCancel,
}: ProfileInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <section className="mb-8 rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">기본 정보</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 프로필 이미지 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            프로필 이미지
          </label>
          <div className="flex items-center gap-4">
            {/* 이미지 미리보기 */}
            {previewImage ? (
              <Image
                src={previewImage}
                alt="프로필 이미지"
                width={96}
                height={96}
                fallback="/images/fallback-image.svg"
                aspectRatio="square"
                objectFit="cover"
                rounded="full"
                className="border-2 border-neutral-200 bg-neutral-100"
                unoptimized
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 text-neutral-400">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}

            {/* 파일 선택 버튼 */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isOptimizing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={isUploading || isOptimizing}
                disabled={isOptimizing}
              >
                {isOptimizing ? "최적화 중..." : "이미지 선택"}
              </Button>
              <p className="mt-1 text-xs text-neutral-500">
                JPG, PNG, GIF (자동 최적화됨)
              </p>
              {optimizationInfo && (
                <p className="mt-1 text-xs font-medium text-green-600">
                  ✓ {optimizationInfo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 이메일 (읽기 전용) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            이메일
          </label>
          <Input
            type="email"
            value={email}
            disabled
            className="bg-neutral-50"
          />
          <p className="mt-1 text-xs text-neutral-500">
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        {/* 이름 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            이름 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            전화번호
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="010-1234-5678"
          />
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" loading={isUploading}>
            저장
          </Button>
        </div>
      </form>
    </section>
  );
}
