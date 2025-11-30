/**
 * 예약 생성 Hook
 */

import { ApiError, NetworkError } from "@/lib/api/errors";
import { reservationApi } from "@/lib/api/reservations";
import type { CreateReservationRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * 예약 생성 Mutation Hook
 *
 * @example
 * ```tsx
 * const createReservation = useCreateReservation();
 *
 * const handleSubmit = () => {
 *   createReservation.mutate({
 *     campSiteId: 1,
 *     checkIn: "2025-12-01",
 *     checkOut: "2025-12-03",
 *     adults: 2,
 *     children: 1,
 *   });
 * };
 * ```
 */
export function useCreateReservation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => reservationApi.create(data),
    onSuccess: (response) => {
      // 예약 목록 쿼리 무효화 (새로고침용)
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      // 결제 페이지로 이동
      // TODO: 실제 결제 페이지 구현 시 reservationId 전달
      const reservationId = response.data.id;
      router.push(`/payment?reservationId=${reservationId}`);
    },
    onError: (error) => {
      console.error("Failed to create reservation:", error);

      if (error instanceof ApiError) {
        if (error.status === 400) {
          alert("예약 정보를 다시 확인해주세요.");
        } else if (error.status === 404) {
          alert("예약하려는 캠핑장을 찾을 수 없습니다.");
        } else if (error.status === 409) {
          alert("이미 예약된 날짜입니다. 다른 날짜를 선택해주세요.");
        } else if (error.status >= 500) {
          alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          alert(`예약 생성에 실패했습니다: ${error.message}`);
        }
      } else if (error instanceof NetworkError) {
        alert("네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.");
      } else {
        alert(
          error instanceof Error
            ? error.message
            : "예약 생성에 실패했습니다. 다시 시도해주세요."
        );
      }
    },
  });
}
