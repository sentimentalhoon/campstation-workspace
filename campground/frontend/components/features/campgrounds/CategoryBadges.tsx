/**
 * CategoryBadges 컴포넌트
 * 캠핑장 운영 주체 및 인증/등급 배지 표시
 */

"use client";

import {
  CERTIFICATION_COLORS,
  CERTIFICATION_EMOJIS,
  CERTIFICATION_LABELS,
  OPERATION_TYPE_EMOJIS,
  OPERATION_TYPE_LABELS,
} from "@/lib/constants";
import type {
  CampgroundCertification,
  CampgroundOperationType,
} from "@/types/domain";

type CategoryBadgesProps = {
  operationType?: CampgroundOperationType;
  certification?: CampgroundCertification;
  size?: "sm" | "md" | "lg";
};

/**
 * 캠핑장 카테고리 배지 표시 컴포넌트
 *
 * @param operationType - 운영 주체 (DIRECT, PARTNER, PRIVATE, FRANCHISE)
 * @param certification - 인증/등급 (PREMIUM, CERTIFIED, STANDARD, NEW)
 * @param size - 배지 크기
 */
export function CategoryBadges({
  operationType,
  certification,
  size = "sm",
}: CategoryBadgesProps) {
  if (!operationType && !certification) {
    return null;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* 인증/등급 배지 */}
      {certification && (
        <CertificationBadge
          certification={certification}
          sizeClass={sizeClasses[size]}
        />
      )}

      {/* 운영 주체 배지 */}
      {operationType && (
        <OperationTypeBadge
          operationType={operationType}
          sizeClass={sizeClasses[size]}
        />
      )}
    </div>
  );
}

type CertificationBadgeProps = {
  certification: CampgroundCertification;
  sizeClass: string;
};

function CertificationBadge({
  certification,
  sizeClass,
}: CertificationBadgeProps) {
  const color = CERTIFICATION_COLORS[certification];
  const emoji = CERTIFICATION_EMOJIS[certification];
  const label = CERTIFICATION_LABELS[certification];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white shadow-sm ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}

type OperationTypeBadgeProps = {
  operationType: CampgroundOperationType;
  sizeClass: string;
};

function OperationTypeBadge({
  operationType,
  sizeClass,
}: OperationTypeBadgeProps) {
  const emoji = OPERATION_TYPE_EMOJIS[operationType];
  const label = OPERATION_TYPE_LABELS[operationType];

  return (
    <span
      className={`bg-muted text-muted-foreground inline-flex items-center rounded-full border font-medium ${sizeClass}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
