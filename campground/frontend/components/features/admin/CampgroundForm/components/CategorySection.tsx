/**
 * CategorySection Component
 * 캠핑장 카테고리 (운영 주체, 인증/등급) 선택 섹션
 */

"use client";

import {
  CERTIFICATION_OPTIONS,
  OPERATION_TYPE_OPTIONS,
} from "@/lib/constants";
import type {
  CampgroundCertification,
  CampgroundOperationType,
} from "@/types/domain";
import { FormSection } from "./FormSection";

type CategorySectionProps = {
  operationType?: CampgroundOperationType;
  certification?: CampgroundCertification;
  onUpdate: (field: string, value: string | undefined) => void;
};

export function CategorySection({
  operationType,
  certification,
  onUpdate,
}: CategorySectionProps) {
  return (
    <FormSection title="캠핑장 카테고리">
      <p className="mb-4 text-sm text-gray-600">
        운영 주체 및 인증/등급을 선택해주세요
      </p>

      {/* 운영 주체 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          운영 주체
          <span className="ml-1 text-xs text-gray-500">(선택사항)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {OPERATION_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onUpdate(
                  "operationType",
                  operationType === option.value ? undefined : option.value
                )
              }
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                operationType === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
              title={option.description}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{option.emoji}</span>
                <div className="text-left">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 인증/등급 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          인증/등급
          <span className="ml-1 text-xs text-gray-500">(선택사항)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CERTIFICATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onUpdate(
                  "certification",
                  certification === option.value ? undefined : option.value
                )
              }
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                certification === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
              style={
                certification === option.value
                  ? {
                      borderColor: option.color,
                      backgroundColor: `${option.color}10`,
                      color: option.color,
                    }
                  : undefined
              }
              title={option.description}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{option.emoji}</span>
                <div className="text-left">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </FormSection>
  );
}
