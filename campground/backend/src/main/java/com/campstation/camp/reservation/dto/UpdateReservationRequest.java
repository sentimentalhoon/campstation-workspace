package com.campstation.camp.reservation.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * 예약 수정 요청 DTO (Java 21 record 기반)
 */
public record UpdateReservationRequest(
        @FutureOrPresent(message = "체크인 날짜는 오늘 이후여야 합니다.")
        LocalDate checkInDate,

        @Future(message = "체크아웃 날짜는 미래 날짜여야 합니다.")
        LocalDate checkOutDate,

        @Min(value = 1, message = "최소 1명 이상이어야 합니다.")
        @Max(value = 20, message = "최대 20명까지 가능합니다.")
        Integer numberOfGuests,

        @Size(max = 1000, message = "특별 요청사항은 1000자 이하여야 합니다.")
        String specialRequests
) {
}