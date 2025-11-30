package com.campstation.camp.reservation.domain;

/**
 * 예약 상태
 * - PENDING: 결제 대기 중
 * - CONFIRMED: 예약 확정
 * - CANCELLED: 예약 취소
 * - COMPLETED: 이용 완료
 */
public enum ReservationStatus {
    PENDING,      // 결제 대기 중
    CONFIRMED,    // 예약 확정
    CANCELLED,    // 예약 취소
    COMPLETED,    // 이용 완료
    DELETED       // 사용자 삭제
}
