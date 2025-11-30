/**
 * useReservationFlow Hook
 * Manages the entire reservation flow state and business logic
 * React 19+ with useTransition for non-blocking updates
 */

import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { campgroundApi, reservationApi } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import type {
  CreateReservationRequest,
  PaymentMethod,
  Reservation,
} from "@/types";
import type { Site } from "@/types/domain/campground";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

type ReservationStep = 1 | 2 | 3;

interface UseReservationFlowProps {
  campgroundId: number;
  urlSiteId?: string | null;
  urlCheckIn?: string | null;
  urlCheckOut?: string | null;
}

export function useReservationFlow({
  campgroundId,
  urlSiteId,
  urlCheckIn,
  urlCheckOut,
}: UseReservationFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize step based on URL params
  const initialStep: ReservationStep =
    urlCheckIn && urlCheckOut && urlSiteId ? 3 : 1;

  // State
  const [step, setStep] = useState<ReservationStep>(initialStep);
  const [dateRange, setDateRange] = useState<
    { start: Date; end: Date } | undefined
  >(
    urlCheckIn && urlCheckOut
      ? { start: new Date(urlCheckIn), end: new Date(urlCheckOut) }
      : undefined
  );
  const [selectedSiteId, setSelectedSiteId] = useState<number | undefined>(
    urlSiteId ? Number(urlSiteId) : undefined
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [depositorName, setDepositorName] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);

  // Computed values
  const selectedSite = sites.find((site) => site.id === selectedSiteId);
  const nights = dateRange
    ? differenceInDays(dateRange.end, dateRange.start)
    : 0;

  // Format date to YYYY-MM-DD for API
  const formatDateToLocal = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Price calculation params
  const priceCalcParams = useMemo(() => {
    if (!selectedSiteId || !dateRange) {
      console.log("🔍 [DEBUG] priceCalcParams is null - missing:", {
        selectedSiteId,
        dateRange,
      });
      return null;
    }
    const params = {
      siteId: selectedSiteId,
      checkInDate: formatDateToLocal(dateRange.start),
      checkOutDate: formatDateToLocal(dateRange.end),
      numberOfGuests: adults + children,
    };
    console.log("🔍 [DEBUG] priceCalcParams created:", params);
    return params;
  }, [selectedSiteId, dateRange, adults, children, formatDateToLocal]);

  // Real-time price calculation with detailed breakdown
  const { data: priceBreakdown } = usePriceCalculation(priceCalcParams);

  // Debug price breakdown
  useEffect(() => {
    console.log("🔍 [DEBUG] priceBreakdown updated:", {
      priceBreakdown,
      hasDailyBreakdown: priceBreakdown?.dailyBreakdown?.length,
      hasDiscounts: priceBreakdown?.appliedDiscounts?.length,
      totalAmount: priceBreakdown?.totalAmount,
    });
  }, [priceBreakdown]);

  // Fallback to simple calculation if price breakdown not available
  const totalPrice =
    priceBreakdown?.totalAmount ??
    (selectedSite ? selectedSite.basePrice * nights : 0);

  // Fetch sites when needed
  useEffect(() => {
    if (
      ((step === 2 || step === 3) && sites.length === 0) ||
      (initialStep === 3 && sites.length === 0)
    ) {
      setLoadingSites(true);
      campgroundApi
        .getSites(campgroundId)
        .then((response) => {
          setSites(response.content || []);
        })
        .catch((err) => {
          console.error("Failed to fetch sites:", err);
        })
        .finally(() => {
          setLoadingSites(false);
        });
    }
  }, [step, campgroundId, sites.length, initialStep]);

  // Update date range with transition
  const updateDateRange = useCallback(
    (range: { start: Date; end: Date } | undefined) => {
      startTransition(() => {
        setDateRange(range);
      });
    },
    []
  );

  // Update selected site with transition
  const updateSelectedSite = useCallback((siteId: number | undefined) => {
    startTransition(() => {
      setSelectedSiteId(siteId);
    });
  }, []);

  // Update adults count with transition
  const updateAdults = useCallback((count: number) => {
    startTransition(() => {
      setAdults(count);
    });
  }, []);

  // Update children count with transition
  const updateChildren = useCallback((count: number) => {
    startTransition(() => {
      setChildren(count);
    });
  }, []);

  // Update payment method with transition
  const updatePaymentMethod = useCallback((method: PaymentMethod) => {
    startTransition(() => {
      setPaymentMethod(method);
    });
  }, []);

  // Update depositor name with transition
  const updateDepositorName = useCallback((name: string) => {
    startTransition(() => {
      setDepositorName(name);
    });
  }, []);

  // Validation
  const canGoNext = useCallback(() => {
    if (step === 1) return dateRange && nights > 0;
    if (step === 2) return selectedSiteId !== undefined;
    if (step === 3) {
      if (adults < 1) return false;
      if (paymentMethod === "BANK_TRANSFER" && !depositorName.trim()) {
        return false;
      }
      return true;
    }
    return false;
  }, [
    step,
    dateRange,
    nights,
    selectedSiteId,
    adults,
    paymentMethod,
    depositorName,
  ]);

  // Handle next step or create reservation
  const handleNext = useCallback(async () => {
    if (step < 3) {
      const nextStep = (step + 1) as ReservationStep;
      console.log(`🔍 [DEBUG] Moving to Step ${nextStep}`, {
        from: step,
        to: nextStep,
        dateRange,
        selectedSiteId,
        selectedSite: selectedSite?.siteNumber,
        priceBreakdown,
      });
      setStep(nextStep);
      return;
    }

    // Step 3: Create reservation
    if (!dateRange || !selectedSite) return;

    setIsCreatingReservation(true);

    try {
      if (!dateRange?.start || !dateRange?.end) {
        alert("날짜를 선택해주세요.");
        return;
      }

      const checkInDate = formatDateToLocal(dateRange.start);
      const checkOutDate = formatDateToLocal(dateRange.end);

      // 프론트엔드에서 계산한 예상 금액
      const expectedAmount = priceBreakdown?.totalAmount;

      const reservationData: CreateReservationRequest = {
        campgroundId,
        siteId: selectedSiteId!,
        checkInDate,
        checkOutDate,
        numberOfGuests: adults + children,
        paymentMethod,
        ...(paymentMethod === "BANK_TRANSFER" && {
          depositorName: depositorName.trim(),
        }),
        ...(expectedAmount && {
          expectedAmount, // 백엔드 검증용
        }),
      };

      console.log("🔍 [DEBUG] 예약 생성 요청 상세:", {
        reservationData,
        프론트계산값: {
          totalPrice,
          expectedAmount,
          priceBreakdown: priceBreakdown?.totalAmount,
          basePrice: selectedSite.basePrice,
          nights,
          adults,
          children,
          numberOfGuests: adults + children,
        },
      });

      const reservation = (await reservationApi.create(
        reservationData
      )) as unknown as Reservation;

      console.log("🔍 [DEBUG] 예약 생성 응답 상세:", {
        백엔드totalAmount: reservation.totalAmount,
        프론트totalPrice: totalPrice,
        expectedAmount,
        차이: Math.abs(
          reservation.totalAmount - (expectedAmount || totalPrice)
        ),
        reservation,
      });

      // ✅ 금액 불일치 감지 및 사용자 알림
      if (
        expectedAmount &&
        Math.abs(reservation.totalAmount - expectedAmount) > 100
      ) {
        console.warn("⚠️ 가격 불일치 감지!", {
          expected: expectedAmount,
          actual: reservation.totalAmount,
          difference: Math.abs(reservation.totalAmount - expectedAmount),
        });

        // 사용자에게 알림 (선택적)
        // alert(`가격이 변경되었습니다.\n예상: ${expectedAmount.toLocaleString()}원\n실제: ${reservation.totalAmount.toLocaleString()}원`);
      }

      const paymentId = reservation.payment?.id;
      console.log("결제 ID:", paymentId);

      if (!paymentId) {
        throw new Error("결제 정보가 생성되지 않았습니다.");
      }

      // ✅ Navigate to payment page with minimal query params
      // 나머지 정보는 API로 조회 (reservationId, paymentId만 전달)
      const queryParams = new URLSearchParams({
        reservationId: reservation.id.toString(),
        paymentId: paymentId.toString(),
      });

      console.log("🔍 [DEBUG] Navigating to payment page:", {
        reservationId: reservation.id,
        paymentId,
        url: `/payment?${queryParams.toString()}`,
      });

      router.push(`/payment?${queryParams.toString()}`);
    } catch (error) {
      console.error("❌ 예약 생성 실패:", error);

      // ✅ 에러 타입별 사용자 친화적 메시지
      let errorMessage = "예약 생성에 실패했습니다. 다시 시도해주세요.";

      if (error instanceof ApiError) {
        // 검증 에러 (400)
        if (error.isValidationError()) {
          const fieldErrors = error.getAllFieldErrors();
          errorMessage = Object.values(fieldErrors).join("\n") || error.message;
        }
        // 이미 예약된 날짜 (409 Conflict)
        else if (error.status === 409) {
          errorMessage = "이미 예약된 날짜입니다. 다른 날짜를 선택해주세요.";
        }
        // 인증 에러 (401)
        else if (error.status === 401) {
          errorMessage = "로그인이 필요합니다.";
        }
        // 권한 에러 (403)
        else if (error.status === 403) {
          errorMessage = "예약 권한이 없습니다.";
        }
        // 서버 에러 (5xx)
        else if (error.isServerError()) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
        // 기타 API 에러
        else {
          errorMessage = error.message || "예약 생성에 실패했습니다.";
        }
      }
      // 네트워크 에러
      else if (error instanceof Error && error.message.includes("network")) {
        errorMessage = "네트워크 연결을 확인해주세요.";
      }
      // 기타 에러
      else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsCreatingReservation(false);
    }
  }, [
    step,
    dateRange,
    selectedSite,
    campgroundId,
    selectedSiteId,
    adults,
    children,
    paymentMethod,
    depositorName,
    nights,
    totalPrice,
    priceBreakdown, // ✅ 추가
    formatDateToLocal,
    router,
  ]);

  // Handle back
  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as ReservationStep);
    } else {
      router.back();
    }
  }, [step, router]);

  return {
    // State
    step,
    dateRange,
    selectedSiteId,
    selectedSite,
    adults,
    children,
    paymentMethod,
    depositorName,
    sites,
    loadingSites,
    isCreatingReservation,
    isPending,

    // Computed
    nights,
    totalPrice,
    priceBreakdown, // 가격 상세 내역

    // Actions
    updateDateRange,
    updateSelectedSite,
    updateAdults,
    updateChildren,
    updatePaymentMethod,
    updateDepositorName,
    handleNext,
    handleBack,
    canGoNext: canGoNext(),
  };
}
