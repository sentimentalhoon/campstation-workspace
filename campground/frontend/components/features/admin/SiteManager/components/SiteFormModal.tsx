/**
 * SiteFormModal Component
 * Modal form for adding/editing sites
 */

import { ImageUpload } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { AMENITY_LABELS, SITE_STATUS_LABELS, SITE_TYPE_FILTER_OPTIONS } from "@/lib/constants";
import { Amenity } from "@/types/domain";

import { SiteFormData } from "../types";

interface SiteFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: SiteFormData;
  errors: Record<string, string>;
  imageUpload: ReturnType<typeof import("@/hooks").useImageUpload>;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (name: string, value: string | number) => void;
  onAmenityToggle: (amenity: Amenity) => void;
}

export function SiteFormModal({
  isOpen,
  isEditing,
  formData,
  errors,
  imageUpload,
  isLoading,
  onClose,
  onSubmit,
  onFieldChange,
  onAmenityToggle,
}: SiteFormModalProps) {
  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = parseFloat(e.target.value) || 0;
    onFieldChange(field, value);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
        <form onSubmit={onSubmit} className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {isEditing ? "구역 수정" : "구역 추가"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Site Number */}
            <div>
              <label
                htmlFor="siteNumber"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                구역 번호 *
              </label>
              <input
                type="text"
                id="siteNumber"
                name="siteNumber"
                value={formData.siteNumber}
                onChange={handleChange}
                className={`focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border px-4 py-2 focus:ring-2 ${
                  errors.siteNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="예) A-01"
              />
              {errors.siteNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.siteNumber}</p>
              )}
            </div>

            {/* Site Type */}
            <div>
              <label
                htmlFor="siteType"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                구역 타입 *
              </label>
              <select
                id="siteType"
                name="siteType"
                value={formData.siteType}
                onChange={handleChange}
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2"
              >
                {SITE_TYPE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="capacity"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  수용 인원 *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={(e) => handleNumberChange(e, "capacity")}
                  min="1"
                  className={`focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border px-4 py-2 focus:ring-2 ${
                    errors.capacity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="basePrice"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  기본 가격 (원) *
                </label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={(e) => handleNumberChange(e, "basePrice")}
                  min="0"
                  step="1000"
                  className={`focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border px-4 py-2 focus:ring-2 ${
                    errors.basePrice ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.basePrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.basePrice}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                구역 설명 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border px-4 py-2 focus:ring-2 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="구역에 대한 설명을 입력해주세요."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                상태
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2"
              >
                {Object.entries(SITE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                편의시설
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(AMENITY_LABELS) as Amenity[]).map((amenity) => (
                  <label
                    key={amenity}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => onAmenityToggle(amenity)}
                      className="text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {AMENITY_LABELS[amenity]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  위도 (선택)
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={(e) => handleNumberChange(e, "latitude")}
                  step="any"
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2"
                  placeholder="37.5665"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  경도 (선택)
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude || ""}
                  onChange={(e) => handleNumberChange(e, "longitude")}
                  step="any"
                  className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2"
                  placeholder="126.9780"
                />
              </div>
            </div>

            {/* Images with Optimization */}
            <ImageUpload
              {...imageUpload}
              label="사이트 이미지"
              helpText="최대 5개, 각 5MB 이하 (JPEG, PNG, WebP) - 자동 최적화 적용"
              maxImages={5}
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : isEditing ? "수정하기" : "추가하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
