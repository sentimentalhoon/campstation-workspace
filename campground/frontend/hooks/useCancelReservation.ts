/**
 * 예약 취소 Mutation Hook
 *
 * @see docs/sprints/sprint-2.md
 * @see docs/specifications/05-STATE-MANAGEMENT.md
 */

"use client";

import { reservationApi } from "@/lib/api/reservations";
import type { Reservation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 예약 취소 Mutation Hook
 *
 * 낙관적 업데이트를 사용하여 즉시 UI를 업데이트하고,
 * 실패 시 이전 상태로 롤백합니다.
 *
 * @example
 * ```tsx
 * const cancelReservation = useCancelReservation();
 *
 * const handleCancel = () => {
 *   if (confirm('정말 예약을 취소하시겠습니까?')) {
 *     cancelReservation.mutate(reservationId, {
 *       onSuccess: () => {
 *         alert('예약이 취소되었습니다.');
 *         router.push('/reservations');
 *       },
 *       onError: (error) => {
 *         alert('취소에 실패했습니다: ' + error.message);
 *       },
 *     });
 *   }
 * };
 * ```
 */

type CancelReservationContext = {
  previousReservation?: Reservation;
};

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation<Reservation, Error, number, CancelReservationContext>({
    mutationFn: (reservationId: number) => reservationApi.cancel(reservationId),

    // 낙관적 업데이트
    onMutate: async (reservationId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({
        queryKey: ["reservation", reservationId],
      });
      await queryClient.cancelQueries({ queryKey: ["reservations"] });

      // 현재 데이터 스냅샷 저장
      const previousReservation = queryClient.getQueryData<Reservation>([
        "reservation",
        reservationId,
      ]);

      // 낙관적으로 데이터 업데이트
      if (previousReservation) {
        queryClient.setQueryData<Reservation>(["reservation", reservationId], {
          ...previousReservation,
          status: "CANCELLED",
        });
      }

      // 롤백용 컨텍스트 반환
      return { previousReservation };
    },

    // 에러 발생 시 롤백
    onError: (err, reservationId, context) => {
      if (context?.previousReservation) {
        queryClient.setQueryData(
          ["reservation", reservationId],
          context.previousReservation
        );
      }
      console.error("Failed to cancel reservation:", err);
    },

    // 성공/실패 관계없이 무효화하여 최신 데이터 가져오기
    onSettled: (_data, _error, reservationId) => {
      queryClient.invalidateQueries({
        queryKey: ["reservation", reservationId],
      });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
