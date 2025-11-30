package com.campstation.camp.reservation.domain;

/**
 * 환불 상태
 */
public enum RefundStatus {
    PENDING,    // 환불 대기
    PROCESSING, // 환불 처리중
    COMPLETED,  // 환불 완료
    FAILED      // 환불 실패
}
