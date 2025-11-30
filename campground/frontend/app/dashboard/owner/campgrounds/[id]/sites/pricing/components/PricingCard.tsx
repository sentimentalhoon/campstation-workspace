/**
 * PricingCard Component
 * 요금제 정보를 카드 형태로 표시
 */

import { Button } from "@/components/ui/Button";
import type { SitePricingResponse } from "@/types/pricing";
import {
  Calendar,
  DollarSign,
  Edit,
  Tag,
  Trash2,
  TrendingDown,
  Users,
} from "lucide-react";

interface PricingCardProps {
  pricing: SitePricingResponse;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

/**
 * 요금 규칙 타입 한글 변환
 */
const RULE_TYPE_LABELS: Record<string, string> = {
  BASE: "기본 요금",
  SEASONAL: "시즌별 요금",
  DATE_RANGE: "기간 지정",
  SPECIAL_EVENT: "특별 이벤트",
};

/**
 * 시즌 타입 한글 변환
 */
const SEASON_TYPE_LABELS: Record<string, string> = {
  PEAK: "성수기",
  HIGH: "준성수기",
  NORMAL: "평시",
  LOW: "비수기",
};

/**
 * 시즌 타입별 색상
 */
const SEASON_TYPE_COLORS: Record<string, string> = {
  PEAK: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  NORMAL: "bg-blue-100 text-blue-800",
  LOW: "bg-green-100 text-green-800",
};

export function PricingCard({
  pricing,
  onEdit,
  onDelete,
  onToggleActive,
}: PricingCardProps) {
  /**
   * 가격 포맷팅
   */
  const formatPrice = (price?: number) => {
    if (!price) return "-";
    return `₩${price.toLocaleString()}`;
  };

  /**
   * 기간 표시
   */
  const renderPeriod = () => {
    if (!pricing.startMonth || !pricing.endMonth) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4" />
        <span>
          {pricing.startMonth}/{pricing.startDay} ~ {pricing.endMonth}/
          {pricing.endDay}
        </span>
      </div>
    );
  };

  /**
   * 할인 정책 표시
   */
  const renderDiscounts = () => {
    const discounts: string[] = [];

    if (pricing.longStayDiscountRate && pricing.longStayMinNights) {
      discounts.push(
        `장기 숙박: ${pricing.longStayMinNights}박 이상 ${pricing.longStayDiscountRate}% 할인`
      );
    }

    if (pricing.extendedStayDiscountRate && pricing.extendedStayMinNights) {
      discounts.push(
        `연박: ${pricing.extendedStayMinNights}박 이상 ${pricing.extendedStayDiscountRate}% 할인`
      );
    }

    if (pricing.earlyBirdDiscountRate && pricing.earlyBirdMinDays) {
      discounts.push(
        `조기 예약: ${pricing.earlyBirdMinDays}일 전 ${pricing.earlyBirdDiscountRate}% 할인`
      );
    }

    if (discounts.length === 0) return null;

    return (
      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <TrendingDown className="h-4 w-4" />
          <span>할인 정책</span>
        </div>
        <ul className="ml-6 space-y-1 text-sm text-gray-600">
          {discounts.map((discount, index) => (
            <li key={index}>• {discount}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6 transition-colors hover:bg-gray-50">
      <div className="flex items-start justify-between">
        {/* 왼쪽: 요금제 정보 */}
        <div className="flex-1">
          {/* 헤더: 이름 + 우선순위 */}
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              {pricing.pricingName}
            </h3>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              우선순위: {pricing.priority}
            </span>
            {!pricing.isActive && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                비활성화
              </span>
            )}
          </div>

          {/* 규칙 타입 + 시즌 */}
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              {RULE_TYPE_LABELS[pricing.ruleType] || pricing.ruleType}
            </span>
            {pricing.seasonType && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  SEASON_TYPE_COLORS[pricing.seasonType] ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {SEASON_TYPE_LABELS[pricing.seasonType] || pricing.seasonType}
              </span>
            )}
          </div>

          {/* 기간 */}
          {renderPeriod()}

          {/* 설명 */}
          {pricing.description && (
            <p className="mt-2 text-sm text-gray-600">{pricing.description}</p>
          )}

          {/* 요금 정보 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">평일 기본 요금</div>
                <div className="font-semibold text-gray-900">
                  {formatPrice(pricing.basePrice)}/박
                </div>
              </div>
            </div>

            {pricing.weekendPrice && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">주말 요금</div>
                  <div className="font-semibold text-gray-900">
                    {formatPrice(pricing.weekendPrice)}/박
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">인원</div>
                <div className="text-sm text-gray-900">
                  기준 {pricing.baseGuests}명 (최대 {pricing.maxGuests}명)
                </div>
              </div>
            </div>

            {pricing.extraGuestFee && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">추가 인원 요금</div>
                  <div className="text-sm text-gray-900">
                    {formatPrice(pricing.extraGuestFee)}/명
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 요일별 배율 */}
          {pricing.dayMultipliers && (
            <div className="mt-3">
              <div className="mb-1 text-xs text-gray-500">요일별 배율 설정</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                {pricing.dayMultipliers}
              </code>
            </div>
          )}

          {/* 할인 정책 */}
          {renderDiscounts()}
        </div>

        {/* 오른쪽: 액션 버튼 */}
        <div className="ml-4 flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-4 w-4" />
            수정
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" />
            삭제
          </Button>
          <Button
            variant={pricing.isActive ? "outline" : "primary"}
            size="sm"
            onClick={onToggleActive}
          >
            {pricing.isActive ? "비활성화" : "활성화"}
          </Button>
        </div>
      </div>
    </div>
  );
}
