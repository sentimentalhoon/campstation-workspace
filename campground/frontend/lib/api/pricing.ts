/**
 * Pricing API
 * 사이트 요금제 관리 API
 *
 * @module lib/api/pricing
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  CreateSitePricingRequest,
  SitePricingResponse,
  UpdateSitePricingRequest,
} from "@/types/pricing";
import type {
  CalculatePriceRequest,
  PriceBreakdown,
} from "@/types/domain/pricing";
import { apiClient } from "./client";

/**
 * 가격 계산 파라미터 (API 호출용)
 */
type CalculatePriceParams = CalculatePriceRequest;

/**
 * 요금제 API
 */
export const pricingApi = {
  /**
   * 요금제 생성 (Owner 전용)
   *
   * @param siteId - 사이트 ID
   * @param data - 요금제 생성 데이터
   * @returns 생성된 요금제
   *
   * @example
   * ```ts
   * const pricing = await pricingApi.create(123, {
   *   pricingName: "여름 성수기",
   *   ruleType: "SEASONAL",
   *   basePrice: 80000,
   *   weekendPrice: 120000,
   *   baseGuests: 2,
   *   maxGuests: 4,
   *   priority: 100,
   *   isActive: true,
   * });
   * ```
   */
  create: (siteId: number, data: CreateSitePricingRequest) =>
    apiClient<SitePricingResponse>(API_ENDPOINTS.OWNER.PRICING(siteId), {
      method: "POST",
      body: data,
    }),

  /**
   * 사이트별 요금제 목록 조회 (Owner 전용)
   *
   * @param siteId - 사이트 ID
   * @returns 요금제 목록 (우선순위 내림차순)
   *
   * @example
   * ```ts
   * const pricings = await pricingApi.getBySite(123);
   * ```
   */
  getBySite: (siteId: number) =>
    apiClient<SitePricingResponse[]>(API_ENDPOINTS.OWNER.PRICING_LIST(siteId)),

  /**
   * 요금제 수정 (Owner 전용)
   *
   * @param siteId - 사이트 ID
   * @param pricingId - 요금제 ID
   * @param data - 수정 데이터
   * @returns 수정된 요금제
   *
   * @example
   * ```ts
   * const updated = await pricingApi.update(123, 456, {
   *   pricingName: "여름 성수기 (수정)",
   *   basePrice: 85000,
   *   priority: 100,
   *   isActive: true,
   * });
   * ```
   */
  update: (siteId: number, pricingId: number, data: UpdateSitePricingRequest) =>
    apiClient<SitePricingResponse>(
      API_ENDPOINTS.OWNER.PRICING_UPDATE(siteId, pricingId),
      {
        method: "PUT",
        body: data,
      }
    ),

  /**
   * 요금제 삭제 (Owner 전용)
   *
   * @param siteId - 사이트 ID
   * @param pricingId - 요금제 ID
   *
   * @example
   * ```ts
   * await pricingApi.delete(123, 456);
   * ```
   */
  delete: (siteId: number, pricingId: number) =>
    apiClient<void>(API_ENDPOINTS.OWNER.PRICING_DELETE(siteId, pricingId), {
      method: "DELETE",
    }),

  /**
   * Owner의 모든 요금제 조회 (Owner 전용)
   *
   * @returns 모든 요금제 목록
   *
   * @example
   * ```ts
   * const allPricings = await pricingApi.getAllOwner();
   * ```
   */
  getAllOwner: () =>
    apiClient<SitePricingResponse[]>(API_ENDPOINTS.OWNER.ALL_PRICING),

  /**
   * 요금 미리 계산 (공개 API)
   *
   * @param params - 계산 파라미터
   * @returns 요금 상세 내역 (PriceBreakdown)
   *
   * @example
   * ```ts
   * const breakdown = await pricingApi.calculate({
   *   siteId: 123,
   *   checkInDate: "2025-07-15",
   *   checkOutDate: "2025-07-17",
   *   numberOfGuests: 3,
   * });
   *
   * console.log(`최종 금액: ${breakdown.totalAmount}원`);
   * console.log(`할인 금액: ${breakdown.totalDiscount}원`);
   * breakdown.items.forEach(item => {
   *   console.log(`${item.name}: ${item.amount}원`);
   * });
   * ```
   */
  calculate: async (params: CalculatePriceParams) => {
    console.log("🔍 [DEBUG] pricingApi.calculate called with:", params);
    const queryParams = {
      siteId: params.siteId.toString(),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      numberOfGuests: params.numberOfGuests.toString(),
    };
    console.log("🔍 [DEBUG] Query params:", queryParams);
    console.log("🔍 [DEBUG] API URL:", API_ENDPOINTS.PRICING.CALCULATE);

    try {
      const result = await apiClient<PriceBreakdown>(API_ENDPOINTS.PRICING.CALCULATE, {
        params: queryParams,
      });
      console.log("🔍 [DEBUG] pricingApi.calculate success:", result);
      return result;
    } catch (error) {
      console.error("🔍 [DEBUG] pricingApi.calculate error:", error);
      throw error;
    }
  },

  /**
   * 특정 사이트의 요금 계산 (경로 파라미터 버전)
   *
   * @param siteId - 사이트 ID
   * @param params - 계산 파라미터
   * @returns 요금 상세 내역
   *
   * @example
   * ```ts
   * const breakdown = await pricingApi.calculateBySite(123, {
   *   checkInDate: "2025-07-15",
   *   checkOutDate: "2025-07-17",
   *   numberOfGuests: 3,
   * });
   * ```
   */
  calculateBySite: (
    siteId: number,
    params: Omit<CalculatePriceParams, "siteId">
  ) =>
    apiClient<PriceBreakdown>(API_ENDPOINTS.PRICING.CALCULATE_BY_SITE(siteId), {
      params: {
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        numberOfGuests: params.numberOfGuests.toString(),
      },
    }),
};

/**
 * Owner API에 요금제 메서드 추가를 위한 타입 확장
 * (기존 ownerApi에 통합할 예정)
 */
export const ownerPricingApi = {
  /**
   * 요금제 생성
   */
  createSitePricing: pricingApi.create,

  /**
   * 사이트별 요금제 목록
   */
  getSitePricings: pricingApi.getBySite,

  /**
   * 요금제 수정
   */
  updateSitePricing: pricingApi.update,

  /**
   * 요금제 삭제
   */
  deleteSitePricing: pricingApi.delete,

  /**
   * 모든 요금제 조회
   */
  getAllPricings: pricingApi.getAllOwner,
};
