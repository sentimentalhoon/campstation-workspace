/**
 * useSitePricing Hook
 * 사이트 요금제 관리 Hook
 *
 * @module hooks/owner/useSitePricing
 */

import { pricingApi } from "@/lib/api/pricing";
import type {
  CreateSitePricingRequest,
  SitePricingResponse,
  UpdateSitePricingRequest,
} from "@/types/pricing";
import { useCallback, useEffect, useState } from "react";

interface UseSitePricingOptions {
  siteId: number;
  autoFetch?: boolean; // 자동 로드 여부 (기본: true)
}

/**
 * 사이트 요금제 관리 Hook
 *
 * @param options - Hook 옵션
 * @returns 요금제 상태 및 관리 함수
 *
 * @example
 * ```tsx
 * function PricingManager({ siteId }) {
 *   const {
 *     pricings,
 *     isLoading,
 *     error,
 *     createPricing,
 *     updatePricing,
 *     deletePricing,
 *     toggleActive,
 *   } = useSitePricing({ siteId });
 *
 *   // 요금제 생성
 *   const handleCreate = async (data) => {
 *     await createPricing(data);
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSitePricing({
  siteId,
  autoFetch = true,
}: UseSitePricingOptions) {
  const [pricings, setPricings] = useState<SitePricingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 요금제 목록 조회
   */
  const fetchPricings = useCallback(async () => {
    if (!siteId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await pricingApi.getBySite(siteId);
      // 우선순위 내림차순 정렬 (높은 우선순위가 위로)
      const sorted = [...data].sort((a, b) => b.priority - a.priority);
      setPricings(sorted);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("요금제 목록 조회 실패");
      setError(error);
      console.error("요금제 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  /**
   * 초기 로드
   */
  useEffect(() => {
    if (autoFetch && siteId) {
      fetchPricings();
    }
  }, [autoFetch, siteId, fetchPricings]);

  /**
   * 요금제 생성
   *
   * @param data - 요금제 생성 데이터
   * @throws 생성 실패 시 에러
   */
  const createPricing = async (data: CreateSitePricingRequest) => {
    try {
      await pricingApi.create(siteId, data);
      await fetchPricings(); // 목록 새로고침
    } catch (err) {
      const error = err instanceof Error ? err : new Error("요금제 생성 실패");
      throw error;
    }
  };

  /**
   * 요금제 수정
   *
   * @param pricingId - 요금제 ID
   * @param data - 수정 데이터
   * @throws 수정 실패 시 에러
   */
  const updatePricing = async (
    pricingId: number,
    data: UpdateSitePricingRequest
  ) => {
    try {
      await pricingApi.update(siteId, pricingId, data);
      await fetchPricings(); // 목록 새로고침
    } catch (err) {
      const error = err instanceof Error ? err : new Error("요금제 수정 실패");
      throw error;
    }
  };

  /**
   * 요금제 삭제
   *
   * @param pricingId - 요금제 ID
   * @throws 삭제 실패 시 에러
   */
  const deletePricing = async (pricingId: number) => {
    try {
      await pricingApi.delete(siteId, pricingId);
      await fetchPricings(); // 목록 새로고침
    } catch (err) {
      const error = err instanceof Error ? err : new Error("요금제 삭제 실패");
      throw error;
    }
  };

  /**
   * 요금제 활성화/비활성화 토글
   *
   * @param pricing - 토글할 요금제
   * @throws 토글 실패 시 에러
   */
  const toggleActive = async (pricing: SitePricingResponse) => {
    try {
      await pricingApi.update(siteId, pricing.id, {
        ...pricing,
        isActive: !pricing.isActive,
      });
      await fetchPricings(); // 목록 새로고침
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("요금제 상태 변경 실패");
      throw error;
    }
  };

  /**
   * 수동 새로고침
   */
  const refetch = () => {
    fetchPricings();
  };

  return {
    // 상태
    pricings,
    isLoading,
    error,

    // 함수
    createPricing,
    updatePricing,
    deletePricing,
    toggleActive,
    refetch,
  };
}
