package com.campstation.camp.shared.exception;

import java.time.LocalDate;

/**
 * Exception thrown when a reservation conflicts with existing bookings
 * (Double booking prevention)
 */
public class ReservationConflictException extends BusinessException {

    public ReservationConflictException(String message) {
        super(ErrorCode.RESERVATION_CONFLICT, message);
    }

    public ReservationConflictException(Long siteId, LocalDate checkIn, LocalDate checkOut) {
        super(ErrorCode.RESERVATION_CONFLICT,
                String.format("Site %d is already booked for dates between %s and %s",
                        siteId, checkIn, checkOut));
    }
}
