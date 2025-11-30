package com.campstation.camp.shared.notification;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.service.UserService;
import com.campstation.camp.reservation.service.ReceiptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

/**
 * 이메일 알림 서비스
 */
@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final UserService userService;
    private final ReceiptService receiptService;

    public EmailNotificationService(JavaMailSender mailSender, UserService userService, ReceiptService receiptService) {
        this.mailSender = mailSender;
        this.userService = userService;
        this.receiptService = receiptService;
    }

    /**
     * 결제 완료 알림 이메일 전송
     */
    public void sendPaymentConfirmationEmail(Payment payment) {
        try {
            User user = userService.findById(payment.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + payment.getUserId()));

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("CampStation - 결제 완료 확인");
            helper.setText(buildPaymentConfirmationEmailBody(payment, user));

            // PDF 영수증 첨부
            byte[] receiptPdf = receiptService.generateReceiptPdf(payment);
            helper.addAttachment("receipt_" + payment.getId() + ".pdf", new ByteArrayDataSource(receiptPdf, "application/pdf"));

            mailSender.send(message);

            log.info("Payment confirmation email with receipt sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email: {}", e.getMessage());
            // 이메일 전송 실패해도 결제는 성공으로 처리
        }
    }

    /**
     * 결제 취소 알림 이메일 전송
     */
    public void sendPaymentCancellationEmail(Payment payment) {
        try {
            User user = userService.findById(payment.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + payment.getUserId()));

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("CampStation - 결제 취소 확인");
            message.setText(buildPaymentCancellationEmailBody(payment, user));

            mailSender.send(message);

            log.info("Payment cancellation email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment cancellation email: {}", e.getMessage());
        }
    }

    private String buildPaymentConfirmationEmailBody(Payment payment, User user) {
        return String.format("""
            안녕하세요, %s님!

            CampStation에서 결제가 성공적으로 완료되었습니다.

            결제 정보:
            - 결제 금액: ₩%,.0f
            - 결제 수단: %s
            - 거래 ID: %s
            - 결제 일시: %s

            예약이 확정되었습니다. 즐거운 캠핑 되세요!

            문의사항이 있으시면 언제든지 연락 주세요.

            감사합니다.
            CampStation 팀
            """,
            user.getName(),
            payment.getAmount(),
            payment.getPaymentMethod().getDescription(),
            payment.getTransactionId(),
            payment.getCreatedAt().toString()
        );
    }

    private String buildPaymentCancellationEmailBody(Payment payment, User user) {
        return String.format("""
            안녕하세요, %s님!

            CampStation에서 결제가 취소되었습니다.

            취소 정보:
            - 취소 금액: ₩%,.0f
            - 결제 수단: %s
            - 거래 ID: %s
            - 취소 일시: %s

            환불 처리는 3-5영업일 이내에 완료될 예정입니다.

            문의사항이 있으시면 언제든지 연락 주세요.

            감사합니다.
            CampStation 팀
            """,
            user.getName(),
            payment.getAmount(),
            payment.getPaymentMethod().getDescription(),
            payment.getTransactionId(),
            payment.getUpdatedAt().toString()
        );
    }

    /**
     * 성능 경고 이메일 전송
     */
    public void sendPerformanceAlert(String uri, long duration) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("admin@campstation.kr");
            message.setSubject("CampStation 성능 경고");
            message.setText(String.format(
                "성능 경고가 발생했습니다.\n\n" +
                "요청 URI: %s\n" +
                "처리 시간: %d ms\n\n" +
                "시스템 성능을 확인해주세요.",
                uri, duration
            ));
            mailSender.send(message);
            log.info("성능 경고 이메일 전송 완료: {} ({}ms)", uri, duration);
        } catch (Exception e) {
            log.error("성능 경고 이메일 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 시스템 경고 이메일 전송
     */
    public void sendSystemAlert(String title, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo("admin@campstation.kr");
            mailMessage.setSubject("CampStation 시스템 경고: " + title);
            mailMessage.setText(String.format(
                "시스템 경고가 발생했습니다.\n\n" +
                "제목: %s\n" +
                "메시지: %s\n\n" +
                "시스템 상태를 확인해주세요.",
                title, message
            ));
            mailSender.send(mailMessage);
            log.info("시스템 경고 이메일 전송 완료: {}", title);
        } catch (Exception e) {
            log.error("시스템 경고 이메일 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 헬스 체크 경고 이메일 전송
     */
    public void sendHealthCheckAlert(String service, String errorMessage) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("admin@campstation.kr");
            message.setSubject("CampStation 헬스 체크 실패: " + service);
            message.setText(String.format(
                "헬스 체크 실패가 발생했습니다.\n\n" +
                "서비스: %s\n" +
                "오류 메시지: %s\n\n" +
                "시스템 상태를 확인해주세요.",
                service, errorMessage
            ));
            mailSender.send(message);
            log.info("헬스 체크 경고 이메일 전송 완료: {} - {}", service, errorMessage);
        } catch (Exception e) {
            log.error("헬스 체크 경고 이메일 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 예약 확인 이메일 전송
     */
    public void sendReservationConfirmationEmail(Reservation reservation) {
        try {
            User user = reservation.getUser();
            if (user == null) {
                log.info("예약 확인 이메일 전송 생략 (비회원 예약): {}", reservation.getId());
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("CampStation - 예약 확인");
            message.setText(buildReservationConfirmationEmailBody(reservation, user));

            mailSender.send(message);
            log.info("예약 확인 이메일 전송 완료: {}", reservation.getId());
        } catch (Exception e) {
            log.error("예약 확인 이메일 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 예약 취소 이메일 전송
     */
    public void sendReservationCancellationEmail(Reservation reservation) {
        try {
            User user = reservation.getUser();
            if (user == null) {
                log.info("예약 취소 이메일 전송 생략 (비회원 예약): {}", reservation.getId());
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("CampStation - 예약 취소 확인");
            message.setText(buildReservationCancellationEmailBody(reservation, user));

            mailSender.send(message);
            log.info("예약 취소 이메일 전송 완료: {}", reservation.getId());
        } catch (Exception e) {
            log.error("예약 취소 이메일 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 입금 확인 요청 이메일 전송 (오너에게)
     */
    public void sendDepositConfirmationRequestEmail(Payment payment, Reservation reservation, User campgroundOwner) {
        try {
            if (campgroundOwner == null) {
                log.error("캠핑장 소유자 정보가 없습니다. 예약 ID: {}", reservation.getId());
                return;
            }

            User customer = reservation.getUser();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(campgroundOwner.getEmail());
            message.setSubject("CampStation - 입금 확인 요청");
            message.setText(buildDepositConfirmationRequestEmailBody(payment, reservation, customer, campgroundOwner));

            mailSender.send(message);
            log.info("입금 확인 요청 이메일 전송 완료 - 오너: {}, 예약 ID: {}", campgroundOwner.getEmail(), reservation.getId());
        } catch (Exception e) {
            log.error("입금 확인 요청 이메일 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 수동 환불 처리 요청 이메일 전송 (오너에게)
     */
    public void sendManualRefundNotification(Payment payment, Reservation reservation,
                                             com.campstation.camp.reservation.domain.Refund refund,
                                             com.campstation.camp.reservation.dto.RefundRequest request,
                                             User campgroundOwner) {
        try {
            if (campgroundOwner == null) {
                log.error("캠핑장 소유자 정보가 없습니다. 예약 ID: {}", reservation.getId());
                return;
            }

            User customer = reservation.getUser();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(campgroundOwner.getEmail());
            message.setSubject("CampStation - 수동 환불 처리 요청");
            message.setText(buildManualRefundRequestEmailBody(payment, reservation, refund, request, customer, campgroundOwner));

            mailSender.send(message);
            log.info("수동 환불 요청 이메일 전송 완료 - 오너: {}, 환불 ID: {}", campgroundOwner.getEmail(), refund.getId());
        } catch (Exception e) {
            log.error("수동 환불 요청 이메일 전송 실패: {}", e.getMessage());
        }
    }

    private String buildReservationConfirmationEmailBody(Reservation reservation, User user) {
        return String.format("""
            안녕하세요, %s님!

            CampStation에서 예약이 성공적으로 완료되었습니다.

            예약 정보:
            - 예약 번호: %s
            - 캠핑장: %s
            - 체크인: %s
            - 체크아웃: %s
            - 총 금액: ₩%,.0f

            예약이 확정되었습니다. 즐거운 캠핑 되세요!

            문의사항이 있으시면 언제든지 연락 주세요.

            감사합니다.
            CampStation 팀
            """,
            user.getName(),
            reservation.getId(),
            reservation.getCampground().getName(),
            reservation.getCheckInDate(),
            reservation.getCheckOutDate(),
            reservation.getTotalAmount()
        );
    }

    private String buildReservationCancellationEmailBody(Reservation reservation, User user) {
        return String.format("""
            안녕하세요, %s님!

            CampStation에서 예약이 취소되었습니다.

            취소된 예약 정보:
            - 예약 번호: %s
            - 캠핑장: %s
            - 체크인: %s
            - 체크아웃: %s
            - 환불 금액: ₩%,.0f

            취소가 완료되었습니다. 다른 캠핑장을 찾아보세요!

            문의사항이 있으시면 언제든지 연락 주세요.

            감사합니다.
            CampStation 팀
            """,
            user.getName(),
            reservation.getId(),
            reservation.getCampground().getName(),
            reservation.getCheckInDate(),
            reservation.getCheckOutDate(),
            reservation.getTotalAmount()
        );
    }

    private String buildDepositConfirmationRequestEmailBody(Payment payment, Reservation reservation, User customer, User owner) {
        return String.format("""
            안녕하세요, %s님!

            CampStation에서 계좌이체 입금 확인 요청이 도착했습니다.

            예약 정보:
            - 예약 번호: %s
            - 고객명: %s
            - 입금자명: %s
            - 캠핑장: %s
            - 체크인: %s
            - 체크아웃: %s
            - 결제 금액: ₩%,.0f
            - 결제 일시: %s

            고객이 입금 확인을 요청했습니다.
            입금이 확인되면 대시보드에서 입금 확인 처리를 해주세요.

            [대시보드 바로가기]
            https://campstation.kr/owner/payments

            문의사항이 있으시면 언제든지 연락 주세요.

            감사합니다.
            CampStation 팀
            """,
            owner.getName(),
            reservation.getId(),
            customer.getName(),
            payment.getDepositorName() != null ? payment.getDepositorName() : "미입력",
            reservation.getCampground().getName(),
            reservation.getCheckInDate(),
            reservation.getCheckOutDate(),
            payment.getAmount(),
            payment.getCreatedAt().toString()
        );
    }

    private String buildManualRefundRequestEmailBody(Payment payment, Reservation reservation,
                                                     com.campstation.camp.reservation.domain.Refund refund,
                                                     com.campstation.camp.reservation.dto.RefundRequest request,
                                                     User customer, User owner) {
        return String.format("""
            안녕하세요, %s님!

            CampStation에서 계좌이체 환불 처리 요청이 도착했습니다.

            예약 정보:
            - 예약 번호: %s
            - 환불 ID: %s
            - 고객명: %s
            - 고객 연락처: %s
            - 입금자명: %s
            - 캠핑장: %s
            - 체크인: %s
            - 체크아웃: %s
            - 원 결제 금액: ₩%,.0f
            - 환불 금액: ₩%,.0f
            - 환불 사유: %s

            고객이 계좌이체 결제 환불을 요청했습니다.
            고객에게 환불 처리 후, 대시보드에서 환불 완료 확인을 해주세요.

            ** 환불 처리 방법 **
            1. 고객이 입금한 계좌로 환불 금액을 송금해주세요
            2. 송금 완료 후 대시보드에서 '환불 완료' 버튼을 클릭해주세요
            3. 환불 완료 확인 시 고객에게 자동으로 알림이 발송됩니다

            [대시보드 바로가기]
            https://campstation.kr/owner/refunds

            문의사항이 있으시면 언제든지 연락 주세요.

            감사합니다.
            CampStation 팀
            """,
            owner.getName(),
            reservation.getId(),
            refund.getId(),
            customer.getName(),
            customer.getPhone() != null ? customer.getPhone() : "미입력",
            payment.getDepositorName() != null ? payment.getDepositorName() : "미입력",
            reservation.getCampground().getName(),
            reservation.getCheckInDate(),
            reservation.getCheckOutDate(),
            payment.getAmount(),
            refund.getRefundAmount(),
            request.getRefundReason() != null ? request.getRefundReason() : "사유 없음"
        );
    }
}