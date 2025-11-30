/**
 * PricingForm Component
 * 요금제 생성/수정 폼 모달
 */

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/hooks/ui/useToast";
import type {
  CreateSitePricingRequest,
  DayMultipliers,
  PricingRuleType,
  SeasonType,
  SitePricingResponse,
} from "@/types/pricing";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface PricingFormProps {
  mode: "create" | "edit";
  siteId: number;
  siteName: string;
  initialData?: SitePricingResponse;
  onSave: (data: CreateSitePricingRequest) => Promise<void>;
  onCancel: () => void;
}

const RULE_TYPE_OPTIONS: Array<{ value: PricingRuleType; label: string }> = [
  { value: "BASE", label: "기본 요금" },
  { value: "SEASONAL", label: "시즌별 요금" },
  { value: "DATE_RANGE", label: "기간 지정" },
  { value: "SPECIAL_EVENT", label: "특별 이벤트" },
];

const SEASON_TYPE_OPTIONS: Array<{ value: SeasonType; label: string }> = [
  { value: "PEAK", label: "성수기" },
  { value: "HIGH", label: "준성수기" },
  { value: "NORMAL", label: "평시" },
  { value: "LOW", label: "비수기" },
];

const DAY_NAMES = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DAY_LABELS: Record<string, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

export function PricingForm({
  mode,
  // siteId는 미래 확장을 위해 예약 (현재 미사용)
  siteName,
  initialData,
  onSave,
  onCancel,
}: PricingFormProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSitePricingRequest>({
    pricingName: "",
    description: "",
    ruleType: "BASE",
    basePrice: 50000,
    baseGuests: 2,
    maxGuests: 4,
    priority: 0,
    isActive: true,
  });

  // 요일별 배율 설정
  const [useDayMultipliers, setUseDayMultipliers] = useState(false);
  const [dayMultipliers, setDayMultipliers] = useState<DayMultipliers>({});

  // 할인 정책 활성화
  const [useLongStayDiscount, setUseLongStayDiscount] = useState(false);
  const [useExtendedStayDiscount, setUseExtendedStayDiscount] = useState(false);
  const [useEarlyBirdDiscount, setUseEarlyBirdDiscount] = useState(false);

  // 초기 데이터 설정 (수정 모드)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        pricingName: initialData.pricingName,
        description: initialData.description,
        ruleType: initialData.ruleType,
        basePrice: initialData.basePrice,
        weekendPrice: initialData.weekendPrice,
        dayMultipliers: initialData.dayMultipliers,
        baseGuests: initialData.baseGuests,
        maxGuests: initialData.maxGuests,
        extraGuestFee: initialData.extraGuestFee,
        seasonType: initialData.seasonType,
        startMonth: initialData.startMonth,
        startDay: initialData.startDay,
        endMonth: initialData.endMonth,
        endDay: initialData.endDay,
        longStayDiscountRate: initialData.longStayDiscountRate,
        longStayMinNights: initialData.longStayMinNights,
        extendedStayDiscountRate: initialData.extendedStayDiscountRate,
        extendedStayMinNights: initialData.extendedStayMinNights,
        earlyBirdDiscountRate: initialData.earlyBirdDiscountRate,
        earlyBirdMinDays: initialData.earlyBirdMinDays,
        priority: initialData.priority,
        isActive: initialData.isActive,
      });

      // 요일별 배율
      if (initialData.dayMultipliers) {
        try {
          const parsed = JSON.parse(initialData.dayMultipliers);
          setDayMultipliers(parsed);
          setUseDayMultipliers(true);
        } catch (e) {
          console.error("요일별 배율 파싱 실패:", e);
        }
      }

      // 할인 정책
      setUseLongStayDiscount(!!initialData.longStayDiscountRate);
      setUseExtendedStayDiscount(!!initialData.extendedStayDiscountRate);
      setUseEarlyBirdDiscount(!!initialData.earlyBirdDiscountRate);
    }
  }, [mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.pricingName.trim()) {
      toast.warning("요금제 이름을 입력해주세요");
      return;
    }

    if (formData.basePrice <= 0) {
      toast.warning("기본 요금은 0보다 커야 합니다");
      return;
    }

    if (formData.baseGuests <= 0 || formData.maxGuests <= 0) {
      toast.warning("인원 수는 0보다 커야 합니다");
      return;
    }

    if (formData.baseGuests > formData.maxGuests) {
      toast.warning("기준 인원은 최대 인원보다 클 수 없습니다");
      return;
    }

    try {
      setIsSubmitting(true);

      // 요일별 배율 JSON 변환
      const submitData = {
        ...formData,
        dayMultipliers: useDayMultipliers
          ? JSON.stringify(dayMultipliers)
          : undefined,
        // 할인 미사용 시 undefined
        longStayDiscountRate: useLongStayDiscount
          ? formData.longStayDiscountRate
          : undefined,
        longStayMinNights: useLongStayDiscount
          ? formData.longStayMinNights
          : undefined,
        extendedStayDiscountRate: useExtendedStayDiscount
          ? formData.extendedStayDiscountRate
          : undefined,
        extendedStayMinNights: useExtendedStayDiscount
          ? formData.extendedStayMinNights
          : undefined,
        earlyBirdDiscountRate: useEarlyBirdDiscount
          ? formData.earlyBirdDiscountRate
          : undefined,
        earlyBirdMinDays: useEarlyBirdDiscount
          ? formData.earlyBirdMinDays
          : undefined,
      };

      await onSave(submitData);
    } catch (error) {
      console.error("제출 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "요금제 저장에 실패했습니다"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = <K extends keyof CreateSitePricingRequest>(
    key: K,
    value: CreateSitePricingRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateDayMultiplier = (day: keyof DayMultipliers, value: string) => {
    const numValue = parseFloat(value);
    setDayMultipliers((prev) => ({
      ...prev,
      [day]: isNaN(numValue) ? undefined : numValue,
    }));
  };

  // 규칙 타입에 따라 시즌/기간 표시 여부 결정
  const showSeasonSettings =
    formData.ruleType === "SEASONAL" ||
    formData.ruleType === "DATE_RANGE" ||
    formData.ruleType === "SPECIAL_EVENT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "요금제 추가" : "요금제 수정"} - {siteName}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="rounded p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            {/* 기본 정보 */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                기본 정보
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    요금제 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pricingName}
                    onChange={(e) =>
                      updateFormData("pricingName", e.target.value)
                    }
                    placeholder="예: 여름 성수기 요금"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    설명
                  </label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    placeholder="요금제에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <Select
                  label="규칙 타입"
                  value={formData.ruleType}
                  onChange={(e) =>
                    updateFormData(
                      "ruleType",
                      e.target.value as PricingRuleType
                    )
                  }
                  options={RULE_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  required
                />
              </div>
            </section>

            {/* 요금 설정 */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                요금 설정
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      평일 기본 요금 (원/박){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) =>
                        updateFormData("basePrice", Number(e.target.value))
                      }
                      min="0"
                      step="1000"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      주말 요금 (원/박)
                    </label>
                    <input
                      type="number"
                      value={formData.weekendPrice || ""}
                      onChange={(e) =>
                        updateFormData(
                          "weekendPrice",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      min="0"
                      step="1000"
                      placeholder="미설정 시 평일 요금 적용"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 요일별 배율 */}
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <Checkbox
                      checked={useDayMultipliers}
                      onCheckedChange={(checked) =>
                        setUseDayMultipliers(checked)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      요일별 배율 설정 (1.0 = 기본 요금)
                    </span>
                  </label>

                  {useDayMultipliers && (
                    <div className="mt-2 grid grid-cols-7 gap-2">
                      {DAY_NAMES.map((day) => (
                        <div key={day}>
                          <label className="mb-1 block text-center text-xs text-gray-600">
                            {DAY_LABELS[day]}
                          </label>
                          <input
                            type="number"
                            value={dayMultipliers[day] || ""}
                            onChange={(e) =>
                              updateDayMultiplier(day, e.target.value)
                            }
                            placeholder="1.0"
                            step="0.1"
                            min="0"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 인원 정책 */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                인원 정책
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    기준 인원 (명) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.baseGuests}
                    onChange={(e) =>
                      updateFormData("baseGuests", Number(e.target.value))
                    }
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    최대 인원 (명) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxGuests}
                    onChange={(e) =>
                      updateFormData("maxGuests", Number(e.target.value))
                    }
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    추가 인원당 요금 (원)
                  </label>
                  <input
                    type="number"
                    value={formData.extraGuestFee || ""}
                    onChange={(e) =>
                      updateFormData(
                        "extraGuestFee",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min="0"
                    step="1000"
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* 시즌/기간 설정 */}
            {showSeasonSettings && (
              <section>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  시즌/기간 설정
                </h3>
                <div className="space-y-4">
                  {formData.ruleType === "SEASONAL" && (
                    <Select
                      label="시즌 타입"
                      value={formData.seasonType || ""}
                      onChange={(e) =>
                        updateFormData(
                          "seasonType",
                          e.target.value
                            ? (e.target.value as SeasonType)
                            : undefined
                        )
                      }
                      options={[
                        { value: "", label: "선택 안함" },
                        ...SEASON_TYPE_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        })),
                      ]}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        시작 월/일
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.startMonth || ""}
                          onChange={(e) =>
                            updateFormData(
                              "startMonth",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="월 (1-12)"
                          min="1"
                          max="12"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={formData.startDay || ""}
                          onChange={(e) =>
                            updateFormData(
                              "startDay",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="일 (1-31)"
                          min="1"
                          max="31"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        종료 월/일
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.endMonth || ""}
                          onChange={(e) =>
                            updateFormData(
                              "endMonth",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="월 (1-12)"
                          min="1"
                          max="12"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={formData.endDay || ""}
                          onChange={(e) =>
                            updateFormData(
                              "endDay",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="일 (1-31)"
                          min="1"
                          max="31"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 할인 정책 */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                할인 정책 (선택)
              </h3>
              <div className="space-y-4">
                {/* 장기 숙박 할인 */}
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <Checkbox
                      checked={useLongStayDiscount}
                      onCheckedChange={(checked) =>
                        setUseLongStayDiscount(checked)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      장기 숙박 할인
                    </span>
                  </label>
                  {useLongStayDiscount && (
                    <div className="ml-6 flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.longStayMinNights || ""}
                          onChange={(e) =>
                            updateFormData(
                              "longStayMinNights",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="최소 박수"
                          min="1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">박 이상</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.longStayDiscountRate || ""}
                          onChange={(e) =>
                            updateFormData(
                              "longStayDiscountRate",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="할인율"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">% 할인</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 연박 할인 */}
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <Checkbox
                      checked={useExtendedStayDiscount}
                      onCheckedChange={(checked) =>
                        setUseExtendedStayDiscount(checked)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      연박 할인
                    </span>
                  </label>
                  {useExtendedStayDiscount && (
                    <div className="ml-6 flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.extendedStayMinNights || ""}
                          onChange={(e) =>
                            updateFormData(
                              "extendedStayMinNights",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="최소 박수"
                          min="1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">박 이상</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.extendedStayDiscountRate || ""}
                          onChange={(e) =>
                            updateFormData(
                              "extendedStayDiscountRate",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="할인율"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">% 할인</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 조기 예약 할인 */}
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <Checkbox
                      checked={useEarlyBirdDiscount}
                      onCheckedChange={(checked) =>
                        setUseEarlyBirdDiscount(checked)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      조기 예약 할인
                    </span>
                  </label>
                  {useEarlyBirdDiscount && (
                    <div className="ml-6 flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.earlyBirdMinDays || ""}
                          onChange={(e) =>
                            updateFormData(
                              "earlyBirdMinDays",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="최소 일수"
                          min="1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">일 전</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.earlyBirdDiscountRate || ""}
                          onChange={(e) =>
                            updateFormData(
                              "earlyBirdDiscountRate",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="할인율"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">% 할인</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 기타 설정 */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                기타 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    우선순위 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      updateFormData("priority", Number(e.target.value))
                    }
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    숫자가 높을수록 우선순위가 높습니다
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        updateFormData("isActive", checked)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      활성화
                    </span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* 푸터 버튼 */}
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-gray-200 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {mode === "create" ? "추가" : "수정"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
