package com.campstation.camp.shared.notification;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.user.domain.User;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * SMS 알림 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    /**
     * 결제 완료 SMS 알림 전송
     */
    public void sendPaymentConfirmationSms(Payment payment) {
        try {
            // Twilio credentials가 설정되지 않은 경우 SMS 전송 생략
            if (accountSid.isEmpty() || authToken.isEmpty() || twilioPhoneNumber.isEmpty()) {
                log.info("Twilio credentials not configured, skipping SMS notification for payment: {}", payment.getId());
                return;
            }

            Twilio.init(accountSid, authToken);

            String messageBody = buildPaymentConfirmationSmsBody(payment);

            Message message = Message.creator(
                    new com.twilio.type.PhoneNumber("+1234567890"), // 실제로는 user의 phone number를 사용
                    new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                    messageBody
            ).create();

            log.info("Payment confirmation SMS sent, SID: {}", message.getSid());
        } catch (Exception e) {
            log.error("Failed to send payment confirmation SMS: {}", e.getMessage());
            // SMS 전송 실패해도 결제는 성공으로 처리
        }
    }

    /**
     * 결제 취소 SMS 알림 전송
     */
    public void sendPaymentCancellationSms(Payment payment) {
        try {
            if (accountSid.isEmpty() || authToken.isEmpty() || twilioPhoneNumber.isEmpty()) {
                log.info("Twilio credentials not configured, skipping SMS notification for payment cancellation: {}", payment.getId());
                return;
            }

            Twilio.init(accountSid, authToken);

            String messageBody = "CampStation: Your payment has been cancelled. Amount: $" +
                    String.format("%.2f", payment.getAmount());

            Message message = Message.creator(
                    new com.twilio.type.PhoneNumber("+1234567890"), // 실제로는 user의 phone number를 사용
                    new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                    messageBody
            ).create();

            log.info("Payment cancellation SMS sent, SID: {}", message.getSid());
        } catch (Exception e) {
            log.error("Failed to send payment cancellation SMS: {}", e.getMessage());
        }
    }

    private String buildPaymentConfirmationSmsBody(Payment payment) {
        return String.format(
                "CampStation: Payment confirmed! Amount: $%.2f, Transaction: %s. Thank you!",
                payment.getAmount(),
                payment.getTransactionId()
        );
    }

    /**
     * 예약 확인 SMS 알림 전송
     */
    public void sendReservationConfirmationSms(Reservation reservation) {
        try {
            // Twilio credentials가 설정되지 않은 경우 SMS 전송 생략
            if (accountSid.isEmpty() || authToken.isEmpty() || twilioPhoneNumber.isEmpty()) {
                log.info("Twilio credentials not configured, skipping SMS notification for reservation: {}", reservation.getId());
                return;
            }

            User user = reservation.getUser();
            if (user == null || user.getPhone() == null || user.getPhone().isEmpty()) {
                log.info("예약 확인 SMS 전송 생략 (전화번호 없음): {}", reservation.getId());
                return;
            }

            Twilio.init(accountSid, authToken);

            String messageBody = buildReservationConfirmationSmsBody(reservation);

            Message message = Message.creator(
                    new com.twilio.type.PhoneNumber(user.getPhone()),
                    new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                    messageBody
            ).create();

            log.info("예약 확인 SMS 전송 완료, SID: {}", message.getSid());
        } catch (Exception e) {
            log.error("예약 확인 SMS 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 예약 취소 SMS 알림 전송
     */
    public void sendReservationCancellationSms(Reservation reservation) {
        try {
            // Twilio credentials가 설정되지 않은 경우 SMS 전송 생략
            if (accountSid.isEmpty() || authToken.isEmpty() || twilioPhoneNumber.isEmpty()) {
                log.info("Twilio credentials not configured, skipping SMS notification for reservation cancellation: {}", reservation.getId());
                return;
            }

            User user = reservation.getUser();
            if (user == null || user.getPhone() == null || user.getPhone().isEmpty()) {
                log.info("예약 취소 SMS 전송 생략 (전화번호 없음): {}", reservation.getId());
                return;
            }

            Twilio.init(accountSid, authToken);

            String messageBody = buildReservationCancellationSmsBody(reservation);

            Message message = Message.creator(
                    new com.twilio.type.PhoneNumber(user.getPhone()),
                    new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                    messageBody
            ).create();

            log.info("예약 취소 SMS 전송 완료, SID: {}", message.getSid());
        } catch (Exception e) {
            log.error("예약 취소 SMS 전송 실패: {}", e.getMessage());
        }
    }

    private String buildReservationConfirmationSmsBody(Reservation reservation) {
        return String.format(
                "CampStation: 예약 확인! 캠핑장: %s, 체크인: %s, 체크아웃: %s, 금액: ₩%,.0f. 즐거운 캠핑 되세요!",
                reservation.getCampground().getName(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                reservation.getTotalAmount()
        );
    }

    private String buildReservationCancellationSmsBody(Reservation reservation) {
        return String.format(
                "CampStation: 예약 취소 완료. 캠핑장: %s, 체크인: %s, 환불 금액: ₩%,.0f",
                reservation.getCampground().getName(),
                reservation.getCheckInDate(),
                reservation.getTotalAmount()
        );
    }
}