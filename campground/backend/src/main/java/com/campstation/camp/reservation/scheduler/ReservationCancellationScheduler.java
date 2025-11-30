package com.campstation.camp.reservation.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.PaymentStatus;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.repository.PaymentRepository;
import com.campstation.camp.reservation.repository.ReservationRepository;

/**
 * 예약 자동 취소 스케줄러
 * 
 * 30분 이내 미결제된 예약을 자동으로 취소합니다.
 * 매 1분마다 실행되어 미결제 예약을 확인하고 취소 처리합니다.
 * 
 * @author CampStation Team
 * @version 1.1
 * @since 2024-10-24
 */
@Component
public class ReservationCancellationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReservationCancellationScheduler.class);
    
    // 결제 대기 시간 (30분)
    private static final int PAYMENT_TIMEOUT_MINUTES = 30;
    
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    
    public ReservationCancellationScheduler(
            ReservationRepository reservationRepository,
            PaymentRepository paymentRepository) {
        this.reservationRepository = reservationRepository;
        this.paymentRepository = paymentRepository;
    }
    
    /**
     * 미결제 예약 자동 취소
     * 
     * 매 1분마다 실행되어 30분이 경과한 PENDING 상태의 예약을 자동 취소합니다.
     * 예약 취소 시 해당 결제도 CANCELLED 상태로 변경합니다.
     * cron 표현식: 0 (asterisk-slash)1 (asterisk) (asterisk) (asterisk) (asterisk) = 매 1분마다 실행
     */
    @Scheduled(cron = "0 */1 * * * *")
    @Transactional
    public void cancelUnpaidReservations() {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(PAYMENT_TIMEOUT_MINUTES);
            
            // 30분 이상 경과한 PENDING 상태의 예약 조회
            List<Reservation> unpaidReservations = reservationRepository
                .findByStatusAndCreatedAtBefore(ReservationStatus.PENDING, cutoffTime);
            
            if (unpaidReservations.isEmpty()) {
                logger.debug("취소할 미결제 예약이 없습니다.");
                return;
            }
            
            int cancelledCount = 0;
            for (Reservation reservation : unpaidReservations) {
                try {
                    // 계좌이체 입금 확인 요청 중인 예약은 취소하지 않음
                    List<Payment> payments = paymentRepository.findByReservationIdOrderByCreatedAtDesc(reservation.getId());
                    boolean hasConfirmationRequested = payments.stream()
                        .anyMatch(p -> p.getStatus() == PaymentStatus.CONFIRMATION_REQUESTED);
                    
                    if (hasConfirmationRequested) {
                        logger.debug("입금 확인 요청 중인 예약은 취소하지 않음 - 예약ID: {}", reservation.getId());
                        continue;
                    }
                    // 예약 취소 처리
                    reservation.setStatus(ReservationStatus.CANCELLED);
                    reservationRepository.save(reservation);
                    cancelledCount++;
                    
                    logger.info("예약 자동 취소 완료 - 예약ID: {}, 생성시간: {}, 경과시간: {}분",
                        reservation.getId(),
                        reservation.getCreatedAt(),
                        java.time.Duration.between(reservation.getCreatedAt(), LocalDateTime.now()).toMinutes()
                    );
                    
                    // 해당 예약의 PENDING 상태 결제도 CANCELLED로 변경
                    // 이미 위에서 payments를 조회했으므로 재사용
                    try {
                        for (Payment payment : payments) {
                            if (payment.getStatus() == PaymentStatus.PENDING) {
                                payment.setStatus(PaymentStatus.CANCELLED);
                                paymentRepository.save(payment);
                                logger.info("결제 자동 취소 완료 - 결제ID: {}, 예약ID: {}", 
                                    payment.getId(), reservation.getId());
                            }
                        }
                    } catch (Exception e) {
                        logger.error("결제 취소 실패 - 예약ID: {}, 오류: {}", 
                            reservation.getId(), e.getMessage(), e);
                    }
                    
                } catch (Exception e) {
                    logger.error("예약 취소 실패 - 예약ID: {}, 오류: {}", 
                        reservation.getId(), e.getMessage(), e);
                }
            }
            
            logger.info("미결제 예약 자동 취소 완료 - 총 {}건 취소", cancelledCount);
            
        } catch (Exception e) {
            logger.error("미결제 예약 자동 취소 스케줄러 실행 중 오류 발생", e);
        }
    }
}
