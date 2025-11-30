package com.campstation.camp.payment.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.payment.dto.PaymentLogResponse;
import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.Refund;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.repository.PaymentRepository;
import com.campstation.camp.reservation.repository.RefundRepository;
import com.campstation.camp.reservation.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 결제 관리 Facade
 * 관리자용 결제 관련 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PaymentAdminFacade {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final ReservationRepository reservationRepository;

    /**
     * 결제 로그 조회 (필터링 지원)
     * 
     * @param type "PAYMENT" 또는 "REFUND" (null이면 전체)
     * @param from 시작일 (null 가능)
     * @param to 종료일 (null 가능)
     * @param pageable 페이징 정보
     * @return 결제 로그 페이지
     */
    public Page<PaymentLogResponse> findPaymentLogs(String type, String from, String to, Pageable pageable) {
        log.info("PaymentAdminFacade: Find payment logs - type: {}, from: {}, to: {}", type, from, to);

        List<PaymentLogResponse> allLogs = new ArrayList<>();

        // PAYMENT 타입 또는 전체 조회시 결제 내역 포함
        if (type == null || type.equals("ALL") || type.equals("PAYMENT")) {
            List<Payment> payments = paymentRepository.findAll();
            List<PaymentLogResponse> paymentLogs = payments.stream()
                    .map(this::convertPaymentToLog)
                    .collect(Collectors.toList());
            allLogs.addAll(paymentLogs);
        }

        // REFUND 타입 또는 전체 조회시 환불 내역 포함
        if (type == null || type.equals("ALL") || type.equals("REFUND")) {
            List<Refund> refunds = refundRepository.findAll();
            List<PaymentLogResponse> refundLogs = refunds.stream()
                    .map(this::convertRefundToLog)
                    .collect(Collectors.toList());
            allLogs.addAll(refundLogs);
        }

        // 날짜 필터링
        List<PaymentLogResponse> filteredLogs = filterByDate(allLogs, from, to);

        // 생성 시간 내림차순 정렬 (최신순)
        filteredLogs.sort((a, b) -> {
            LocalDateTime aTime = a.getCreatedAt();
            LocalDateTime bTime = b.getCreatedAt();
            if (aTime == null && bTime == null) return 0;
            if (aTime == null) return 1;
            if (bTime == null) return -1;
            return bTime.compareTo(aTime);
        });

        // 페이징 처리
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredLogs.size());
        List<PaymentLogResponse> pagedLogs = filteredLogs.subList(start, end);

        return new PageImpl<>(pagedLogs, pageable, filteredLogs.size());
    }

    /**
     * 날짜 필터링
     */
    private List<PaymentLogResponse> filterByDate(List<PaymentLogResponse> logs, String from, String to) {
        List<PaymentLogResponse> filtered = logs;

        if (from != null && !from.isEmpty()) {
            LocalDate fromDate = LocalDate.parse(from);
            LocalDateTime fromDateTime = fromDate.atStartOfDay();
            filtered = filtered.stream()
                    .filter(log -> log.getCreatedAt() != null && !log.getCreatedAt().isBefore(fromDateTime))
                    .collect(Collectors.toList());
        }

        if (to != null && !to.isEmpty()) {
            LocalDate toDate = LocalDate.parse(to);
            LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay();
            filtered = filtered.stream()
                    .filter(log -> log.getCreatedAt() != null && log.getCreatedAt().isBefore(toDateTime))
                    .collect(Collectors.toList());
        }

        return filtered;
    }

    /**
     * Payment 엔티티를 PaymentLogResponse로 변환
     */
    private PaymentLogResponse convertPaymentToLog(Payment payment) {
        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElse(null);

        String userName = "-";
        String campgroundName = "-";

        if (reservation != null) {
            userName = getUserName(reservation);
            if (reservation.getCampground() != null) {
                campgroundName = reservation.getCampground().getName();
            }
        }

        return PaymentLogResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .reservationId(payment.getReservationId())
                .amount(payment.getAmount().doubleValue())
                .type("PAYMENT")
                .status(mapPaymentStatus(payment.getStatus().name()))
                .method(payment.getPaymentMethod().name())
                .userName(userName)
                .campgroundName(campgroundName)
                // Payment 테이블의 추가 필드들
                .transactionId(payment.getTransactionId())
                .cardNumber(payment.getCardNumber())
                .cardHolderName(payment.getCardHolderName())
                .depositorName(payment.getDepositorName())
                .failureReason(payment.getFailureReason())
                // 토스페이먼츠 상세 정보
                .tossMethod(payment.getTossMethod())
                .easyPayProvider(payment.getEasyPayProvider())
                .cardCompany(payment.getCardCompany())
                .cardType(payment.getCardType())
                .acquirerCode(payment.getAcquirerCode())
                .installmentPlanMonths(payment.getInstallmentPlanMonths())
                .approveNo(payment.getApproveNo())
                .approvedAt(payment.getApprovedAt())
                // 타임스탬프
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    /**
     * Refund 엔티티를 PaymentLogResponse로 변환
     */
    private PaymentLogResponse convertRefundToLog(Refund refund) {
        Reservation reservation = refund.getReservation();

        String userName = "-";
        String campgroundName = "-";

        if (reservation != null) {
            userName = getUserName(reservation);
            if (reservation.getCampground() != null) {
                campgroundName = reservation.getCampground().getName();
            }
        }

        return PaymentLogResponse.builder()
                .id(refund.getId())
                .reservationId(reservation != null ? reservation.getId() : null)
                .amount(refund.getRefundAmount().doubleValue())
                .type("REFUND")
                .status(mapRefundStatus(refund.getStatus().name()))
                .method(refund.getPayment() != null ? refund.getPayment().getPaymentMethod().name() : "UNKNOWN")
                .userName(userName)
                .campgroundName(campgroundName)
                .refundedAt(refund.getRefundedAt())
                .createdAt(refund.getCreatedAt())
                .updatedAt(refund.getUpdatedAt())
                .build();
    }

    /**
     * 예약에서 사용자명 추출
     */
    private String getUserName(Reservation reservation) {
        if (reservation.getUser() != null) {
            return reservation.getUser().getName();
        } else if (reservation.getGuest() != null) {
            return reservation.getGuest().getName() + " (비회원)";
        }
        return "-";
    }

    /**
     * PaymentStatus를 로그용 상태로 매핑
     */
    private String mapPaymentStatus(String status) {
        return switch (status) {
            case "COMPLETED" -> "SUCCESS";
            case "FAILED" -> "FAILED";
            case "PENDING" -> "PENDING";
            default -> status;
        };
    }

    /**
     * RefundStatus를 로그용 상태로 매핑
     */
    private String mapRefundStatus(String status) {
        return switch (status) {
            case "COMPLETED" -> "SUCCESS";
            case "FAILED" -> "FAILED";
            case "PENDING", "PROCESSING" -> "PENDING";
            default -> status;
        };
    }
}
