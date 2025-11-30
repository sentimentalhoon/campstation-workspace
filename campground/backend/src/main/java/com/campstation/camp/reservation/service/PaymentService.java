package com.campstation.camp.reservation.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.PaymentMethod;
import com.campstation.camp.reservation.domain.PaymentStatus;
import com.campstation.camp.reservation.domain.Refund;
import com.campstation.camp.reservation.domain.RefundStatus;
import com.campstation.camp.reservation.domain.RefundType;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.dto.PaymentResponse;
import com.campstation.camp.reservation.dto.ProcessPaymentRequest;
import com.campstation.camp.reservation.dto.ProcessPaymentResponse;
import com.campstation.camp.reservation.dto.RefundRequest;
import com.campstation.camp.reservation.dto.RefundResponse;
import com.campstation.camp.reservation.payment.TossPaymentsClient;
import com.campstation.camp.reservation.repository.PaymentRepository;
import com.campstation.camp.reservation.repository.RefundRepository;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.notification.EmailNotificationService;
import com.campstation.camp.shared.notification.SmsNotificationService;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 결제 서비스
 * 결제 처리, 환불 및 결제 관련 비즈니스 로직을 담당하는 서비스 클래스
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 *
 * @author CampStation Team
 * @version 2.0
 * @since 2024-01-01
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final RefundRepository refundRepository;
    private final EmailNotificationService emailNotificationService;
    private final ReceiptService receiptService;
    private final SmsNotificationService smsNotificationService;
    private final TossPaymentsClient tossPaymentsClient;
    private final UserRepository userRepository;

    @Transactional
    public ProcessPaymentResponse processPayment(Long userId, ProcessPaymentRequest request) {
        try {
            // 사용자 정보 확인
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

            // 예약 정보 확인
            boolean reservationExists = reservationRepository.existsById(request.getReservationId());
            if (!reservationExists) {
                throw new ResourceNotFoundException("예약을 찾을 수 없습니다.");
            }

            // 이미 결제된 예약인지 확인
            List<Payment> existingPayments = paymentRepository.findByReservationIdOrderByCreatedAtDesc(request.getReservationId());
            boolean hasCompletedPayment = existingPayments.stream()
                    .anyMatch(payment -> payment.getStatus() == PaymentStatus.COMPLETED);

            if (hasCompletedPayment) {
                return ProcessPaymentResponse.builder()
                        .success(false)
                        .message("이미 결제된 예약입니다.")
                        .build();
            }

            // 결제 정보 생성 - User 엔티티 설정
            Payment payment = Payment.builder()
                    .user(user)
                    .reservationId(request.getReservationId())
                    .amount(request.getAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .status(PaymentStatus.PENDING)
                    .build();

            // 카드 정보가 있는 경우 저장 (실제로는 암호화해야 함)
            if (request.getPaymentInfo() != null && request.getPaymentMethod() == PaymentMethod.CARD) {
                String maskedCardNumber = maskCardNumber(request.getPaymentInfo().getCardNumber());
                payment = Payment.builder()
                        .user(user)
                        .reservationId(request.getReservationId())
                        .amount(request.getAmount())
                        .paymentMethod(request.getPaymentMethod())
                        .status(PaymentStatus.PENDING)
                        .cardNumber(maskedCardNumber)
                        .cardHolderName(request.getPaymentInfo().getCardHolderName())
                        .build();
            }

            Payment savedPayment = paymentRepository.save(payment);

            // 실제 결제 처리 로직 (여기서는 시뮬레이션)
            String transactionId = processActualPayment(savedPayment, request);

            if (transactionId != null) {
                savedPayment.markAsCompleted(transactionId);
                paymentRepository.save(savedPayment);

                // 결제 완료 이메일 알림 전송
                try {
                    emailNotificationService.sendPaymentConfirmationEmail(savedPayment);
                } catch (Exception e) {
                    log.warn("결제 완료 이메일 전송 실패: {}", e.getMessage());
                    // 이메일 전송 실패해도 결제는 성공으로 처리
                }

                // 결제 완료 SMS 알림 전송
                try {
                    smsNotificationService.sendPaymentConfirmationSms(savedPayment);
                } catch (Exception e) {
                    log.warn("결제 완료 SMS 전송 실패: {}", e.getMessage());
                    // SMS 전송 실패해도 결제는 성공으로 처리
                }

                return ProcessPaymentResponse.builder()
                        .success(true)
                        .transactionId(transactionId)
                        .message("결제가 성공적으로 완료되었습니다.")
                        .build();
            } else {
                savedPayment.markAsFailed("결제 처리 실패");
                paymentRepository.save(savedPayment);

                return ProcessPaymentResponse.builder()
                        .success(false)
                        .message("결제 처리에 실패했습니다.")
                        .build();
            }

        } catch (Exception e) {
            log.error("결제 처리 중 오류 발생", e);
            return ProcessPaymentResponse.builder()
                    .success(false)
                    .message("결제 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

    private String processActualPayment(Payment payment, ProcessPaymentRequest request) {
        // 포트원 PG를 통한 실제 결제 처리
        try {
            // 결제 금액 검증
            if (payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                log.error("Invalid payment amount: {}", payment.getAmount());
                return null;
            }

            // 카드 결제인 경우 유효성 검증
            if (payment.getPaymentMethod() == PaymentMethod.CARD && request.getPaymentInfo() != null) {
                if (!isValidCardInfo(request.getPaymentInfo())) {
                    log.error("Invalid card information");
                    return null;
                }
            }

            // 계좌이체는 입금 대기 상태로 처리
            if (payment.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
                log.info("Bank transfer payment - waiting for deposit confirmation");
                return null; // 입금 확인 후 별도로 처리
            }

            // 토스페이먼츠는 프론트엔드에서 결제 진행 후 백엔드에서 승인
            // orderId 생성 (프론트엔드와 동일한 형식 사용)
            String orderId = "ORDER_" + System.currentTimeMillis() + "_" + payment.getId();
            log.info("Payment orderId generated - orderId: {}, paymentId: {}", orderId, payment.getId());

            // 프론트엔드에서 결제 완료 후 confirmPayment API를 호출하면
            // verifyAndCompletePayment() 메서드에서 실제 승인 처리됨
            // 여기서는 orderId만 반환 (시뮬레이션)
            return orderId;

        } catch (Exception e) {
            log.error("Payment processing error", e);
            return null;
        }
    }

    private boolean isValidCardInfo(ProcessPaymentRequest.PaymentInfo paymentInfo) {
        // 간단한 카드 정보 검증 (실제로는 더 엄격한 검증 필요)
        String cardNumber = paymentInfo.getCardNumber().replaceAll("\\s+", "");
        return cardNumber.length() >= 13 && cardNumber.length() <= 19 &&
               paymentInfo.getExpiryDate() != null && paymentInfo.getCvv() != null;
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return cardNumber;
        }
        String cleaned = cardNumber.replaceAll("\\s+", "");
        return "****-****-****-" + cleaned.substring(cleaned.length() - 4);
    }

    public Page<PaymentResponse> getPaymentHistory(Long userId, Pageable pageable) {
        log.info("Getting payment history for userId: {}", userId);
        Page<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        log.info("Found {} payments for userId: {}", payments.getTotalElements(), userId);
        return payments.map(this::convertToResponse);
    }

    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));
        return convertToResponse(payment);
    }

    private PaymentResponse convertToResponse(Payment payment) {
        // 캠핑장 이름 가져오기
        String campgroundName = null;
        try {
            var reservation = reservationRepository.findById(payment.getReservationId()).orElse(null);
            if (reservation != null && reservation.getCampground() != null) {
                campgroundName = reservation.getCampground().getName();
            }
        } catch (Exception e) {
            log.warn("Failed to load campground name for payment {}: {}", payment.getId(), e.getMessage());
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .reservationId(payment.getReservationId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .cardNumber(payment.getCardNumber())
                .cardHolderName(payment.getCardHolderName())
                .campgroundName(campgroundName)
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    @Transactional
    public RefundResponse processRefund(Long userId, RefundRequest request) {
        try {
            // 결제 정보 확인
            Payment payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("결제를 찾을 수 없습니다."));

            // 결제 소유자 확인
            if (!payment.getUserId().equals(userId)) {
                return RefundResponse.builder()
                        .success(false)
                        .message("해당 결제에 대한 환불 권한이 없습니다.")
                        .build();
            }

            // 결제 상태 확인
            if (payment.getStatus() != PaymentStatus.COMPLETED) {
                return RefundResponse.builder()
                        .success(false)
                        .message("완료된 결제만 환불할 수 있습니다.")
                        .build();
            }

            // 환불 금액 검증
            if (request.getRefundAmount().compareTo(payment.getAmount()) > 0) {
                return RefundResponse.builder()
                        .success(false)
                        .message("환불 금액이 결제 금액을 초과할 수 없습니다.")
                        .build();
            }

            // 예약 정보 조회
            Reservation reservation = reservationRepository.findById(payment.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

            // 환불 내역 생성 (처리 전)
            Refund refund = Refund.builder()
                    .payment(payment)
                    .reservation(reservation)
                    .userId(userId)
                    .refundAmount(request.getRefundAmount())
                    .refundReason(request.getRefundReason())
                    .status(RefundStatus.PROCESSING)
                    .processedBy(userId)
                    .refundType(RefundType.USER)
                    .build();
            refund = refundRepository.save(refund);

            // 실제 환불 처리 로직 (Toss Payments API 호출)
            boolean refundSuccess = processActualRefund(payment, request, refund);

            if (refundSuccess) {
                // 결제 수단에 따라 상태 결정
                // 계좌이체는 환불 대기중, 카드/간편결제는 즉시 환불 완료
                PaymentStatus newStatus;
                RefundStatus refundStatus;
                String message;
                
                if (payment.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
                    newStatus = PaymentStatus.REFUND_PENDING;
                    refundStatus = RefundStatus.PENDING;
                    message = "환불 요청이 접수되었습니다. 영업일 기준 3-5일 내 환불이 완료됩니다.";
                } else {
                    newStatus = PaymentStatus.REFUNDED;
                    refundStatus = RefundStatus.COMPLETED;
                    message = "환불이 성공적으로 처리되었습니다.";
                }
                
                // 환불 내역 상태 업데이트
                refund.updateStatus(refundStatus);
                refundRepository.save(refund);

                payment.updateStatus(newStatus);
                paymentRepository.save(payment);

                // 환불 완료 시 예약 취소 처리
                try {
                    reservation.changeStatus(ReservationStatus.CANCELLED);
                    reservationRepository.save(reservation);
                    log.info("예약 {} 취소 처리 완료 (환불 완료)", payment.getReservationId());
                } catch (Exception e) {
                    log.error("예약 취소 처리 중 오류 발생: {}", e.getMessage());
                    // 예약 취소 실패해도 환불은 계속 진행
                }

                // 환불 접수/완료 알림 전송
                try {
                    emailNotificationService.sendPaymentCancellationEmail(payment);
                } catch (Exception e) {
                    log.warn("환불 알림 이메일 전송 실패: {}", e.getMessage());
                }

                try {
                    smsNotificationService.sendPaymentCancellationSms(payment);
                } catch (Exception e) {
                    log.warn("환불 알림 SMS 전송 실패: {}", e.getMessage());
                }

                return RefundResponse.builder()
                        .success(true)
                        .message(message)
                        .refundTransactionId(refund.getRefundTransactionId())
                        .refundedAmount(request.getRefundAmount())
                        .refundedAt(refund.getRefundedAt())
                        .build();
            } else {
                // 환불 실패 처리
                refund.failRefund("환불 처리 실패");
                refundRepository.save(refund);
                
                return RefundResponse.builder()
                        .success(false)
                        .message("환불 처리에 실패했습니다.")
                        .build();
            }

        } catch (Exception e) {
            log.error("환불 처리 중 오류 발생: {}", e.getMessage());
            return RefundResponse.builder()
                    .success(false)
                    .message("환불 처리 중 오류가 발생했습니다.")
                    .build();
        }
    }

    /**
     * 환불 처리 (결제 방식에 따라 다르게 처리)
     * - BANK_TRANSFER: 수동 환불 (PENDING 상태로 변경, 오너가 직접 환불 후 확인)
     * - CARD, KAKAO_PAY: Toss Payments API를 통한 자동 환불
     *
     * @param payment 결제 정보
     * @param request 환불 요청 정보
     * @param refund 환불 엔티티
     * @return 환불 성공 여부
     */
    private boolean processActualRefund(Payment payment, RefundRequest request, Refund refund) {
        try {
            // 계좌이체는 수동 환불 프로세스
            if (payment.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
                log.info("Bank transfer refund requested - will be processed manually. Payment: {}, Amount: {}",
                    payment.getId(), request.getRefundAmount());

                // 환불 정보 설정 (수동 처리)
                String refundTransactionId = "BANK_REFUND_" + System.currentTimeMillis();
                refund.completeRefund(
                    refundTransactionId,
                    "PENDING", // 수동 처리 대기 중
                    request.getRefundAmount(),
                    "PENDING"
                );

                // 오너에게 알림 발송 (수동 환불 처리 필요)
                try {
                    notifyOwnerForManualRefund(payment, refund, request);
                } catch (Exception e) {
                    log.warn("Failed to send manual refund notification to owner: {}", e.getMessage());
                }

                return true; // PENDING 상태로 처리 성공
            }

            // Toss Payments를 통한 자동 환불 (CARD, KAKAO_PAY)
            String paymentKey = payment.getTransactionId();
            Integer cancelAmount = request.getRefundAmount().intValue();
            String cancelReason = request.getRefundReason();

            try {
                // Toss Payments 결제 취소 API 호출
                var cancelResponse = tossPaymentsClient.cancelPayment(paymentKey, cancelReason, cancelAmount);
                log.info("TossPayments payment cancelled - paymentKey: {}, amount: {}", paymentKey, cancelAmount);
                log.debug("TossPayments cancel response: {}", cancelResponse);

                // Toss Payments 응답 파싱 및 Refund 엔티티 업데이트
                if (cancelResponse != null && cancelResponse.has("cancels")) {
                    var cancelsArray = cancelResponse.getAsJsonArray("cancels");
                    if (cancelsArray.size() > 0) {
                        // 가장 최근 취소 정보 (마지막 요소)
                        var latestCancel = cancelsArray.get(cancelsArray.size() - 1).getAsJsonObject();
                        
                        // transactionKey 저장
                        if (latestCancel.has("transactionKey")) {
                            refund.completeRefund(
                                getStringOrNull(latestCancel, "transactionKey"),
                                getStringOrNull(latestCancel, "cancelStatus"),
                                getBigDecimalOrNull(cancelResponse, "balanceAmount"),
                                getStringOrNull(cancelResponse, "status")
                            );
                        }
                        
                        // Toss Payments 상세 정보 업데이트
                        refund.updateTossPaymentDetails(
                            getStringOrNull(latestCancel, "cancelStatus"),
                            getStringOrNull(latestCancel, "cancelRequestId"),
                            getBigDecimalOrNull(latestCancel, "taxFreeAmount"),
                            getBigDecimalOrNull(latestCancel, "taxExemptionAmount"),
                            getBigDecimalOrNull(latestCancel, "refundableAmount"),
                            getBigDecimalOrNull(latestCancel, "cardDiscountAmount"),
                            getBigDecimalOrNull(latestCancel, "transferDiscountAmount"),
                            getBigDecimalOrNull(latestCancel, "easyPayDiscountAmount"),
                            getStringOrNull(latestCancel, "receiptKey"),
                            getBigDecimalOrNull(cancelResponse, "totalAmount"),
                            getBigDecimalOrNull(cancelResponse, "balanceAmount"),
                            getStringOrNull(cancelResponse, "status")
                        );
                    }
                }

                return true;

            } catch (Exception e) {
                log.error("TossPayments payment cancellation failed", e);
                refund.failRefund("Toss Payments 취소 API 호출 실패: " + e.getMessage());
                return false;
            }

        } catch (Exception e) {
            log.error("Refund processing error", e);
            refund.failRefund("환불 처리 중 오류 발생: " + e.getMessage());
            return false;
        }
    }

    /**
     * JsonObject에서 안전하게 String 값을 추출
     * null이거나 JsonNull인 경우 null 반환
     */
    private String getStringOrNull(com.google.gson.JsonObject jsonObject, String key) {
        if (!jsonObject.has(key)) {
            return null;
        }
        var element = jsonObject.get(key);
        return (element != null && !element.isJsonNull()) ? element.getAsString() : null;
    }

    /**
     * JsonObject에서 안전하게 BigDecimal 값을 추출
     * null이거나 JsonNull인 경우 null 반환
     */
    private BigDecimal getBigDecimalOrNull(com.google.gson.JsonObject jsonObject, String key) {
        if (!jsonObject.has(key)) {
            return null;
        }
        var element = jsonObject.get(key);
        return (element != null && !element.isJsonNull()) ? new BigDecimal(element.getAsInt()) : null;
    }

    /**
     * 토스페이먼츠 결제 승인 및 검증
     * 
     * 프론트엔드에서 결제 완료 후 paymentKey, orderId, amount를 받아서 최종 승인 처리
     * 
     * @param paymentKey 토스페이먼츠 결제 키
     * @param paymentId 결제 ID
     * @param orderId 주문 ID
     * @param amount 결제 금액
     * @return 결제 응답
     */
    @Transactional
    public PaymentResponse verifyAndCompletePayment(String paymentKey, Long paymentId, String orderId, int amount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

        // ✅ 1. 결제 금액 재검증 - 예약 시 계산한 금액과 실제 결제 금액 비교
        BigDecimal requestedAmount = BigDecimal.valueOf(amount);
        BigDecimal savedAmount = payment.getAmount();
        
        if (savedAmount.compareTo(requestedAmount) != 0) {
            log.error("Payment amount mismatch! Saved: {}, Requested: {}, PaymentId: {}", 
                    savedAmount, requestedAmount, paymentId);
            payment.markAsFailed("결제 금액 불일치: 예약 금액=" + savedAmount + ", 결제 금액=" + requestedAmount);
            paymentRepository.save(payment);
            throw new IllegalArgumentException(
                    String.format("결제 금액이 일치하지 않습니다. (예약 금액: %s원, 결제 금액: %s원)", 
                            savedAmount, requestedAmount));
        }
        
        log.info("✅ Payment amount verified - amount: {}, paymentId: {}", amount, paymentId);

        try {
            // 토스페이먼츠 결제 승인 API 호출
            var paymentResult = tossPaymentsClient.confirmPayment(paymentKey, orderId, amount);
            log.info("TossPayments payment confirmed - paymentKey: {}, orderId: {}", paymentKey, orderId);
            log.debug("TossPayments response: {}", paymentResult);

            // 토스페이먼츠 응답에서 결제 정보 추출 및 저장
            if (paymentResult.has("method")) {
                String tossMethod = paymentResult.get("method").getAsString();
                payment.setTossMethod(tossMethod);
                log.info("Payment method from Toss: {}", tossMethod);
                
                // 우리 PaymentMethod enum 업데이트
                if ("간편결제".equals(tossMethod)) {
                    payment.setPaymentMethod(com.campstation.camp.reservation.domain.PaymentMethod.EASY_PAYMENT); // 기본값
                    
                    // 간편결제 제공자 저장
                    if (paymentResult.has("easyPay")) {
                        var easyPayElement = paymentResult.get("easyPay");
                        String easyPayProvider = null;
                        
                        // easyPay가 객체인 경우 provider 필드에서 추출
                        if (easyPayElement.isJsonObject()) {
                            var easyPayObj = easyPayElement.getAsJsonObject();
                            if (easyPayObj.has("provider")) {
                                easyPayProvider = easyPayObj.get("provider").getAsString();
                            }
                            log.info("EasyPay object: {}", easyPayObj);
                        } else if (easyPayElement.isJsonPrimitive()) {
                            // easyPay가 문자열인 경우 직접 사용
                            easyPayProvider = easyPayElement.getAsString();
                        }
                        
                        if (easyPayProvider != null) {
                            payment.setEasyPayProvider(easyPayProvider);
                            log.info("EasyPay provider: {}", easyPayProvider);
                            // 향후 다른 간편결제 추가 가능 (네이버페이, 토스페이 등)
                        }
                    }
                } else if ("카드".equals(tossMethod)) {
                    payment.setPaymentMethod(com.campstation.camp.reservation.domain.PaymentMethod.CARD);
                    
                    // 카드 상세 정보 저장
                    if (paymentResult.has("card")) {
                        var cardInfo = paymentResult.getAsJsonObject("card");
                        
                        if (cardInfo.has("company")) {
                            payment.setCardCompany(cardInfo.get("company").getAsString());
                        }
                        if (cardInfo.has("cardType")) {
                            payment.setCardType(cardInfo.get("cardType").getAsString());
                        }
                        if (cardInfo.has("number")) {
                            payment.setCardNumber(cardInfo.get("number").getAsString());
                        }
                        if (cardInfo.has("acquirerCode")) {
                            payment.setAcquirerCode(cardInfo.get("acquirerCode").getAsString());
                        }
                        if (cardInfo.has("installmentPlanMonths")) {
                            payment.setInstallmentPlanMonths(cardInfo.get("installmentPlanMonths").getAsString());
                        }
                        if (cardInfo.has("approveNo")) {
                            payment.setApproveNo(cardInfo.get("approveNo").getAsString());
                        }
                        
                        log.info("Card details saved - company: {}, type: {}", 
                                payment.getCardCompany(), payment.getCardType());
                    }
                }
            }
            
            // 승인 일시 저장 (타임존 정보가 포함된 경우 UTC로 변환)
            if (paymentResult.has("approvedAt")) {
                String approvedAtStr = paymentResult.get("approvedAt").getAsString();
                try {
                    // ISO 8601 형식 파싱 (타임존 정보 포함: "2025-10-28T23:03:01+09:00")
                    OffsetDateTime approvedDateTime = OffsetDateTime.parse(approvedAtStr);
                    // UTC로 변환하여 ISO 8601 형식으로 저장
                    String utcApprovedAt = approvedDateTime.atZoneSameInstant(ZoneOffset.UTC)
                            .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                    payment.setApprovedAt(utcApprovedAt);
                    log.info("Approved at converted to UTC: {} -> {}", approvedAtStr, utcApprovedAt);
                } catch (Exception e) {
                    // 파싱 실패 시 원본 그대로 저장
                    log.warn("Failed to parse approvedAt, saving as is: {}", approvedAtStr, e);
                    payment.setApprovedAt(approvedAtStr);
                }
            }

            // 승인 성공 시 결제 완료 처리
            payment.markAsCompleted(paymentKey);
            paymentRepository.save(payment);

            // 예약 상태를 CONFIRMED로 변경
            var reservation = reservationRepository.findById(payment.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));
            
            reservation.setStatus(com.campstation.camp.reservation.domain.ReservationStatus.CONFIRMED);
            reservationRepository.save(reservation);
            log.info("Reservation {} confirmed after payment completion", reservation.getId());

            // 알림 전송
            try {
                emailNotificationService.sendPaymentConfirmationEmail(payment);
            } catch (Exception e) {
                log.warn("결제 완료 이메일 전송 실패: {}", e.getMessage());
            }

            try {
                smsNotificationService.sendPaymentConfirmationSms(payment);
            } catch (Exception e) {
                log.warn("결제 완료 SMS 전송 실패: {}", e.getMessage());
            }

            log.info("Payment confirmation successful - paymentKey: {}, paymentId: {}", 
                    paymentKey, paymentId);

            return PaymentResponse.fromEntity(payment);

        } catch (Exception e) {
            log.error("Payment confirmation failed", e);
            payment.markAsFailed("결제 승인 실패: " + e.getMessage());
            paymentRepository.save(payment);
            throw new RuntimeException("결제 승인에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 사용자가 입금 확인을 요청 (오너에게 알림 전송)
     *
     * @param paymentId 결제 ID
     * @param userId 요청하는 사용자 ID
     */
    @Transactional
    public void requestDepositConfirmation(Long paymentId, Long userId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

        // 본인의 결제인지 확인
        if (!payment.getUserId().equals(userId)) {
            throw new RuntimeException("본인의 결제만 확인 요청할 수 있습니다.");
        }

        // 계좌이체 결제인지 확인
        if (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new RuntimeException("계좌이체 결제만 입금 확인 요청이 가능합니다.");
        }

        // PENDING 상태인지 확인
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("입금 대기 중인 결제만 확인 요청할 수 있습니다.");
        }

        // 예약 정보 조회
        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        // 캠핑장 오너 정보 조회
        var campgroundOwner = reservation.getCampground().getOwner();
        if (campgroundOwner == null) {
            throw new RuntimeException("캠핑장 소유자 정보를 찾을 수 없습니다.");
        }

        // 결제 상태를 CONFIRMATION_REQUESTED로 변경
        payment.setStatus(PaymentStatus.CONFIRMATION_REQUESTED);
        paymentRepository.save(payment);
        log.info("Payment status changed to CONFIRMATION_REQUESTED: {}", paymentId);

        // 오너에게 입금 확인 요청 이메일 전송
        try {
            emailNotificationService.sendDepositConfirmationRequestEmail(payment, reservation, campgroundOwner);
            log.info("Deposit confirmation request sent to owner: {}, payment: {}", campgroundOwner.getEmail(), paymentId);
        } catch (Exception e) {
            log.error("Failed to send deposit confirmation request: {}", e.getMessage());
            throw new RuntimeException("입금 확인 요청 전송에 실패했습니다.");
        }
    }

    /**
     * 계좌이체 입금 확인 및 완료 처리
     *
     * @param paymentId 결제 ID
     * @return 결제 응답
     */
    @Transactional
    public PaymentResponse confirmBankTransferDeposit(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

        // 계좌이체 결제인지 확인
        if (payment.getPaymentMethod() != com.campstation.camp.reservation.domain.PaymentMethod.BANK_TRANSFER) {
            throw new RuntimeException("계좌이체 결제만 입금 확인이 가능합니다.");
        }

        // 이미 완료된 결제인지 확인
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("이미 입금이 확인된 결제입니다.");
        }

        // PENDING 또는 CONFIRMATION_REQUESTED 상태인지 확인
        if (payment.getStatus() != PaymentStatus.PENDING && 
            payment.getStatus() != PaymentStatus.CONFIRMATION_REQUESTED) {
            throw new RuntimeException("입금 대기 중이거나 확인 요청된 결제만 확인할 수 있습니다.");
        }

        // 결제를 완료 상태로 변경
        String transactionId = "BANK_" + System.currentTimeMillis();
        payment.markAsCompleted(transactionId);
        Payment savedPayment = paymentRepository.save(payment);

        // 예약 상태도 CONFIRMED로 변경
        var reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));
        
        reservation.setStatus(com.campstation.camp.reservation.domain.ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        // 입금 확인 알림 전송
        try {
            emailNotificationService.sendPaymentConfirmationEmail(savedPayment);
        } catch (Exception e) {
            log.warn("입금 확인 이메일 전송 실패: {}", e.getMessage());
        }

        try {
            smsNotificationService.sendPaymentConfirmationSms(savedPayment);
        } catch (Exception e) {
            log.warn("입금 확인 SMS 전송 실패: {}", e.getMessage());
        }

        log.info("Bank transfer deposit confirmed for payment: {}", paymentId);
        
        return PaymentResponse.fromEntity(savedPayment);
    }

    /**
     * Owner 전용 환불 처리 (제한 없음)
     * Owner는 당일 환불, 전액 환불이 가능하며 Toss Payments API를 통해 실제 환불 처리
     * 
     * @param payment 결제 정보
     * @param reservation 예약 정보
     * @param request 환불 요청
     * @param ownerId 환불 처리하는 오너 ID
     * @return 환불 응답
     */
    @Transactional
    public RefundResponse processOwnerRefund(Payment payment, Reservation reservation, RefundRequest request, Long ownerId) {
        try {
            // 결제 상태 확인
            if (payment.getStatus() != PaymentStatus.COMPLETED) {
                throw new IllegalStateException("완료된 결제만 환불할 수 있습니다. 현재 상태: " + payment.getStatus());
            }

            // 환불 금액 검증
            if (request.getRefundAmount().compareTo(payment.getAmount()) > 0) {
                throw new IllegalArgumentException("환불 금액이 결제 금액을 초과할 수 없습니다.");
            }

            // 환불 내역 생성 (처리 전)
            Refund refund = Refund.builder()
                    .payment(payment)
                    .reservation(reservation)
                    .userId(payment.getUserId())
                    .refundAmount(request.getRefundAmount())
                    .refundReason(request.getRefundReason())
                    .status(RefundStatus.PROCESSING)
                    .processedBy(ownerId)
                    .refundType(RefundType.OWNER)
                    .build();
            refund = refundRepository.save(refund);

            // Toss Payments API를 통한 실제 환불 처리
            boolean refundSuccess = processActualRefund(payment, request, refund);

            if (!refundSuccess) {
                // 환불 실패는 이미 processActualRefund에서 처리됨
                refundRepository.save(refund);
                throw new RuntimeException("Toss Payments 환불 API 호출 실패");
            }

            // 환불 완료 상태 업데이트
            refund.updateStatus(RefundStatus.COMPLETED);
            refundRepository.save(refund);

            // 결제 상태를 REFUNDED로 변경
            payment.updateStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            // 예약 상태를 CANCELLED로 변경
            reservation.changeStatus(ReservationStatus.CANCELLED);
            reservationRepository.save(reservation);

            log.info("Owner 환불 완료 - 결제 ID: {}, 예약 ID: {}, 환불 금액: {}, 환불 내역 ID: {}", 
                payment.getId(), reservation.getId(), request.getRefundAmount(), refund.getId());

            // 환불 알림 전송
            sendRefundNotifications(payment);

            return RefundResponse.builder()
                    .success(true)
                    .message("환불이 성공적으로 처리되었습니다.")
                    .refundTransactionId(refund.getRefundTransactionId())
                    .refundedAmount(request.getRefundAmount())
                    .refundedAt(refund.getRefundedAt())
                    .build();

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Owner 환불 검증 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Owner 환불 처리 중 오류 발생", e);
            throw new RuntimeException("환불 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * Toss Payments API를 통한 실제 환불 실행
     * 
     * @param payment 결제 정보
     * @param request 환불 요청
     * @return 환불 트랜잭션 ID
     */
    private String executeRefund(Payment payment, RefundRequest request) {
        try {
            String paymentKey = payment.getTransactionId();
            String cancelReason = request.getRefundReason();
            
            // 환불 사유가 없는 경우 기본값 설정 (Toss Payments 필수 파라미터)
            if (cancelReason == null || cancelReason.trim().isEmpty()) {
                cancelReason = "관리자 환불 처리";
            }
            
            // 부분 환불인 경우에만 cancelAmount 설정
            Integer cancelAmount = null;
            if (request.getRefundAmount() != null && 
                request.getRefundAmount().compareTo(payment.getAmount()) < 0) {
                cancelAmount = request.getRefundAmount().intValue();
            }

            log.info("Toss Payments 환불 요청 - paymentKey: {}, amount: {}, reason: {}", 
                paymentKey, cancelAmount, cancelReason);

            tossPaymentsClient.cancelPayment(paymentKey, cancelReason, cancelAmount);
            
            log.info("Toss Payments 환불 성공 - paymentKey: {}", paymentKey);
            
            return "REFUND_" + System.currentTimeMillis();

        } catch (Exception e) {
            log.error("Toss Payments 환불 API 호출 실패", e);
            return null;
        }
    }

    /**
     * 환불 알림 전송
     *
     * @param payment 결제 정보
     */
    private void sendRefundNotifications(Payment payment) {
        try {
            emailNotificationService.sendPaymentCancellationEmail(payment);
        } catch (Exception e) {
            log.warn("환불 이메일 전송 실패: {}", e.getMessage());
        }

        try {
            smsNotificationService.sendPaymentCancellationSms(payment);
        } catch (Exception e) {
            log.warn("환불 SMS 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 오너에게 수동 환불 처리 필요 알림 전송 (계좌이체 환불)
     *
     * @param payment 결제 정보
     * @param refund 환불 정보
     * @param request 환불 요청
     */
    private void notifyOwnerForManualRefund(Payment payment, Refund refund, RefundRequest request) {
        try {
            Reservation reservation = reservationRepository.findById(payment.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

            var campgroundOwner = reservation.getCampground().getOwner();
            if (campgroundOwner == null) {
                log.error("캠핑장 소유자 정보가 없습니다. 예약 ID: {}", reservation.getId());
                return;
            }

            emailNotificationService.sendManualRefundNotification(
                payment, reservation, refund, request, campgroundOwner
            );

            log.info("수동 환불 알림 전송 완료 - 오너: {}, 결제 ID: {}", campgroundOwner.getEmail(), payment.getId());
        } catch (Exception e) {
            log.error("수동 환불 알림 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 오너가 계좌이체 환불을 완료 처리 (수동 환불 확인)
     *
     * @param refundId 환불 ID
     * @return 환불 응답
     */
    @Transactional
    public RefundResponse confirmManualRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("환불 정보를 찾을 수 없습니다."));

        Payment payment = refund.getPayment();
        if (payment == null) {
            throw new ResourceNotFoundException("결제 정보를 찾을 수 없습니다.");
        }

        // 계좌이체 결제인지 확인
        if (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new RuntimeException("계좌이체 결제만 수동 환불 확인이 가능합니다.");
        }

        // 환불 대기 중인지 확인
        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new RuntimeException("환불 대기 중인 건만 처리할 수 있습니다. 현재 상태: " + refund.getStatus());
        }

        // 환불 완료 처리
        refund.completeRefund(
            refund.getRefundTransactionId(),
            "COMPLETED",
            refund.getRefundAmount(),
            "REFUNDED"
        );
        refundRepository.save(refund);

        // 결제 상태 변경
        payment.updateStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // 예약 취소 처리
        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        reservation.changeStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // 고객에게 환불 완료 알림
        sendRefundNotifications(payment);

        log.info("수동 환불 완료 처리 - 환불 ID: {}, 결제 ID: {}", refundId, payment.getId());

        return RefundResponse.builder()
                .success(true)
                .message("환불이 완료되었습니다.")
                .refundTransactionId(refund.getRefundTransactionId())
                .refundedAmount(refund.getRefundAmount())
                .refundedAt(refund.getRefundedAt())
                .build();
    }
}