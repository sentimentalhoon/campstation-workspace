/**
 * 요금 계산기 컴포넌트
 * 체크인/아웃 날짜와 인원을 입력받아 예상 요금을 계산
 */

"use client";

import { Button } from "@/components/ui/Button";
import { PriceBreakdownDisplay } from "@/components/features/PriceBreakdownDisplay";
import { pricingApi } from "@/lib/api/pricing";
import type { PriceBreakdown } from "@/types/domain/pricing";
import { Calculator } from "lucide-react";
import { useState } from "react";

interface PriceCalculatorProps {
  siteId: number;
  siteName: string;
}

export function PriceCalculator({ siteId, siteName }: PriceCalculatorProps) {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(2);

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string>("");

  const handleCalculate = async () => {
    // 유효성 검사
    if (!checkInDate || !checkOutDate) {
      setError("체크인/체크아웃 날짜를 모두 선택해주세요.");
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      setError("체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.");
      return;
    }

    if (numberOfGuests < 1) {
      setError("인원은 1명 이상이어야 합니다.");
      return;
    }

    // 요금 계산
    setError("");
    setIsCalculating(true);

    try {
      const breakdown = await pricingApi.calculate({
        siteId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
      });

      setResult(breakdown);
    } catch (err) {
      console.error("요금 계산 실패:", err);
      setError(
        "요금 계산에 실패했습니다. 활성화된 요금제가 있는지 확인해주세요."
      );
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setCheckInDate("");
    setCheckOutDate("");
    setNumberOfGuests(2);
    setResult(null);
    setError("");
  };

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">요금 계산기</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {siteName}의 예상 요금을 계산합니다
        </p>
      </div>

      <div className="p-6">
        {/* 입력 영역 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              체크인
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              체크아웃
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              인원 수
            </label>
            <input
              type="number"
              min="1"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              loading={isCalculating}
              className="flex-1"
            >
              계산
            </Button>
            {result && (
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isCalculating}
              >
                초기화
              </Button>
            )}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* 계산 결과 - 가격 상세 내역 */}
        {result && (
          <div className="mt-6">
            <PriceBreakdownDisplay
              breakdown={result}
              showTitle={true}
              className="shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
