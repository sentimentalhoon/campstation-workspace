package com.campstation.camp.reservation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;

/**
 * 관리자용 예약 응답 DTO
 * Java 21 record를 활용한 불변 데이터 전송 객체
 */
public record AdminReservationResponse(
    Long id,
    Long userId,
    String userName,
    String userEmail,
    Long campgroundId,
    String campgroundName,
    Long siteId,
    String siteNumber,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    Integer numberOfGuests,
    BigDecimal totalAmount,
    ReservationStatus status,
    String specialRequests,
    String rejectionReason
) {
    /**
     * Reservation 엔티티로부터 DTO 생성
     */
    public static AdminReservationResponse from(Reservation reservation) {
        String userName = null;
        String userEmail = null;

        // 회원 예약인 경우
        if (reservation.getUser() != null) {
            userName = reservation.getUser().getName();
            userEmail = reservation.getUser().getEmail();
        }
        // 비회원 예약인 경우
        else if (reservation.getGuest() != null) {
            userName = reservation.getGuest().getName();
            userEmail = reservation.getGuest().getEmail();
        }

        return new AdminReservationResponse(
                reservation.getId(),
                reservation.getUser() != null ? reservation.getUser().getId() : null,
                userName,
                userEmail,
                reservation.getCampground().getId(),
                reservation.getCampground().getName(),
                reservation.getSite().getId(),
                reservation.getSite().getSiteNumber(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                reservation.getNumberOfGuests(),
                reservation.getTotalAmount(),
                reservation.getStatus(),
                reservation.getSpecialRequests(),
                reservation.getRejectionReason()
        );
    }
}