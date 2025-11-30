package com.campstation.camp.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Error codes for business exceptions
 */
@Getter
public enum ErrorCode {
    // Common errors
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "COMMON_001", "Invalid input"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON_002", "Resource not found"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "COMMON_003", "Unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "COMMON_004", "Forbidden"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_005", "Internal server error"),

    // User errors
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_001", "User not found"),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_002", "User already exists"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "USER_003", "Invalid credentials"),

    // Campground errors
    CAMPGROUND_NOT_FOUND(HttpStatus.NOT_FOUND, "CAMPGROUND_001", "Campground not found"),
    CAMPGROUND_NOT_AVAILABLE(HttpStatus.CONFLICT, "CAMPGROUND_002", "Campground not available"),

    // Reservation errors
    RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "RESERVATION_001", "Reservation not found"),
    RESERVATION_CONFLICT(HttpStatus.CONFLICT, "RESERVATION_002", "Reservation conflicts with existing booking"),
    RESERVATION_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, "RESERVATION_003", "Reservation cannot be cancelled"),
    INVALID_DATE_RANGE(HttpStatus.BAD_REQUEST, "RESERVATION_004", "Invalid date range"),

    // Payment errors
    PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "PAYMENT_001", "Payment processing failed"),
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "PAYMENT_002", "Payment not found"),
    REFUND_FAILED(HttpStatus.BAD_REQUEST, "PAYMENT_003", "Refund processing failed"),

    // Site errors
    SITE_NOT_FOUND(HttpStatus.NOT_FOUND, "SITE_001", "Site not found"),
    SITE_NOT_AVAILABLE(HttpStatus.CONFLICT, "SITE_002", "Site not available for selected dates");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
