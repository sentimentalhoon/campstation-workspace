import { paymentApi } from "@/lib/api/payments";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 입금 확인 요청 훅
 */
export function useRequestDepositConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) =>
      paymentApi.requestDepositConfirmation(paymentId),
    onSuccess: () => {
      // 예약 목록과 상세 정보 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation"] });
    },
  });
}
