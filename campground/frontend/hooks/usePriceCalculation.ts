/**
 * 가격 계산 Hook
 * 예약 전 실시간 가격 계산 및 상세 내역 조회
 *
 * @module hooks/usePriceCalculation
 */

"use client";

import { pricingApi } from "@/lib/api/pricing";
import type { CalculatePriceRequest, PriceBreakdown } from "@/types/domain/pricing";
import { useQuery } from "@tanstack/react-query";

/**
 * 가격 계산 Hook
 *
 * @param params - 가격 계산 파라미터 (siteId, checkInDate, checkOutDate, numberOfGuests)
 * @param options - React Query options
 * @returns React Query result with price breakdown
 *
 * @example
 * ```tsx
 * const { data: priceBreakdown, isLoading } = usePriceCalculation({
 *   siteId: 123,
 *   checkInDate: "2025-07-15",
 *   checkOutDate: "2025-07-17",
 *   numberOfGuests: 3,
 * });
 *
 * if (isLoading) return <Skeleton />;
 *
 * return (
 *   <div>
 *     <p>최종 금액: {priceBreakdown?.totalAmount.toLocaleString()}원</p>
 *     <p>할인 금액: {priceBreakdown?.totalDiscount.toLocaleString()}원</p>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // 실시간 가격 업데이트 (날짜/인원 변경 시)
 * const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
 * const [guests, setGuests] = useState(2);
 *
 * const { data: priceBreakdown } = usePriceCalculation({
 *   siteId: siteId,
 *   checkInDate: dates.checkIn,
 *   checkOutDate: dates.checkOut,
 *   numberOfGuests: guests,
 * }, {
 *   enabled: !!dates.checkIn && !!dates.checkOut, // 날짜 선택 후 자동 계산
 * });
 * ```
 */
export function usePriceCalculation(
  params: CalculatePriceRequest | null,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  const isEnabled = options?.enabled ?? (params !== null &&
    !!params.siteId &&
    !!params.checkInDate &&
    !!params.checkOutDate);

  console.log("🔍 [DEBUG] usePriceCalculation Hook", {
    params,
    isEnabled,
    hasParams: !!params,
  });

  return useQuery<PriceBreakdown>({
    queryKey: ["pricing", "calculate", params],
    queryFn: async () => {
      if (!params) {
        throw new Error("가격 계산 파라미터가 필요합니다.");
      }
      console.log("🔍 [DEBUG] Calling pricingApi.calculate with:", params);
      const result = await pricingApi.calculate(params);
      console.log("🔍 [DEBUG] pricingApi.calculate response:", result);
      return result;
    },
    enabled: isEnabled,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5분 (요금제는 자주 변경되지 않음)
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false, // 포커스 시 재조회 안함
  });
}

/**
 * 사이트별 가격 계산 Hook (경로 파라미터 버전)
 *
 * @param siteId - 사이트 ID
 * @param params - 가격 계산 파라미터 (checkInDate, checkOutDate, numberOfGuests)
 * @param options - React Query options
 * @returns React Query result with price breakdown
 *
 * @example
 * ```tsx
 * const { data: priceBreakdown } = usePriceCalculationBySite(
 *   siteId,
 *   {
 *     checkInDate: "2025-07-15",
 *     checkOutDate: "2025-07-17",
 *     numberOfGuests: 3,
 *   }
 * );
 * ```
 */
export function usePriceCalculationBySite(
  siteId: number | null,
  params: Omit<CalculatePriceRequest, "siteId"> | null,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery<PriceBreakdown>({
    queryKey: ["pricing", "calculate", "site", siteId, params],
    queryFn: () => {
      if (!siteId || !params) {
        throw new Error("사이트 ID와 가격 계산 파라미터가 필요합니다.");
      }
      return pricingApi.calculateBySite(siteId, params);
    },
    enabled: options?.enabled ?? (siteId !== null &&
      params !== null &&
      !!params.checkInDate &&
      !!params.checkOutDate),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}
